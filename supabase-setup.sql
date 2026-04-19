-- Run this in Supabase SQL Editor → New Query

-- Seeds table (user gatherings + curated cards)
create table if not exists public.seeds (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  icon text default '🌱',
  type text default 'gathering',
  ephemeral boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Row Level Security
alter table public.seeds enable row level security;

-- Users can only see and modify their own seeds
create policy "Users own their seeds"
  on public.seeds
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast user lookups
create index if not exists seeds_user_id_idx on public.seeds(user_id);
create index if not exists seeds_created_at_idx on public.seeds(created_at desc);

-- Auto-delete ephemeral seeds after 24 hours (optional — uses pg_cron if enabled)
-- If you have pg_cron enabled in Supabase:
-- select cron.schedule('delete-expired-seeds', '0 * * * *',
--   $$ delete from public.seeds where ephemeral = true and expires_at < now() $$
-- );
