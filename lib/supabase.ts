import { createClient } from "@supabase/supabase-js";

// Falls back to a placeholder so the client can be constructed (and the app
// built/prerendered) before a real Supabase project exists. Calls made
// against the placeholder simply fail at runtime with a network error,
// which the Board components already handle.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BoardNote = {
  id: string;
  message: string;
  color: string;
  rotation: number;
  created_at: string;
};
