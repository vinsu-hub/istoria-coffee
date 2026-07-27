import Link from "next/link";
import { getCategory } from "@/lib/menu";
import MenuGrid from "./MenuGrid";

export default function MenuPreview() {
  const featured = getCategory("specials").slice(0, 4);

  return (
    <section id="menu" className="px-5 md:px-10 pt-14 max-w-3xl">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-[26px] md:text-[34px] leading-tight">Menu</h2>
        <Link href="/menu" className="text-sm font-semibold text-accent-700 hover:text-accent-800">
          See full menu →
        </Link>
      </div>
      <div className="mt-6">
        <MenuGrid items={featured} />
      </div>
    </section>
  );
}
