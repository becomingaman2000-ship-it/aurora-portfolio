import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import img from "@/assets/eustace-4.asset.json";
import { absUrl, canonical, professionalServiceJsonLd } from "@/lib/site";
import { assetUrl } from "@/lib/asset";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Hire a Software & Website Engineer | Eustace Madawu" },
      {
        name: "description",
        content:
          "Hire freelance engineer Eustace Madawu: website engineering, software engineering, product design, databases, payments and data — remote worldwide, clear quotes.",
      },
      {
        property: "og:title",
        content: "Services — Hire a Software & Website Engineer | Eustace Madawu",
      },
      { property: "og:url", content: absUrl("/services") },
      { property: "og:image", content: absUrl(img.url) },
      { name: "twitter:image", content: absUrl(img.url) },
    ],
    links: [canonical("/services")],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          ...professionalServiceJsonLd(),
        }),
      },
    ],
  }),
  component: Services,
});

const services = [
  {
    id: "web",
    tag: "Primary",
    title: "Website Engineering",
    desc: "Marketing sites, product sites, e-commerce, and interactive web platforms — designed and built end-to-end.",
    bullets: [
      "Modern React / TanStack Start",
      "Supabase & Firebase backends",
      "Local payment gateways (Paynow, EcoCash)",
      "Responsive, animated, accessible",
    ],
  },
  {
    id: "software",
    tag: "Primary",
    title: "Software Engineering",
    desc: "Custom applications, internal tools, automation and assistant-style scripting to move real work forward.",
    bullets: [
      "Full-stack app development",
      "REST & realtime APIs",
      "Database design & data modelling",
      "Notification & workflow automation",
    ],
  },
  {
    id: "product",
    tag: "Product",
    title: "Product Design & Strategy",
    desc: "From a napkin idea to a spec, a working prototype, and a shipped v1 — with tight revision cycles.",
    bullets: ["Discovery & requirements", "UI/UX prototyping", "Ship-and-iterate delivery"],
  },
  {
    id: "data",
    tag: "Data",
    title: "Data & Business Reporting",
    desc: "Recurring business performance reporting and CISCO-certified data analytics for external clients.",
    bullets: ["Dashboards & KPIs", "Reporting cadence", "Insight → action"],
  },
  {
    id: "counsel",
    tag: "People",
    title: "Counselling & Peer Support",
    desc: "Trained counsellor delivering confidential, empathetic support and leading peer-counselling programmes.",
    bullets: ["1:1 counselling sessions", "Programme oversight", "Confidentiality-first"],
  },
  {
    id: "events",
    tag: "Events",
    title: "Event Planning & Organising",
    desc: "Large-scale events, university sports fixtures, and orientation programmes — smoothly delivered.",
    bullets: ["Logistics & scheduling", "Registration & equipment", "On-the-day coordination"],
  },
];

function Services() {
  return (
    <div className="animate-fade-in space-y-16">
      <section className="grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-5">
          <span className="glass inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-widest">
            Services
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            What I can do for <span className="text-gradient">your team.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl">
            I mainly offer website and software engineering — with product design, counselling and
            events on the side. Everything is built to ship.
          </p>
          <Link
            to="/contact"
            className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Start a project →
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-[2rem] p-2"
        >
          <img
            src={assetUrl(img.url)}
            alt="Eustace working"
            className="w-full aspect-[4/5] rounded-[1.6rem] object-cover"
            decoding="async"
          />
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ delay: i * 0.04 }}
            className="glass group rounded-3xl p-6 flex flex-col hover:-translate-y-1 transition"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-widest">
              <span className="text-primary">{s.tag}</span>
              <span className="text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-6 inline-flex text-sm text-primary group-hover:translate-x-1 transition"
            >
              Enquire →
            </Link>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
