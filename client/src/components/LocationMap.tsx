/**
 * LocationMap — map embed + directions + hours table.
 * Uses Google Maps Embed API iframe (no billing tier needed for basic embed).
 * BLOCKED: exact lat/lng needed — using search query as fallback.
 */

export default function LocationMap() {
  // BLOCKED: Appendix E — exact lat/lng needed
  // Using search-based embed URL as placeholder
  const mapQuery = encodeURIComponent("Istoria Coffee Brgy Maitim Bay Laguna Philippines");
  const embedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=Istoria+Coffee+Brgy+Maitim+Bay+Laguna+Philippines`;

  return (
    <section className="py-12 lg:py-16 bg-cream">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Map */}
          <div className="aspect-[4/3] rounded-sm overflow-hidden shadow-sm border border-border">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Istoria Coffee location on Google Maps"
              className="w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl lg:text-3xl text-charcoal font-semibold mb-3">
                Find Us
              </h2>
              <p className="font-body text-base text-charcoal-light leading-relaxed">
                Brgy. Maitim, National Highway (Manila South Road),
                <br />
                Bay, Laguna, Philippines
              </p>
            </div>

            {/* Landmark directions */}
            <div className="bg-parchment rounded-sm p-4 border border-border">
              <h3 className="font-body text-sm font-medium text-charcoal mb-2">
                How to get here:
              </h3>
              <p className="font-body text-sm text-charcoal-light leading-relaxed">
                Right on National Highway / Manila South Road, near well-known
                landmarks in Bay, Laguna. Look for the Istoria Coffee sign.
              </p>
            </div>

            {/* Hours table */}
            <div>
              <h3 className="font-body text-sm font-medium text-charcoal-light uppercase tracking-wider mb-3">
                Operating Hours
              </h3>
              <table className="w-full font-body text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 text-charcoal-light">Monday</td>
                    <td className="py-2 text-charcoal text-right font-medium">12:00 PM – 3:00 AM</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-charcoal-light">Tuesday</td>
                    <td className="py-2 text-charcoal text-right font-medium">12:00 PM – 3:00 AM</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-charcoal-light">Wednesday</td>
                    <td className="py-2 text-charcoal text-right font-medium">12:00 PM – 3:00 AM</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-charcoal-light">Thursday</td>
                    <td className="py-2 text-charcoal text-right font-medium">12:00 PM – 3:00 AM</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-charcoal-light">Friday</td>
                    <td className="py-2 text-charcoal text-right font-medium">12:00 PM – 3:00 AM</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-charcoal-light">Saturday</td>
                    <td className="py-2 text-charcoal text-right font-medium">12:00 PM – 3:00 AM</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-charcoal-light">Sunday</td>
                    <td className="py-2 text-charcoal text-right font-medium">12:00 PM – 3:00 AM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Get Directions button */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso text-warm-white text-sm font-body font-medium hover:bg-espresso-light transition-all duration-200 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Get Directions
            </a>

            <p className="font-body text-xs text-charcoal-light/40">
              ⚠️ Exact coordinates pending from owner. Map may show approximate location.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
