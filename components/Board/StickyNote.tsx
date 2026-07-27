import type { BoardNote } from "@/lib/supabase";

const COLOR_CLASSES: Record<string, string> = {
  accent: "bg-accent-100",
  accent2: "bg-accent2-100",
  neutral: "bg-neutral-200",
};

export default function StickyNote({ note }: { note: BoardNote }) {
  const bg = COLOR_CLASSES[note.color] ?? COLOR_CLASSES.neutral;

  return (
    <div
      className={`${bg} rounded-2xl p-4.5 min-h-[130px] font-hand text-xl leading-snug shadow-sm`}
      style={{ transform: `rotate(${note.rotation}deg)` }}
    >
      {note.message}
    </div>
  );
}
