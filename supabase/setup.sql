-- 1) Create member profile table
create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  company text,
  role text not null default 'member' check (role in ('member', 'admin')),
  updated_at timestamptz not null default now()
);

-- 2) Keep updated_at fresh
create or replace function public.set_member_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_member_profiles_updated_at on public.member_profiles;
create trigger trg_member_profiles_updated_at
before update on public.member_profiles
for each row
execute function public.set_member_profiles_updated_at();

-- 2.1) Prevent clients from self-escalating privileged fields
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
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.role := old.role;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_member_profile_privileged_fields on public.member_profiles;
create trigger trg_guard_member_profile_privileged_fields
before insert or update on public.member_profiles
for each row
execute function public.guard_member_profile_privileged_fields();

-- 3) Enable Row Level Security
alter table public.member_profiles enable row level security;

-- 4) Policies: each logged-in user can read/update only their own profile
drop policy if exists "read own profile" on public.member_profiles;
create policy "read own profile"
on public.member_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "insert own profile" on public.member_profiles;
create policy "insert own profile"
on public.member_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "update own profile" on public.member_profiles;
create policy "update own profile"
on public.member_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5) Make your account admin manually after first signup
-- update public.member_profiles
-- set role = 'admin'
-- where user_id = 'YOUR_AUTH_USER_UUID';
