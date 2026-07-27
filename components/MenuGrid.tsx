import type { MenuItem } from "@/lib/menu";
import MenuCard from "./MenuCard";

export default function MenuGrid({
  items,
  kicker,
}: {
  items: MenuItem[];
  kicker?: string;
}) {
  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      {items.map((item) => (
        <MenuCard key={item.id} item={item} kicker={kicker} />
      ))}
    </div>
  );
}
