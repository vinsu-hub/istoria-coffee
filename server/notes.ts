import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// Statically imported (bundled directly into the JS output) so seed data is
// always available even when the serverless bundler doesn't preserve the
// runtime file path server/notes.ts would otherwise compute from __dirname.
import seedNotes from "./data/notes.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const NOTES_FILE = path.resolve(__dirname, "data", "notes.json");
export const MAX_MESSAGE_LENGTH = 140;
export const MAX_NOTES_RETURNED = 60;
const MAX_NOTES_STORED = 200;
const POST_LIMIT_SECONDS = 60 * 60 * 24; // one note per device per rolling day

// Same intent as the client-side pre-check in AddNoteForm.tsx — the server
// is the actual guardrail; the client check is just instant UX feedback.
const BLOCKLIST = ["putang ina", "gago", "tang ina", "porn", "fuck", "shit", "bobo", "tanga"];

export interface Note {
  id: string;
  message: string;
  deviceId: string;
  createdAt: string; // ISO timestamp
  displayDate: string; // e.g. "Jul 27"
}

export type PublicNote = Omit<Note, "deviceId">;

export function containsBlockedWord(message: string): boolean {
  const lower = message.toLowerCase();
  return BLOCKLIST.some((word) => lower.includes(word));
}

export function toPublicNote(note: Note): PublicNote {
  const { deviceId, ...rest } = note;
  return rest;
}

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildNote(message: string, deviceId: string): Note {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    message,
    deviceId,
    createdAt: now.toISOString(),
    displayDate: formatDisplayDate(now.toISOString()),
  };
}

export type CreateNoteResult =
  | { ok: true; note: PublicNote }
  | { ok: false; status: number; error: string };

export type DeleteNoteResult = { ok: true } | { ok: false; status: number; error: string };

function validateInput(message: unknown, deviceId: unknown): { message: string; deviceId: string } | { error: "invalid_request" | "invalid_length" | "blocked_content" } {
  if (typeof message !== "string" || typeof deviceId !== "string" || !deviceId) {
    return { error: "invalid_request" };
  }
  const trimmed = message.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) {
    return { error: "invalid_length" };
  }
  if (containsBlockedWord(trimmed)) {
    return { error: "blocked_content" };
  }
  return { message: trimmed, deviceId };
}

// ---------------------------------------------------------------------------
// Supabase-backed store (highest priority when configured — see
// supabase/freedom_wall.sql for the table this expects)
// ---------------------------------------------------------------------------

const NOTES_TABLE = "freedom_wall_notes";

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function deleteNoteSupabase(
  supabase: SupabaseClient,
  id: string
): Promise<DeleteNoteResult> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0) {
    return { ok: false, status: 404, error: "not_found" };
  }
  return { ok: true };
}

async function listRecentNotesSupabase(supabase: SupabaseClient): Promise<PublicNote[]> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("id, message, created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_NOTES_RETURNED);

  if (error) throw error;

  return (data ?? []).map((row: { id: string; message: string; created_at: string }) => ({
    id: row.id,
    message: row.message,
    createdAt: row.created_at,
    displayDate: formatDisplayDate(row.created_at),
  }));
}

async function createNoteSupabase(
  supabase: SupabaseClient,
  message: string,
  deviceId: string
): Promise<CreateNoteResult> {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const { data: existing, error: checkError } = await supabase
    .from(NOTES_TABLE)
    .select("id")
    .eq("device_id", deviceId)
    .gte("created_at", startOfToday.toISOString())
    .limit(1);

  if (checkError) throw checkError;
  if (existing && existing.length > 0) {
    return { ok: false, status: 429, error: "limit_reached" };
  }

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .insert({ message, device_id: deviceId })
    .select("id, message, created_at")
    .single();

  if (error) {
    // The unique (device_id, day) index is a race-condition safety net —
    // a violation here means another request from the same device beat
    // this one to it in the tiny window since the check above.
    if (error.code === "23505") {
      return { ok: false, status: 429, error: "limit_reached" };
    }
    throw error;
  }

  return {
    ok: true,
    note: {
      id: data.id,
      message: data.message,
      createdAt: data.created_at,
      displayDate: formatDisplayDate(data.created_at),
    },
  };
}

// ---------------------------------------------------------------------------
// Redis-backed store (used automatically on Vercel once Upstash is connected)
// ---------------------------------------------------------------------------

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function deleteNoteRedis(redis: Redis, id: string): Promise<DeleteNoteResult> {
  const raw = await redis.zrange<string[]>("wall:notes", 0, -1);
  const match = raw.find((entry) => (JSON.parse(entry) as Note).id === id);
  if (!match) {
    return { ok: false, status: 404, error: "not_found" };
  }
  await redis.zrem("wall:notes", match);
  return { ok: true };
}

