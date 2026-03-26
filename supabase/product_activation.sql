-- Product activation system (upgraded)
-- Run after supabase/setup.sql

create extension if not exists pgcrypto with schema extensions;

alter table public.member_profiles
add column if not exists membership_tier text not null default 'member'
check (membership_tier in ('member', 'product_member'));

-- Keep privileged fields immutable from client-side authenticated writes.
create or replace function public.guard_member_profile_privileged_fields()
returns trigger
language plpgsql
as $$
begin
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
  code_last4 text,
  public_serial text,
  status text not null default 'new' check (status in ('new', 'redeemed', 'revoked')),
  product_sku text,
  batch_id uuid not null default gen_random_uuid(),
  note text,
  expires_at timestamptz,
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Backward-compatible migration for older activation_codes table
alter table public.activation_codes add column if not exists code_last4 text;
alter table public.activation_codes add column if not exists public_serial text;

update public.activation_codes
set code_last4 = '****'
where code_last4 is null;

update public.activation_codes
set public_serial = 'BY-LEGACY-' || upper(substr(replace(id::text, '-', ''), 1, 12))
where public_serial is null;

alter table public.activation_codes alter column code_last4 set not null;
alter table public.activation_codes alter column public_serial set not null;

create unique index if not exists uq_activation_codes_public_serial
on public.activation_codes (public_serial);

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

