/**
 * OrderOptionCard — delivery-app card.
 * Absorbed into Istoria's warm palette — no app-brand colors.
 */

interface OrderOptionCardProps {
  name: string;
  blurb: string;
  icon: React.ReactNode;
  deepLink?: string;
  webUrl: string;
  blocked?: boolean;
}

export default function OrderOptionCard({
  name,
  blurb,
  icon,
  deepLink,
  webUrl,
  blocked,
}: OrderOptionCardProps) {
  const handleOpen = () => {
    if (blocked) return;

    if (deepLink) {
      const start = Date.now();
      window.location.href = deepLink;
      setTimeout(() => {
        const elapsed = Date.now() - start;
        if (elapsed < 2000) {
          window.open(webUrl, "_blank", "noopener,noreferrer");
        }
      }, 1500);
    } else {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-warm-white border border-border rounded-sm p-8 text-center shadow-sm">
      <div className="flex justify-center mb-4 text-espresso/60">{icon}</div>
      <h3 className="font-display text-xl text-charcoal font-semibold mb-2">
        {name}
      </h3>
      <p className="font-body text-sm text-charcoal-light mb-6">
        {blurb}
      </p>
      {blocked ? (
        <button
          disabled
          className="px-6 py-3 rounded-full bg-cream border border-border text-charcoal-light text-sm font-body font-medium cursor-not-allowed"
        >
          Coming soon
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="px-6 py-3 rounded-full bg-espresso text-warm-white text-sm font-body font-medium hover:bg-espresso-light transition-all duration-200 active:scale-[0.97]"
        >
          Open App →
        </button>
      )}
    </div>
  );
}
