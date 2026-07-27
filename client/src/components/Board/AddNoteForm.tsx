import { useState } from "react";
import { useDeviceId } from "@/hooks/useDeviceId";

/**
 * AddNoteForm — textarea + warning copy + submit.
 * Styled as a warm paper note pinned to the wall.
 * Posts to /api/notes — one note per device per day, server-side guardrails.
 */

const BASIC_BLOCKLIST = ["putang ina", "gago", "tang ina", "porn", "fuck"];

interface AddNoteFormProps {
  onPosted?: () => void;
}

export default function AddNoteForm({ onPosted }: AddNoteFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "limit_reached" | "rejected" | "error">("idle");
  const deviceId = useDeviceId();

  const charCount = message.length;
  const hasBadWord = BASIC_BLOCKLIST.some((word) =>
    message.toLowerCase().includes(word)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (charCount === 0 || charCount > 140 || !deviceId) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, deviceId }),
      });

      if (res.status === 201) {
        setStatus("success");
        setMessage("");
        onPosted?.();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 429 || data.error === "limit_reached") {
        setStatus("limit_reached");
      } else if (data.error === "blocked_content") {
        setStatus("rejected");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Warning copy — persistent, from Appendix C */}
      <div className="mb-6 p-4 rounded-sm bg-parchment border border-border">
        <p className="font-body text-sm text-charcoal leading-relaxed">
          <span className="font-accent text-lg text-espresso italic">Isang kwento, isang araw.</span>{" "}
          Panatilihin nating magalang — mga notang may masamang salita o hindi angkop na laman ay awtomatikong titiktikan.
        </p>
        <p className="font-body text-xs text-charcoal-light/50 mt-1">
          (One note, one day. Keep it kind — notes with harmful or inappropriate content are automatically screened.)
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Note input — warm paper with tape */}
        <div className="relative bg-[#f5eddb] border border-[#d4c5a0] rounded-sm p-5 shadow-[2px_3px_8px_rgba(120,100,70,0.1)]">
          {/* Tape strip */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-2 w-12 h-4"
            style={{
              background: "rgba(210, 195, 170, 0.5)",
              transform: `rotate(${Math.random() * 4 - 2}deg)`,
            }}
          />

          {/* Subtle lined-paper effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-sm"
            style={{
              backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #8b7355 27px, #8b7355 28px)",
            }}
          />

          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value.slice(0, 140));
              if (status !== "idle") setStatus("idle");
            }}
            className="w-full h-32 bg-transparent border-none resize-none font-body text-base text-charcoal placeholder:text-charcoal-light/40 focus:outline-none focus:ring-0 relative z-10"
            placeholder="Isulat ang kwento mo dito..."
            maxLength={140}
            disabled={status === "submitting"}
          />

          {/* Client-side pre-check feedback */}
          {hasBadWord && (
            <p className="font-body text-xs text-amber-700 mt-1 relative z-10">
              * Hiyas — baka may salitang hindi angkop. Try rewording.
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#d4c5a0]/40 relative z-10">
            <span className={`font-body text-xs ${charCount > 130 ? "text-amber-700" : "text-charcoal-light/50"}`}>
              {charCount} / 140
            </span>

            {status === "success" && (
              <span className="font-body text-sm text-espresso">
                Na-post na! Balikan ka bukas. ☕
              </span>
            )}
            {status === "limit_reached" && (
              <span className="font-body text-sm text-charcoal-light/60">
                Isang kwento lang bawat araw — balik ka bukas.
              </span>
            )}
            {status === "rejected" && (
              <span className="font-body text-sm text-amber-700">
                Hindi ma-post ang kwento mo — baka may salitang hindi angkop. Subukan ulit.
              </span>
            )}
            {status === "error" && (
              <span className="font-body text-sm text-amber-700">
                May problema sa pag-post. Subukan ulit.
              </span>
            )}
            {status !== "success" && status !== "limit_reached" && status !== "rejected" && status !== "error" && (
              <button
                type="submit"
                disabled={charCount === 0 || hasBadWord || status === "submitting"}
                className={`px-5 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 active:scale-[0.97] ${
                  charCount === 0 || hasBadWord
                    ? "bg-espresso/20 text-charcoal-light/40 cursor-not-allowed"
                    : "bg-espresso text-warm-white hover:bg-espresso-light"
                }`}
              >
                {status === "submitting" ? "Nagpo-post..." : "I-post"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
