#!/usr/bin/env node
/**
 * Safe `vite build` wrapper.
 *
 * The repo root contains the committed GitHub Pages static export
 * (index.html, <route>/index.html, assets/, …). Vite/nitro auto-detects a
 * root-level index.html and turns it into a static renderer template,
 * which would make the produced server serve only the home page.
 *
 * This wrapper temporarily hides the export, runs the build, then restores
 * the files (via git), so `npm run build` always yields the real SSR server
 * no matter the state of the working tree.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const EXPORT_PATHS = [
  "index.html",
  "404.html",
  ".nojekyll",
  "about",
  "services",
  "projects",
  "leadership",
  "contact",
  "assets",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "apple-touch-icon.png",
  "llms.txt",
];

const present = EXPORT_PATHS.filter((p) => existsSync(join(ROOT, p)));
if (present.length > 0) {
  console.log(
    `[build-safe] Temporarily hiding ${present.length} Pages-export paths (restored after build)…`,
  );
  for (const p of present) rmSync(join(ROOT, p), { recursive: true, force: true });
}

const child = spawn(
  join(ROOT, "node_modules", ".bin", "vite"),
  ["build", ...process.argv.slice(2)],
  {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code) => {
  if (present.length > 0) {
    const res = spawnSync("git", ["checkout", "--", ...EXPORT_PATHS], {
      cwd: ROOT,
      stdio: "pipe",
    });
    if (res.status !== 0) {
      console.warn(
        "[build-safe] Could not restore the export via git. Regenerate it with: npm run deploy:pages",
      );
    }
  }
  process.exit(code ?? 1);
});
