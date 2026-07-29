import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Shared service-role client for every Supabase-only admin resource
// (menu.ts, submissions.ts) — separate from server/notes.ts's own getSupabase(),
// which stays private there since notes.ts also supports non-Supabase tiers.
let cachedClient: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Admin features require SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set"
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}

export interface AdminUser {
  id: string;
  email: string;
}

// Verifies a Supabase Auth bearer token and confirms the user is in
// admin_users. Every admin-gated handler in every runtime (Vercel/Express/
// Vite dev middleware) calls this first and returns 401 on null — this is
// the actual security boundary, not the /login route being unlinked from nav.
export async function requireAdmin(
  authHeader: string | undefined | null
): Promise<AdminUser | null> {
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  try {
    const supabase = getServiceClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return null;

    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("id, email")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (adminError || !adminRow) return null;
    return adminRow as AdminUser;
  } catch {
    // Supabase not configured (e.g. local dev without env vars set) — fail
    // closed as "not an admin" rather than crashing the request/process.
    return null;
  }
}
