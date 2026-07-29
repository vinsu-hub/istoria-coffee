import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MenuGrid from "@/components/MenuGrid";
import { useMenu } from "@/hooks/useMenu";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * /menu — Full categorized menu page.
 * Editorial zine feel: chapter-like sections, paper texture, dotted leaders.
 * Two-tier nav: Drinks/Food switch, then category tabs within the selected section.
 * Menu data is fetched at runtime from /api/menu (Supabase-backed, admin-editable)
 * rather than a static build-time import, so category lists come from the data
 * itself instead of a hardcoded array kept in sync by hand.
 */

type Section = "drinks" | "food";

export default function MenuPage() {
  const { data: menuData, loading, error } = useMenu();
  const [activeSection, setActiveSection] = useState<Section>("drinks");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const tabRef = useRef<HTMLDivElement>(null);

  const categories = menuData ? menuData.categories[activeSection] : [];

  useEffect(() => {
    if (categories.length > 0 && activeCategory === null) {
      setActiveCategory(categories[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuData]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    const nextCategories = menuData?.categories[section] ?? [];
    setActiveCategory(nextCategories[0]?.key ?? null);
  };

  if (loading || !menuData) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Nav />
        <main className="flex-1 pt-20 lg:pt-24 container py-14 space-y-4">
          <Skeleton className="h-10 w-1/2 mx-auto" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Nav />
        <main className="flex-1 pt-20 lg:pt-24 container py-14 text-center">
          <p className="font-body text-charcoal-light">
            Couldn't load the menu right now — please refresh or try again shortly.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

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
                  <MenuGrid items={menuData[activeSection][cat.key] ?? []} />
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
