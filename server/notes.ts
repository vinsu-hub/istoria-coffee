import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const NOTES_FILE = path.resolve(__dirname, "data", "notes.json");
export const MAX_MESSAGE_LENGTH = 140;
export const MAX_NOTES_RETURNED = 60;

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

export async function readNotes(): Promise<Note[]> {
  try {
    const raw = await fs.readFile(NOTES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeNotes(notes: Note[]): Promise<void> {
  await fs.mkdir(path.dirname(NOTES_FILE), { recursive: true });
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

export function containsBlockedWord(message: string): boolean {
  const lower = message.toLowerCase();
  return BLOCKLIST.some((word) => lower.includes(word));
}

function isSameDay(isoA: string, isoB: string): boolean {
  return isoA.slice(0, 10) === isoB.slice(0, 10);
}

export function toPublicNote(note: Note): PublicNote {
  const { deviceId, ...rest } = note;
  return rest;
}

export async function listRecentNotes(): Promise<PublicNote[]> {
  const notes = await readNotes();
  return notes
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_NOTES_RETURNED)
    .map(toPublicNote);
}

export type CreateNoteResult =
  | { ok: true; note: PublicNote }
  | { ok: false; status: number; error: string };

export async function createNote(message: unknown, deviceId: unknown): Promise<CreateNoteResult> {
  if (typeof message !== "string" || typeof deviceId !== "string" || !deviceId) {
    return { ok: false, status: 400, error: "invalid_request" };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, status: 400, error: "invalid_length" };
  }

  if (containsBlockedWord(trimmed)) {
    return { ok: false, status: 400, error: "blocked_content" };
  }

  const notes = await readNotes();
  const now = new Date();
  const nowIso = now.toISOString();

  const alreadyPostedToday = notes.some(
    (note) => note.deviceId === deviceId && isSameDay(note.createdAt, nowIso)
  );
  if (alreadyPostedToday) {
    return { ok: false, status: 429, error: "limit_reached" };
  }

  const note: Note = {
    id: crypto.randomUUID(),
    message: trimmed,
    deviceId,
    createdAt: nowIso,
    displayDate: now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };

  notes.push(note);
  await writeNotes(notes);

  return { ok: true, note: toPublicNote(note) };
}
