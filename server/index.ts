import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { listRecentNotes, createNote } from "./notes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

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
