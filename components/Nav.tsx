import Link from "next/link";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/#wall", label: "Wall" },
  { href: "/#location", label: "Location" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-20 flex flex-wrap items-center gap-3 md:gap-5 px-5 md:px-10 py-3 bg-cream/92 backdrop-blur-md border-b border-ink/10">
      <span className="font-heading text-xl mr-auto">Istoria</span>
      <div className="flex gap-3 md:gap-5 text-[13.5px] basis-full md:basis-auto order-3 md:order-none">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-ink/72 hover:text-accent-700">
            {link.label}
          </Link>
        ))}
      </div>
      <Link
        href="/order"
        className="btn btn-primary text-[13px] px-4 py-2.5"
      >
        Tara, Kape? →
      </Link>
    </nav>
  );
}
