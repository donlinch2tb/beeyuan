-- Product activation system
-- Run after supabase/setup.sql

create extension if not exists pgcrypto with schema extensions;

alter table public.member_profiles
add column if not exists membership_tier text not null default 'member'
check (membership_tier in ('member', 'product_member'));

-- Recreate guard to include membership_tier after this column exists
create or replace function public.guard_member_profile_privileged_fields()
returns trigger
language plpgsql
as $$
begin
  -- Allow server-side/manual operations (no authenticated user context).
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'member';
    new.membership_tier := 'member';
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.role := old.role;
    new.membership_tier := old.membership_tier;
    return new;
  end if;

  return new;
end;
$$;

create table if not exists public.activation_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text unique not null,
  status text not null default 'new' check (status in ('new', 'redeemed', 'revoked')),
  product_sku text,
  batch_id uuid not null default gen_random_uuid(),
  note text,
  expires_at timestamptz,
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.activation_events (
  id bigserial primary key,
  code_id uuid not null references public.activation_codes(id),
  user_id uuid not null references auth.users(id),
  event_type text not null check (event_type in ('redeem')),
  created_at timestamptz not null default now()
);

create table if not exists public.activation_redeem_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id),
  code_hash text,
  ok boolean not null default false,
  attempted_at timestamptz not null default now()
);

alter table public.activation_codes enable row level security;
alter table public.activation_events enable row level security;
alter table public.activation_redeem_attempts enable row level security;

drop policy if exists "admin can read activation_codes" on public.activation_codes;
create policy "admin can read activation_codes"
on public.activation_codes
for select
to authenticated
using (
  exists (
    select 1
    from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "admin can read activation_events" on public.activation_events;
create policy "admin can read activation_events"
on public.activation_events
for select
to authenticated
using (
  exists (
    select 1
    from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "admin can read activation_redeem_attempts" on public.activation_redeem_attempts;
create policy "admin can read activation_redeem_attempts"
on public.activation_redeem_attempts
for select
to authenticated
using (
  exists (
    select 1
    from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
);

create index if not exists idx_activation_redeem_attempts_user_time
on public.activation_redeem_attempts (user_id, attempted_at desc);

-- Internal helper: create random code with friendly alphabet
create or replace function public.generate_activation_code(p_length int default 20)
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out_code text := '';
  i int;
begin
  for i in 1..greatest(12, least(32, p_length)) loop
    out_code := out_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return out_code;
end;
$$;

-- Admin RPC: create a batch of activation codes and return plaintext once
create or replace function public.admin_generate_activation_codes(
  p_count int,
  p_sku text default null,
  p_note text default null,
  p_base_url text default null
)
returns table (
  code text,
  activation_url text,
  batch_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  i int;
  v_code text;
  v_hash text;
  v_batch uuid := gen_random_uuid();
  v_url_base text := coalesce(nullif(trim(p_base_url), ''), 'https://www.bee-yuan.com');
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Admin only';
  end if;

  if p_count is null or p_count < 1 or p_count > 2000 then
    raise exception 'p_count must be between 1 and 2000';
  end if;

  -- Strict allowlist for activation link domain
  if not (
    v_url_base ~ '^https://www\.bee-yuan\.com/?$'
    or v_url_base ~ '^http://localhost:5173/?$'
    or v_url_base ~ '^http://localhost:5174/?$'
  ) then
    raise exception 'p_base_url is not allowed';
  end if;

  v_url_base := regexp_replace(v_url_base, '/+$', '');

  for i in 1..p_count loop
    loop
      v_code := public.generate_activation_code(20);
      v_hash := encode(extensions.digest(v_code, 'sha256'), 'hex');
      begin
        insert into public.activation_codes (code_hash, product_sku, note, batch_id)
        values (v_hash, p_sku, p_note, v_batch);
        exit;
      exception
        when unique_violation then
          -- retry if collision
      end;
    end loop;

    code := v_code;
    activation_url := v_url_base || '/activate?code=' || v_code;
    batch_id := v_batch;
    return next;
  end loop;
end;
$$;

revoke all on function public.admin_generate_activation_codes(int, text, text, text) from public;
grant execute on function public.admin_generate_activation_codes(int, text, text, text) to authenticated;

-- Member RPC: redeem a code and upgrade account
create or replace function public.redeem_activation_code(p_code text)
returns table (
  ok boolean,
  message text,
  membership_tier text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_hash text;
  v_code_id uuid;
  v_attempt_count int;
begin
  if v_uid is null then
    return query select false, 'Not authenticated', 'member'::text;
    return;
  end if;

  if p_code is null or length(trim(p_code)) < 12 then
    return query select false, 'Invalid code format', 'member'::text;
    return;
  end if;

  v_hash := encode(extensions.digest(trim(upper(p_code)), 'sha256'), 'hex');

  select count(*)
  into v_attempt_count
  from public.activation_redeem_attempts a
  where a.user_id = v_uid
    and a.attempted_at > now() - interval '10 minutes';

  if v_attempt_count >= 10 then
    return query select false, 'Too many attempts. Please wait 10 minutes and try again.', coalesce(
      (select p.membership_tier from public.member_profiles p where p.user_id = v_uid),
      'member'
    )::text;
    return;
  end if;

  update public.activation_codes c
  set
    status = 'redeemed',
    redeemed_by = v_uid,
    redeemed_at = now()
  where c.code_hash = v_hash
    and c.status = 'new'
    and (c.expires_at is null or c.expires_at > now())
  returning c.id into v_code_id;

  if v_code_id is null then
    insert into public.activation_redeem_attempts (user_id, code_hash, ok)
    values (v_uid, v_hash, false);

    return query select false, 'Code invalid, expired, or already used', coalesce(
      (select p.membership_tier from public.member_profiles p where p.user_id = v_uid),
      'member'
    )::text;
    return;
  end if;

  update public.member_profiles p
  set membership_tier = 'product_member'
  where p.user_id = v_uid;

  insert into public.activation_events (code_id, user_id, event_type)
  values (v_code_id, v_uid, 'redeem');

  insert into public.activation_redeem_attempts (user_id, code_hash, ok)
  values (v_uid, v_hash, true);

  return query select true, 'Activation successful', 'product_member'::text;
end;
$$;

revoke all on function public.redeem_activation_code(text) from public;
grant execute on function public.redeem_activation_code(text) to authenticated;
