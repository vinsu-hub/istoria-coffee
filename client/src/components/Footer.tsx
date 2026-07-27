import { Link } from "wouter";

/**
 * Footer — logo, socials, hours, contact links, CTA repeat.
 * Warm minimalist: clean typography, generous spacing.
 */
export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream pt-16 lg:pt-20 pb-8">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 mb-12">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/brand/icon.png"
                alt="Istoria Coffee"
                className="h-8 w-8 brightness-0 invert"
              />
              <div className="leading-tight">
                <span className="font-display text-lg font-semibold tracking-tight text-warm-white">
                  istoria
                </span>
                <span className="block text-[10px] tracking-[0.2em] uppercase font-body font-medium text-cream-dark">
                  coffee
                </span>
              </div>
            </div>
            <p className="font-body text-sm text-cream/70 leading-relaxed max-w-xs">
              Kape at Kwentuhan. Brgy. Maitim, National Highway, Bay, Laguna.
            </p>
          </div>

          {/* Links column */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wide uppercase text-cream-dark mb-4">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/menu"
                className="font-body text-sm text-cream/70 hover:text-warm-white transition-colors"
              >
                Menu
              </Link>
              <Link
                href="/board"
                className="font-body text-sm text-cream/70 hover:text-warm-white transition-colors"
              >
                Freedom Board
              </Link>
              <Link
                href="/contact"
                className="font-body text-sm text-cream/70 hover:text-warm-white transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/order"
                className="font-body text-sm text-cream/70 hover:text-warm-white transition-colors"
              >
                Order Now
              </Link>
            </nav>
          </div>

          {/* Info column */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wide uppercase text-cream-dark mb-4">
              Hours & Socials
            </h4>
            <div className="mb-4">
              <p className="font-body text-sm text-cream/70">
                Mon – Sun
              </p>
              <p className="font-body text-sm text-cream font-medium">
                12:00 PM – 3:00 AM
              </p>
            </div>
            <div className="flex gap-4">
              {/* Facebook */}
              <a
                href="https://facebook.com/coffee.istoria"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 text-cream" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com/istoriacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 text-cream" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com/@istoria.coffee"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4 text-cream" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* CTA bar */}
        <div className="border-t border-cream/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/order"
            className="font-display text-lg sm:text-xl text-cream hover:text-warm-white transition-colors"
          >
            Let's grab coffee. <span className="font-accent text-wood">Visit us.</span>
          </Link>
          <p className="font-body text-xs text-cream/40">
            &copy; {new Date().getFullYear()} Istoria Coffee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
