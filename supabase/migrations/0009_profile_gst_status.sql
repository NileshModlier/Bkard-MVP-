-- ============================================================================
-- 0009_profile_gst_status.sql
-- GST Phase 1: gst_number already exists on profiles (0002).
-- Adds gst_status. authenticated may write only 'Not submitted' |
-- 'Pending Verification'. 'Verified' | 'Rejected' are service_role only.
-- Final statuses cannot be changed back by the client.
-- ============================================================================

alter table public.profiles
  add column if not exists gst_number text;

alter table public.profiles
  add column if not exists gst_status text not null default 'Not submitted';

alter table public.profiles
  drop constraint if exists profiles_gst_status_check;

alter table public.profiles
  add constraint profiles_gst_status_check
  check (gst_status in (
    'Not submitted',
    'Pending Verification',
    'Verified',
    'Rejected'
  ));

comment on column public.profiles.gst_status is
  'Workflow status. authenticated may write Not submitted or Pending Verification only, and cannot change Verified or Rejected. Those two values are service_role only (future GST API).';

create or replace function public.protect_profile_gst_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    if old.gst_status in ('Verified', 'Rejected') then
      new.gst_status := old.gst_status;
    elsif new.gst_status is distinct from old.gst_status
      and new.gst_status not in ('Not submitted', 'Pending Verification') then
      new.gst_status := old.gst_status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_gst_status on public.profiles;
create trigger profiles_protect_gst_status
  before update on public.profiles
  for each row execute function public.protect_profile_gst_status();

comment on function public.protect_profile_gst_status() is
  'authenticated/anon: cannot set Verified/Rejected; cannot change gst_status once it is Verified or Rejected. service_role bypasses this.';
