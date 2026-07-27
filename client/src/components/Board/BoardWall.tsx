import { useEffect, useState } from "react";
import StickyNote from "./StickyNote";

/**
 * BoardWall — fetches recent notes from the Freedom Wall API and renders
 * them in a scattered layout.
 */

interface WallNote {
  id: string;
  message: string;
  createdAt: string;
  displayDate: string;
}

export default function BoardWall({ refreshKey }: { refreshKey?: number }) {
  const [notes, setNotes] = useState<WallNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setNotes(data.notes ?? []);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <p className="font-body text-sm text-charcoal-light/50 text-center">Loading notes…</p>
    );
  }

  if (notes.length === 0) {
    return (
      <p className="font-body text-sm text-charcoal-light/50 text-center">
        No notes yet — be the first to share a story.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
      {notes.map((note) => (
        <StickyNote key={note.id} message={note.message} createdAt={note.displayDate} />
      ))}
    </div>
  );
}
