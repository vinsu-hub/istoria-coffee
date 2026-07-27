// Deno Edge Function — the only path allowed to write to board_notes.
// Server-side gatekeeper: daily-limit check, then OpenAI moderation, then insert.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COLORS = ["accent", "accent2", "neutral"];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomRotation(): number {
  // Subtle alternating tilt (-2deg to 2deg), matching the adopted design tone
  // rather than the wider -6deg/6deg range from the original brief.
  return Math.round((Math.random() * 4 - 2) * 10) / 10;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { device_id, message } = await req.json();

    if (typeof device_id !== "string" || !device_id) {
      return json({ ok: false, reason: "missing_device_id" }, 400);
    }
    if (typeof message !== "string" || !message.trim() || message.length > 140) {
      return json({ ok: false, reason: "invalid_message" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: canPost, error: canPostError } = await supabase.rpc(
      "can_post_today",
      { p_device_id: device_id },
    );
    if (canPostError) throw canPostError;
    if (!canPost) {
      return json({ ok: false, reason: "already_posted_today" }, 200);
    }

    const moderationRes = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({ model: "omni-moderation-latest", input: message }),
    });
    const moderation = await moderationRes.json();
    const result = moderation.results?.[0];
    const flagged = result?.flagged ?? false;

    if (flagged) {
      await supabase.from("moderation_flags").insert({
        device_id,
        message,
        categories: result.categories ?? {},
      });
      return json({ ok: false, reason: "flagged" }, 200);
    }

    const { error: insertError } = await supabase.from("board_notes").insert({
      device_id,
      message,
      color: randomColor(),
      rotation: randomRotation(),
    });
    if (insertError) throw insertError;

    return json({ ok: true }, 200);
  } catch (err) {
    console.error(err);
    return json({ ok: false, reason: "server_error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
