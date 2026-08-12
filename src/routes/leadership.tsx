import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import img from "@/assets/eustace-6.asset.json";
import { absUrl, canonical } from "@/lib/site";
import { assetUrl } from "@/lib/asset";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership & Community — Eustace .T. Madawu" },
      {
        name: "description",
        content:
          "Trusted with people, programmes, and institutional responsibility — counselling, head-boy leadership, and event organising.",
      },
      { property: "og:title", content: "Leadership & Community — Eustace .T. Madawu" },
      { property: "og:url", content: absUrl("/leadership") },
      { property: "og:image", content: absUrl(img.url) },
      { name: "twitter:image", content: absUrl(img.url) },
    ],
    links: [canonical("/leadership")],
  }),
  component: Leadership,
});

const roles = [
  {
    title: "Overseer, Peer Counselling & Psychological Services",
    org: "Harare Institute of Technology · Current (formerly Chairman)",
    points: [
      "Provides senior oversight of the peer-counselling programme after previously serving as its elected Chairman.",
      "Leads and coordinates a team of trained peer counsellors supporting students' academic, emotional, and personal wellbeing.",
      "Manages counselling schedules, confidentiality protocols, and cross-team organisation.",
    ],
  },
  {
    title: "Trained Peer Counsellor",
    org: "Harare Institute of Technology · Certified",
    points: [
      "Completed formal counselling training and holds a Counselling Training Certificate.",
      "Delivers confidential, empathetic support to students navigating academic and personal challenges.",
      "Applies strong conflict-resolution and active-listening skills in high-trust settings.",
    ],
  },
  {
    title: "Head Boy",
    org: "Red Cross Independent College · 2022 – 2023",
    points: [
      "Represented the student body in leadership meetings with school administration.",
      "Organised student activities and discipline programmes across the college.",
      "Built a foundation of responsibility, integrity, and public leadership from an early age.",
    ],
  },
  {
    title: "Event Planner & Organiser",
    org: "University Sports Events & Student Orientation · 2024 – Present",
    points: [
      "Plans and coordinates large-scale events, from sports fixtures to orientation programmes.",
      "Manages logistics, equipment, registration, and scheduling in fast-paced environments.",
      "Consistently delivers smooth experiences for hundreds of participants.",
    ],
  },
];

function Leadership() {
  return (
    <div className="animate-fade-in space-y-16">
      <section className="grid gap-10 md:grid-cols-[1fr_1.2fr] items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-[2rem] p-2"
        >
          <img
            src={assetUrl(img.url)}
            alt="Eustace in leadership setting"
            className="w-full aspect-[4/5] rounded-[1.6rem] object-cover"
            decoding="async"
          />
        </motion.div>
        <div className="space-y-5">
          <span className="glass inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-widest">
            Leadership
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Trusted with <span className="text-gradient">people & programmes.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl">
            A rare combination of technical depth and people leadership — certified counsellor,
            programme overseer, and event organiser with a track record of institutional
            responsibility.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {roles.map((r, i) => (
          <motion.article
            key={r.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-3xl p-6 space-y-3"
          >
            <div className="text-xs uppercase tracking-widest text-primary">0{i + 1} · Role</div>
            <h3 className="text-xl font-semibold">{r.title}</h3>
            <div className="text-sm text-muted-foreground italic">{r.org}</div>
            <ul className="space-y-2 text-sm pt-2">
              {r.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </section>

      <section className="glass-strong rounded-[2rem] p-8 md:p-12 text-center">
        <div className="text-xs uppercase tracking-widest text-primary">Personal attributes</div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[
            "Highly Dependable",
            "Strong Work Ethic",
            "Fast Learner",
            "Confident Communicator",
            "Detail-Oriented",
            "Disciplined",
            "Positive Attitude",
            "Leadership",
          ].map((a) => (
            <span
              key={a}
              className="glass rounded-full px-4 py-1.5 text-sm hover:scale-105 transition"
            >
              ✦ {a}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
