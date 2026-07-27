import type { Metadata } from "next";
import { menuCategories, getCategory } from "@/lib/menu";
import MenuGrid from "@/components/MenuGrid";

const title = "Menu | Istoria Coffee";
const description = "The full Istoria Coffee menu — coffee, specials, lattes, non-coffee drinks, and add-ons.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: ["/images/og-image.jpg"] },
};

export default function MenuPage() {
  return (
    <div className="pb-16">
      <div className="sticky top-[57px] z-10 bg-cream/95 backdrop-blur-md border-b border-ink/10 overflow-x-auto">
        <div className="flex gap-5 px-5 md:px-10 py-3 text-sm whitespace-nowrap">
          {menuCategories.map((cat) => (
            <a
              key={cat.key}
              href={`#${cat.key}`}
              className="text-ink/72 hover:text-accent-700"
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-10 pt-10 max-w-3xl">
        <h1 className="text-[32px] md:text-[42px] leading-tight mb-2">Menu</h1>
        <p className="text-ink/70 text-[15px] mb-10">
          Prices in PHP. Hot / iced shown where both are available.
        </p>

        <div className="grid gap-14">
          {menuCategories.map((cat) => (
            <section key={cat.key} id={cat.key} className="scroll-mt-32">
              <h2 className="text-[22px] mb-4">{cat.label}</h2>
              <MenuGrid items={getCategory(cat.key)} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
