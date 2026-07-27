import { useState, useRef } from "react";
import { Link } from "wouter";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MenuGrid from "@/components/MenuGrid";
import menuData from "@/data/menu.json";

/**
 * /menu — Full categorized menu page.
 * Editorial zine feel: chapter-like sections, paper texture, dotted leaders.
 * Two-tier nav: Drinks/Food switch, then category tabs within the selected section.
 */

type Section = "drinks" | "food";

interface MenuItem {
  id: string;
  name: string;
  price?: number;
  hot?: number;
  iced?: number;
  servesNote?: string;
}

const drinksCategories = [
  { key: "basics", label: "Basics", blurb: "Classic brews, honest prices." },
  { key: "specials", label: "Specials", blurb: "Our signature creations — worth every peso." },
  { key: "latte", label: "Latte", blurb: "Espresso meets your favorite flavor." },
  { key: "nonCoffee", label: "Non-Coffee", blurb: "For when coffee is not the mood." },
  { key: "oatBased", label: "Oat-Based", blurb: "Creamy, dairy-free, and full of flavor." },
  { key: "matchaBlends", label: "Matcha Blends", blurb: "Earthy matcha, reimagined." },
] as const;

const foodCategories = [
  { key: "waffles", label: "Waffles", blurb: "Savory-sweet, straight off the iron." },
  { key: "mains", label: "Mains", blurb: "Hearty plates to share or savor solo." },
  { key: "patata", label: "Patata", blurb: "Crispy potatoes, done a few ways." },
  { key: "pasta", label: "Pasta", blurb: "Comfort in a bowl." },
  { key: "riceBowls", label: "Rice Bowls", blurb: "A full meal, one bowl." },
  { key: "partyTrays", label: "Party Trays", blurb: "For the whole barkada." },
] as const;

export default function MenuPage() {
  const [activeSection, setActiveSection] = useState<Section>("drinks");
  const categories = activeSection === "drinks" ? drinksCategories : foodCategories;
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].key);
  const tabRef = useRef<HTMLDivElement>(null);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    const nextCategories = section === "drinks" ? drinksCategories : foodCategories;
    setActiveCategory(nextCategories[0].key);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Nav />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* Page header — editorial chapter opener */}
        <section className="py-14 lg:py-20">
          <div className="container text-center">
            <p className="font-accent text-2xl text-charcoal-light mb-3">Our Menu</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-charcoal font-bold mb-5">
              Thirsty? Hungry?
            </h1>
            <p className="font-body text-base sm:text-lg text-charcoal-light max-w-sm mx-auto leading-relaxed">
              Every order is made with heart. Pick your favorite.
            </p>
          </div>
        </section>

        {/* Drinks / Food switch */}
        <section className="sticky top-16 lg:top-20 z-40 bg-cream/95 backdrop-blur-md border-y border-border">
          <div className="container">
            <div className="flex justify-center gap-2 py-3">
              {(["drinks", "food"] as Section[]).map((section) => (
                <button
                  key={section}
                  onClick={() => handleSectionChange(section)}
                  className={`px-7 py-2 rounded-full text-sm font-display font-semibold tracking-wide uppercase transition-all duration-200 ${
                    activeSection === section
                      ? "bg-espresso text-warm-white shadow-sm"
                      : "bg-transparent text-charcoal-light hover:text-charcoal hover:bg-cream-dark"
                  }`}
                >
                  {section === "drinks" ? "Drinks" : "Food"}
                </button>
              ))}
            </div>

            {/* Category tabs — editorial index */}
            <div ref={tabRef} className="border-t border-border">
              <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveCategory(cat.key);
                      document.getElementById(cat.key)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
                      activeCategory === cat.key
                        ? "bg-espresso text-warm-white shadow-sm"
                        : "bg-transparent text-charcoal-light hover:text-charcoal hover:bg-cream-dark"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Menu sections — chapter pages */}
        <section className="py-12 lg:py-16">
          <div className="container space-y-20">
            {categories.map((cat, idx) => (
              <div key={cat.key} id={cat.key} className="scroll-mt-40">
                {/* Chapter divider */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="font-accent text-3xl text-espresso/30">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl lg:text-3xl text-charcoal font-semibold">
                      {cat.label}
                    </h2>
                    <p className="font-body text-sm text-charcoal-light mt-0.5">
                      {cat.blurb}
                    </p>
                  </div>
                </div>

                {/* Items with dotted leaders */}
                <div className="bg-warm-white border border-border rounded-sm p-6 lg:p-8">
                  <MenuGrid items={(menuData[activeSection] as Record<string, MenuItem[]>)[cat.key]} />
                </div>
              </div>
            ))}

            {/* Add-ons — shown under both sections */}
            <div id="addOns" className="scroll-mt-40">
              <div className="flex items-center gap-4 mb-8">
                <span className="font-accent text-3xl text-espresso/30">+</span>
                <div className="flex-1">
                  <h2 className="font-display text-2xl lg:text-3xl text-charcoal font-semibold">
                    Add-ons
                  </h2>
                  <p className="font-body text-sm text-charcoal-light mt-0.5">
                    Extra love in every cup.
                  </p>
                </div>
              </div>
              <div className="bg-warm-white border border-border rounded-sm p-6 lg:p-8">
                <MenuGrid items={menuData.addOns} />
              </div>
            </div>
          </div>
        </section>

        {/* CTA — chapter closer */}
        <section className="py-14 lg:py-20 bg-parchment text-center">
          <div className="container">
            <p className="font-accent text-xl text-charcoal-light mb-3">Ready to order?</p>
            <p className="font-display text-2xl text-charcoal mb-6">
              Let's bring it to your table.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 bg-espresso text-warm-white px-8 py-4 rounded-full text-base font-body font-medium hover:bg-espresso-light transition-all duration-200 active:scale-[0.97]"
            >
              Order now →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
