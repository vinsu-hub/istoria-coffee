"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Client-side pre-check only, for instant UX feedback. The Edge Function
// re-checks server-side with the service role key — that's the real gate.
export function useCanPostToday(deviceId: string | null): boolean | null {
  const [canPost, setCanPost] = useState<boolean | null>(null);

  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;

    Promise.resolve(supabase.rpc("can_post_today", { p_device_id: deviceId }))
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) throw error;
        setCanPost(Boolean(data));
      })
      .catch(() => {
        if (!cancelled) setCanPost(true); // fail open on the client; server still enforces it
      });

    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  return canPost;
}
