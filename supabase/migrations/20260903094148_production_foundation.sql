-- Pawlytics production foundation
-- Lifecycle, moderation, authority SLAs, notifications, analytics and RLS.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Roles are stored in public.users, never in user-editable JWT metadata.
alter table public.users
  add column if not exists trust_score numeric not null default 0.50 check (trust_score between 0 and 1),
  add column if not exists confirmed_report_count integer not null default 0 check (confirmed_report_count >= 0),
  add column if not exists rejected_report_count integer not null default 0 check (rejected_report_count >= 0),
  add column if not exists false_report_count integer not null default 0 check (false_report_count >= 0),
  add column if not exists preferred_ward text,
  add column if not exists notifications_enabled boolean not null default true,
  add column if not exists role_version integer not null default 1;

create or replace function private.is_authority()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid())
      and role in ('admin', 'moderator', 'dispatcher', 'field_officer')
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_authority() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_authority() to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Replace the legacy signup trigger that trusted user-editable role metadata.
drop trigger if exists on_auth_user_created on auth.users;
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, role) values (new.id, 'citizen') on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.is_admin(); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Normalize the legacy state before applying the lifecycle constraint.
update public.reports set status = 'pending_verification' where status = 'under_review';

alter table public.reports
  add column if not exists client_submission_id uuid,
  add column if not exists evidence_path text,
  add column if not exists submitted_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists assigned_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists assigned_to uuid references public.users(id) on delete set null,
  add column if not exists resolution_summary text,
  add column if not exists confirmation_count integer not null default 0 check (confirmation_count >= 0),
  add column if not exists dispute_count integer not null default 0 check (dispute_count >= 0),
  add column if not exists duplicate_score numeric check (duplicate_score between 0 and 1),
  add column if not exists risk_weight numeric not null default 0 check (risk_weight between 0 and 1);

update public.reports
set submitted_at = coalesce(submitted_at, created_at, now()),
    expires_at = coalesce(expires_at, incident_timestamp + interval '30 days');

alter table public.reports alter column status set default 'submitted';
alter table public.reports alter column submitted_at set default now();
alter table public.reports alter column expires_at set default (now() + interval '30 days');

alter table public.reports drop constraint if exists reports_status_check;
alter table public.reports add constraint reports_status_check check (
  status in ('submitted', 'pending_verification', 'verified', 'assigned', 'resolved', 'expired', 'rejected', 'duplicate')
);
alter table public.reports drop constraint if exists reports_verification_status_check;
alter table public.reports add constraint reports_verification_status_check check (
  verification_status in ('pending', 'verified', 'rejected', 'duplicate')
);
alter table public.reports drop constraint if exists reports_severity_check;
alter table public.reports add constraint reports_severity_check check (severity_level between 1 and 5);
alter table public.reports drop constraint if exists reports_dog_count_check;
alter table public.reports add constraint reports_dog_count_check check (dog_count between 1 and 100);
alter table public.reports drop constraint if exists reports_coordinates_check;
alter table public.reports add constraint reports_coordinates_check check (
  latitude between -90 and 90 and longitude between -180 and 180
);
alter table public.reports drop constraint if exists reports_description_length_check;
alter table public.reports add constraint reports_description_length_check check (
  description is null or char_length(description) <= 2000
);
create unique index if not exists idx_reports_client_submission_id
  on public.reports(client_submission_id) where client_submission_id is not null;
create index if not exists idx_reports_active_lifecycle
  on public.reports(status, expires_at) where status not in ('resolved', 'expired', 'rejected', 'duplicate');
create index if not exists idx_reports_duplicate_scan
  on public.reports(category, incident_timestamp desc);

