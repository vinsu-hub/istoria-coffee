/**
 * MenuCard — zine-style drink/item card.
 * Warm paper texture, dotted price line, handwritten price weight.
 * Not a spreadsheet row — a café menu excerpt.
 */
interface MenuCardProps {
  item: {
    id: string;
    name: string;
    price?: number;
    hot?: number;
    iced?: number;
    note?: string;
    servesNote?: string;
  };
  tag?: string;
  featured?: boolean;
}

export default function MenuCard({ item, tag, featured }: MenuCardProps) {
  const hasSplitPricing = item.hot !== undefined && item.iced !== undefined;

  return (
    <div className={`group relative py-3 ${featured ? "border-b-2 border-espresso/20" : "border-b border-border"}`}>
      {tag && (
        <span className="absolute top-0 right-0 text-[9px] font-accent text-espresso/70 uppercase tracking-wider">
          {tag}
        </span>
      )}
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-sm sm:text-base font-medium text-charcoal leading-tight">
          {item.name}
        </h4>
        <div className="flex-none border-b border-dotted border-charcoal/20 flex-1 min-w-[2rem] mb-1" />
        {hasSplitPricing ? (
          <div className="flex-none flex gap-3 text-xs sm:text-sm">
            <span className="text-charcoal-light">
              Hot <span className="font-body font-semibold text-charcoal">₱{item.hot}</span>
            </span>
            <span className="text-charcoal-light">
              Iced <span className="font-body font-semibold text-charcoal">₱{item.iced}</span>
            </span>
          </div>
        ) : (
          <span className="flex-none font-body text-sm font-semibold text-charcoal whitespace-nowrap">
            ₱{item.price}
          </span>
        )}
      </div>
      {(item.note || item.servesNote) && (
        <p className="text-right font-body text-xs text-charcoal-light/70 mt-0.5">
          {item.note ?? item.servesNote}
        </p>
      )}
    </div>
  );
}
