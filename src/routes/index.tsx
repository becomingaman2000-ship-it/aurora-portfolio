import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import profile from "@/assets/profile-main.asset.json";
import { LoopText } from "@/components/LoopText";
import { ExpandingPill } from "@/components/ExpandingPill";
import { CONTACT_EMAIL, GMAIL_COMPOSE } from "@/lib/contact";
import { absUrl, canonical, faqJsonLd } from "@/lib/site";
import { assetUrl } from "@/lib/asset";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Who is Eustace .T. Madawu?",
    a: "Eustace .T. Madawu is a freelance software & website engineer from Harare, Zimbabwe — a B.Tech (Hons) Electronic Commerce student at the Harare Institute of Technology, technopreneur, trained counsellor and event organiser. He designs, builds and ships full-stack products end-to-end for clients worldwide.",
  },
  {
    q: "Can I hire Eustace .T. Madawu to build a website or software?",
    a: "Yes. Eustace takes freelance website and software engineering engagements — marketing sites, e-commerce stores, full-stack web applications and product builds — working remotely with clients anywhere in the world. Email him with your idea and scope to get a quote and timeline.",
  },
  {
    q: "What technologies does he work with?",
    a: "Modern, production-grade stacks: React, TypeScript, Node.js, TanStack Start, Tailwind CSS, SQL and NoSQL databases, payment integrations and cloud deployment — covering the full pipeline from UI/UX design through frontend, backend, database and launch.",
  },
  {
    q: "What products has Eustace built?",
    a: "Shipped and live: Makeke — a B2B logistics and marketplace platform connecting bakeries and pastry producers with retailers, cafés and event vendors in African cities — and Hit Campus Guide, an interactive way-finder for the Harare Institute of Technology campus.",
  },
  {
    q: "Does he work with clients outside Zimbabwe?",
    a: "Yes. Although based in Harare, he works fully remote and takes engagements from anywhere in the world — with clear milestones, regular updates and agreed deliverables communicated over email.",
  },
  {
    q: "How much does a website or software project cost?",
    a: "Pricing depends on scope: a marketing site, a web app and a full product build each differ in effort. Share your requirements by email and you'll receive a clear quote, timeline and delivery plan before any commitment.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eustace .T. Madawu — Freelance Software & Website Engineer" },
      {
        name: "description",
        content:
          "Hire Eustace .T. Madawu — freelance software & website engineer from Harare, Zimbabwe, working remotely worldwide. Websites, web apps and full-stack products designed, built and shipped.",
      },
      { property: "og:url", content: absUrl("/") },
      { property: "og:image", content: absUrl(profile.url) },
      { name: "twitter:image", content: absUrl(profile.url) },
    ],
    links: [canonical("/")],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqJsonLd(FAQ)) }],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="animate-fade-in">
      <section className="grid gap-10 md:grid-cols-[1.15fr_1fr] items-center min-h-[70vh]">
        <div className="space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs uppercase tracking-widest"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Available for engagements
          </motion.span>
          <h1 className="font-display text-[2.75rem] sm:text-6xl md:text-7xl font-semibold leading-[0.95]">
            Building the web,
            <br />
            <LoopText
              className="text-[2.75rem] sm:text-6xl md:text-7xl font-semibold"
              words={[
                "one system at a time.",
                "one interface at a time.",
                "one product at a time.",
                "one launch at a time.",
              ]}
            />
          </h1>
          <p className="max-w-xl text-base md:text-lg text-muted-foreground">
            I'm <b className="text-foreground">Eustace .T. Madawu</b> — a software & website engineer,
            technopreneur, trained counsellor and event organiser from Harare, Zimbabwe. I design
            and ship full-stack products end-to-end.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/projects"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition"
            >
              View my work →
            </Link>
            <Link
              to="/contact"
              className="glass rounded-full px-6 py-3 text-sm font-medium hover:scale-[1.02] transition"
            >
              Get in touch
            </Link>
            <div className="ml-2">
              <ExpandingPill
                actions={[
                  {
                    icon: "✉",
                    label: "Email",
                    onClick: () => (window.location.href = `mailto:${CONTACT_EMAIL}`),
                  },
                  {
                    icon: "▶",
                    label: "Gmail",
                    onClick: () => window.open(GMAIL_COMPOSE, "_blank", "noopener,noreferrer"),
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-8 max-w-md">
            {[
              { k: "4+", v: "Leadership roles" },
              { k: "3", v: "Languages" },
              { k: "∞", v: "Products shipped" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl px-3 py-3 sm:px-4">
                <div className="text-2xl font-semibold text-gradient">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            <div
              className="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-70"
              style={{
                background:
                  "conic-gradient(from 180deg, var(--color-aurora-1), var(--color-aurora-2), var(--color-aurora-3), var(--color-aurora-1))",
              }}
            />
            <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-2">
              <img
                src={assetUrl(profile.url)}
                alt="Eustace .T. Madawu portrait"
                className="h-full w-full rounded-[2rem] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold">Eustace .T. Madawu</div>
                  <div className="text-muted-foreground">Harare, Zimbabwe</div>
                </div>
                <span className="rounded-full bg-primary/20 px-2 py-1 text-primary">Tier SSS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-24 grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Engineering",
            d: "Full-stack websites & software — frontend, backend, database, payments.",
            to: "/services" as const,
          },
          {
            t: "Leadership",
            d: "Counselling oversight, event organising, and student programme leadership.",
            to: "/leadership" as const,
          },
          {
            t: "Products",
            d: "Makeke and Hit Campus Guide — shipped, live, and used.",
            to: "/projects" as const,
          },
        ].map((c) => (
          <Link
            key={c.t}
            to={c.to}
            className="glass group rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Explore</div>
            <div className="mt-2 text-2xl font-semibold">{c.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            <div className="mt-4 text-sm text-primary group-hover:translate-x-1 transition">
              Continue →
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-24 max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-primary mb-2">FAQ</div>
        <h2 className="text-3xl md:text-4xl font-semibold">
          Hiring a software or website engineer?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Straight answers to the questions clients ask most.
        </p>
        <Accordion type="single" collapsible className="mt-6 glass rounded-3xl px-6">
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-sm text-muted-foreground">
          Ready when you are —{" "}
          <a className="text-primary underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </div>
  );
}