create table if not exists public.admin_support_actions (
  id bigserial primary key,
  performed_by uuid not null references auth.users(id),
  action_type text not null check (action_type in ('lookup', 'transfer', 'revoke', 'reissue')),
  code_id uuid references public.activation_codes(id),
  public_serial text,
  target_email text,
  reason text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activation_codes enable row level security;
alter table public.activation_events enable row level security;
alter table public.activation_redeem_attempts enable row level security;
alter table public.admin_support_actions enable row level security;

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

drop policy if exists "admin can read admin_support_actions" on public.admin_support_actions;
create policy "admin can read admin_support_actions"
on public.admin_support_actions
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

create index if not exists idx_activation_codes_redeemed_by
on public.activation_codes (redeemed_by, redeemed_at desc);

create index if not exists idx_admin_support_actions_created_at
on public.admin_support_actions (created_at desc);

-- Internal helper: random readable activation code
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

-- Internal helper: public serial for post-sale service tracking
create or replace function public.generate_public_serial()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  part1 text := '';
  part2 text := '';
  i int;
begin
  for i in 1..4 loop
    part1 := part1 || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  for i in 1..6 loop
    part2 := part2 || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return 'BY-' || to_char(now(), 'YY') || part1 || '-' || part2;
end;
$$;

-- Admin RPC: generate activation codes + public serials
drop function if exists public.admin_generate_activation_codes(int, text, text, text);
create or replace function public.admin_generate_activation_codes(
  p_count int,
  p_sku text default null,
  p_note text default null,
  p_base_url text default null
)
returns table (
  code text,
  public_serial text,
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
  v_last4 text;
  v_serial text;
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
      v_last4 := right(v_code, 4);
      v_serial := public.generate_public_serial();
      begin
        insert into public.activation_codes (
          code_hash,
          code_last4,
          public_serial,
          product_sku,
          note,
          batch_id
        )
        values (
          v_hash,
          v_last4,
          v_serial,
          p_sku,
          p_note,
          v_batch
        );
        exit;
      exception
        when unique_violation then
          -- retry on rare collisions
      end;
    end loop;

    code := v_code;
    public_serial := v_serial;
    activation_url := v_url_base || '/activate?code=' || v_code;
    batch_id := v_batch;
    return next;
  end loop;
end;
$$;

revoke all on function public.admin_generate_activation_codes(int, text, text, text) from public;
grant execute on function public.admin_generate_activation_codes(int, text, text, text) to authenticated;

-- Member RPC: redeem code and bind product ownership to current account
drop function if exists public.redeem_activation_code(text);
create or replace function public.redeem_activation_code(p_code text)
returns table (
  ok boolean,
  message text,
  membership_tier text,
  public_serial text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_hash text;
  v_code_id uuid;
  v_existing_status text;
  v_existing_owner uuid;
  v_existing_serial text;
  v_attempt_count int;
begin
  if v_uid is null then
    return query select false, 'Not authenticated', 'member'::text, null::text;
    return;
  end if;

  if p_code is null or length(trim(p_code)) < 12 then
    return query select false, 'Invalid code format', 'member'::text, null::text;
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
    )::text, null::text;
    return;
  end if;

  -- Try atomic first-time claim
  update public.activation_codes c
  set
    status = 'redeemed',
    redeemed_by = v_uid,
    redeemed_at = now()
  where c.code_hash = v_hash
    and c.status = 'new'
    and (c.expires_at is null or c.expires_at > now())
  returning c.id, c.public_serial into v_code_id, v_existing_serial;

  if v_code_id is not null then
    update public.member_profiles p
    set membership_tier = 'product_member'
    where p.user_id = v_uid;

    insert into public.activation_events (code_id, user_id, event_type)
    values (v_code_id, v_uid, 'redeem');

    insert into public.activation_redeem_attempts (user_id, code_hash, ok)
    values (v_uid, v_hash, true);

    return query select true, 'Activation successful', 'product_member'::text, v_existing_serial;
    return;
  end if;

  -- Not first claim: inspect existing owner/state
  select c.status, c.redeemed_by, c.public_serial
  into v_existing_status, v_existing_owner, v_existing_serial
  from public.activation_codes c
  where c.code_hash = v_hash;

  insert into public.activation_redeem_attempts (user_id, code_hash, ok)
  values (v_uid, v_hash, false);

  if v_existing_status is null then
    return query select false, 'Code invalid', coalesce(
      (select p.membership_tier from public.member_profiles p where p.user_id = v_uid),
      'member'
    )::text, null::text;
    return;
  end if;

  if v_existing_status = 'revoked' then
    return query select false, 'Code has been revoked. Please contact support.', coalesce(
      (select p.membership_tier from public.member_profiles p where p.user_id = v_uid),
      'member'
    )::text, v_existing_serial;
    return;
  end if;

  if v_existing_status = 'redeemed' and v_existing_owner = v_uid then
    return query select false, 'This code is already bound to your account.', coalesce(
      (select p.membership_tier from public.member_profiles p where p.user_id = v_uid),
      'member'
    )::text, v_existing_serial;
    return;
  end if;

  if v_existing_status = 'redeemed' and v_existing_owner is distinct from v_uid then
    return query select false, 'This code is already bound to another account. Please contact support.', coalesce(
      (select p.membership_tier from public.member_profiles p where p.user_id = v_uid),
      'member'
    )::text, v_existing_serial;
    return;
  end if;

  return query select false, 'Code invalid, expired, or already used', coalesce(
    (select p.membership_tier from public.member_profiles p where p.user_id = v_uid),
    'member'
  )::text, v_existing_serial;
end;
$$;

revoke all on function public.redeem_activation_code(text) from public;
grant execute on function public.redeem_activation_code(text) to authenticated;

-- Helper: check whether current user is a verified product member
drop function if exists public.is_verified_product_member(uuid);
create or replace function public.is_verified_product_member(p_uid uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.member_profiles p
      where p.user_id = p_uid
        and p.membership_tier = 'product_member'
    )
    and exists (
      select 1
      from public.activation_codes c
      where c.redeemed_by = p_uid
        and c.status = 'redeemed'
    );
$$;

revoke all on function public.is_verified_product_member(uuid) from public;
grant execute on function public.is_verified_product_member(uuid) to authenticated;

-- Helper: enforce verified product member authorization in RPCs
drop function if exists public.require_verified_product_member(uuid);
create or replace function public.require_verified_product_member(p_uid uuid default auth.uid())
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_verified_product_member(p_uid) then
    raise exception 'Verified product member required';
  end if;
end;
$$;

revoke all on function public.require_verified_product_member(uuid) from public;
grant execute on function public.require_verified_product_member(uuid) to authenticated;

-- Member RPC: list products owned by current user (for member center UI)
drop function if exists public.my_owned_products();
create or replace function public.my_owned_products()
returns table (
  public_serial text,
  product_sku text,
  redeemed_at timestamptz,
  code_mask text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_verified_product_member(auth.uid());

  return query
  select
    c.public_serial,
    c.product_sku,
    c.redeemed_at,
    ('****-****-****-' || c.code_last4)::text as code_mask
  from public.activation_codes c
  where c.redeemed_by = auth.uid()
    and c.status = 'redeemed'
  order by c.redeemed_at desc nulls last;
end;
$$;

revoke all on function public.my_owned_products() from public;
grant execute on function public.my_owned_products() to authenticated;

-- Example pattern for future member-only features
drop function if exists public.product_member_feature_ping();
create or replace function public.product_member_feature_ping()
returns table (
  ok boolean,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_verified_product_member(auth.uid());
  return query select true, 'Authorized product member';
end;
$$;

revoke all on function public.product_member_feature_ping() from public;
grant execute on function public.product_member_feature_ping() to authenticated;

-- Admin RPC: lookup activation by serial or owner email
drop function if exists public.admin_lookup_activation(text);
create or replace function public.admin_lookup_activation(p_query text)
returns table (
  code_id uuid,
  public_serial text,
  product_sku text,
  status text,
  redeemed_at timestamptz,
  owner_user_id uuid,
  owner_email text,
  code_mask text,
  note text,
  batch_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_query text := trim(coalesce(p_query, ''));
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

  if v_query = '' then
    raise exception 'Query is required';
  end if;

  insert into public.admin_support_actions (performed_by, action_type, reason, meta)
  values (auth.uid(), 'lookup', 'support lookup', jsonb_build_object('query', v_query));

  if position('@' in v_query) > 0 then
    return query
    select
      c.id,
      c.public_serial,
      c.product_sku,
      c.status,
      c.redeemed_at,
      c.redeemed_by,
      u.email::text,
      ('****-****-****-' || c.code_last4)::text,
      c.note,
      c.batch_id
    from public.activation_codes c
    left join auth.users u on u.id = c.redeemed_by
    where lower(u.email::text) = lower(v_query)
    order by c.redeemed_at desc nulls last, c.created_at desc;
    return;
  end if;

  return query
  select
    c.id,
    c.public_serial,
    c.product_sku,
    c.status,
    c.redeemed_at,
    c.redeemed_by,
    u.email::text,
    ('****-****-****-' || c.code_last4)::text,
    c.note,
    c.batch_id
  from public.activation_codes c
  left join auth.users u on u.id = c.redeemed_by
  where c.public_serial ilike v_query || '%'
  order by c.created_at desc
  limit 50;
end;
$$;

revoke all on function public.admin_lookup_activation(text) from public;
grant execute on function public.admin_lookup_activation(text) to authenticated;

-- Admin RPC: transfer ownership to another account email
drop function if exists public.admin_transfer_activation(text, text, text);
create or replace function public.admin_transfer_activation(
  p_public_serial text,
  p_to_email text,
  p_reason text default null
)
returns table (
  ok boolean,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.activation_codes%rowtype;
  v_target_user uuid;
  v_prev_owner uuid;
begin
  if auth.uid() is null then
    return query select false, 'Not authenticated';
    return;
  end if;

  if not exists (
    select 1 from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ) then
    return query select false, 'Admin only';
    return;
  end if;

  select * into v_code
  from public.activation_codes
  where public_serial = trim(coalesce(p_public_serial, ''));

  if v_code.id is null then
    return query select false, 'Serial not found';
    return;
  end if;

  if v_code.status <> 'redeemed' then
    return query select false, 'Only redeemed product can be transferred';
    return;
  end if;

  select id into v_target_user
  from auth.users
  where lower(email::text) = lower(trim(coalesce(p_to_email, '')))
  limit 1;

  if v_target_user is null then
    return query select false, 'Target account email not found';
    return;
  end if;

  v_prev_owner := v_code.redeemed_by;

  update public.activation_codes
  set
    redeemed_by = v_target_user,
    redeemed_at = now()
  where id = v_code.id;

  update public.member_profiles
  set membership_tier = 'product_member'
  where user_id = v_target_user;

  if v_prev_owner is not null and v_prev_owner <> v_target_user then
    update public.member_profiles p
    set membership_tier = 'member'
    where p.user_id = v_prev_owner
      and not exists (
        select 1
        from public.activation_codes c
        where c.redeemed_by = v_prev_owner and c.status = 'redeemed'
      );
  end if;

  insert into public.admin_support_actions (
    performed_by,
    action_type,
    code_id,
    public_serial,
    target_email,
    reason,
    meta
  )
  values (
    auth.uid(),
    'transfer',
    v_code.id,
    v_code.public_serial,
    lower(trim(coalesce(p_to_email, ''))),
    p_reason,
    jsonb_build_object('from_user_id', v_prev_owner, 'to_user_id', v_target_user)
  );

  return query select true, 'Ownership transferred';
end;
$$;

revoke all on function public.admin_transfer_activation(text, text, text) from public;
grant execute on function public.admin_transfer_activation(text, text, text) to authenticated;

-- Admin RPC: revoke a serial
drop function if exists public.admin_revoke_activation(text, text);
create or replace function public.admin_revoke_activation(
  p_public_serial text,
  p_reason text default null
)
returns table (
  ok boolean,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.activation_codes%rowtype;
begin
  if auth.uid() is null then
    return query select false, 'Not authenticated';
    return;
  end if;

  if not exists (
    select 1 from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ) then
    return query select false, 'Admin only';
    return;
  end if;

  select * into v_code
  from public.activation_codes
  where public_serial = trim(coalesce(p_public_serial, ''));

  if v_code.id is null then
    return query select false, 'Serial not found';
    return;
  end if;

  update public.activation_codes
  set status = 'revoked'
  where id = v_code.id;

  if v_code.redeemed_by is not null then
    update public.member_profiles p
    set membership_tier = 'member'
    where p.user_id = v_code.redeemed_by
      and not exists (
        select 1
        from public.activation_codes c
        where c.redeemed_by = v_code.redeemed_by
          and c.status = 'redeemed'
          and c.id <> v_code.id
      );
  end if;

  insert into public.admin_support_actions (
    performed_by,
    action_type,
    code_id,
    public_serial,
    reason
  )
  values (
    auth.uid(),
    'revoke',
    v_code.id,
    v_code.public_serial,
    p_reason
  );

  return query select true, 'Serial revoked';
end;
$$;

revoke all on function public.admin_revoke_activation(text, text) from public;
grant execute on function public.admin_revoke_activation(text, text) to authenticated;

-- Admin RPC: reissue a new activation code for the same SKU
drop function if exists public.admin_reissue_activation(text, text, text);
create or replace function public.admin_reissue_activation(
  p_public_serial text,
  p_reason text default null,
  p_base_url text default null
)
returns table (
  ok boolean,
  message text,
  old_public_serial text,
  new_public_serial text,
  new_code text,
  activation_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.activation_codes%rowtype;
  v_code text;
  v_hash text;
  v_last4 text;
  v_serial text;
  v_url_base text := coalesce(nullif(trim(p_base_url), ''), 'https://www.bee-yuan.com');
  v_new_id uuid;
begin
  if auth.uid() is null then
    return query select false, 'Not authenticated', null::text, null::text, null::text, null::text;
    return;
  end if;

  if not exists (
    select 1 from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ) then
    return query select false, 'Admin only', null::text, null::text, null::text, null::text;
    return;
  end if;

  if not (
    v_url_base ~ '^https://www\.bee-yuan\.com/?$'
    or v_url_base ~ '^http://localhost:5173/?$'
    or v_url_base ~ '^http://localhost:5174/?$'
  ) then
    return query select false, 'p_base_url is not allowed', null::text, null::text, null::text, null::text;
    return;
  end if;
  v_url_base := regexp_replace(v_url_base, '/+$', '');

  select * into v_old
  from public.activation_codes
  where public_serial = trim(coalesce(p_public_serial, ''));

  if v_old.id is null then
    return query select false, 'Serial not found', null::text, null::text, null::text, null::text;
    return;
  end if;

  update public.activation_codes
  set status = 'revoked'
  where id = v_old.id;

  loop
    v_code := public.generate_activation_code(20);
    v_hash := encode(extensions.digest(v_code, 'sha256'), 'hex');
    v_last4 := right(v_code, 4);
    v_serial := public.generate_public_serial();
    begin
      insert into public.activation_codes (
        code_hash,
        code_last4,
        public_serial,
        status,
        product_sku,
        note,
        batch_id
      ) values (
        v_hash,
        v_last4,
        v_serial,
        'new',
        v_old.product_sku,
        coalesce(v_old.note, '') || ' | reissue from ' || v_old.public_serial,
        v_old.batch_id
      )
      returning id into v_new_id;
      exit;
    exception
      when unique_violation then
        -- retry collision
    end;
  end loop;

  insert into public.admin_support_actions (
    performed_by,
    action_type,
    code_id,
    public_serial,
    reason,
    meta
  )
  values (
    auth.uid(),
    'reissue',
    v_old.id,
    v_old.public_serial,
    p_reason,
    jsonb_build_object('new_code_id', v_new_id, 'new_public_serial', v_serial)
  );

  return query
  select
    true,
    'Reissue successful',
    v_old.public_serial,
    v_serial,
    v_code,
    v_url_base || '/activate?code=' || v_code;
end;
$$;

revoke all on function public.admin_reissue_activation(text, text, text) from public;
grant execute on function public.admin_reissue_activation(text, text, text) to authenticated;

-- Admin RPC: recent support action logs
drop function if exists public.admin_support_recent_actions(int);
create or replace function public.admin_support_recent_actions(p_limit int default 50)
returns table (
  id bigint,
  action_type text,
  public_serial text,
  target_email text,
  reason text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    a.id,
    a.action_type,
    a.public_serial,
    a.target_email,
    a.reason,
    a.created_at
  from public.admin_support_actions a
  where exists (
    select 1
    from public.member_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
  order by a.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.admin_support_recent_actions(int) from public;
grant execute on function public.admin_support_recent_actions(int) to authenticated;
