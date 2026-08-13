/**
 * Prefixes root-absolute URLs (like "/assets/foo.jpg") with the Vite base
 * path. On normal deployments the base is "/" and URLs are returned as-is;
 * on subpath deployments (e.g. GitHub Pages project sites at
 * https://<user>.github.io/<repo>/) the base is "/<repo>/" so URLs become
 * "/<repo>/assets/foo.jpg". import.meta.env.BASE_URL is statically replaced
 * by Vite, so SSR and client render stay identical (no hydration mismatch).
 */
const BASE = import.meta.env.BASE_URL ?? "/";

export function assetUrl(url: string): string {
  if (!url.startsWith("/")) return url;
  if (BASE === "/") return url;
  return `${BASE.replace(/\/$/, "")}${url}`;
}
