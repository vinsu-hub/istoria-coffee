/**
 * StickyNote — renders one note with physical paper feel.
 * Warmer tones, slight tape shadow, torn-edge suggestion.
 * Not generic pastel UI — a café wall pin-up.
 */

// Warm paper palette — muted, earthy, café-authentic
const PAPER_COLORS = [
  { bg: "bg-[#f5eddb]", border: "border-[#d4c5a0]" },
  { bg: "bg-[#f0e6d0]", border: "border-[#c9b88e]" },
  { bg: "bg-[#e8dcc4]", border: "border-[#b8a680]" },
  { bg: "bg-[#f7f0e0]", border: "border-[#d9c9a8]" },
  { bg: "bg-[#efe3cd]", border: "border-[#c4b48e]" },
  { bg: "bg-[#f2ead8]", border: "border-[#d1c29e]" },
  { bg: "bg-[#e6dac2]", border: "border-[#bfb08c]" },
  { bg: "bg-[#f4ecda]", border: "border-[#d6c6a6]" },
];

interface StickyNoteProps {
  message: string;
  color?: string;
  rotation?: number;
  createdAt?: string;
}

export default function StickyNote({
  message,
  color,
  rotation = 0,
  createdAt,
}: StickyNoteProps) {
  // Pick from warm paper palette
  const paper = PAPER_COLORS[Math.floor(Math.random() * PAPER_COLORS.length)];
  const rotate = rotation || Math.random() * 8 - 4; // -4 to 4 degrees
  const tapeStyle = Math.random() > 0.5 ? "top" : "bottom";

  return (
    <div className="relative">
      {/* Tape strip */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${tapeStyle === "top" ? "-top-2" : "-bottom-2"} w-12 h-4 bg-cream/60 rotate-1`}
        style={{
          background: "rgba(210, 195, 170, 0.5)",
          transform: `rotate(${Math.random() * 4 - 2}deg)`,
        }}
      />

      {/* Note body — warm paper */}
      <div
        className={`${paper.bg} ${paper.border} border rounded-sm p-4 shadow-[2px_3px_8px_rgba(120,100,70,0.12)]`}
        style={{
          transform: `rotate(${rotate}deg)`,
          background: `${paper.bg}`,
        }}
      >
        {/* Subtle lined-paper effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #8b7355 27px, #8b7355 28px)",
          }}
        />

        <p className="font-body text-sm text-charcoal leading-relaxed break-words relative z-10">
          {message}
        </p>
        {createdAt && (
          <p className="font-accent text-xs text-charcoal-light/50 mt-2 relative z-10">
            — {createdAt}
          </p>
        )}
      </div>
    </div>
  );
}
