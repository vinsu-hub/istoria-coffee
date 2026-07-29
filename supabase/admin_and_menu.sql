-- Admin panel schema: admin allowlist, menu items, community submissions.
-- Run this once in the Supabase SQL editor for the project, after
-- supabase/freedom_wall.sql (reuses its public.utc_date() helper).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin allowlist — maps Supabase Auth users to admin privileges.
-- Accounts are still created by hand (Supabase dashboard: Authentication >
-- Users > Add user) — there is no public signup. Only rows present here are
-- treated as admins by server-side code (see server/adminAuth.ts).
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Deliberately zero policies: this table is only ever read via the
-- service-role client (server/adminAuth.ts). RLS enabled + no policies means
-- even a leaked anon key can't read or enumerate it.

-- ---------------------------------------------------------------------------
-- Menu categories + items — replaces client/src/data/menu.json, which is a
-- static build-time import and can't be edited from an admin panel (Vercel's
-- filesystem is read-only outside /tmp).
-- ---------------------------------------------------------------------------
create table if not exists public.menu_categories (
  key text primary key,             -- e.g. "basics", "waffles" — matches menu.json's existing keys
  section text not null check (section in ('drinks', 'food')),
  label text not null,
  blurb text not null,
  sort_order int not null default 0
);

create table if not exists public.menu_items (
  id text primary key,              -- human slug, matches menu.json's existing ids (e.g. "americano")
  category_key text not null references public.menu_categories (key) on delete cascade,
  name text not null,
  price int,
  hot int,
  iced int,
  tag text,
  note text,
  serves_note text,
  is_addon boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_category_idx
  on public.menu_items (category_key, sort_order);

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;

drop policy if exists "Anyone can read categories" on public.menu_categories;
create policy "Anyone can read categories"
  on public.menu_categories for select using (true);

drop policy if exists "Anyone can read menu items" on public.menu_items;
create policy "Anyone can read menu items"
  on public.menu_items for select using (true);

-- No insert/update/delete policies for anon — all writes go through
-- server/menu.ts using the service-role client, after requireAdmin() passes.

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Community submissions — customer photo/comment posts, moderated before
-- appearing publicly on /community.
-- ---------------------------------------------------------------------------
create table if not exists public.community_submissions (
  id uuid primary key default gen_random_uuid(),
  comment text check (comment is null or char_length(comment) <= 500),
  image_path text,               -- storage object path in the community-uploads bucket, nullable
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  device_id text,                -- lightweight abuse signal, same role as freedom_wall_notes.device_id
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  constraint community_submissions_has_content
    check (comment is not null or image_path is not null)
);

create index if not exists community_submissions_status_idx
  on public.community_submissions (status, created_at desc);

alter table public.community_submissions enable row level security;

drop policy if exists "Anyone can read approved submissions" on public.community_submissions;
create policy "Anyone can read approved submissions"
  on public.community_submissions for select using (status = 'approved');

-- No public insert/update policy — creation and moderation both go through
-- server/submissions.ts (service-role client), same defense-in-depth pattern
-- as freedom_wall_notes and menu_items above.

-- Storage bucket for submission images. Public read (needed to display
-- approved images by URL); writes only via the service-role client in
-- server/submissions.ts, which validates file type/size before upload —
-- deliberately no anon-key direct-upload policy, so validation stays in one
-- server-side chokepoint instead of being re-expressed in RLS.
insert into storage.buckets (id, name, public)
values ('community-uploads', 'community-uploads', true)
on conflict (id) do nothing;

drop policy if exists "Public read community uploads" on storage.objects;
create policy "Public read community uploads"
  on storage.objects for select
  using (bucket_id = 'community-uploads');
