// One-off migration: reads the legacy client/src/data/menu.json (plus the
// category metadata that used to be hardcoded in Menu.tsx) and inserts it
// into the new menu_categories/menu_items Supabase tables. Run manually once:
//   node scripts/seed-menu-to-supabase.mjs
// Safe to re-run — uses upsert, so it won't duplicate rows.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.dirname(fileURLToPath(import.meta.url));
const menuPath = path.join(root, "..", "client", "src", "data", "menu.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const menuData = JSON.parse(fs.readFileSync(menuPath, "utf-8"));

// Mirrors the category labels/blurbs that used to be hardcoded in Menu.tsx.
const CATEGORY_META = {
  drinks: {
    basics: { label: "Basics", blurb: "Classic brews, honest prices." },
    specials: { label: "Specials", blurb: "Our signature creations — worth every peso." },
    latte: { label: "Latte", blurb: "Espresso meets your favorite flavor." },
    nonCoffee: { label: "Non-Coffee", blurb: "For when coffee is not the mood." },
    oatBased: { label: "Oat-Based", blurb: "Creamy, dairy-free, and full of flavor." },
    matchaBlends: { label: "Matcha Blends", blurb: "Earthy matcha, reimagined." },
  },
  food: {
    waffles: { label: "Waffles", blurb: "Savory-sweet, straight off the iron." },
    mains: { label: "Mains", blurb: "Hearty plates to share or savor solo." },
    patata: { label: "Patata", blurb: "Crispy potatoes, done a few ways." },
    pasta: { label: "Pasta", blurb: "Comfort in a bowl." },
    riceBowls: { label: "Rice Bowls", blurb: "A full meal, one bowl." },
    partyTrays: { label: "Party Trays", blurb: "For the whole barkada." },
  },
};

const ADDON_CATEGORY_KEY = "addOns";

async function main() {
  const categoryRows = [];
  let sortOrder = 0;
  for (const section of ["drinks", "food"]) {
    for (const [key, meta] of Object.entries(CATEGORY_META[section])) {
      categoryRows.push({ key, section, label: meta.label, blurb: meta.blurb, sort_order: sortOrder++ });
    }
  }
  categoryRows.push({
    key: ADDON_CATEGORY_KEY,
    section: "drinks",
    label: "Add-ons",
    blurb: "Extra love in every cup.",
    sort_order: sortOrder++,
  });

  const { error: catError } = await supabase.from("menu_categories").upsert(categoryRows);
  if (catError) throw catError;
  console.log(`Upserted ${categoryRows.length} categories.`);

  const itemRows = [];
  let itemSort = 0;
  for (const section of ["drinks", "food"]) {
    for (const [categoryKey, items] of Object.entries(menuData[section])) {
      for (const item of items) {
        itemRows.push({
          id: item.id,
          category_key: categoryKey,
          name: item.name,
          price: item.price ?? null,
          hot: item.hot ?? null,
          iced: item.iced ?? null,
          tag: item.tag ?? null,
          note: item.note ?? null,
          serves_note: item.servesNote ?? null,
          is_addon: false,
          sort_order: itemSort++,
        });
      }
    }
  }
  for (const item of menuData.addOns) {
    itemRows.push({
      id: item.id,
      category_key: ADDON_CATEGORY_KEY,
      name: item.name,
      price: item.price ?? null,
      hot: item.hot ?? null,
      iced: item.iced ?? null,
      tag: item.tag ?? null,
      note: item.note ?? null,
      serves_note: item.servesNote ?? null,
      is_addon: true,
      sort_order: itemSort++,
    });
  }

  const { error: itemError } = await supabase.from("menu_items").upsert(itemRows);
  if (itemError) throw itemError;
  console.log(`Upserted ${itemRows.length} menu items.`);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
