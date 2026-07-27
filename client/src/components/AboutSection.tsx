/**
 * AboutSection — short story copy + real photos, alternating layout.
 * Warm minimalist editorial feel.
 */
export default function AboutSection() {
  return (
    <section className="py-20 lg:py-32 bg-parchment">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="font-accent text-xl text-charcoal-light mb-2">Our story</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal font-semibold">
            Not just coffee — a <span className="italic">story</span> in every cup
          </h2>
        </div>

        {/* Block 1: Image left, text right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 lg:mb-24">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-sm">
            <img
              src="/brand/about-interior.jpg"
              alt="Istoria Coffee interior — warm wood and ambient lighting"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:pl-4">
            <h3 className="font-display text-2xl lg:text-3xl text-charcoal font-semibold mb-4">
              A space that feels like home
            </h3>
            <p className="font-body text-base lg:text-lg text-charcoal-light leading-relaxed mb-4">
              When we started Istoria, we wanted a place where people don't just drink coffee
              — where they talk, share stories, and get to know one another.
            </p>
            <p className="font-body text-base lg:text-lg text-charcoal-light leading-relaxed">
              Every corner of our café is designed to make you feel like you're sitting in a
              friend's living room — warm wood, soft light, and the aroma of freshly brewed
              coffee filling the air.
            </p>
          </div>
        </div>

        {/* Block 2: Text left, image right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 lg:pr-4">
            <h3 className="font-display text-2xl lg:text-3xl text-charcoal font-semibold mb-4">
              Crafted with care
            </h3>
            <p className="font-body text-base lg:text-lg text-charcoal-light leading-relaxed mb-4">
              Every drink we serve is made by hand — from the espresso pull to the last drizzle
              of syrup. We believe the best coffee comes from passion, not machines.
            </p>
            <p className="font-body text-base lg:text-lg text-charcoal-light leading-relaxed">
              From the first drop to the last sip — every drink has heart behind it.
              That's Istoria.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-sm order-1 lg:order-2">
            <img
              src="/brand/about-barista.jpg"
              alt="Barista crafting latte art at Istoria Coffee"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
