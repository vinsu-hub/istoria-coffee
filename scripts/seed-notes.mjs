// Copies the initial Freedom Wall seed data into dist/ on build, but only if
// dist/data/notes.json doesn't already exist — so redeploys never clobber
// notes that real users have posted in production.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, "..", "server", "data", "notes.json");
const destDir = path.join(root, "..", "dist", "data");
const dest = path.join(destDir, "notes.json");

if (fs.existsSync(src) && !fs.existsSync(dest)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("Seeded dist/data/notes.json from server/data/notes.json");
}
