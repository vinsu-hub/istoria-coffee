import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Client-side session state — used for UX (redirect away from /admin if
// logged out, show/hide sign-out button). This is NOT the security boundary:
// every admin API call is independently gated by requireAdmin() server-side
// (see server/adminAuth.ts), so this hook being bypassed client-side can't
// expose anything the API wouldn't already refuse.
export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Attaches the current Supabase access token as a Bearer header on every
  // admin fetch — this is what the 3 backend runtimes (Vercel/Express/Vite
  // dev middleware) all read identically via requireAdmin(authHeader).
  const authFetch = useCallback(async (input: RequestInfo, init: RequestInit = {}) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }, []);

  return { session, loading, authFetch };
}
