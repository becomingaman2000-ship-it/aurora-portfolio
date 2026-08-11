import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { HoverExpand } from "@/components/HoverExpand";
import makeke1 from "@/assets/makeke-1.asset.json";
import makeke2 from "@/assets/makeke-2.asset.json";
import makekeVideo from "@/assets/makeke-pitch.asset.json";
import nav1 from "@/assets/nav-1.asset.json";
import nav2 from "@/assets/nav-2.asset.json";
import nav3 from "@/assets/nav-3.asset.json";
import img from "@/assets/eustace-5.asset.json";
import { absUrl, canonical } from "@/lib/site";
import { assetUrl } from "@/lib/asset";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & Products by Eustace Madawu — Makeke, Hit Campus Guide" },
      {
        name: "description",
        content:
          "Products engineered by Eustace Madawu: Makeke — a B2B pastry logistics marketplace — and Hit Campus Guide, an interactive campus way-finder. Screenshots and pitch video.",
      },
      { property: "og:title", content: "Projects & Products — Eustace Madawu" },
      { property: "og:url", content: absUrl("/projects") },
      { property: "og:image", content: absUrl(makeke1.url) },
      { name: "twitter:image", content: absUrl(makeke1.url) },
    ],
    links: [canonical("/projects")],
  }),
  component: Projects,
});

function Projects() {
  return (
    <div className="animate-fade-in space-y-24">
      <section className="grid gap-8 md:grid-cols-[1.3fr_1fr] items-center">
        <div className="space-y-5">
          <span className="glass inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-widest">
            Selected work
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Products <span className="text-gradient">shipped & live.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Full-stack builds — designed, engineered, and delivered end-to-end. Click through, watch
            the pitch, or try it live.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-[2rem] p-2"
        >
          <img
            src={assetUrl(img.url)}
            alt="Eustace presenting"
            className="w-full aspect-[4/5] rounded-[1.6rem] object-cover"
            decoding="async"
          />
        </motion.div>
      </section>

      {/* Makeke */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="glass-strong rounded-[2rem] p-6 md:p-10 space-y-8"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">01 · Flagship</div>
            <h2 className="mt-2 text-4xl md:text-5xl font-semibold">Makeke</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              A B2B platform that connects bakeries and pastry producers with the retailers, cafés
              and event vendors that need them — on-demand supply, routed and fulfilled. Think
              logistics + marketplace for the cakes and pastries economy, built for African cities.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {["B2B marketplace", "Realtime dispatch", "Vendor & retailer roles", "Payments"].map(
                (t) => (
                  <span key={t} className="glass rounded-full px-3 py-1">
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[makeke1, makeke2].map((m, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01, y: -4 }}
              className="overflow-hidden rounded-2xl border border-glass-border"
            >
              <img
                src={assetUrl(m.url)}
                alt={`Makeke screen ${i + 1}`}
                className="w-full"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          ))}
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-3">
            Innovator pitch — video
          </div>
          <div className="glass overflow-hidden rounded-2xl">
            <video
              controls
              preload="metadata"
              poster={assetUrl(makeke1.url)}
              className="w-full aspect-video bg-black"
            >
              <source src={assetUrl(makekeVideo.url)} type="video/mp4" />
            </video>
          </div>
        </div>
      </motion.section>

      {/* Hit Campus Guide */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="glass-strong rounded-[2rem] p-6 md:p-10 space-y-8"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent">02 · Live</div>
            <h2 className="mt-2 text-4xl md:text-5xl font-semibold">Hit Campus Guide</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              An interactive way-finder for the Harare Institute of Technology campus — helping new
              students, visitors, and staff navigate lecture halls, offices, and facilities with
              ease.
            </p>
          </div>
          <a
            href="https://becomingaman2000-ship-it.github.io/hitarnav/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 self-start"
          >
            Open live site ↗
          </a>
        </div>

        <HoverExpand
          images={[
            { src: assetUrl(nav1.url), alt: "Hit Campus Guide — home", code: "01 · Home" },
            { src: assetUrl(nav2.url), alt: "Hit Campus Guide — navigation", code: "02 · Nav" },
            { src: assetUrl(nav3.url), alt: "Hit Campus Guide — detail", code: "03 · Detail" },
            { src: assetUrl(nav1.url), alt: "Hit Campus Guide", code: "04" },
            { src: assetUrl(nav2.url), alt: "Hit Campus Guide", code: "05" },
          ]}
        />
      </motion.section>
    </div>
  );
}
