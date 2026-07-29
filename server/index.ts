// Local `pnpm start` runs this file directly with plain `node` — no dotenv
// loader is wired up, so .env.local wouldn't otherwise reach process.env.
// Vercel's own env injection makes this a no-op in production (no
// .env.local file is deployed there).
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (e.g. production) — fine, platform env vars apply instead.
}

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { listRecentNotes, createNote, deleteNote } from "./notes.js";
import { requireAdmin } from "./adminAuth.js";
import {
  listMenu,
  listCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "./menu.js";
import {
  listApprovedSubmissions,
  createSubmission,
  listPendingSubmissions,
  moderateSubmission,
} from "./submissions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Raised limit (default is 100kb) to allow base64-encoded community photo
  // uploads in the JSON body — see server/submissions.ts's MAX_IMAGE_BYTES.
  app.use(express.json({ limit: "6mb" }));

  // Freedom Wall API — JSON-file backed, one note per device per day.
  app.get("/api/notes", async (_req, res) => {
    res.json({ notes: await listRecentNotes() });
  });

  app.post("/api/notes", async (req, res) => {
    const result = await createNote(req.body?.message, req.body?.deviceId);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(201).json({ note: result.note });
  });

  // Admin — Freedom Wall moderation (notes delete). Gated by requireAdmin()
  // on every call, independent of the /login route being unlinked from nav.
  app.get("/api/admin-notes", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      res.json({ notes: await listRecentNotes() });
    } catch (error) {
      res.status(500).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.delete("/api/admin-notes", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const id = typeof req.query.id === "string" ? req.query.id : undefined;
    if (!id) {
      res.status(400).json({ error: "missing_id" });
      return;
    }
    try {
      const result = await deleteNote(id);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  // Menu — public read, admin-gated CRUD.
  app.get("/api/menu", async (_req, res) => {
    try {
      res.json(await listMenu());
    } catch (error) {
      res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.get("/api/admin-menu", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      res.json({ categories: await listCategories() });
    } catch (error) {
      res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.post("/api/admin-menu", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      await createMenuItem(req.body);
      res.status(201).json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.put("/api/admin-menu", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const id = typeof req.query.id === "string" ? req.query.id : req.body?.id;
    if (!id) {
      res.status(400).json({ error: "missing_id" });
      return;
    }
    try {
      await updateMenuItem(id, req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.delete("/api/admin-menu", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const id = typeof req.query.id === "string" ? req.query.id : undefined;
    if (!id) {
      res.status(400).json({ error: "missing_id" });
      return;
    }
    try {
      await deleteMenuItem(id);
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  // Community submissions — public create + approved list, admin moderation.
  app.get("/api/submissions", async (_req, res) => {
    try {
      res.json({ submissions: await listApprovedSubmissions() });
    } catch (error) {
      res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const result = await createSubmission(req.body);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(201).json({ submission: result.submission });
    } catch (error) {
      res.status(500).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.get("/api/admin-submissions", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      res.json({ submissions: await listPendingSubmissions() });
    } catch (error) {
      res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  app.post("/api/admin-submissions", async (req, res) => {
    const admin = await requireAdmin(req.headers.authorization);
    if (!admin) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const { id, decision } = req.body ?? {};
    if (!id || (decision !== "approved" && decision !== "rejected")) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    try {
      const result = await moderateSubmission(id, decision);
      if (!result.ok) {
        res.status(result.status ?? 400).json({ error: result.error });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(503).json({ error: String(error instanceof Error ? error.message : error) });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
