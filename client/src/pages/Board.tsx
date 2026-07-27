import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AddNoteForm from "@/components/Board/AddNoteForm";
import BoardWall from "@/components/Board/BoardWall";

/**
 * /board — Freedom Board ("Kwentuhan Wall")
 * Full wall + form. Posts persist via /api/notes (JSON-file backed on the server).
 */

export default function BoardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 pt-20 lg:pt-24">
        {/* Header */}
        <section className="py-12 lg:py-16 bg-parchment">
          <div className="container text-center">
            <p className="font-accent text-xl text-charcoal-light mb-2">Kwentuhan Wall</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal font-bold mb-4">
              May kwento ka?
            </h1>
            <p className="font-body text-base text-charcoal-light max-w-md mx-auto">
              I-share dito. Isang kwento, isang araw.
            </p>
          </div>
        </section>

        {/* Add Note Form */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <AddNoteForm onPosted={() => setRefreshKey((k) => k + 1)} />
          </div>
        </section>

        {/* Board Wall */}
        <section className="py-12 lg:py-16 bg-parchment">
          <div className="container">
            <h2 className="font-display text-2xl text-charcoal font-semibold mb-8 text-center">
              Kwentuhan Wall
            </h2>
            <BoardWall refreshKey={refreshKey} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
