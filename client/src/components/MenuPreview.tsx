import { Link } from "wouter";
import { useMenu } from "@/hooks/useMenu";

/**
 * MenuPreview — homepage section showing 4 featured items from specials.
 * Links to /menu for the full menu.
 */
export default function MenuPreview() {
  const { data: menuData } = useMenu();
  const featured = menuData?.drinks.specials?.slice(0, 4) ?? [];

  if (featured.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-parchment">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10">
          <div>
            <p className="font-accent text-xl text-charcoal-light mb-1">Our specials</p>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal font-semibold">
              Regulars' top favorites
            </h2>
          </div>
          <Link
            href="/menu"
            className="mt-4 lg:mt-0 font-body text-sm text-espresso hover:text-espresso-light transition-colors font-medium"
          >
            See full menu →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-sm p-5 hover:shadow-md transition-all duration-200"
            >
              <h4 className="font-display text-base font-semibold text-charcoal mb-2">
                {item.name}
              </h4>
              <span className="font-body text-sm text-charcoal font-medium">₱{item.price}</span>
            </div>
          ))}
        </div>

        {/* Featured image */}
        <div className="mt-10 rounded-sm overflow-hidden aspect-[16/6]">
          <img
            src="/brand/menu-featured.jpg"
            alt="Istoria Coffee drinks — flat lay"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
