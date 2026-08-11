import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        // SITE_URL wins when set (it is baked in at build time for static
        // prerendered deploys); otherwise derive the origin per request.
        const base = process.env.SITE_URL || new URL(request.url).origin;
        const lastmod = new Date().toISOString().slice(0, 10);
        const paths: [string, string][] = [
          ["/", "1.0"],
          ["/services", "0.9"],
          ["/contact", "0.9"],
          ["/about", "0.8"],
          ["/projects", "0.8"],
          ["/leadership", "0.7"],
        ];
        const urls = paths
          .map(
            ([p, pri]) =>
              `  <url><loc>${base}${p}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${pri}</priority></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
