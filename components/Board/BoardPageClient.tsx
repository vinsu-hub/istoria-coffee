"use client";

import { useState } from "react";
import BoardWall from "./BoardWall";
import AddNoteForm from "./AddNoteForm";

export default function BoardPageClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="px-5 md:px-10 pt-10 pb-16 max-w-3xl">
      <h1 className="text-[32px] md:text-[42px] leading-tight mb-2">
        Freedom board
      </h1>
      <p className="text-ink/70 text-[15px] mb-8 max-w-[40ch]">
        Notes left on the wall by whoever sat here before you.
      </p>

      <div className="mb-12">
        <AddNoteForm onPosted={() => setRefreshKey((k) => k + 1)} />
      </div>

      <BoardWall key={refreshKey} />
    </div>
  );
}
