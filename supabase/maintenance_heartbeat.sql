-- Maintenance heartbeat + page/admin activity tracking
-- Run after supabase/setup.sql and supabase/product_activation.sql
-- Idempotent: safe to re-run.

create extension if not exists pg_cron with schema extensions;

create table if not exists public.system_heartbeat_log (
  id bigserial primary key,
  source text not null default 'pg_cron',
  member_profiles_count bigint not null,
  activation_codes_count bigint not null,
  redeemed_codes_count bigint not null,
  recent_redeem_attempts_24h bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_system_heartbeat_log_created_at
on public.system_heartbeat_log (created_at desc);

create table if not exists public.system_heartbeat_state (
  id int primary key default 1 check (id = 1),
  last_run_at timestamptz not null default now(),
  last_source text not null default 'manual',
  total_runs bigint not null default 0,
  heartbeat_enabled boolean not null default true,
  page_tracking_enabled boolean not null default true,
  admin_tracking_enabled boolean not null default true,
  heartbeat_schedule text not null default '0 */6 * * *'
);

alter table public.system_heartbeat_state
add column if not exists heartbeat_enabled boolean not null default true;

alter table public.system_heartbeat_state
add column if not exists page_tracking_enabled boolean not null default true;

alter table public.system_heartbeat_state
add column if not exists admin_tracking_enabled boolean not null default true;

alter table public.system_heartbeat_state
add column if not exists heartbeat_schedule text not null default '0 */6 * * *';

insert into public.system_heartbeat_state (id, last_run_at, last_source, total_runs)
values (1, now(), 'bootstrap', 0)
on conflict (id) do nothing;

update public.system_heartbeat_state
set
  heartbeat_enabled = coalesce(heartbeat_enabled, true),
  page_tracking_enabled = coalesce(page_tracking_enabled, true),
  admin_tracking_enabled = coalesce(admin_tracking_enabled, true),
  heartbeat_schedule = coalesce(nullif(heartbeat_schedule, ''), '0 */6 * * *')
where id = 1;

create table if not exists public.page_view_events (
  id bigserial primary key,
  page_path text not null,
  lang text,
  referrer text,
  viewer_user_id uuid references auth.users(id),
  viewed_at timestamptz not null default now()
);

create index if not exists idx_page_view_events_viewed_at
on public.page_view_events (viewed_at desc);

create index if not exists idx_page_view_events_path_time
on public.page_view_events (page_path, viewed_at desc);

create table if not exists public.admin_page_view_events (
  id bigserial primary key,
  page_path text not null,
  viewer_user_id uuid references auth.users(id),
  viewed_at timestamptz not null default now()
);

create index if not exists idx_admin_page_view_events_time
on public.admin_page_view_events (viewed_at desc);

create table if not exists public.admin_maintenance_actions (
  id bigserial primary key,
  acted_by uuid references auth.users(id),
  action_type text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_maintenance_actions_time
on public.admin_maintenance_actions (created_at desc);

create or replace function public.is_admin_user(p_uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member_profiles p
    where p.user_id = p_uid and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin_user(uuid) from public;
grant execute on function public.is_admin_user(uuid) to authenticated;

drop function if exists public.run_system_heartbeat(text);
create or replace function public.run_system_heartbeat(p_source text default 'manual')
returns table (
  ok boolean,
  message text,
  last_run_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_profiles_count bigint := 0;
  v_activation_codes_count bigint := 0;
  v_redeemed_codes_count bigint := 0;
  v_recent_redeem_attempts_24h bigint := 0;
  v_source text := coalesce(nullif(trim(p_source), ''), 'manual');
  v_uid uuid := auth.uid();
begin
  if v_source = 'pg_cron' then
    if not exists (
      select 1
      from public.system_heartbeat_state s
      where s.id = 1 and s.heartbeat_enabled = true
    ) then
      return query
      select true, 'Heartbeat skipped (paused)', s.last_run_at
      from public.system_heartbeat_state s
      where s.id = 1;
      return;
    end if;
  end if;

  select count(*) into v_member_profiles_count from public.member_profiles;
  select count(*) into v_activation_codes_count from public.activation_codes;

  select count(*)
  into v_redeemed_codes_count
  from public.activation_codes
  where status = 'redeemed';

  select count(*)
  into v_recent_redeem_attempts_24h
  from public.activation_redeem_attempts
  where attempted_at > now() - interval '24 hours';

  insert into public.system_heartbeat_log (
    source,
    member_profiles_count,
    activation_codes_count,
    redeemed_codes_count,
    recent_redeem_attempts_24h
  )
  values (
    v_source,
    v_member_profiles_count,
    v_activation_codes_count,
    v_redeemed_codes_count,
    v_recent_redeem_attempts_24h
  );

  update public.system_heartbeat_state
  set
    last_run_at = now(),
    last_source = v_source,
    total_runs = total_runs + 1
  where id = 1;

  if v_uid is not null and public.is_admin_user(v_uid) then
    if exists (
      select 1
      from public.system_heartbeat_state s
      where s.id = 1 and s.admin_tracking_enabled = true
    ) then
      insert into public.admin_maintenance_actions (acted_by, action_type, detail)
      values (v_uid, 'run_heartbeat', v_source);
    end if;
  end if;

  return query
  select true, 'Heartbeat recorded', s.last_run_at
  from public.system_heartbeat_state s
  where s.id = 1;
end;
$$;

revoke all on function public.run_system_heartbeat(text) from public;
grant execute on function public.run_system_heartbeat(text) to authenticated;

drop function if exists public.track_page_view(text, text, text);
create or replace function public.track_page_view(
  p_path text,
  p_lang text default null,
  p_referrer text default null
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
  v_path text := trim(coalesce(p_path, ''));
  v_lang text := nullif(trim(coalesce(p_lang, '')), '');
  v_referrer text := nullif(trim(coalesce(p_referrer, '')), '');
  v_uid uuid := auth.uid();
  v_page_tracking_enabled boolean := true;
  v_admin_tracking_enabled boolean := true;
  v_is_admin_page boolean := false;
begin
  if v_path = '' then
    return query select false, 'Path is required';
    return;
  end if;

  select s.page_tracking_enabled, s.admin_tracking_enabled
  into v_page_tracking_enabled, v_admin_tracking_enabled
  from public.system_heartbeat_state s
  where s.id = 1;

  if coalesce(v_page_tracking_enabled, true) = false then
    return query select false, 'Page tracking disabled';
    return;
  end if;

  v_is_admin_page := (v_path like '/admin%');

  insert into public.page_view_events (page_path, lang, referrer, viewer_user_id)
  values (v_path, v_lang, v_referrer, v_uid);

  if v_is_admin_page
     and coalesce(v_admin_tracking_enabled, true)
     and v_uid is not null
     and public.is_admin_user(v_uid) then
    insert into public.admin_page_view_events (page_path, viewer_user_id)
    values (v_path, v_uid);
  end if;

  return query select true, 'Tracked';
end;
$$;

revoke all on function public.track_page_view(text, text, text) from public;
grant execute on function public.track_page_view(text, text, text) to anon, authenticated;

drop function if exists public.cleanup_system_heartbeat_log(int);
create or replace function public.cleanup_system_heartbeat_log(p_retention_days int default 60)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_retention_days int := greatest(14, least(coalesce(p_retention_days, 60), 365));
  v_deleted int := 0;
begin
  with deleted_heartbeat as (
    delete from public.system_heartbeat_log
    where created_at < now() - make_interval(days => v_retention_days)
    returning 1
  ),
  deleted_page as (
    delete from public.page_view_events
    where viewed_at < now() - make_interval(days => v_retention_days)
    returning 1
  ),
  deleted_admin_page as (
    delete from public.admin_page_view_events
    where viewed_at < now() - make_interval(days => v_retention_days)
    returning 1
  ),
  deleted_admin_actions as (
    delete from public.admin_maintenance_actions
    where created_at < now() - make_interval(days => v_retention_days)
    returning 1
  )
  select
    (select count(*) from deleted_heartbeat)
    + (select count(*) from deleted_page)
    + (select count(*) from deleted_admin_page)
    + (select count(*) from deleted_admin_actions)
  into v_deleted;

  return v_deleted;
end;
$$;

revoke all on function public.cleanup_system_heartbeat_log(int) from public;
grant execute on function public.cleanup_system_heartbeat_log(int) to authenticated;

drop view if exists public.system_heartbeat_latest;

create view public.system_heartbeat_latest as
select
  s.last_run_at,
  s.last_source,
  s.total_runs,
  s.heartbeat_enabled,
  s.page_tracking_enabled,
  s.admin_tracking_enabled,
  s.heartbeat_schedule,
  l.member_profiles_count,
  l.activation_codes_count,
  l.redeemed_codes_count,
  l.recent_redeem_attempts_24h,
  l.created_at as last_log_at
from public.system_heartbeat_state s
left join lateral (
  select *
  from public.system_heartbeat_log l
  order by l.created_at desc
  limit 1
) l on true
where s.id = 1;

drop function if exists public.admin_get_heartbeat_status();
create or replace function public.admin_get_heartbeat_status()
returns table (
  enabled boolean,
  schedule text,
  page_tracking_enabled boolean,
  admin_tracking_enabled boolean,
  bundle_enabled boolean,
  last_run_at timestamptz,
  last_source text,
  total_runs bigint,
  last_log_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin_user(auth.uid()) then
    raise exception 'Admin only';
  end if;

  return query
  select
    s.heartbeat_enabled as enabled,
    s.heartbeat_schedule as schedule,
    s.page_tracking_enabled,
    s.admin_tracking_enabled,
    (s.heartbeat_enabled and s.page_tracking_enabled and s.admin_tracking_enabled) as bundle_enabled,
    s.last_run_at,
    s.last_source,
    s.total_runs,
    l.last_log_at
  from public.system_heartbeat_state s
  left join lateral (
    select created_at as last_log_at
    from public.system_heartbeat_log
    order by created_at desc
    limit 1
  ) l on true
  where s.id = 1;
end;
$$;

revoke all on function public.admin_get_heartbeat_status() from public;
grant execute on function public.admin_get_heartbeat_status() to authenticated;

drop function if exists public.admin_set_heartbeat_enabled(boolean);
create or replace function public.admin_set_heartbeat_enabled(p_enabled boolean)
returns table (
  ok boolean,
  message text,
  enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_enabled boolean := coalesce(p_enabled, true);
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return query select false, 'Not authenticated', null::boolean;
    return;
  end if;

  if not public.is_admin_user(v_uid) then
    return query select false, 'Admin only', null::boolean;
    return;
  end if;

  update public.system_heartbeat_state
  set heartbeat_enabled = v_target_enabled
  where id = 1;

  if exists (
    select 1
    from public.system_heartbeat_state s
    where s.id = 1 and s.admin_tracking_enabled = true
  ) then
    insert into public.admin_maintenance_actions (acted_by, action_type, detail)
    values (v_uid, 'toggle_heartbeat', case when v_target_enabled then 'enabled' else 'paused' end);
  end if;

  if v_target_enabled then
    return query select true, 'Heartbeat automation enabled', true;
    return;
  end if;

  return query select true, 'Heartbeat automation paused', false;
end;
$$;

revoke all on function public.admin_set_heartbeat_enabled(boolean) from public;
grant execute on function public.admin_set_heartbeat_enabled(boolean) to authenticated;

drop function if exists public.admin_set_maintenance_bundle_enabled(boolean);
create or replace function public.admin_set_maintenance_bundle_enabled(p_enabled boolean)
returns table (
  ok boolean,
  message text,
  enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_enabled boolean := coalesce(p_enabled, true);
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return query select false, 'Not authenticated', null::boolean;
    return;
  end if;

  if not public.is_admin_user(v_uid) then
    return query select false, 'Admin only', null::boolean;
    return;
  end if;

  update public.system_heartbeat_state
  set
    heartbeat_enabled = v_target_enabled,
    page_tracking_enabled = v_target_enabled,
    admin_tracking_enabled = v_target_enabled
  where id = 1;

  insert into public.admin_maintenance_actions (acted_by, action_type, detail)
  values (v_uid, 'toggle_bundle', case when v_target_enabled then 'enabled' else 'paused' end);

  if v_target_enabled then
    return query select true, 'Maintenance bundle enabled', true;
    return;
  end if;

  return query select true, 'Maintenance bundle paused', false;
end;
$$;

revoke all on function public.admin_set_maintenance_bundle_enabled(boolean) from public;
grant execute on function public.admin_set_maintenance_bundle_enabled(boolean) to authenticated;

drop function if exists public.admin_get_maintenance_metrics(int);
create or replace function public.admin_get_maintenance_metrics(p_hours int default 24)
returns table (
  hours_window int,
  page_views bigint,
  unique_pages bigint,
  admin_page_views bigint,
  admin_unique_users bigint,
  admin_actions bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hours int := greatest(1, least(coalesce(p_hours, 24), 168));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin_user(auth.uid()) then
    raise exception 'Admin only';
  end if;

  return query
  select
    v_hours,
    (select count(*) from public.page_view_events v where v.viewed_at > now() - make_interval(hours => v_hours)),
    (select count(distinct v.page_path) from public.page_view_events v where v.viewed_at > now() - make_interval(hours => v_hours)),
    (select count(*) from public.admin_page_view_events v where v.viewed_at > now() - make_interval(hours => v_hours)),
    (select count(distinct v.viewer_user_id) from public.admin_page_view_events v where v.viewed_at > now() - make_interval(hours => v_hours)),
    (select count(*) from public.admin_maintenance_actions a where a.created_at > now() - make_interval(hours => v_hours));
end;
$$;

revoke all on function public.admin_get_maintenance_metrics(int) from public;
grant execute on function public.admin_get_maintenance_metrics(int) to authenticated;

drop function if exists public.admin_top_page_views(int, int);
create or replace function public.admin_top_page_views(p_hours int default 24, p_limit int default 10)
returns table (
  page_path text,
  views bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hours int := greatest(1, least(coalesce(p_hours, 24), 168));
  v_limit int := greatest(1, least(coalesce(p_limit, 10), 100));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin_user(auth.uid()) then
    raise exception 'Admin only';
  end if;

  return query
  select
    v.page_path,
    count(*) as views
  from public.page_view_events v
  where v.viewed_at > now() - make_interval(hours => v_hours)
  group by v.page_path
  order by views desc, v.page_path asc
  limit v_limit;
end;
$$;

revoke all on function public.admin_top_page_views(int, int) from public;
grant execute on function public.admin_top_page_views(int, int) to authenticated;

drop function if exists public.admin_recent_maintenance_actions(int);
create or replace function public.admin_recent_maintenance_actions(p_limit int default 20)
returns table (
  created_at timestamptz,
  action_type text,
  detail text,
  acted_by uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int := greatest(1, least(coalesce(p_limit, 20), 200));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin_user(auth.uid()) then
    raise exception 'Admin only';
  end if;

  return query
  select a.created_at, a.action_type, a.detail, a.acted_by
  from public.admin_maintenance_actions a
  order by a.created_at desc
  limit v_limit;
end;
$$;

revoke all on function public.admin_recent_maintenance_actions(int) from public;
grant execute on function public.admin_recent_maintenance_actions(int) to authenticated;

-- Bootstrap one heartbeat now so status is visible right away.
select public.run_system_heartbeat('bootstrap');

-- Recreate cron jobs idempotently.
do $$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id
  from cron.job
  where jobname = 'beeyuan-heartbeat-every-6h';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'beeyuan-heartbeat-every-6h',
    '0 */6 * * *',
    $cmd$select public.run_system_heartbeat('pg_cron');$cmd$
  );

  select jobid into v_job_id
  from cron.job
  where jobname = 'beeyuan-heartbeat-cleanup-daily';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'beeyuan-heartbeat-cleanup-daily',
    '20 3 * * *',
    $cmd$select public.cleanup_system_heartbeat_log(60);$cmd$
  );
end $$;
