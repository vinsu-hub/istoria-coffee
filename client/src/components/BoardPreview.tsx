import { useEffect, useState } from "react";
import { Link } from "wouter";

/**
 * BoardPreview — homepage section showing the latest 4 notes from /api/notes.
 * Links to /board for the full wall.
 * Uses warm paper tones, not generic pastels.
 */

interface WallNote {
  id: string;
  message: string;
}

const PAPER_TONES = ["bg-[#f5eddb]", "bg-[#f0e6d0]", "bg-[#f7f0e0]", "bg-[#e8dcc4]"];
const ROTATIONS = [-3, 2, -1, 4];

export default function BoardPreview() {
  const [notes, setNotes] = useState<WallNote[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setNotes((data.notes ?? []).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10">
          <div>
            <p className="font-accent text-xl text-charcoal-light mb-1">Freedom Wall</p>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal font-semibold">
              Got a story? Share it here.
            </h2>
          </div>
          <Link
            href="/board"
            className="mt-4 lg:mt-0 font-body text-sm text-espresso hover:text-espresso-light transition-colors font-medium"
          >
            Add yours →
          </Link>
        </div>

        {notes.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl">
            {notes.map((note, idx) => (
              <div
                key={note.id}
                className={`${PAPER_TONES[idx % PAPER_TONES.length]} p-4 rounded-sm shadow-[2px_3px_8px_rgba(120,100,70,0.1)]`}
                style={{ transform: `rotate(${ROTATIONS[idx % ROTATIONS.length]}deg)` }}
              >
                <p className="font-body text-sm text-charcoal leading-relaxed">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
