"use client";

import { useEffect, useState } from "react";

function getManilaHour(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const hourPart = parts.find((p) => p.type === "hour")?.value ?? "0";
  // Intl can return "24" for midnight hour in some environments; normalize to 0.
  return Number(hourPart) % 24;
}

function isOpenNow(hour: number): boolean {
  return hour >= 12 || hour < 3;
}

export default function StatusBadge() {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isOpenNow(getManilaHour()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="flex flex-wrap items-center gap-3 md:gap-5 px-5 md:px-10 py-6 border-y border-ink/10">
      <span className="inline-flex items-center gap-2 rounded-full bg-accent-100 text-accent-800 text-xs px-3.5 py-1.5">
        <span
          className="block w-1.5 h-1.5 rounded-full"
          style={{
            background:
              open === null
                ? "var(--color-neutral-400)"
                : open
                  ? "var(--color-accent2-600)"
                  : "var(--color-neutral-600)",
          }}
        />
        {open === null ? "—" : open ? "Open until 3AM" : "Closed — opens 12PM"}
      </span>
      <span className="text-[13.5px] text-ink/65">
        Brgy. Maitim, National Highway, Bay, Laguna · 12PM–3AM daily
      </span>
    </section>
  );
}
