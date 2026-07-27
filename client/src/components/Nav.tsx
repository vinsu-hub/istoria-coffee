import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

/**
 * Istoria Coffee Navigation
 * Sticky, transparent→solid on scroll on homepage only.
 * Solid on all other pages.
 * Logo left, links right, primary CTA button linking to /order.
 * On homepage with scroll-scrubbed hero: stays transparent for 250vh scroll space.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const isHome = location === "/";

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => {
      // With 250vh hero, nav becomes solid after scrolling past the animation
      setScrolled(window.scrollY > window.innerHeight * 1.5);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const links = [
    { href: "/menu", label: "Menu" },
    { href: "/board", label: "Wall" },
    { href: "/contact", label: "Contact" },
  ];

  const bgClass = !isHome
    ? "bg-warm-white/95 backdrop-blur-md shadow-sm"
    : scrolled
      ? "bg-warm-white/95 backdrop-blur-md shadow-sm"
      : "bg-transparent";

  const textClass = !isHome
    ? "text-charcoal"
    : scrolled
      ? "text-charcoal"
      : "text-charcoal";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
    >
      <div className="container flex items-center justify-between h-16 lg:h-20">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/brand/icon.png"
            alt="Istoria Coffee"
            className="h-9 w-9"
          />
          <div className="leading-tight">
            <span className="font-display text-lg font-semibold tracking-tight text-charcoal">
              istoria
            </span>
            <span className="block text-[10px] tracking-[0.2em] uppercase font-body font-medium text-charcoal-light">
              coffee
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-body text-sm font-medium tracking-wide transition-colors duration-200 hover:text-espresso ${
                location === link.href ? "text-espresso" : textClass
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/order"
            className="inline-flex items-center gap-1 bg-espresso text-warm-white px-5 py-2.5 rounded-full text-sm font-body font-medium hover:bg-espresso-light transition-all duration-200 active:scale-[0.97]"
          >
            Order now
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-[2px] bg-charcoal transition-all duration-200 ${
              mobileOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-charcoal transition-all duration-200 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-charcoal transition-all duration-200 ${
              mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-warm-white/98 backdrop-blur-lg shadow-lg transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col py-4 px-6 gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-body text-base font-medium py-3 border-b border-cream transition-colors ${
                location === link.href ? "text-espresso" : "text-charcoal-light"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/order"
            className="mt-3 inline-flex items-center justify-center gap-1 bg-espresso text-warm-white px-5 py-3 rounded-full text-base font-body font-medium"
          >
            Order now →
          </Link>
        </nav>
      </div>
    </header>
  );
}
