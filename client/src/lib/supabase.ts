/**
 * Supabase client configuration.
 * BLOCKED: Supabase project not yet created — keys pending.
 * When Supabase is set up, replace these with real values.
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Database schema (for reference — apply via Supabase SQL editor):
 *
 * create table board_notes (
 *   id uuid primary key default gen_random_uuid(),
 *   device_id text not null,
 *   message text not null check (char_length(message) <= 140),
 *   color text default 'yellow',
 *   rotation int default 0,
 *   created_at timestamptz default now()
 * );
 *
 * create table moderation_flags (
 *   id uuid primary key default gen_random_uuid(),
 *   device_id text,
 *   message text,
 *   categories jsonb,
 *   created_at timestamptz default now()
 * );
 *
 * create index idx_device_daily on board_notes (device_id, created_at);
 *
 * create or replace function can_post_today(p_device_id text)
 * returns boolean as $$
 *   select not exists (
 *     select 1 from board_notes
 *     where device_id = p_device_id
 *     and created_at::date = (now() at time zone 'Asia/Manila')::date
 *   );
 * $$ language sql stable;
 */

// Placeholder: would export createClient from @supabase/supabase-js
export function createSupabaseClient() {
  return {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: (data: unknown) => Promise.resolve({ data: null, error: null }),
    }),
    rpc: (fn: string, params: unknown) => Promise.resolve({ data: null, error: null }),
  };
}
