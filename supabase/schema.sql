-- ============================================================
-- Bkard — Supabase Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- profiles: one row per authenticated user (executive identity)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  company text default '',
  job_title text default '',
  gst_number text,
  gst_verified boolean not null default false,
  is_premium boolean not null default false,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- cards: digital business cards owned by a profile
-- ------------------------------------------------------------
create table if not exists public.cards (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  template_id text not null default 'obsidian',
  full_name text not null default '',
  job_title text default '',
  company text default '',
  email text default '',
  phone text default '',
  website text default '',
  address text default '',
  bio text default '',
  avatar_url text default '',
  socials jsonb not null default '{}'::jsonb,
  views integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cards_owner_id_idx on public.cards (owner_id);

-- ------------------------------------------------------------
-- connections: networking / connection requests between profiles
-- ------------------------------------------------------------
create table if not exists public.connections (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid not null references public.cards (id) on delete cascade,
  requester_id uuid references public.profiles (id) on delete set null,
  requester_name text,
  requester_email text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists connections_card_id_idx on public.connections (card_id);

-- ------------------------------------------------------------
-- downloads: audit log for PNG / PDF / vCard exports (free-tier gate)
-- ------------------------------------------------------------
create table if not exists public.downloads (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid not null references public.cards (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  format text not null check (format in ('png', 'pdf', 'vcard')),
  created_at timestamptz not null default now()
);

create index if not exists downloads_owner_id_idx on public.downloads (owner_id);

-- ------------------------------------------------------------
-- subscriptions: premium billing state
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.connections enable row level security;
alter table public.downloads enable row level security;
alter table public.subscriptions enable row level security;

-- profiles: users manage only their own row; profiles are not publicly listed
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- cards: owners have full control; anyone (incl. anonymous) can read a
-- card that is marked public — this powers the public /cards/share/:id page
create policy "cards_select_public_or_own" on public.cards
  for select using (is_public = true or auth.uid() = owner_id);

create policy "cards_insert_own" on public.cards
  for insert with check (auth.uid() = owner_id);

create policy "cards_update_own" on public.cards
  for update using (auth.uid() = owner_id);

create policy "cards_delete_own" on public.cards
  for delete using (auth.uid() = owner_id);

-- connections: card owner can view/manage requests directed at their cards;
-- anyone can create a connection request (even anonymous visitors)
create policy "connections_select_owner" on public.connections
  for select using (
    auth.uid() = (select owner_id from public.cards where cards.id = connections.card_id)
  );

create policy "connections_insert_any" on public.connections
  for insert with check (true);

create policy "connections_update_owner" on public.connections
  for update using (
    auth.uid() = (select owner_id from public.cards where cards.id = connections.card_id)
  );

-- downloads: only the card owner can read their own download log;
-- inserts are allowed from anyone triggering a download (owner or visitor)
create policy "downloads_select_owner" on public.downloads
  for select using (auth.uid() = owner_id);

create policy "downloads_insert_any" on public.downloads
  for insert with check (true);

-- subscriptions: strictly private to the owner
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = owner_id);

create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = owner_id);

create policy "subscriptions_update_own" on public.subscriptions
  for update using (auth.uid() = owner_id);

-- ============================================================
-- Triggers: keep updated_at fresh
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create a profile row whenever a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
