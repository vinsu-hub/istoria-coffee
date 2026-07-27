import { useState, useEffect } from "react";

/**
 * useCanPostToday — client-side pre-check via Supabase (UX convenience only;
 * real enforcement is server-side in the Edge Function).
 * BLOCKED: Supabase not connected yet.
 */
export function useCanPostToday(deviceId: string): boolean {
  const [canPost, setCanPost] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    // BLOCKED: Supabase RPC call pending
    // In production: supabase.rpc("can_post_today", { p_device_id: deviceId })
    // For now, always return true
    setCanPost(true);
  }, [deviceId]);

  return canPost;
}
