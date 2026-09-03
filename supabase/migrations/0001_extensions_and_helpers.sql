-- ============================================================================
-- 0001_extensions_and_helpers.sql
-- Bkard — Supabase Migration
-- Purpose: extensions + shared trigger functions used by every table below.
-- Every migration in this set is written to leave the database in a
-- COMPLETE, SECURE state on its own (table + indexes + RLS together) —
-- never a table sitting temporarily without RLS enabled between files.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";   -- gen_random_uuid(), used in newer Postgres as the modern default

-- Shared updated_at trigger — reused by every table with an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic BEFORE UPDATE trigger: stamps updated_at = now() on every row update.';
