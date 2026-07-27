import type { MenuItem } from "@/lib/menu";

function formatPrice(item: MenuItem): string {
  if ("price" in item) return `₱${item.price}`;
  return `₱${item.hot} / ₱${item.iced}`;
}

export default function MenuCard({
  item,
  kicker,
}: {
  item: MenuItem;
  kicker?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-neutral-100 rounded-3xl p-5">
      {kicker && (
        <span className="text-[10px] tracking-wide uppercase text-accent-700">
          {kicker}
        </span>
      )}
      <div className="flex justify-between items-baseline gap-3">
        <span className="font-heading text-[19px]">{item.name}</span>
        <span className="text-[15px] font-semibold whitespace-nowrap">
          {formatPrice(item)}
        </span>
      </div>
      {item.tag && (
        <span className="inline-flex self-start text-[11px] px-2.5 py-0.5 rounded-full bg-accent-100 text-accent-800">
          {item.tag}
        </span>
      )}
      {"hot" in item && (
        <span className="text-xs text-ink/55">hot / iced</span>
      )}
    </div>
  );
}