-- Sanitized public telemetry endpoint: no reporter identity, notes or evidence.
create or replace function public.get_active_reports(days integer default 30)
returns table (
  id uuid, category text, severity_level integer, description text,
  latitude double precision, longitude double precision, location_label text,
  ward text, incident_timestamp timestamptz, status text,
  verification_status text, dog_count integer, group_detected boolean,
  context_tags text[], confirmation_count integer, dispute_count integer,
  is_owner boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.category, r.severity_level,
    left(coalesce(r.description, ''), 500), r.latitude, r.longitude,
    r.location_label, r.ward, r.incident_timestamp, r.status,
    r.verification_status, r.dog_count, r.group_detected, r.context_tags,
    r.confirmation_count, r.dispute_count, r.reporter_id = (select auth.uid())
  from public.reports r
  where r.is_demo = false
    and r.status in ('verified', 'assigned')
    and r.expires_at > now()
    and r.incident_timestamp > now() - make_interval(days => least(greatest(days, 1), 90));
$$;
revoke all on function public.get_active_reports(integer) from public, anon;
grant execute on function public.get_active_reports(integer) to authenticated;

alter table public.authority_actions
  add column if not exists report_id uuid references public.reports(id) on delete set null,
  add column if not exists assigned_to uuid references public.users(id) on delete set null,
  add column if not exists acknowledged_at timestamptz,
  add column if not exists due_at timestamptz,
  add column if not exists resolution_evidence_url text,
  add column if not exists resolution_summary text;

alter table public.authority_actions drop constraint if exists authority_actions_status_check;
alter table public.authority_actions add constraint authority_actions_status_check check (
  status in ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled', 'overdue')
);
create index if not exists idx_authority_actions_sla on public.authority_actions(status, due_at);
create index if not exists idx_authority_actions_report on public.authority_actions(report_id);

create table if not exists public.report_confirmations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  decision text not null check (decision in ('confirm', 'dispute')),
  reason text check (reason is null or char_length(reason) <= 500),
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);
create index if not exists idx_report_confirmations_report on public.report_confirmations(report_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  notification_type text not null check (notification_type in ('report_update', 'nearby_risk', 'assignment', 'resolution', 'system')),
  title text not null check (char_length(title) between 1 and 120),
  message text not null check (char_length(message) between 1 and 500),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, created_at desc) where read_at is null;

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id, created_at desc);

-- Privacy-safe product analytics: aggregate counts only; no movement or precise location.
create table if not exists public.analytics_daily (
  metric_date date not null default current_date,
  event_type text not null,
  event_count bigint not null default 0 check (event_count >= 0),
  primary key (metric_date, event_type)
);

create or replace function private.validate_report_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if new.status = old.status then return new; end if;
  allowed := case old.status
    when 'submitted' then new.status in ('pending_verification', 'expired')
    when 'pending_verification' then new.status in ('verified', 'rejected', 'duplicate', 'expired')
    when 'verified' then new.status in ('assigned', 'resolved', 'expired')
    when 'assigned' then new.status in ('resolved', 'expired')
    else false
  end;
  if not allowed then
    raise exception 'Invalid report status transition: % -> %', old.status, new.status using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.set_report_lifecycle_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.submitted_at := coalesce(new.submitted_at, now());
  new.expires_at := coalesce(new.expires_at, new.incident_timestamp + interval '30 days');
  if new.status = 'verified' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.verified_at := coalesce(new.verified_at, now());
    new.verification_status := 'verified';
  elsif new.status = 'assigned' and old.status is distinct from new.status then
    new.assigned_at := coalesce(new.assigned_at, now());
  elsif new.status = 'resolved' and old.status is distinct from new.status then
    new.resolved_at := coalesce(new.resolved_at, now());
  elsif new.status in ('rejected', 'duplicate') then
    new.verification_status := new.status;
  end if;
  return new;
end;
$$;

