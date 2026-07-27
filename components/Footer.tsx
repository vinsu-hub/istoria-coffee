import Link from "next/link";

const socials = [
  { label: "Instagram", href: "https://instagram.com/istoriacoffee" },
  { label: "Facebook", href: "https://facebook.com/coffee.istoria" },
  { label: "TikTok", href: "https://tiktok.com/@istoria.coffee" },
];

export default function Footer() {
  return (
    <footer
      id="contact-info"
      className="mt-16 md:mt-24 px-5 md:px-10 pt-12 pb-10 bg-neutral-900 text-neutral-100"
    >
      <div className="max-w-4xl grid gap-8">
        <div>
          <span className="font-heading text-2xl block">Istoria</span>
          <span className="text-sm opacity-70">Kape at Kwentuhan · Bay, Laguna</span>
        </div>

        <div className="grid gap-2 text-sm opacity-80">
          <span>Open daily, 12PM – 3AM</span>
          <a href="mailto:hello@istoria.coffee" className="text-accent-200 hover:text-accent-100">
            hello@istoria.coffee
          </a>
          <span>Brgy. Maitim, National Highway, Bay, Laguna</span>
        </div>

        <div className="flex gap-2.5">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="w-10 h-10 rounded-full border border-neutral-100/30 grid place-items-center text-neutral-100 hover:bg-neutral-100/12 transition-colors"
            >
              {social.label[0]}
            </a>
          ))}
        </div>

        <Link
          href="/order"
          className="btn btn-primary justify-self-start"
        >
          Tara, Kape? →
        </Link>

        <span className="text-xs opacity-55">© 2026 Istoria Coffee</span>
      </div>
    </footer>
  );
}
