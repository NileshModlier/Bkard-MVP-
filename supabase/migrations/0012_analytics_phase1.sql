-- ============================================================================
-- 0012_analytics_phase1.sql
-- Extends 0008 analytics_events. Does not create a second events table.
-- ============================================================================

alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check
  check (event_type in ('view', 'qr_scan', 'copy_link', 'whatsapp_share'));

drop index if exists analytics_events_dedupe_idx;

create unique index if not exists analytics_events_view_qr_dedupe_idx
  on public.analytics_events (card_id, visitor_hash, ((created_at)::date), event_type)
  where event_type in ('view', 'qr_scan');

alter table public.cards
  add column if not exists qr_scans integer not null default 0;

alter table public.cards
  add column if not exists copy_link_clicks integer not null default 0;

alter table public.cards
  add column if not exists whatsapp_shares integer not null default 0;

create or replace function public.record_card_event(
  p_card_id uuid,
  p_event_type text,
  p_visitor_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_inserted boolean := false;
begin
  if p_event_type not in ('view', 'qr_scan', 'copy_link', 'whatsapp_share') then
    raise exception 'invalid event_type: %', p_event_type;
  end if;

  if p_visitor_hash is null or length(trim(p_visitor_hash)) = 0 then
    return false;
  end if;

  select owner_id into v_owner_id from public.cards where id = p_card_id;
  if v_owner_id is null then
    return false;
  end if;

  -- Logged-in owners do not inflate view / QR stats.
  if p_event_type in ('view', 'qr_scan')
     and auth.uid() is not null
     and auth.uid() = v_owner_id then
    return false;
  end if;

  begin
    insert into public.analytics_events (card_id, event_type, visitor_hash)
    values (p_card_id, p_event_type, trim(p_visitor_hash));
    v_inserted := true;
  exception
    when unique_violation then
      v_inserted := false;
  end;

  if not v_inserted then
    return false;
  end if;

  if p_event_type = 'view' then
    perform public.increment_card_views(p_card_id);
  elsif p_event_type = 'qr_scan' then
    update public.cards
      set qr_scans = qr_scans + 1
      where id = p_card_id and is_public = true;
  elsif p_event_type = 'copy_link' then
    update public.cards
      set copy_link_clicks = copy_link_clicks + 1
      where id = p_card_id and is_public = true;
  elsif p_event_type = 'whatsapp_share' then
    update public.cards
      set whatsapp_shares = whatsapp_shares + 1
      where id = p_card_id and is_public = true;
  end if;

  return true;
end;
$$;

comment on function public.record_card_event(uuid, text, text) is
  'Inserts an analytics event. Dedupes view/qr_scan per visitor per day. Skips view/qr_scan when auth.uid() is the card owner. Increments cards counters.';

revoke all on function public.record_card_event(uuid, text, text) from public;
grant execute on function public.record_card_event(uuid, text, text) to anon, authenticated;
