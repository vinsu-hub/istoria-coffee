import { useEffect, useState } from "react";

export interface MenuItem {
  id: string;
  name: string;
  price?: number;
  hot?: number;
  iced?: number;
  tag?: string;
  note?: string;
  servesNote?: string;
}

export interface MenuData {
  drinks: Record<string, MenuItem[]>;
  food: Record<string, MenuItem[]>;
  addOns: MenuItem[];
  meta: { address: string; hours: string; tagline: string };
  categories: {
    drinks: Array<{ key: string; label: string; blurb: string }>;
    food: Array<{ key: string; label: string; blurb: string }>;
  };
}

// Menu moved from a static build-time JSON import to a Supabase-backed
// runtime fetch so the new admin panel can edit it without a rebuild+deploy.
// Cached in module scope so navigating between pages (Home -> Menu) doesn't
// re-fetch every time.
let cache: MenuData | null = null;
let inFlight: Promise<MenuData> | null = null;

async function fetchMenu(): Promise<MenuData> {
  if (cache) return cache;
  if (!inFlight) {
    inFlight = fetch("/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load menu (${res.status})`);
        return res.json();
      })
      .then((data: MenuData) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function useMenu() {
  const [data, setData] = useState<MenuData | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    setLoading(true);
    fetchMenu()
      .then((menu) => {
        if (!cancelled) setData(menu);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load menu");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
