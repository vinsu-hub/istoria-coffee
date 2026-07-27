-- Freedom Board ("Kwentuhan Wall") schema, RLS policies, and daily-post check.

create table board_notes (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  message text not null check (char_length(message) <= 140),
  color text default 'yellow',
  rotation int default 0,
  created_at timestamptz default now()
);

create table moderation_flags (
  id uuid primary key default gen_random_uuid(),
  device_id text,
  message text,
  categories jsonb,
  created_at timestamptz default now()
);

create index idx_device_daily on board_notes (device_id, created_at);

create or replace function can_post_today(p_device_id text)
returns boolean as $$
  select not exists (
    select 1 from board_notes
    where device_id = p_device_id
    and created_at::date = (now() at time zone 'Asia/Manila')::date
  );
$$ language sql stable;

-- Row Level Security: reads are public, writes only via the submit-note
-- Edge Function (service_role key, bypasses RLS by design, server-side only).
-- Without this, the public anon key could insert directly from the browser
-- and skip moderation entirely.
alter table board_notes enable row level security;
alter table moderation_flags enable row level security;

create policy "public read" on board_notes
  for select using (true);

-- No insert/update/delete policies for anon/authenticated on either table.
