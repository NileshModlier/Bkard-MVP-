-- ============================================================================
-- 0003_cards.sql
-- Replaces the localStorage-only `bkard_cards` key as the source of truth.
-- localStorage keeps a CACHE of this table for offline reading only —
-- see "localStorage as Cache" in the response for the sync contract.
-- ============================================================================

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,

  template_id text not null default 'obsidian',

  full_name text not null default '',
  job_title text not null default '',
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  website text not null default '',
  address text not null default '',
  bio text not null default '',
  avatar_url text,
  socials jsonb not null default '{}'::jsonb,

  -- Denormalized from profiles at write time so a public card viewer never
  -- needs to (and, per RLS, cannot) read the owner's private profiles row
  -- just to show the executive-verified badge.
  owner_gst_verified boolean not null default false,

  views integer not null default 0,
  is_public boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cards_template_id_not_blank check (length(trim(template_id)) > 0),
  constraint cards_views_non_negative check (views >= 0)
);

comment on table public.cards is
  'A single digital business card. is_public + owner_id together define the RLS-enforced sharing boundary used by the public /cards/share/:id page.';
comment on column public.cards.owner_gst_verified is
  'Denormalized snapshot of profiles.gst_verified at last sync, kept in sync via trigger below, so public card reads never need profiles access.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists cards_owner_id_idx on public.cards (owner_id);
create index if not exists cards_owner_id_created_at_idx on public.cards (owner_id, created_at desc);
-- Public-card lookups by id are the hottest read path in the app (every QR
-- scan / share-link open) — id is already the primary key (indexed), this
-- partial index optimizes the common "public + by id" filter combination.
create index if not exists cards_public_idx on public.cards (id) where is_public = true;
create index if not exists cards_template_id_idx on public.cards (template_id);

-- ---------------------------------------------------------------------------
-- Trigger: updated_at
-- ---------------------------------------------------------------------------
drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: keep owner_gst_verified denormalization in sync whenever the
-- owning profile's verification status changes.
-- ---------------------------------------------------------------------------
create or replace function public.sync_card_gst_badge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.gst_verified is distinct from old.gst_verified then
    update public.cards
      set owner_gst_verified = new.gst_verified
      where owner_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_card_gst_badge on public.profiles;
create trigger profiles_sync_card_gst_badge
  after update on public.profiles
  for each row execute function public.sync_card_gst_badge();

-- ---------------------------------------------------------------------------
-- Also stamp owner_gst_verified correctly at card-creation time
-- ---------------------------------------------------------------------------
create or replace function public.stamp_card_gst_badge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select gst_verified into new.owner_gst_verified
    from public.profiles where id = new.owner_id;
  return new;
end;
$$;

drop trigger if exists cards_stamp_gst_badge on public.cards;
create trigger cards_stamp_gst_badge
  before insert on public.cards
  for each row execute function public.stamp_card_gst_badge();

-- ---------------------------------------------------------------------------
-- Atomic, race-free view counter (fixes the client-side useRef/StrictMode
-- double-count and refresh-to-inflate problems from the architecture review)
-- ---------------------------------------------------------------------------
create or replace function public.increment_card_views(card_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.cards set views = views + 1 where id = card_id and is_public = true;
$$;

comment on function public.increment_card_views(uuid) is
  'Atomic view-count increment, callable by anon/authenticated via RPC. SECURITY DEFINER so an unauthenticated visitor can increment views without needing UPDATE grants on the whole table.';

revoke all on function public.increment_card_views(uuid) from public;
grant execute on function public.increment_card_views(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.cards enable row level security;

-- Public cards are readable by ANYONE, including unauthenticated visitors —
-- this is what makes /cards/share/:id actually work cross-device, which
-- was the most critical gap found in the architecture review.
create policy cards_select_public_or_own
  on public.cards for select
  using (is_public = true or auth.uid() = owner_id);

create policy cards_insert_own
  on public.cards for insert
  with check (auth.uid() = owner_id);

create policy cards_update_own
  on public.cards for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy cards_delete_own
  on public.cards for delete
  using (auth.uid() = owner_id);
