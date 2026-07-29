import { getServiceClient } from "./adminAuth.js";

// Menu items are Supabase-only (no fallback tiers) — this is new data with
// no legacy JSON-backed production path to preserve, unlike server/notes.ts.
// Categories are seeded once via supabase/admin_and_menu.sql + the seed
// script and aren't editable from the admin UI — only items are.

const ADDON_CATEGORY_KEY = "addOns";

// Not part of the admin-editable scope for this feature — kept as a static
// constant, matching what client/src/data/menu.json's "meta" held before.
const SITE_MENU_META = {
  address: "Bay, Laguna, PH 4033",
  hours: "12PM – 3AM",
  tagline: "Kape at Kwentuhan",
};

interface DbCategoryRow {
  key: string;
  section: "drinks" | "food";
  label: string;
  blurb: string;
  sort_order: number;
}

interface DbItemRow {
  id: string;
  category_key: string;
  name: string;
  price: number | null;
  hot: number | null;
  iced: number | null;
  tag: string | null;
  note: string | null;
  serves_note: string | null;
  is_addon: boolean;
  sort_order: number;
}

export interface PublicMenuItem {
  id: string;
  name: string;
  price?: number;
  hot?: number;
  iced?: number;
  tag?: string;
  note?: string;
  servesNote?: string;
}

export interface MenuResponse {
  drinks: Record<string, PublicMenuItem[]>;
  food: Record<string, PublicMenuItem[]>;
  addOns: PublicMenuItem[];
  meta: typeof SITE_MENU_META;
  categories: {
    drinks: Array<{ key: string; label: string; blurb: string }>;
    food: Array<{ key: string; label: string; blurb: string }>;
  };
}

function toPublicItem(row: DbItemRow): PublicMenuItem {
  return {
    id: row.id,
    name: row.name,
    ...(row.price != null ? { price: row.price } : {}),
    ...(row.hot != null ? { hot: row.hot } : {}),
    ...(row.iced != null ? { iced: row.iced } : {}),
    ...(row.tag ? { tag: row.tag } : {}),
    ...(row.note ? { note: row.note } : {}),
    ...(row.serves_note ? { servesNote: row.serves_note } : {}),
  };
}

export async function listMenu(): Promise<MenuResponse> {
  const supabase = getServiceClient();
  const [{ data: categories, error: catError }, { data: items, error: itemError }] =
    await Promise.all([
      supabase.from("menu_categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
    ]);

  if (catError) throw catError;
  if (itemError) throw itemError;

  const drinks: Record<string, PublicMenuItem[]> = {};
  const food: Record<string, PublicMenuItem[]> = {};
  const addOns: PublicMenuItem[] = [];
  const categoryMeta: MenuResponse["categories"] = { drinks: [], food: [] };

  for (const cat of (categories ?? []) as DbCategoryRow[]) {
    if (cat.key === ADDON_CATEGORY_KEY) continue;
    const bucket = cat.section === "drinks" ? drinks : food;
    bucket[cat.key] = [];
    categoryMeta[cat.section].push({ key: cat.key, label: cat.label, blurb: cat.blurb });
  }

  for (const item of (items ?? []) as DbItemRow[]) {
    if (item.is_addon) {
      addOns.push(toPublicItem(item));
      continue;
    }
    const bucket = drinks[item.category_key] ?? food[item.category_key];
    bucket?.push(toPublicItem(item));
  }

  return { drinks, food, addOns, meta: SITE_MENU_META, categories: categoryMeta };
}

export async function listCategories(): Promise<DbCategoryRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("menu_categories").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as DbCategoryRow[];
}

export interface MenuItemInput {
  id: string;
  categoryKey: string;
  name: string;
  price?: number;
  hot?: number;
  iced?: number;
  tag?: string;
  note?: string;
  servesNote?: string;
  isAddon?: boolean;
  sortOrder?: number;
}

function validateItemInput(input: Partial<MenuItemInput>, requireCore: boolean) {
  if (requireCore) {
    if (!input.id || typeof input.id !== "string") throw new Error("invalid_id");
    if (!input.categoryKey || typeof input.categoryKey !== "string") throw new Error("invalid_category");
    if (!input.name || typeof input.name !== "string") throw new Error("invalid_name");
  }
}

export async function createMenuItem(input: MenuItemInput): Promise<void> {
  validateItemInput(input, true);
  const supabase = getServiceClient();
  const { error } = await supabase.from("menu_items").insert({
    id: input.id,
    category_key: input.categoryKey,
    name: input.name,
    price: input.price ?? null,
    hot: input.hot ?? null,
    iced: input.iced ?? null,
    tag: input.tag ?? null,
    note: input.note ?? null,
    serves_note: input.servesNote ?? null,
    is_addon: input.isAddon ?? false,
    sort_order: input.sortOrder ?? 0,
  });
  if (error) throw error;
}

export async function updateMenuItem(id: string, input: Partial<MenuItemInput>): Promise<void> {
  validateItemInput(input, false);
  const supabase = getServiceClient();

  const patch: Record<string, unknown> = {};
  if (input.categoryKey !== undefined) patch.category_key = input.categoryKey;
  if (input.name !== undefined) patch.name = input.name;
  if (input.price !== undefined) patch.price = input.price;
  if (input.hot !== undefined) patch.hot = input.hot;
  if (input.iced !== undefined) patch.iced = input.iced;
  if (input.tag !== undefined) patch.tag = input.tag;
  if (input.note !== undefined) patch.note = input.note;
  if (input.servesNote !== undefined) patch.serves_note = input.servesNote;
  if (input.isAddon !== undefined) patch.is_addon = input.isAddon;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const { error } = await supabase.from("menu_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}
