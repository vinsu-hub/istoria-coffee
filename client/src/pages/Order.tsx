import { Link } from "wouter";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import OrderOptionCard from "@/components/OrderOptionCard";

/**
 * /order — Order Now page.
 * Routes customers to Grab / foodpanda.
 * BLOCKED: Exact store links pending from owner (Appendix E).
 */

const deliveryOptions = [
  {
    name: "GrabFood",
    blurb: "Order via GrabFood and get your Istoria favorites delivered.",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    deepLink: "grab://food",
    webUrl: "https://www.grab.com/ph/consumer/food/",
    blocked: true,
  },
  {
    name: "foodpanda",
    blurb: "Order via foodpanda and enjoy Istoria at home.",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
      </svg>
    ),
    deepLink: "foodpanda://",
    webUrl: "https://www.foodpanda.ph/",
    blocked: true,
  },
];

export default function OrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Nav />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* Header — editorial opener */}
        <section className="py-14 lg:py-20">
          <div className="container text-center">
            <p className="font-accent text-2xl text-charcoal-light mb-3">Just order.</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-charcoal font-bold mb-5">
              Getting hungry?
            </h1>
            <p className="font-body text-base sm:text-lg text-charcoal-light max-w-sm mx-auto leading-relaxed">
              Order now via Grab or foodpanda.
            </p>
          </div>
        </section>

        {/* Delivery options */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
              {deliveryOptions.map((option) => (
                <OrderOptionCard key={option.name} {...option} />
              ))}
            </div>

            {/* Blocker notice */}
            <p className="font-body text-xs text-charcoal-light/40 text-center mt-8 max-w-md mx-auto">
              ⚠️ Grab and foodpanda store links pending from the owner. Pages will be updated
              once exact URLs are provided.
            </p>

            {/* View menu link */}
            <div className="text-center mt-8">
              <Link
                href="/menu"
                className="font-body text-sm text-charcoal-light hover:text-espresso transition-colors underline underline-offset-4 decoration-1"
              >
                View our full menu first
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
