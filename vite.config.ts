// Vite only exposes VITE_-prefixed vars to client code via import.meta.env —
// it doesn't load .env.local into process.env for the server-side code that
// runs inside this config's dev-middleware plugins (server/adminAuth.ts,
// server/menu.ts, server/submissions.ts all read process.env.SUPABASE_URL
// etc. directly). Node 20.12+ can load a dotenv-style file natively.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local locally (e.g. CI) — fine, those env vars just won't be set.
}

import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { listRecentNotes, createNote, deleteNote } from "./server/notes";
import { requireAdmin } from "./server/adminAuth";
import {
  listMenu,
  listCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "./server/menu";
import {
  listApprovedSubmissions,
  createSubmission,
  listPendingSubmissions,
  moderateSubmission,
} from "./server/submissions";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

function vitePluginFreedomWallApi(): Plugin {
  return {
    name: "freedom-wall-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/notes", async (req, res) => {
        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ notes: await listRecentNotes() }));
          return;
        }

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", async () => {
            try {
              const parsed = JSON.parse(body || "{}");
              const result = await createNote(parsed.message, parsed.deviceId);
              res.setHeader("Content-Type", "application/json");
              if (!result.ok) {
                res.writeHead(result.status);
                res.end(JSON.stringify({ error: result.error }));
                return;
              }
              res.writeHead(201);
              res.end(JSON.stringify({ note: result.note }));
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "invalid_request" }));
            }
          });
          return;
        }

        res.writeHead(405);
        res.end();
      });
    },
  };
}

function readJsonBody(req: import("node:http").IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function vitePluginMenuApi(): Plugin {
  return {
    name: "menu-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/menu", async (req, res) => {
        if (req.method !== "GET") {
          res.writeHead(405);
          res.end();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        try {
          res.end(JSON.stringify(await listMenu()));
        } catch (error) {
          res.writeHead(503);
          res.end(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
        }
      });
    },
  };
}

function vitePluginAdminMenuApi(): Plugin {
  return {
    name: "admin-menu-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/admin-menu", async (req, res) => {
        const admin = await requireAdmin(req.headers.authorization as string | undefined);
        if (!admin) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "unauthorized" }));
          return;
        }

        res.setHeader("Content-Type", "application/json");
        const url = new URL(req.url ?? "", "http://localhost");
        const id = url.searchParams.get("id") ?? undefined;

        try {
          if (req.method === "GET") {
            res.end(JSON.stringify({ categories: await listCategories() }));
            return;
          }

          if (req.method === "POST") {
            const body = await readJsonBody(req);
            await createMenuItem(body);
            res.writeHead(201);
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          if (req.method === "PUT") {
            const body = await readJsonBody(req);
            const itemId = id ?? body.id;
            if (!itemId) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: "missing_id" }));
              return;
            }
            await updateMenuItem(itemId, body);
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          if (req.method === "DELETE") {
            if (!id) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: "missing_id" }));
              return;
            }
            await deleteMenuItem(id);
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          res.writeHead(405);
          res.end();
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
        }
      });
    },
  };
}

function vitePluginSubmissionsApi(): Plugin {
  return {
    name: "submissions-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/submissions", async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        try {
          if (req.method === "GET") {
            res.end(JSON.stringify({ submissions: await listApprovedSubmissions() }));
            return;
          }

          if (req.method === "POST") {
            const body = await readJsonBody(req);
            const result = await createSubmission(body);
            if (!result.ok) {
              res.writeHead(result.status);
              res.end(JSON.stringify({ error: result.error }));
              return;
            }
            res.writeHead(201);
            res.end(JSON.stringify({ submission: result.submission }));
            return;
          }

          res.writeHead(405);
          res.end();
        } catch (error) {
          res.writeHead(503);
          res.end(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
        }
      });
    },
  };
}

function vitePluginAdminSubmissionsApi(): Plugin {
  return {
    name: "admin-submissions-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/admin-submissions", async (req, res) => {
        const admin = await requireAdmin(req.headers.authorization as string | undefined);
        if (!admin) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "unauthorized" }));
          return;
        }

        res.setHeader("Content-Type", "application/json");

        try {
          if (req.method === "GET") {
            res.end(JSON.stringify({ submissions: await listPendingSubmissions() }));
            return;
          }

          if (req.method === "POST") {
            const body = await readJsonBody(req);
            const { id, decision } = body ?? {};
            if (!id || (decision !== "approved" && decision !== "rejected")) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: "invalid_request" }));
              return;
            }
            const result = await moderateSubmission(id, decision);
            if (!result.ok) {
              res.writeHead(result.status ?? 400);
              res.end(JSON.stringify({ error: result.error }));
              return;
            }
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          res.writeHead(405);
          res.end();
        } catch (error) {
          res.writeHead(503);
          res.end(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
        }
      });
    },
  };
}

function vitePluginAdminNotesApi(): Plugin {
  return {
    name: "admin-notes-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/admin-notes", async (req, res) => {
        const admin = await requireAdmin(req.headers.authorization as string | undefined);
        if (!admin) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "unauthorized" }));
          return;
        }

        try {
          if (req.method === "GET") {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ notes: await listRecentNotes() }));
            return;
          }

          if (req.method === "DELETE") {
            const url = new URL(req.url ?? "", "http://localhost");
            const id = url.searchParams.get("id");
            if (!id) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "missing_id" }));
              return;
            }
            const result = await deleteNote(id);
            res.setHeader("Content-Type", "application/json");
            if (!result.ok) {
              res.writeHead(result.status);
              res.end(JSON.stringify({ error: result.error }));
              return;
            }
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          res.writeHead(405);
          res.end();
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
        }
      });
    },
  };
}

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing storage key");
          return;
        }

        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!forgeBaseUrl || !forgeKey) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Storage proxy not configured");
          return;
        }

        try {
          const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
          forgeUrl.searchParams.set("path", key);

          const forgeResp = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` },
          });

          if (!forgeResp.ok) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Storage backend error");
            return;
          }

          const { url } = (await forgeResp.json()) as { url: string };
          if (!url) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Empty signed URL");
            return;
          }

          res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
          res.end();
        } catch {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Storage proxy error");
        }
      });
    },
  };
}

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  vitePluginManusDebugCollector(),
  vitePluginStorageProxy(),
  vitePluginFreedomWallApi(),
  vitePluginAdminNotesApi(),
  vitePluginMenuApi(),
  vitePluginAdminMenuApi(),
  vitePluginSubmissionsApi(),
  vitePluginAdminSubmissionsApi(),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    watch: {
      ignored: ["**/*.zip"],
    },
  },
});
