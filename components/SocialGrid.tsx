import PhotoPlaceholder from "./PhotoPlaceholder";

const socials = [
  { label: "Instagram", href: "https://instagram.com/istoriacoffee" },
  { label: "Facebook", href: "https://facebook.com/coffee.istoria" },
  { label: "TikTok", href: "https://tiktok.com/@istoria.coffee" },
];

// Placeholder grid until a SnapWidget or Behold.so embed is wired up
// (Appendix E: pick provider based on free-tier limits at build time).
// Swap the grid below for the provider's iframe/script embed once chosen.
export default function SocialGrid() {
  return (
    <section className="pt-16">
      <div className="flex items-baseline justify-between gap-4 flex-wrap px-5 md:px-10 max-w-3xl">
        <h2 className="text-[26px] md:text-[34px] leading-tight">
          @istoriacoffee
        </h2>
        <a
          href={socials[0].href}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-accent-700 hover:text-accent-800"
        >
          Follow →
        </a>
      </div>

      <div
        className="grid gap-1 mt-6"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <PhotoPlaceholder
            key={i}
            label={`Post ${i + 1}`}
            className="aspect-square"
          />
        ))}
      </div>

      <div className="flex gap-3 px-5 md:px-10 mt-6">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-ink/70 hover:text-accent-700 underline underline-offset-4"
          >
            {social.label}
          </a>
        ))}
      </div>
    </section>
  );
}
