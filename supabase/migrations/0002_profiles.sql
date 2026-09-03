-- ============================================================================
-- 0002_profiles.sql
-- One row per auth.users row. This is the SERVER-AUTHORITATIVE replacement
-- for the localStorage keys `bkard_user`, `bkard_is_premium`, and
-- `bkard_gst_verified` — those keys become read-only CACHES of this table
-- from this migration forward (see "User Profile Strategy" in the response).
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  full_name text not null default '',
  email text not null,
  company text not null default '',
  job_title text not null default '',
  avatar_url text,

  -- GST / executive verification — server-authoritative. The client's old
  -- verifyGst() trusted a client-side regex result directly; that
  -- capability is removed here on purpose. Only the verify-gst Edge
  -- Function (running with the service_role key) may set gst_verified.
  gst_number text,
  gst_verified boolean not null default false,
  gst_verified_at timestamptz,

  -- Premium/billing — server-authoritative. Only Stripe-webhook-driven
  -- Edge Functions may set is_premium; see 0006_subscriptions.sql and the
  -- "Premium Subscription Strategy" section.
  is_premium boolean not null default false,
  stripe_customer_id text unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

comment on table public.profiles is
  'One row per authenticated user. Server-authoritative source for is_premium and gst_verified — never trust a client-supplied value for either.';
comment on column public.profiles.is_premium is
  'ONLY written by the stripe-webhook Edge Function (service_role). Client code must never update this column directly — RLS below blocks it.';
comment on column public.profiles.gst_verified is
  'ONLY written by the verify-gst Edge Function (service_role). Client code must never update this column directly — RLS below blocks it.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create unique index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_is_premium_idx on public.profiles (is_premium) where is_premium = true;
create index if not exists profiles_stripe_customer_id_idx on public.profiles (stripe_customer_id) where stripe_customer_id is not null;

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: auto-provision a profile row when a new auth.users row is created
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users may read only their own profile. (Public-facing fields that a card
-- viewer needs — e.g. gst_verified badge, full_name — are denormalized
-- onto the `cards` row itself in 0003_cards.sql instead of requiring a
-- profiles read, since profiles otherwise stays fully private.)
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users may update their own profile, EXCEPT is_premium and gst_verified —
-- enforced by excluding those columns from what `with check` allows to
-- differ from the existing row. Postgres RLS can't easily do column-level
-- exclusion in a single USING/CHECK clause, so the safe pattern is:
-- (a) grant only a safe column subset via a view or RPC for client updates,
--     OR
-- (b) enforce via a BEFORE UPDATE trigger that reverts any client-side
--     change to protected columns unless the role is service_role.
-- We use (b) here — see the trigger below — because it also protects
-- direct SQL/API updates, not just ORM-shaped ones.
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.is_premium := old.is_premium;
    new.gst_verified := old.gst_verified;
    new.gst_verified_at := old.gst_verified_at;
    new.stripe_customer_id := old.stripe_customer_id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged_columns on public.profiles;
create trigger profiles_protect_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

comment on function public.protect_profile_privileged_columns() is
  'Defense-in-depth: silently reverts client-side changes to is_premium/gst_verified/stripe_customer_id unless the write comes from service_role (Edge Functions). RLS policy alone cannot express column-level write restrictions, so this trigger closes that gap.';
