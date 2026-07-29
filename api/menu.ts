import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listMenu } from "../server/menu.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  try {
    res.status(200).json(await listMenu());
  } catch (error) {
    res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
  }
}
