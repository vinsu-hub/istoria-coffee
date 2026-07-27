"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/#wall", label: "Wall" },
  { href: "/#location", label: "Location" },
  { href: "/contact", label: "Contact" },
];

const REVEAL_FALLBACK_MS = 1500;

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [revealed, setRevealed] = useState(!isHome);

  useEffect(() => {
    if (!isHome) return;
    const reveal = () => setRevealed(true);
    window.addEventListener("hero-ready", reveal);
    const fallback = window.setTimeout(reveal, REVEAL_FALLBACK_MS);
    return () => {
      window.removeEventListener("hero-ready", reveal);
      window.clearTimeout(fallback);
    };
  }, [isHome]);

  return (
    <nav
      className={`sticky top-0 z-20 flex flex-wrap items-center gap-3 md:gap-5 px-5 md:px-10 py-3 bg-cream/92 backdrop-blur-md border-b border-ink/10 transition-all duration-700 ease-out ${
        revealed ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <span className="font-heading text-xl mr-auto">Istoria</span>
      <div className="flex gap-3 md:gap-5 text-[13.5px] basis-full md:basis-auto order-3 md:order-none">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-ink/72 hover:text-accent-700">
            {link.label}
          </Link>
        ))}
      </div>
      <Link href="/order" className="btn btn-primary text-[13px] px-4 py-2.5">
        Tara, Kape? →
      </Link>
    </nav>
  );
}
