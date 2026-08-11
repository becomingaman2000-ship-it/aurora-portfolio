# Portfolio — Eustace Madawu

Personal portfolio website of **Eustace Madawu** — software & website engineer,
technopreneur, trained counsellor and event organiser from Harare, Zimbabwe.

Minimalist glassmorphic spatial UI with animated aurora backgrounds, light/dark
mode, and full server-side rendering.

## Stack

- **[TanStack Start](https://tanstack.com/start)** + React 19 (SSR, file-based routes in `src/routes/`)
- **[Tailwind CSS v4](https://tailwindcss.com)** + shadcn-style UI components
- **[Framer Motion](https://motion.dev)** animations
- **[Nitro](https://nitro.build)** server output — deployable anywhere
- Vite 8 · TypeScript · Node ≥ 20.19

## Quick start

```sh
npm install
npm run dev        # dev server on http://localhost:8080
```

## Production build

```sh
npm run build      # outputs a self-contained server to .output/
npm start          # serves the production build (PORT/HOST env respected)
```

The `.output/` folder is fully self-contained — copy it to any Node 20.19+
host and run `node .output/server/index.mjs`.

## Deploy

The deployment target is chosen **at build time** via `NITRO_PRESET`:

| Target                  | Build command                                  | Then                                |
| ----------------------- | ---------------------------------------------- | ----------------------------------- |
| Any Node host (default) | `npm run build`                                | `node .output/server/index.mjs`     |
| Docker                  | `docker build -t portfolio .`                  | `docker run -p 3000:3000 portfolio` |
| Vercel                  | `NITRO_PRESET=vercel npm run build`            | deploy `.output/` / zero-config     |
| Netlify                 | `NITRO_PRESET=netlify npm run build`           | deploy via Netlify CLI/UI           |
| Cloudflare Workers      | `NITRO_PRESET=cloudflare-module npm run build` | `npx wrangler deploy`               |

Full preset list: <https://nitro.build/deploy#presets>

## Media assets

All media is served locally from `public/assets/` — no external CDN
dependency. The repository ships **abstract placeholder images** so the site
renders out of the box. Replace them with the real files **using these exact
filenames** (see `src/assets/*.asset.json`, which maps each name to a public
path):

| File                                           | Used on                          |
| ---------------------------------------------- | -------------------------------- |
| `public/assets/profile-main.jpg`               | Home hero portrait (≈4:5)        |
| `public/assets/eustace-2.jpg`, `eustace-3.jpg` | About                            |
| `public/assets/eustace-4.jpg`                  | Services                         |
| `public/assets/eustace-5.jpg`                  | Contact / Projects               |
| `public/assets/eustace-6.jpg`                  | Leadership                       |
| `public/assets/makeke-1.jpg`, `makeke-2.jpg`   | Projects — Makeke screenshots    |
| `public/assets/makeke-pitch.mp4`               | Projects — innovator pitch video |
| `public/assets/nav-1.jpg` … `nav-3.jpg`        | Projects — Hit Campus Guide      |

Just drop your originals over the placeholders and rebuild (or restart the dev
server). No code changes needed.

## Project structure

```
public/assets/     # static media (images/video above)
src/assets/        # *.asset.json manifests -> public paths
src/components/    # aurora background, nav, motion primitives, ui/
src/lib/           # contact links, SSR error page/capture
src/routes/        # /, /about, /services, /projects, /leadership, /contact, /sitemap.xml
src/server.ts      # SSR error-wrapping server entry
```

## Scripts

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `npm run dev`    | Dev server with HMR on port 8080 |
| `npm run build`  | Production build → `.output/`    |
| `npm start`      | Run the production server        |
| `npm run lint`   | ESLint                           |
| `npm run format` | Prettier                         |
