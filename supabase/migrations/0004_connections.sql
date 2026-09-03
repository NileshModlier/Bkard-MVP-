-- ============================================================================
-- 0004_connections.sql
-- Professional-networking connection requests. Replaces the old (broken)
-- pattern of incrementing a non-existent `cards.connections` counter column
-- with real, queryable rows.
-- ============================================================================

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,

  requester_id uuid references public.profiles (id) on delete set null,
  requester_name text,
  requester_email text,

  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),

  created_at timestamptz not null default now(),
  responded_at timestamptz,

  constraint connections_requester_identity check (
    requester_id is not null or (requester_name is not null and requester_email is not null)
  )
);

comment on table public.connections is
  'A connection request made against a card. Anonymous visitors may submit a request (requester_id null) by supplying name+email; authenticated users are linked via requester_id.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists connections_card_id_idx on public.connections (card_id);
create index if not exists connections_card_id_status_idx on public.connections (card_id, status);
create index if not exists connections_requester_id_idx on public.connections (requester_id) where requester_id is not null;
-- Prevent duplicate pending requests from the same authenticated requester
-- against the same card (a common networking-app spam vector).
create unique index if not exists connections_unique_pending_per_requester
  on public.connections (card_id, requester_id)
  where status = 'pending' and requester_id is not null;

-- ---------------------------------------------------------------------------
-- Trigger: stamp responded_at when status changes away from pending
-- ---------------------------------------------------------------------------
create or replace function public.stamp_connection_response()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status <> 'pending' and old.status = 'pending' then
    new.responded_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists connections_stamp_response on public.connections;
create trigger connections_stamp_response
  before update on public.connections
  for each row execute function public.stamp_connection_response();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.connections enable row level security;

-- Only the card's owner may read the requests made against their card.
create policy connections_select_owner
  on public.connections for select
  using (
    auth.uid() = (select owner_id from public.cards where cards.id = connections.card_id)
  );

-- Anyone (including anonymous visitors) may submit a connection request —
-- this is intentional; the public share page is the entry point.
-- requester_id, if provided, must match the caller's own auth.uid() so a
-- logged-in user cannot submit a request impersonating someone else.
create policy connections_insert_any
  on public.connections for insert
  with check (requester_id is null or requester_id = auth.uid());

-- Only the card's owner may update status (accept/decline).
create policy connections_update_owner
  on public.connections for update
  using (
    auth.uid() = (select owner_id from public.cards where cards.id = connections.card_id)
  )
  with check (
    auth.uid() = (select owner_id from public.cards where cards.id = connections.card_id)
  );
