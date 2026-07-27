import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

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

function buildNote(message: string, deviceId: string): Note {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    message,
    deviceId,
    createdAt: now.toISOString(),
    displayDate: now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

export type CreateNoteResult =
  | { ok: true; note: PublicNote }
  | { ok: false; status: number; error: string };

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
// Redis-backed store (used automatically on Vercel once Upstash is connected)
// ---------------------------------------------------------------------------

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
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
    return [];
  }
}

async function writeNotesFile(notes: Note[]): Promise<void> {
  await fs.mkdir(path.dirname(NOTES_FILE), { recursive: true });
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

function isSameDay(isoA: string, isoB: string): boolean {
  return isoA.slice(0, 10) === isoB.slice(0, 10);
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
// Public API — picks Redis when configured, else falls back to the JSON file
// ---------------------------------------------------------------------------

export async function listRecentNotes(): Promise<PublicNote[]> {
  const redis = getRedis();
  return redis ? listRecentNotesRedis(redis) : listRecentNotesFile();
}

export async function createNote(rawMessage: unknown, rawDeviceId: unknown): Promise<CreateNoteResult> {
  const validated = validateInput(rawMessage, rawDeviceId);
  if ("error" in validated) {
    return { ok: false, status: 400, error: validated.error };
  }

  const redis = getRedis();
  return redis
    ? createNoteRedis(redis, validated.message, validated.deviceId)
    : createNoteFile(validated.message, validated.deviceId);
}
