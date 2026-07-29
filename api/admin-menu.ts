import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../server/adminAuth.js";
import {
  listCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../server/menu.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req.headers.authorization);
  if (!admin) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};

  try {
    if (req.method === "GET") {
      res.status(200).json({ categories: await listCategories() });
      return;
    }

    if (req.method === "POST") {
      await createMenuItem(body);
      res.status(201).json({ ok: true });
      return;
    }

    if (req.method === "PUT") {
      const id = typeof req.query.id === "string" ? req.query.id : body.id;
      if (!id) {
        res.status(400).json({ error: "missing_id" });
        return;
      }
      await updateMenuItem(id, body);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "DELETE") {
      const id = typeof req.query.id === "string" ? req.query.id : undefined;
      if (!id) {
        res.status(400).json({ error: "missing_id" });
        return;
      }
      await deleteMenuItem(id);
      res.status(200).json({ ok: true });
      return;
    }
  } catch (error) {
    res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
    return;
  }

  res.status(405).end();
}
