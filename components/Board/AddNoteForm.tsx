"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useCanPostToday } from "@/hooks/useCanPostToday";

const MAX_LENGTH = 140;

// Instant client-side feedback only — not the real filter. The Edge
// Function's OpenAI Moderation call is the actual gate.
const OBVIOUS_WORDLIST = ["putangina", "gago", "tanga"];

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "rejected"; reason: "flagged" | "already_posted_today" | "error" };

export default function AddNoteForm({ onPosted }: { onPosted?: () => void }) {
  const deviceId = useDeviceId();
  const canPostToday = useCanPostToday(deviceId);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const hasObviousWord = OBVIOUS_WORDLIST.some((word) =>
    message.toLowerCase().includes(word),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deviceId || !message.trim() || state.status === "submitting") return;

    setState({ status: "submitting" });
    const { data, error } = await supabase.functions.invoke("submit-note", {
      body: { device_id: deviceId, message: message.trim() },
    });

    if (error || !data?.ok) {
      const reason = data?.reason === "flagged"
        ? "flagged"
        : data?.reason === "already_posted_today"
          ? "already_posted_today"
          : "error";
      setState({ status: "rejected", reason });
      return;
    }

    setState({ status: "success" });
    setMessage("");
    onPosted?.();
  }

  if (canPostToday === false) {
    return (
      <p className="text-sm text-ink/70 bg-neutral-100 rounded-2xl p-4">
        Isang kwento sa isang araw lang, ha? Balik ka bukas. ☕
        <br />
        <span className="text-xs text-ink/50">
          (Only one story a day, okay? Come back tomorrow. ☕)
        </span>
      </p>
    );
  }

  if (state.status === "success") {
    return (
      <p className="text-sm text-accent2-800 bg-accent2-100 rounded-2xl p-4">
        Posted! Thanks for sharing. Come back tomorrow for another.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 max-w-md">
      <p className="text-xs text-ink/60 leading-relaxed">
        Isang kwento, isang araw. Panatilihin nating magalang — mga notang
        may masamang salita o hindi angkop na laman ay awtomatikong
        titiktikan.
        <br />
        <span className="opacity-80">
          (One note, one day. Keep it kind — notes with harmful or
          inappropriate content are automatically screened.)
        </span>
      </p>

      <textarea
        className="input"
        rows={3}
        maxLength={MAX_LENGTH}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="May kwento ka? I-share dito."
      />
      <div className="flex justify-between items-center text-xs text-ink/50">
        <span>
          {message.length}/{MAX_LENGTH}
        </span>
        {hasObviousWord && (
          <span className="text-accent-800">Baka ma-flag ito.</span>
        )}
      </div>

      {state.status === "rejected" && (
        <p className="text-sm text-accent-800 bg-accent-100 rounded-2xl p-3">
          {state.reason === "flagged"
            ? "Hindi ma-post ang kwento mo — baka may salitang hindi angkop. Subukan ulit."
            : state.reason === "already_posted_today"
              ? "Isang kwento sa isang araw lang, ha? Balik ka bukas. ☕"
              : "Something went wrong — try again in a bit."}
        </p>
      )}

      <button
        type="submit"
        disabled={!message.trim() || state.status === "submitting"}
        className="btn btn-primary self-start"
      >
        {state.status === "submitting" ? "Posting…" : "May kwento ka? I-share dito."}
      </button>
    </form>
  );
}
