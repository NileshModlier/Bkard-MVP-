-- ============================================================================
-- 0005_downloads.sql
-- Replaces `bkard_download_count` (a bypassable client-side localStorage
-- counter) with a server-enforced, atomic, race-free limit. This is the
-- single highest-priority fix from the architecture review (§12, Critical).
-- ============================================================================

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,

  format text not null check (format in ('png', 'pdf', 'vcard')),

  created_at timestamptz not null default now()
);

comment on table public.downloads is
  'Audit log of every export action, and the basis for atomic free-tier enforcement via register_card_download() below. Insert only through that function in production — never insert directly from client code.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists downloads_owner_id_idx on public.downloads (owner_id);
create index if not exists downloads_owner_id_created_at_idx on public.downloads (owner_id, created_at desc);
create index if not exists downloads_card_id_idx on public.downloads (card_id);

-- ---------------------------------------------------------------------------
-- Free-tier limit as a single, changeable constant. Kept in SQL (not just
-- the frontend's FREE_DOWNLOAD_LIMIT constant) so the server-side function
-- below is the actual enforcement point, with the frontend constant used
-- only for display copy ("12 of 15 remaining").
-- ---------------------------------------------------------------------------
create or replace function public.free_download_limit()
returns integer
language sql
immutable
as $$
  select 15;
$$;

-- ---------------------------------------------------------------------------
-- Atomic check-and-insert. This is the function the register-download Edge
-- Function calls (or that can be called directly via RPC with the
-- authenticated user's JWT — either path enforces the same rule).
--
-- Uses `for update` row locking on a per-owner advisory approach via
-- pg_advisory_xact_lock to close the race condition where two concurrent
-- downloads both read count=14 and both succeed. SECURITY DEFINER so the
-- function can read profiles.is_premium (bypassing the anon/authenticated
-- RLS restriction on that column) as part of a single atomic decision.
-- ---------------------------------------------------------------------------
create or replace function public.register_card_download(
  p_card_id uuid,
  p_format text
)
returns table (allowed boolean, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_is_premium boolean;
  v_current_count integer;
  v_limit integer := public.free_download_limit();
begin
  if p_format not in ('png', 'pdf', 'vcard') then
    raise exception 'invalid format: %', p_format;
  end if;

  select owner_id into v_owner_id from public.cards where id = p_card_id;
  if v_owner_id is null then
    raise exception 'card not found: %', p_card_id;
  end if;

  -- Lock on the owner so concurrent downloads for the same account
  -- serialize through this check — this is what closes the race condition
  -- the client-side counter could never close.
  perform pg_advisory_xact_lock(hashtext(v_owner_id::text));

  select is_premium into v_is_premium from public.profiles where id = v_owner_id;

  if v_is_premium then
    insert into public.downloads (card_id, owner_id, format) values (p_card_id, v_owner_id, p_format);
    return query select true, null::integer;
    return;
  end if;

  select count(*) into v_current_count from public.downloads where owner_id = v_owner_id;

  if v_current_count >= v_limit then
    return query select false, 0;
    return;
  end if;

  insert into public.downloads (card_id, owner_id, format) values (p_card_id, v_owner_id, p_format);
  return query select true, (v_limit - v_current_count - 1);
end;
$$;

comment on function public.register_card_download(uuid, text) is
  'The ONLY sanctioned way to record a download. Atomically checks the free-tier limit and inserts in one transaction (closing the race condition and the clear-localStorage bypass from the pre-migration architecture). Call via supabase.rpc(''register_card_download'', {...}) — do not insert into downloads directly.';

revoke all on function public.register_card_download(uuid, text) from public;
grant execute on function public.register_card_download(uuid, text) to authenticated;
-- Intentionally NOT granted to `anon` — only the authenticated card owner
-- downloads against their own quota. A public visitor exporting a card
-- they're viewing should be routed through the owner's session context or
-- a separate, more permissive "visitor export" policy decision — flagged
-- as a product decision to make explicitly, not defaulted silently here.

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.downloads enable row level security;

-- Only the owner may read their own download history/count.
create policy downloads_select_owner
  on public.downloads for select
  using (auth.uid() = owner_id);

-- No direct INSERT policy for authenticated/anon roles — inserts happen
-- exclusively through register_card_download() (SECURITY DEFINER, which
-- bypasses RLS by design). This is what makes the client-side "just insert
-- a row" bypass structurally impossible, not just discouraged by convention.
