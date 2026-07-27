const ADDRESS = "Brgy. Maitim, National Highway, Bay, Laguna, Philippines";
const ENCODED_ADDRESS = encodeURIComponent(ADDRESS);

// Exact lat/lng not yet provided (Appendix E open item) — uses a text-query
// embed, which needs no API key and resolves the same address. Swap to the
// key-based Google Maps Embed API (NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY) with
// exact coordinates once available; no markup changes needed beyond the src.
const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${ENCODED_ADDRESS}&output=embed`;
const DIRECTIONS_HREF = `https://www.google.com/maps/dir/?api=1&destination=${ENCODED_ADDRESS}`;

export default function LocationMap() {
  return (
    <section
      id="location"
      className="px-5 md:px-10 pt-16 max-w-3xl grid gap-6 md:grid-cols-2 md:items-start"
    >
      <div className="md:col-span-2">
        <h2 className="text-[26px] md:text-[34px] leading-tight">Find us</h2>
      </div>

      <div className="rounded-3xl overflow-hidden aspect-[16/10] bg-neutral-200">
        <iframe
          src={MAP_EMBED_SRC}
          title="Istoria Coffee location map"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="grid gap-4.5">
        <div>
          <span className="block text-xs tracking-wide uppercase font-semibold text-accent-700 mb-2">
            Address
          </span>
          <p className="text-[15.5px] leading-relaxed">
            Brgy. Maitim, National Highway
            <br />
            Bay, Laguna, Philippines
          </p>
        </div>
        <div>
          <span className="block text-xs tracking-wide uppercase font-semibold text-accent-700 mb-2">
            Hours
          </span>
          <p className="text-[15.5px] leading-relaxed">
            Monday – Sunday · 12:00PM – 3:00AM
          </p>
        </div>
        <a href={DIRECTIONS_HREF} target="_blank" rel="noreferrer" className="btn btn-primary justify-self-start">
          Get directions →
        </a>
      </div>
    </section>
  );
}