create or replace function private.enforce_report_rate_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.reporter_id is null or new.reporter_id <> (select auth.uid()) then
    raise exception 'reporter_id must match the authenticated user' using errcode = '42501';
  end if;
  if (select count(*) from public.reports
      where reporter_id = new.reporter_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Report limit reached. Try again later.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function private.flag_potential_duplicate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare candidate record;
declare distance_km numeric;
declare hour_gap numeric;
begin
  select r.id, r.latitude, r.longitude, r.incident_timestamp into candidate
  from public.reports r
  where r.category = new.category
    and r.status not in ('expired', 'rejected', 'duplicate')
    and r.incident_timestamp between new.incident_timestamp - interval '24 hours' and new.incident_timestamp + interval '24 hours'
    and abs(r.latitude - new.latitude) < 0.01 and abs(r.longitude - new.longitude) < 0.01
  order by abs(extract(epoch from (r.incident_timestamp - new.incident_timestamp))) asc
  limit 1;
  if candidate.id is null then return new; end if;
  distance_km := 111 * sqrt(power(candidate.latitude - new.latitude, 2)
    + power((candidate.longitude - new.longitude) * cos(radians(new.latitude)), 2));
  if distance_km > 0.5 then return new; end if;
  hour_gap := abs(extract(epoch from (candidate.incident_timestamp - new.incident_timestamp))) / 3600;
  new.duplicate_score := round((0.30 + 0.35 * (1 - distance_km / 0.5) + 0.25 * (1 - hour_gap / 24))::numeric, 2);
  if new.duplicate_score >= 0.65 then
    new.duplicate_of := candidate.id;
    new.suspicious_flag := true;
  end if;
  return new;
end;
$$;

create or replace function private.refresh_reporter_reputation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reporter_id is null or old.status is not distinct from new.status then return new; end if;
  update public.users u set
    confirmed_report_count = stats.confirmed,
    rejected_report_count = stats.rejected,
    false_report_count = stats.false_reports,
    trust_score = greatest(0.10, least(1.0,
      (stats.confirmed + 2.0) / (stats.confirmed + stats.rejected + stats.false_reports * 3.0 + 4.0)))
  from (
    select count(*) filter (where status in ('verified', 'assigned', 'resolved'))::integer confirmed,
      count(*) filter (where status = 'rejected')::integer rejected,
      count(*) filter (where status = 'rejected' and suspicious_flag)::integer false_reports
    from public.reports where reporter_id = new.reporter_id
  ) stats
  where u.id = new.reporter_id;
  return new;
end;
$$;

create or replace function private.refresh_confirmation_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid := coalesce(new.report_id, old.report_id);
begin
  update public.reports set
    confirmation_count = (select count(*) from public.report_confirmations where report_id = target_id and decision = 'confirm'),
    dispute_count = (select count(*) from public.report_confirmations where report_id = target_id and decision = 'dispute')
  where id = target_id;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function private.audit_workflow_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare payload jsonb;
begin
  if tg_table_name = 'reports' then
    payload := jsonb_build_object('from_status', old.status, 'to_status', new.status,
      'verification_status', new.verification_status, 'assigned_to', new.assigned_to);
  else
    payload := jsonb_build_object('from_status', old.status, 'to_status', new.status,
      'assigned_to', new.assigned_to, 'due_at', new.due_at);
  end if;
  insert into public.audit_logs(actor_id, entity_type, entity_id, action, metadata)
  values ((select auth.uid()), tg_table_name, new.id, 'status_changed', payload);
  return new;
end;
$$;

create or replace function private.notify_report_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reporter_id is not null and old.status is distinct from new.status then
    insert into public.notifications(user_id, report_id, notification_type, title, message)
    values (new.reporter_id, new.id,
      case when new.status = 'resolved' then 'resolution' else 'report_update' end,
      case when new.status = 'resolved' then 'Your report was resolved' else 'Report status updated' end,
      'Your report is now ' || replace(new.status, '_', ' ') || '.');
  end if;
  if new.status = 'verified' and old.status is distinct from new.status and new.ward is not null then
    insert into public.notifications(user_id, report_id, notification_type, title, message)
    select u.id, new.id, 'nearby_risk', 'Verified risk near your preferred area',
      coalesce(new.location_label, new.ward) || ': ' || replace(new.category, '_', ' ')
    from public.users u
    where u.notifications_enabled and u.preferred_ward = new.ward and u.id <> coalesce(new.reporter_id, gen_random_uuid());
  end if;
  return new;
end;
$$;

create or replace function private.track_workflow_metric()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare metric text;
begin
  metric := case
    when tg_op = 'INSERT' then 'report_submitted'
    when new.status = 'verified' and old.status is distinct from new.status then 'report_verified'
    when new.status = 'resolved' and old.status is distinct from new.status then 'report_resolved'
    when new.status = 'rejected' and old.status is distinct from new.status then 'report_rejected'
    when new.status = 'duplicate' and old.status is distinct from new.status then 'report_duplicate'
    else null
  end;
  if metric is not null then
    insert into public.analytics_daily(metric_date, event_type, event_count)
    values (current_date, metric, 1)
    on conflict (metric_date, event_type) do update set event_count = public.analytics_daily.event_count + 1;
  end if;
  return new;
end;
$$;

create or replace function private.revoke_sessions_on_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role is distinct from new.role then
    new.role_version := old.role_version + 1;
    delete from auth.sessions where user_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on all functions in schema private from public, anon;
grant execute on function private.is_authority() to authenticated;
grant execute on function private.is_admin() to authenticated;

drop trigger if exists validate_report_transition on public.reports;
create trigger validate_report_transition before update of status on public.reports
for each row execute function private.validate_report_transition();
drop trigger if exists set_report_lifecycle_fields on public.reports;
create trigger set_report_lifecycle_fields before insert or update on public.reports
for each row execute function private.set_report_lifecycle_fields();
drop trigger if exists enforce_report_rate_limit on public.reports;
create trigger enforce_report_rate_limit before insert on public.reports
for each row when (new.is_demo = false) execute function private.enforce_report_rate_limit();
drop trigger if exists flag_potential_duplicate on public.reports;
create trigger flag_potential_duplicate before insert on public.reports
for each row when (new.is_demo = false) execute function private.flag_potential_duplicate();
drop trigger if exists refresh_confirmation_counts on public.report_confirmations;
create trigger refresh_confirmation_counts after insert or update or delete on public.report_confirmations
for each row execute function private.refresh_confirmation_counts();
drop trigger if exists audit_report_status on public.reports;
create trigger audit_report_status after update of status on public.reports
for each row when (old.status is distinct from new.status) execute function private.audit_workflow_change();
drop trigger if exists audit_action_status on public.authority_actions;
create trigger audit_action_status after update of status on public.authority_actions
for each row when (old.status is distinct from new.status) execute function private.audit_workflow_change();
drop trigger if exists notify_report_change on public.reports;
create trigger notify_report_change after update of status on public.reports
for each row when (old.status is distinct from new.status) execute function private.notify_report_change();
drop trigger if exists track_report_metric on public.reports;
create trigger track_report_metric after insert or update of status on public.reports
for each row execute function private.track_workflow_metric();
drop trigger if exists refresh_reporter_reputation on public.reports;
create trigger refresh_reporter_reputation after update of status on public.reports
for each row execute function private.refresh_reporter_reputation();
drop trigger if exists revoke_sessions_on_role_change on public.users;
create trigger revoke_sessions_on_role_change before update of role on public.users
for each row execute function private.revoke_sessions_on_role_change();

-- RLS and least-privilege grants for new data.
alter table public.report_confirmations enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.analytics_daily enable row level security;

revoke all on public.report_confirmations, public.notifications, public.audit_logs, public.analytics_daily from anon, authenticated;
grant select, insert, update, delete on public.report_confirmations to authenticated;
grant select, update on public.notifications to authenticated;
grant select on public.audit_logs, public.analytics_daily to authenticated;

drop policy if exists "Users confirm reports" on public.report_confirmations;
create policy "Users confirm reports" on public.report_confirmations for insert to authenticated
with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own confirmations" on public.report_confirmations;
create policy "Users manage own confirmations" on public.report_confirmations for all to authenticated
using ((select auth.uid()) = user_id or private.is_authority())
with check ((select auth.uid()) = user_id or private.is_authority());

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications for select to authenticated
using ((select auth.uid()) = user_id);
drop policy if exists "Users mark own notifications read" on public.notifications;
create policy "Users mark own notifications read" on public.notifications for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Authorities read audit logs" on public.audit_logs;
create policy "Authorities read audit logs" on public.audit_logs for select to authenticated
using (private.is_authority());
drop policy if exists "Authorities read analytics" on public.analytics_daily;
create policy "Authorities read analytics" on public.analytics_daily for select to authenticated
using (private.is_authority());

-- Replace permissive legacy policies with ownership and authority checks.
drop policy if exists "Citizens create reports" on public.reports;
create policy "Citizens create reports" on public.reports for insert to authenticated
with check ((select auth.uid()) = reporter_id and is_demo = false and status = 'submitted');
drop policy if exists "Citizens view own reports" on public.reports;
create policy "Citizens view own reports" on public.reports for select to authenticated
using ((select auth.uid()) = reporter_id);
drop policy if exists "Admins view all reports" on public.reports;
create policy "Authorities view reports" on public.reports for select to authenticated
using (private.is_authority());
drop policy if exists "Admins update reports" on public.reports;
create policy "Authorities update reports" on public.reports for update to authenticated
using (private.is_authority()) with check (private.is_authority());

drop policy if exists "Admins manage actions" on public.authority_actions;
create policy "Authorities manage actions" on public.authority_actions for all to authenticated
using (private.is_authority()) with check (private.is_authority());
drop policy if exists "Admins manage verifications" on public.verifications;
create policy "Authorities manage verifications" on public.verifications for all to authenticated
using (private.is_authority()) with check (private.is_authority());

drop policy if exists "Users read own profile" on public.users;
create policy "Users read own profile" on public.users for select to authenticated
using ((select auth.uid()) = id);
drop policy if exists "Admins read all profiles" on public.users;
create policy "Authorities read profiles" on public.users for select to authenticated
using (private.is_authority());
drop policy if exists "Admins update profiles" on public.users;
create policy "Admins update profiles" on public.users for update to authenticated
using (private.is_admin()) with check (private.is_admin());

-- Evidence: private bucket, limited to common image/video formats and 10 MiB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-evidence', 'report-evidence', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload report evidence" on storage.objects;
create policy "Users upload report evidence" on storage.objects for insert to authenticated
with check (bucket_id = 'report-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users read own report evidence" on storage.objects;
create policy "Users read own report evidence" on storage.objects for select to authenticated
using (bucket_id = 'report-evidence' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_authority()));
drop policy if exists "Users delete own report evidence" on storage.objects;
create policy "Users delete own report evidence" on storage.objects for delete to authenticated
using (bucket_id = 'report-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Expiry and overdue transitions can be scheduled daily with Supabase Cron.
create or replace function private.expire_stale_workflows()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reports set status = 'expired'
  where status in ('submitted', 'pending_verification', 'verified', 'assigned') and expires_at <= now();
  update public.authority_actions set status = 'overdue'
  where status in ('pending', 'acknowledged', 'in_progress') and due_at < now();
end;
$$;
revoke all on function private.expire_stale_workflows() from public, anon, authenticated;

-- Retain security/audit history for one year unless policy requires longer.
create or replace function private.prune_audit_logs(retention_days integer default 365)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare deleted_count integer;
begin
  if retention_days < 90 then
    raise exception 'Audit retention cannot be shorter than 90 days';
  end if;
  delete from public.audit_logs
  where created_at < now() - make_interval(days => retention_days);
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
revoke all on function private.prune_audit_logs(integer) from public, anon, authenticated;
