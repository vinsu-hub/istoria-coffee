import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client — anon key only, RLS policies (see supabase/*.sql)
// govern exactly what this client can read/write directly. Admin writes and
// anything requiring the service-role key happen server-side only, via the
// shared server/*.ts modules, never here.
//
// createClient() throws synchronously if the URL is missing/malformed — a
// bad or absent env var must never crash module init (this module is only
// ever imported by the lazy-loaded /login and /admin pages, but it shouldn't
// be fragile even so). Falls back to an obviously-fake URL so construction
// always succeeds; actual auth calls will just fail with a clear network
// error instead of taking down the page that imports this module.
const url = import.meta.env.VITE_SUPABASE_URL || "https://supabase-not-configured.invalid";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-anon-key";

export const supabase = createClient(url, anonKey);
