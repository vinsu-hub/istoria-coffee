import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client — anon key only, RLS policies (see supabase/*.sql)
// govern exactly what this client can read/write directly. Admin writes and
// anything requiring the service-role key happen server-side only, via the
// shared server/*.ts modules, never here.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
