import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listRecentNotes, createNote } from "../server/notes";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    res.status(200).json({ notes: await listRecentNotes() });
    return;
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    const result = await createNote(body.message, body.deviceId);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(201).json({ note: result.note });
    return;
  }

  res.status(405).end();
}
