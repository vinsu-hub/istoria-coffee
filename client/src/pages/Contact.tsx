import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import LocationMap from "@/components/LocationMap";

/**
 * /contact — Contact Us page.
 * Form (mailto fallback), direct info block, map.
 * BLOCKED: Phone and email pending from owner.
 */

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* Header */}
        <section className="py-12 lg:py-16 bg-parchment">
          <div className="container text-center">
            <p className="font-accent text-xl text-charcoal-light mb-2">Get in touch</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal font-bold mb-4">
              Got a question?
            </h1>
            <p className="font-body text-base sm:text-lg text-charcoal-light max-w-md mx-auto">
              Just send us a message.
            </p>
          </div>
        </section>

        {/* Form + Info */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-4xl mx-auto">
              {/* Form */}
              <div>
                <h2 className="font-display text-2xl text-charcoal font-semibold mb-6">
                  Send us a message
                </h2>
                <ContactForm recipientEmail={undefined /* BLOCKED: email pending */} />
                <p className="font-body text-xs text-charcoal-light/40 mt-3">
                  ⚠️ Email address pending from owner. Form currently opens your email client.
                </p>
              </div>

              {/* Info block */}
              <div>
                <h2 className="font-display text-2xl text-charcoal font-semibold mb-6">
                  Find Us
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-body text-sm font-medium text-charcoal-light uppercase tracking-wider mb-2">
                      Location
                    </h3>
                    <p className="font-body text-base text-charcoal">
                      Brgy. Maitim, National Highway (Manila South Road),
                      <br />
                      Bay, Laguna, Philippines
                    </p>
                  </div>
                  <div>
                    <h3 className="font-body text-sm font-medium text-charcoal-light uppercase tracking-wider mb-2">
                      Hours
                    </h3>
                    <p className="font-body text-base text-charcoal">
                      Mon – Sun: 12:00 PM – 3:00 AM
                    </p>
                  </div>
                  <div>
                    <h3 className="font-body text-sm font-medium text-charcoal-light uppercase tracking-wider mb-2">
                      Social Media
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://facebook.com/coffee.istoria"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-body text-sm text-charcoal-light hover:text-espresso transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Facebook — @coffee.istoria
                      </a>
                      <a
                        href="https://instagram.com/istoriacoffee"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-body text-sm text-charcoal-light hover:text-espresso transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        Instagram — @istoriacoffee
                      </a>
                      <a
                        href="https://tiktok.com/@istoria.coffee"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-body text-sm text-charcoal-light hover:text-espresso transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-black" />
                        TikTok — @istoria.coffee
                      </a>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-body text-sm font-medium text-charcoal-light uppercase tracking-wider mb-2">
                      Messenger
                    </h3>
                    <a
                      href="https://m.me/coffee.istoria"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-espresso text-warm-white text-sm font-body font-medium hover:bg-espresso-light transition-all duration-200"
                    >
                      Message us →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map section */}
        <LocationMap />
      </main>

      <Footer />
    </div>
  );
}
