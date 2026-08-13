import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import profile from "@/assets/Eustace_Madawu_Photos/123375.jpg";
import portfolioVideo from "../../deliverables/portfolio-ad/eustace-madawu-portfolio-ad.mp4";
import portfolioVideoPoster from "../../deliverables/portfolio-ad/cards/00-opening.jpg";
import { LoopText } from "@/components/LoopText";
import { ExpandingPill } from "@/components/ExpandingPill";
import { CONTACT_EMAIL, GMAIL_COMPOSE } from "@/lib/contact";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eustace Madawu — Software & Website Engineer" },
      { property: "og:image", content: profile },
      { name: "twitter:image", content: profile },
    ],
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
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold leading-[0.95]">
            Building the web,
            <br />
            <LoopText
              className="text-5xl sm:text-6xl md:text-7xl font-semibold"
              words={[
                "one system at a time.",
                "one interface at a time.",
                "one product at a time.",
                "one launch at a time.",
              ]}
            />
          </h1>
          <p className="max-w-xl text-base md:text-lg text-muted-foreground">
            I'm <b className="text-foreground">Eustace Madawu</b> — a software & website
            engineer, technopreneur, trained counsellor and event organiser from Harare,
            Zimbabwe. I design and ship full-stack products end-to-end.
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
                    onClick: () =>
                      (window.location.href = `mailto:${CONTACT_EMAIL}`),
                  },
                  {
                    icon: "▶",
                    label: "Gmail",
                    onClick: () =>
                      window.open(GMAIL_COMPOSE, "_blank", "noopener,noreferrer"),
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-8 max-w-md">
            {[
              { k: "4+", v: "Leadership roles" },
              { k: "3", v: "Languages" },
              { k: "∞", v: "Products shipped" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl px-4 py-3">
                <div className="text-2xl font-semibold text-gradient">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="relative"
        >
          <div className="animate-float-slow relative mx-auto aspect-[4/5] w-full max-w-md">
            <div
              className="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-70"
              style={{
                background:
                  "conic-gradient(from 180deg, var(--color-aurora-1), var(--color-aurora-2), var(--color-aurora-3), var(--color-aurora-1))",
              }}
            />
            <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-2">
              <img
                src={profile}
                alt="Eustace Madawu portrait"
                className="h-full w-full rounded-[2rem] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold">Eustace Madawu</div>
                  <div className="text-muted-foreground">Harare, Zimbabwe</div>
                </div>
                <span className="rounded-full bg-primary/20 px-2 py-1 text-primary">
                  Tier SSS
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section aria-labelledby="portfolio-film-title" className="relative mt-24">
        <div
          aria-hidden="true"
          className="absolute inset-x-[12%] top-20 h-2/3 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              60-second walkthrough
            </span>
            <h2
              id="portfolio-film-title"
              className="mt-4 font-display text-3xl font-semibold sm:text-4xl md:text-5xl"
            >
              See the portfolio <span className="text-gradient">in motion.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-right">
            Watch the complete journey — from engineering services and shipped products to
            leadership, visual themes, and the contact flow.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="glass-strong relative overflow-hidden rounded-[1.75rem] p-2 sm:rounded-[2.25rem] sm:p-3"
        >
          <video
            controls
            playsInline
            preload="metadata"
            poster={portfolioVideoPoster}
            aria-label="One-minute walkthrough of the Eustace Madawu portfolio website"
            className="aspect-video w-full rounded-[1.25rem] bg-black object-cover sm:rounded-[1.65rem]"
          >
            <source src={portfolioVideo} type="video/mp4" />
            Your browser does not support embedded video. {" "}
            <a href={portfolioVideo} download>
              Download the portfolio walkthrough instead.
            </a>
          </video>
        </motion.div>
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
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Explore
            </div>
            <div className="mt-2 text-2xl font-semibold">{c.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            <div className="mt-4 text-sm text-primary group-hover:translate-x-1 transition">
              Continue →
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
