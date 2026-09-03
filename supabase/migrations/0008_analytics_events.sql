-- ============================================================================
-- 0008_analytics_events.sql
-- Real, dedupable view tracking. The atomic increment_card_views() function
-- in 0003_cards.sql fixes the RACE CONDITION in view counting; this table
-- fixes the separate DEDUPE problem (a visitor refreshing the page or a
-- React StrictMode double-effect inflating the count). One unique
-- constraint replaces the old client-side useRef guard entirely.
-- ============================================================================

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  event_type text not null check (event_type in ('view', 'qr_scan')),

  -- A stable-but-anonymous per-browser identifier (e.g. a UUID persisted in
  -- a first-party cookie set by the client, NOT derived from IP — avoids
  -- storing PII while still deduping real repeat visits within a window).
  visitor_hash text not null,

  created_at timestamptz not null default now()
);

comment on table public.analytics_events is
  'Dedupable view/scan events. A (card_id, visitor_hash, day) unique index below prevents refresh-to-inflate without needing to store any PII about the visitor.';

create index if not exists analytics_events_card_id_idx on public.analytics_events (card_id, created_at desc);

-- One counted view per visitor per card per calendar day.
create unique index if not exists analytics_events_dedupe_idx
  on public.analytics_events (card_id, visitor_hash, (created_at::date), event_type);

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
begin
  insert into public.analytics_events (card_id, event_type, visitor_hash)
  values (p_card_id, p_event_type, p_visitor_hash)
  on conflict do nothing;

  if found then
    if p_event_type = 'view' then
      perform public.increment_card_views(p_card_id);
    end if;
    return true;
  end if;

  return false; -- already counted today for this visitor
end;
$$;

revoke all on function public.record_card_event(uuid, text, text) from public;
grant execute on function public.record_card_event(uuid, text, text) to anon, authenticated;

alter table public.analytics_events enable row level security;

-- No SELECT policy for anon/authenticated at all — this table is
-- write-only from the client's perspective (via the RPC above, which is
-- SECURITY DEFINER). Card owners see aggregated views via cards.views,
-- not raw event rows.
create policy analytics_events_owner_read
  on public.analytics_events for select
  using (
    auth.uid() = (select owner_id from public.cards where cards.id = analytics_events.card_id)
  );
