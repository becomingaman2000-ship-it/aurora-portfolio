# Agent notes

- Standalone Vite + TanStack Start app; config lives in `vite.config.ts`
  (Tailwind v4, tsconfig paths, React, nitro build with `NITRO_PRESET`,
  default `node-server` → `.output/`).
- `src/server.ts` is a custom SSR entry that wraps catastrophic errors in a
  friendly 500 page; keep `server.entry: "server"` in `vite.config.ts`.
- Media: routes read `*.asset.json` manifests from `src/assets/` whose `url`
  points into `public/assets/`. Keep manifest URLs and files in sync.
- Routes are file-based in `src/routes/`; `src/routeTree.gen.ts` is generated
  — never edit it by hand.
- The repo ROOT contains the generated GitHub Pages export (index.html,
  <route>/index.html, assets/, …) because Pages serves this branch from "/".
  Regenerate it ONLY via `npm run deploy:pages` (see scripts/build-pages.mjs);
  never hand-edit it, and never leave a root index.html around before running
  `vite build` (npm run build guards this via scripts/build-safe.mjs).
- Verify with `npm run build` (produces `.output/`) before finishing changes.
