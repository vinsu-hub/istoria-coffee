"use client";

import { useEffect, useState } from "react";
import { supabase, type BoardNote } from "@/lib/supabase";
import StickyNote from "./StickyNote";

export default function BoardWall({ limit }: { limit?: number }) {
  const [notes, setNotes] = useState<BoardNote[] | null>(null);

  useEffect(() => {
    let query = supabase
      .from("board_notes")
      .select("id, message, color, rotation, created_at")
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    Promise.resolve(query)
      .then(({ data, error }) => {
        if (error) throw error;
        setNotes(data ?? []);
      })
      .catch((error) => {
        console.error(error);
        setNotes([]);
      });
  }, [limit]);

  if (notes === null) {
    return <p className="text-sm text-ink/50">Loading notes…</p>;
  }

  if (notes.length === 0) {
    return (
      <p className="text-sm text-ink/50">
        No notes yet — be the first to leave one.
      </p>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
    >
      {notes.map((note) => (
        <StickyNote key={note.id} note={note} />
      ))}
    </div>
  );
}
