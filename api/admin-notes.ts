import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../server/adminAuth.js";
import { listRecentNotes, deleteNote } from "../server/notes.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req.headers.authorization);
  if (!admin) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    if (req.method === "GET") {
      res.status(200).json({ notes: await listRecentNotes() });
      return;
    }

    if (req.method === "DELETE") {
      const id = typeof req.query.id === "string" ? req.query.id : undefined;
      if (!id) {
        res.status(400).json({ error: "missing_id" });
        return;
      }
      const result = await deleteNote(id);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).end();
  } catch (error) {
    res.status(500).json({ error: String(error instanceof Error ? error.message : error) });
  }
}