async function listRecentNotesRedis(redis: Redis): Promise<PublicNote[]> {
  const raw = await redis.zrange<string[]>("wall:notes", 0, MAX_NOTES_RETURNED - 1, { rev: true });
  return raw.map((entry) => toPublicNote(JSON.parse(entry) as Note));
}

async function createNoteRedis(redis: Redis, message: string, deviceId: string): Promise<CreateNoteResult> {
  const limitKey = `wall:posted:${deviceId}`;
  const gotLock = await redis.set(limitKey, "1", { nx: true, ex: POST_LIMIT_SECONDS });
  if (!gotLock) {
    return { ok: false, status: 429, error: "limit_reached" };
  }

  const note = buildNote(message, deviceId);
  await redis.zadd("wall:notes", { score: Date.now(), member: JSON.stringify(note) });
  await redis.zremrangebyrank("wall:notes", 0, -MAX_NOTES_STORED - 1);

  return { ok: true, note: toPublicNote(note) };
}

// ---------------------------------------------------------------------------
// JSON-file store (local dev / plain Node server, no Redis env configured)
// ---------------------------------------------------------------------------

async function readNotesFile(): Promise<Note[]> {
  try {
    const raw = await fs.readFile(NOTES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    // Serverless bundlers don't always preserve the on-disk path this file
    // expects (e.g. Vercel functions) — fall back to the copy that got
    // bundled directly into the JS at build time, so GET /api/notes always
    // has at least the seed content instead of silently returning empty.
    return seedNotes as Note[];
  }
}

async function writeNotesFile(notes: Note[]): Promise<void> {
  await fs.mkdir(path.dirname(NOTES_FILE), { recursive: true });
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

function isSameDay(isoA: string, isoB: string): boolean {
  return isoA.slice(0, 10) === isoB.slice(0, 10);
}

async function deleteNoteFile(id: string): Promise<DeleteNoteResult> {
  const notes = await readNotesFile();
  const remaining = notes.filter((note) => note.id !== id);
  if (remaining.length === notes.length) {
    return { ok: false, status: 404, error: "not_found" };
  }

  try {
    await writeNotesFile(remaining);
  } catch {
    return { ok: false, status: 503, error: "storage_unavailable" };
  }

  return { ok: true };
}

async function listRecentNotesFile(): Promise<PublicNote[]> {
  const notes = await readNotesFile();
  return notes
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_NOTES_RETURNED)
    .map(toPublicNote);
}

async function createNoteFile(message: string, deviceId: string): Promise<CreateNoteResult> {
  const notes = await readNotesFile();
  const note = buildNote(message, deviceId);

  const alreadyPostedToday = notes.some(
    (existing) => existing.deviceId === deviceId && isSameDay(existing.createdAt, note.createdAt)
  );
  if (alreadyPostedToday) {
    return { ok: false, status: 429, error: "limit_reached" };
  }

  notes.push(note);
  try {
    await writeNotesFile(notes);
  } catch {
    // Serverless filesystems (e.g. Vercel without Redis connected) are
    // read-only outside /tmp — fail with a clear, catchable error instead
    // of an unhandled crash.
    return { ok: false, status: 503, error: "storage_unavailable" };
  }

  return { ok: true, note: toPublicNote(note) };
}

// ---------------------------------------------------------------------------
// Public API — Supabase when configured, else Redis, else the JSON file
// ---------------------------------------------------------------------------

export async function listRecentNotes(): Promise<PublicNote[]> {
  const supabase = getSupabase();
  if (supabase) return listRecentNotesSupabase(supabase);

  const redis = getRedis();
  return redis ? listRecentNotesRedis(redis) : listRecentNotesFile();
}

export async function createNote(rawMessage: unknown, rawDeviceId: unknown): Promise<CreateNoteResult> {
  const validated = validateInput(rawMessage, rawDeviceId);
  if ("error" in validated) {
    return { ok: false, status: 400, error: validated.error };
  }

  const supabase = getSupabase();
  if (supabase) return createNoteSupabase(supabase, validated.message, validated.deviceId);

  const redis = getRedis();
  return redis
    ? createNoteRedis(redis, validated.message, validated.deviceId)
    : createNoteFile(validated.message, validated.deviceId);
}

// Admin-only — deletes a note from whichever storage tier is active. Kept
// working on the JSON-file tier too (not just Supabase) so local admin
// testing without Supabase configured still exercises this end-to-end.
export async function deleteNote(id: string): Promise<DeleteNoteResult> {
  const supabase = getSupabase();
  if (supabase) return deleteNoteSupabase(supabase, id);

  const redis = getRedis();
  return redis ? deleteNoteRedis(redis, id) : deleteNoteFile(id);
}
