/**
 * SocialGrid — recent post grid, sourced from real shop photos
 * until a live SnapWidget/Behold.so feed is connected.
 */

const GRID_PHOTOS = [
  "/brand/social/1.jpg",
  "/brand/social/2.jpg",
  "/brand/social/3.jpg",
  "/brand/social/4.jpg",
  "/brand/social/5.jpg",
  "/brand/social/6.jpg",
];

export default function SocialGrid() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center mb-10">
          <p className="font-accent text-xl text-charcoal-light mb-1">Follow our journey</p>
          <h2 className="font-display text-3xl sm:text-4xl text-charcoal font-semibold mb-6">
            @istoriacoffee
          </h2>
        </div>

        {/* Recent post grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl mx-auto mb-8">
          {GRID_PHOTOS.map((src, idx) => (
            <a
              key={src}
              href="https://instagram.com/istoriacoffee"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square rounded-sm overflow-hidden border border-border block"
            >
              <img
                src={src}
                alt={`Istoria Coffee — Instagram post ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </a>
          ))}
        </div>

        {/* Follow buttons — muted, on-brand */}
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://instagram.com/istoriacoffee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-charcoal-light text-sm font-body font-medium hover:border-espresso/40 hover:text-espresso transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            Instagram
          </a>
          <a
            href="https://facebook.com/coffee.istoria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-charcoal-light text-sm font-body font-medium hover:border-espresso/40 hover:text-espresso transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Facebook
          </a>
          <a
            href="https://tiktok.com/@istoria.coffee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-charcoal-light text-sm font-body font-medium hover:border-espresso/40 hover:text-espresso transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            TikTok
          </a>
        </div>

        <p className="font-body text-xs text-charcoal-light/40 text-center mt-6">
          ⚡ Live Instagram feed coming soon — SnapWidget/Behold.so setup pending.
        </p>
      </div>
    </section>
  );
}
