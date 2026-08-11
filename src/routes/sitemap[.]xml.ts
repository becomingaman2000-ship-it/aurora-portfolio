import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * XML sitemap — served at /sitemap.xml and declared in robots.txt.
 * Includes image (xmlns:image) and video (xmlns:video) extensions so the
 * portfolio photos, product screenshots and the Makeke pitch video are
 * discoverable in Google/ Bing image & video search too.
 *
 * Page ↔ media mapping mirrors src/assets/*.asset.json imports per route.
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Image = { loc: string; title: string };
type Video = { content: string; thumbnail: string; title: string; description: string };
type Page = {
  path: string;
  priority: string;
  changefreq?: string;
  images?: Image[];
  videos?: Video[];
};

const P = (loc: string, title: string): Image => ({ loc, title });

const PAGES: Page[] = [
  {
    path: "/",
    priority: "1.0",
    images: [
      P("/assets/profile-main.jpg", "Eustace Madawu — freelance software and website engineer, Harare, Zimbabwe"),
    ],
  },
  {
    path: "/services",
    priority: "0.9",
    images: [P("/assets/eustace-4.jpg", "Eustace Madawu speaking at a Harare Institute of Technology event")],
  },
  {
    path: "/contact",
    priority: "0.9",
    images: [P("/assets/eustace-5.jpg", "Eustace Madawu — contact for freelance website and software projects")],
  },
  {
    path: "/about",
    priority: "0.8",
    images: [
      P("/assets/eustace-2.jpg", "Eustace Madawu portrait — software engineer from Harare, Zimbabwe"),
      P("/assets/eustace-3.jpg", "Eustace Madawu studio headshot"),
    ],
  },
  {
    path: "/projects",
    priority: "0.8",
    images: [
      P("/assets/eustace-5.jpg", "Eustace Madawu — builder of Makeke and Hit Campus Guide"),
      P("/assets/makeke-1.jpg", "Makeke marketplace web app — screenshot 1"),
      P("/assets/makeke-2.jpg", "Makeke marketplace web app — screenshot 2"),
      P("/assets/nav-1.jpg", "Hit Campus Guide app — screenshot 1"),
      P("/assets/nav-2.jpg", "Hit Campus Guide app — screenshot 2"),
      P("/assets/nav-3.jpg", "Hit Campus Guide app — screenshot 3"),
    ],
    videos: [
      {
        content: "/assets/makeke-pitch.mp4",
        thumbnail: "/assets/makeke-1.jpg",
        title: "Makeke — product pitch by Eustace Madawu",
        description:
          "Eustace Madawu pitching Makeke, the Zimbabwean campus marketplace web app he designed, built and shipped.",
      },
    ],
  },
  {
    path: "/leadership",
    priority: "0.7",
    images: [P("/assets/eustace-6.jpg", "Eustace Madawu — student leadership and event organising")],
  },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        // SITE_URL wins when set (it is baked in at build time for static
        // prerendered deploys); otherwise derive the origin per request.
        const base = process.env.SITE_URL || new URL(request.url).origin;
        const lastmod = new Date().toISOString().slice(0, 10);

        const urls = PAGES.map(({ path, priority, changefreq = "weekly", images = [], videos = [] }) => {
          const imgs = images
            .map(
              (i) =>
                `    <image:image><image:loc>${base}${i.loc}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`,
            )
            .join("\n");
          const vids = videos
            .map(
              (v) =>
                `    <video:video><video:thumbnail_loc>${base}${v.thumbnail}</video:thumbnail_loc><video:title>${esc(v.title)}</video:title><video:description>${esc(v.description)}</video:description><video:content_loc>${base}${v.content}</video:content_loc></video:video>`,
            )
            .join("\n");
          const extras = [imgs, vids].filter(Boolean).join("\n");
          return `  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${extras ? `\n${extras}` : ""}\n  </url>`;
        }).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
