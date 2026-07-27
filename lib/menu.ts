import menuData from "@/data/menu.json";

export type MenuItem = {
  id: string;
  name: string;
  tag?: string;
} & ({ price: number } | { hot: number; iced: number });

export type MenuCategoryKey = keyof typeof menuData;

export const menuCategories: { key: MenuCategoryKey; label: string }[] = [
  { key: "coffee", label: "Coffee" },
  { key: "specials", label: "Specials" },
  { key: "latte", label: "Latte" },
  { key: "nonCoffee", label: "Non-Coffee" },
  { key: "addOns", label: "Add-ons" },
];

export function getMenu(): Record<MenuCategoryKey, MenuItem[]> {
  return menuData as Record<MenuCategoryKey, MenuItem[]>;
}

export function getCategory(key: MenuCategoryKey): MenuItem[] {
  return getMenu()[key];
}
