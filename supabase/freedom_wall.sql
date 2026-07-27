-- Freedom Wall ("Kwentuhan Wall") notes table.
-- Run this once in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create table if not exists public.freedom_wall_notes (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 1 and 140),
  device_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists freedom_wall_notes_created_at_idx
  on public.freedom_wall_notes (created_at desc);

-- Postgres won't allow timestamptz::date directly in an index expression —
-- that cast depends on the session's timezone setting, so it's only STABLE,
-- not IMMUTABLE, which index expressions require. This wrapper pins the
-- conversion to UTC explicitly, making it a true IMMUTABLE function.
create or replace function public.utc_date(ts timestamptz)
returns date
language sql
immutable
as $$
  select (ts at time zone 'utc')::date;
$$;

-- One note per device per calendar day (UTC) — a DB-level safety net
-- alongside the application-level check, so a race between two
-- concurrent requests from the same device can't both succeed.
create unique index if not exists freedom_wall_notes_device_per_day_idx
  on public.freedom_wall_notes (device_id, public.utc_date(created_at));

alter table public.freedom_wall_notes enable row level security;

-- The wall is public to read.
drop policy if exists "Anyone can read notes" on public.freedom_wall_notes;
create policy "Anyone can read notes"
  on public.freedom_wall_notes
  for select
  using (true);

-- Inserts happen through the app's own /api/notes endpoint (using the
-- Supabase service role key, which bypasses RLS entirely) — this policy
-- is a defense-in-depth fallback in case the anon key is ever used to
-- write directly. The per-day limit and content guardrails are enforced
-- in application code before a row is ever written.
drop policy if exists "Anyone can insert a note" on public.freedom_wall_notes;
create policy "Anyone can insert a note"
  on public.freedom_wall_notes
  for insert
  with check (char_length(message) between 1 and 140);

-- Seed content — mirrors server/data/notes.json so the wall isn't empty
-- the first time this table is used. Safe to re-run (skips duplicates).
insert into public.freedom_wall_notes (message, device_id, created_at) values
  ('Ang sarap ng coffee dito! Balik ulit bukas.', 'seed', '2026-07-25T10:00:00.000Z'),
  ('First time ko dito — ang cozy! ❤️', 'seed', '2026-07-24T10:00:00.000Z'),
  ('Iba talaga yung vibes sa Istoria.', 'seed', '2026-07-23T10:00:00.000Z'),
  ('Matcha espresso fusion — game changer!', 'seed', '2026-07-22T10:00:00.000Z'),
  ('Thank you sa late night kape.', 'seed', '2026-07-21T10:00:00.000Z'),
  ('Pinaka-favorite ko sa Bay! ☕', 'seed', '2026-07-20T10:00:00.000Z'),
  ('Best coffee sa National Highway!', 'seed', '2026-07-19T10:00:00.000Z'),
  ('Ang ganda ng interior. Parang Japan!', 'seed', '2026-07-18T10:00:00.000Z'),
  ('kamusta ka na daphne?', 'seed', '2026-07-26T14:00:00.000Z'),
  ('Sarap mag-aral dito habang umuulan. ☔', 'seed', '2026-07-17T10:00:00.000Z'),
  ('Grabe yung Barista''s Choice, sobrang sarap!', 'seed', '2026-07-16T10:00:00.000Z'),
  ('Nakakarelax dito after work. Salamat Istoria!', 'seed', '2026-07-15T10:00:00.000Z'),
  ('Date spot namin ni jowa ❤️ laging masaya dito.', 'seed', '2026-07-14T10:00:00.000Z'),
  ('Staff are so kind! Will definitely come back.', 'seed', '2026-07-13T10:00:00.000Z'),
  ('Group study spot na namin to. Thank you Istoria!', 'seed', '2026-07-12T10:00:00.000Z')
on conflict (device_id, (public.utc_date(created_at))) do nothing;
