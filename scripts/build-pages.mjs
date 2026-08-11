#!/usr/bin/env node
/**
 * Builds a fully static copy (>GitHub Pages, "deploy from branch: /") of the
 * site and writes it into the repository root:
 *
 *   1. `vite build` with VITE_BASE_PATH=/<repo>/ so every asset/link is
 *      prefixed for the Pages project-site subpath
 *   2. boots the built SSR server locally and mirrors every page to static
 *      HTML (/<route>/index.html) — hydrated normally in the browser
 *   3. copies all static assets from .output/public/ (JS, CSS, images, fonts,
 *      favicon, robots.txt)
 *   4. writes 404.html (SPA fallback → client router renders the 404 page)
 *      and .nojekyll (serve files as-is, skipping Jekyll)
 *
 * Env overrides:
 *   PAGES_BASE  default "/aurora-portfolio/"  (="/<repo>/" — change to
 *               "/portfolio/" after renaming the repository)
 *   SITE_URL    default "https://becomingaman2000-ship-it.github.io/aurora-portfolio"
 *
 * Usage: npm run deploy:pages  →  commit & push → Pages publishes ~1 min later.
 */
import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";

const PORT = 8931;
const ROOT = process.cwd();
const BASE_PATH = process.env.PAGES_BASE || "/aurora-portfolio/";
const SITE_URL =
  process.env.SITE_URL || "https://becomingaman2000-ship-it.github.io/aurora-portfolio";

const ROUTES = ["/", "/about", "/services", "/projects", "/leadership", "/contact", "/sitemap.xml"];

// Files/folders this script manages at the repo root — cleaned before writing.
const MANAGED = [
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
];

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    );
  });
}

async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("server did not start");
}

const fetched = new Set();
async function mirrorResource(origin, prefixedUrl) {
  // prefixedUrl like "/aurora-portfolio/assets/index.js" → fetch
  // "/assets/index.js" from the local server, write "assets/index.js".
  // Skip page links ("/aurora-portfolio/", "/aurora-portfolio/about" etc.) —
  // those are mirrored separately as <route>/index.html from ROUTES.
  if (!/\.[a-zA-Z0-9]{1,8}$/.test(prefixedUrl)) return;
  if (fetched.has(prefixedUrl)) return;
  fetched.add(prefixedUrl);
  const localPath = prefixedUrl.slice(BASE_PATH.length - 1); // keep leading '/'
  const relFile = prefixedUrl.slice(BASE_PATH.length);
  const res = await fetch(origin + localPath);
  if (!res.ok) {
    console.warn(`  ! ${prefixedUrl} -> HTTP ${res.status} (skipped)`);
    return;
  }
  const abs = join(ROOT, relFile);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, Buffer.from(await res.arrayBuffer()));
}

const viteBin = join(ROOT, "node_modules", ".bin", "vite");

// IMPORTANT: the previous export must be removed BEFORE building — nitro
// picks up a stray root index.html as a static renderer template and would
// serve it for every route.
console.log("> Cleaning previous export…");
for (const p of MANAGED) {
  const abs = join(ROOT, p);
  if (existsSync(abs)) rmSync(abs, { recursive: true, force: true });
}

console.log(`> Building (base ${BASE_PATH})…`);
await run(viteBin, ["build"], {
  VITE_BASE_PATH: BASE_PATH,
  SITE_URL,
});

console.log("> Booting SSR server on :8931…");
const server = spawn("node", [join(ROOT, ".output/server/index.mjs")], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", SITE_URL },
  stdio: ["ignore", "pipe", "inherit"],
});
server.stdout.on("data", () => {});

try {
  const origin = `http://127.0.0.1:${PORT}`;
  // The SSR bundle has the router basepath baked in, so pages live under
  // the base path on the local server too.
  const base = BASE_PATH.replace(/\/$/, ""); // "/aurora-portfolio"
  await waitForServer(origin + base + "/");

  console.log("> Mirroring pages…");
  for (const route of ROUTES) {
    const res = await fetch(origin + base + route);
    if (!res.ok) throw new Error(`${route} -> HTTP ${res.status}`);
    const type = res.headers.get("content-type") || "";
    const text = await res.text();

    if (route === "/sitemap.xml") {
      writeFileSync(join(ROOT, "sitemap.xml"), text);
      console.log(`  ${route} -> sitemap.xml`);
      continue;
    }

    const rel = route === "/" ? "index.html" : join(route.slice(1), "index.html");
    const abs = join(ROOT, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, text);
    console.log(`  ${route} -> ${rel}`);

    // Pull every same-origin, base-prefixed resource referenced by the page.
    if (type.includes("text/html")) {
      const re = /(?:src|href)="(\/[^"]+)"/g;
      for (const m of text.matchAll(re)) {
        if (m[1].startsWith(BASE_PATH)) await mirrorResource(origin, m[1]);
      }
    }
  }

  console.log("> Copying static assets from .output/public…");
  cpSync(join(ROOT, ".output/public"), ROOT, { recursive: true });

  console.log("> Writing 404.html and .nojekyll…");
  writeFileSync(join(ROOT, "404.html"), readFileSync(join(ROOT, "index.html")));
  writeFileSync(join(ROOT, ".nojekyll"), "");

  console.log(`\nDone. Static site written to repo root (base ${BASE_PATH}).`);
  console.log(`Commit & push, then it goes live at ${SITE_URL}/`);
} finally {
  server.kill();
}
process.exit(0);
