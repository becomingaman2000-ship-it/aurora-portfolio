// Standalone Vite + TanStack Start configuration (no platform wrapper).
//
// Stack wired here:
//   - Tailwind CSS v4 (@tailwindcss/vite)
//   - tsconfig paths (@/* → src/*)
//   - TanStack Start (SSR, routes in src/routes, custom server entry src/server.ts)
//   - React (@vitejs/plugin-react)
//   - Nitro build output (nitro/vite) — the deployable server bundle
//
// Deployment target is chosen at BUILD time with the NITRO_PRESET env var:
//   node-server (default) · vercel · netlify · cloudflare-module · deno-server · ...
// Full preset list: https://nitro.build/deploy#presets
//
// Examples:
//   npm run build                          -> .output/ (run with `npm start`)
//   NITRO_PRESET=vercel npm run build      -> deploy to Vercel
//   NITRO_PRESET=cloudflare-module npm run build && npx wrangler deploy
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

const nitroPreset = process.env.NITRO_PRESET || "node-server";
// Deploy base path — "/" normally, "/<repo>/" for GitHub Pages project sites.
const basePath = process.env.VITE_BASE_PATH || "/";
// (Static export for GitHub Pages is produced by scripts/build-pages.mjs,
// which mirrors the built server — see that script for details.)

export default defineConfig(({ command, mode }) => {
  // Expose VITE_* env vars to server-side bundles as well (Vite only injects
  // them into the client build by itself).
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    base: basePath,
    define: envDefine,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    server: {
      host: true,
      port: 8080,
      // Accept proxy/preview hostnames (e.g. *.e2b.app) in dev.
      allowedHosts: true,
    },
    preview: {
      host: true,
      port: 8080,
      allowedHosts: true,
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Guard against bundling server-only modules into the client.
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
        // Pin the router basepath (leading slash!) so SSR route matching works
        // on subpath deployments like GitHub Pages project sites. Without this
        // the plugin derives a slash-less value from vite.base and every URL
        // SSRs as the home page.
        router: { basepath: basePath === "/" ? "/" : basePath.replace(/\/$/, "") },
        // Redirect TanStack Start's server entry to src/server.ts (SSR error wrapper).
        server: { entry: "server" },
      }),
      viteReact(),
      // Build-only: produce the deployable server in .output/ (NITRO_PRESET).
      command === "build" ? nitro({ preset: nitroPreset }) : null,
    ].filter(Boolean),
  };
});
