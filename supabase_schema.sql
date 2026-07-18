-- DeutschWeg FA v6 — secure per-user state storage
-- Run in Supabase SQL Editor.

create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

drop policy if exists "read own state" on public.user_state;
create policy "read own state" on public.user_state
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "insert own state" on public.user_state;
create policy "insert own state" on public.user_state
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "update own state" on public.user_state;
create policy "update own state" on public.user_state
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_user_state_updated_at on public.user_state;
create trigger trg_user_state_updated_at
before update on public.user_state
for each row execute function public.set_updated_at();
