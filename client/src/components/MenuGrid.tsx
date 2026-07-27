import MenuCard from "./MenuCard";

/**
 * MenuGrid — zine-style single column with dotted leaders.
 * Not a card grid — a café menu list with warmth.
 */
interface MenuGridProps {
  items: Array<{
    id: string;
    name: string;
    price?: number;
    hot?: number;
    iced?: number;
    servesNote?: string;
  }>;
  tag?: string;
}

export default function MenuGrid({ items, tag }: MenuGridProps) {
  return (
    <div className="max-w-xl mx-auto lg:mx-0 space-y-1">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} tag={tag} />
      ))}
    </div>
  );
}
