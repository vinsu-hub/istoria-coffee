import Link from "next/link";
import BoardWall from "@/components/Board/BoardWall";

export default function FreedomBoardPreview() {
  return (
    <section id="wall" className="px-5 md:px-10 pt-16 max-w-3xl">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-[26px] md:text-[34px] leading-tight">
          Freedom board
        </h2>
        <Link href="/board" className="text-sm font-semibold text-accent-700 hover:text-accent-800">
          Add yours →
        </Link>
      </div>
      <p className="text-[15px] leading-relaxed mt-3 max-w-[40ch] text-ink/70">
        Notes left on the wall by whoever sat here before you.
      </p>
      <div className="mt-7">
        <BoardWall limit={6} />
      </div>
    </section>
  );
}
