import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../server/adminAuth.js";
import { listPendingSubmissions, moderateSubmission } from "../server/submissions.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req.headers.authorization);
  if (!admin) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    if (req.method === "GET") {
      res.status(200).json({ submissions: await listPendingSubmissions() });
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
      const { id, decision } = body as { id?: string; decision?: string };
      if (!id || (decision !== "approved" && decision !== "rejected")) {
        res.status(400).json({ error: "invalid_request" });
        return;
      }
      const result = await moderateSubmission(id, decision);
      if (!result.ok) {
        res.status(result.status ?? 400).json({ error: result.error });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).end();
  } catch (error) {
    res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
  }
}
