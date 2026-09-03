-- ============================================================================
-- 0006_subscriptions.sql
-- Billing history/state, driven exclusively by Stripe webhooks. This table
-- is the audit trail; profiles.is_premium is the fast-read flag the app
-- actually gates features on (kept in sync by the trigger below).
-- ============================================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,

  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'active'
    check (status in ('active', 'canceled', 'past_due', 'incomplete')),

  stripe_subscription_id text unique,
  stripe_price_id text,

  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is
  'Billing audit trail, one row per Stripe subscription lifecycle. Written ONLY by the stripe-webhook Edge Function using the service_role key — never by client code.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists subscriptions_owner_id_idx on public.subscriptions (owner_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
create unique index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id) where stripe_subscription_id is not null;

-- Only one ACTIVE subscription per owner at a time.
create unique index if not exists subscriptions_one_active_per_owner
  on public.subscriptions (owner_id) where status = 'active';

-- ---------------------------------------------------------------------------
-- Trigger: updated_at
-- ---------------------------------------------------------------------------
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: keep profiles.is_premium in sync with subscription status.
-- This is the ONLY code path that ever sets profiles.is_premium = true.
-- ---------------------------------------------------------------------------
create or replace function public.sync_profile_premium_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set is_premium = exists (
      select 1 from public.subscriptions
        where owner_id = coalesce(new.owner_id, old.owner_id)
          and status = 'active'
    )
    where id = coalesce(new.owner_id, old.owner_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists subscriptions_sync_premium_flag on public.subscriptions;
create trigger subscriptions_sync_premium_flag
  after insert or update or delete on public.subscriptions
  for each row execute function public.sync_profile_premium_flag();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;

create policy subscriptions_select_own
  on public.subscriptions for select
  using (auth.uid() = owner_id);

-- No INSERT/UPDATE/DELETE policies for authenticated/anon at all — writes
-- happen exclusively via the stripe-webhook Edge Function using the
-- service_role key, which bypasses RLS by design. A client can never
-- create or edit their own "subscription" row, by construction.
