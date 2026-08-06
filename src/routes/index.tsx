import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import profile from "@/assets/profile-main.asset.json";
import { LoopText } from "@/components/LoopText";
import { ExpandingPill } from "@/components/ExpandingPill";
import { CONTACT_EMAIL, GMAIL_COMPOSE } from "@/lib/contact";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eustace Madawu — Software & Website Engineer" },
      { property: "og:image", content: profile.url },
      { name: "twitter:image", content: profile.url },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="animate-fade-in">
      <section className="grid gap-10 items-center min-h-[70vh]">
        <div className="space-y-6 max-w-3xl">
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
