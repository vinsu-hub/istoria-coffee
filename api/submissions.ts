import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listApprovedSubmissions, createSubmission } from "../server/submissions.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      res.status(200).json({ submissions: await listApprovedSubmissions() });
    } catch (error) {
      res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
    }
    return;
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    try {
      const result = await createSubmission(body);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(201).json({ submission: result.submission });
    } catch (error) {
      res.status(500).json({ error: String(error instanceof Error ? error.message : error) });
    }
    return;
  }

  res.status(405).end();
}
