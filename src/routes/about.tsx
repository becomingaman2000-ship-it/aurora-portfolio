import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import img from "@/assets/eustace-2.asset.json";
import img2 from "@/assets/eustace-3.asset.json";
import { absUrl, canonical } from "@/lib/site";
import { assetUrl } from "@/lib/asset";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Eustace .T. Madawu, Freelance Software & Website Engineer" },
      {
        name: "description",
        content:
          "About Eustace .T. Madawu — freelance software & website engineer from Harare, Zimbabwe: skills, education, languages and the story behind the shipped products.",
      },
      { property: "og:title", content: "About — Eustace .T. Madawu" },
      { property: "og:url", content: absUrl("/about") },
      { property: "og:image", content: absUrl(img.url) },
      { name: "twitter:image", content: absUrl(img.url) },
    ],
    links: [canonical("/about")],
  }),
  component: About,
});

const skills = {
  "Software & Web Engineering": [
    ["Website Engineering I & II", "Advanced"],
    ["Software Engineering", "Advanced"],
    ["Internet & Web Programming", "Advanced"],
    ["Object-Oriented Programming", "Proficient"],
    ["Visual Programming & Development", "Proficient"],
    ["Product Development Project", "Advanced"],
  ],
  "Data, Systems & Infrastructure": [
    ["Database Design Concepts", "Advanced"],
    ["Big Data & Data Analytics", "Proficient"],
    ["Data Communications & Networking", "Proficient"],
    ["Enterprise Systems", "Proficient"],
    ["Operating Systems", "Proficient"],
    ["CISCO Data Analytics (Certified)", "Proficient"],
  ],
  "Digital Commerce & Business": [
    ["E-Commerce Operations Management", "Advanced"],
    ["Fundamentals of Electronic Commerce", "Advanced"],
    ["Electronic Marketing", "Proficient"],
    ["Marketing Research", "Proficient"],
    ["Intellectual Property in E-Commerce", "Proficient"],
    ["Purchasing & Supply Chain Mgmt", "Proficient"],
  ],
  "Finance, Strategy & Technopreneurship": [
    ["Technopreneurship (I–IV)", "Advanced"],
    ["Financial Management", "Proficient"],
    ["Financial Accounting (I & II)", "Proficient"],
    ["Quantitative Analysis for Business", "Proficient"],
    ["Corporate & Commercial Law", "Proficient"],
    ["Micro & Macroeconomics", "Proficient"],
  ],
};

function About() {
  return (
    <div className="animate-fade-in space-y-20">
      <>
        <section className="grid gap-10 md:grid-cols-[1fr_1.2fr] items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            className="glass-strong rounded-[2rem] p-2"
          >
            <img
              src={assetUrl(img.url)}
              alt="Eustace .T. Madawu"
              className="w-full aspect-[4/5] rounded-[1.6rem] object-cover"
              decoding="async"
            />
          </motion.div>
          <div className="space-y-5">
            <span className="glass inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-widest">
              About
            </span>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              Engineer, builder, <span className="text-gradient">leader.</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Eustace .T. Madawu is a Zimbabwean software and website engineer completing a Bachelor of
              Technology Honours Degree in Electronic Commerce at the Harare Institute of Technology
              (HIT), School of Business Management Sciences. He operates at the intersection of
              full-stack engineering, digital business strategy, and product design.
            </p>
            <p className="text-muted-foreground text-base md:text-lg">
              Beyond engineering, Eustace brings a rare combination of technical depth and people
              leadership — a trained counsellor, Overseer of Peer Counselling & Psychological
              Services at HIT, former Head Boy of Red Cross Independent College, and a trusted event
              organiser. Advanced technical craft, paired with proven leadership.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Full-stack", "Product design", "Systems & Data", "Leadership"].map((t) => (
                <span key={t} className="glass rounded-full px-3 py-1 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </>

      <section>
        <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <span className="glass inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-widest">
              02 · Expertise
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold">
              Studied areas & applied craft
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground text-sm">
            Formal coursework and applied practice — presented by discipline.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(skills).map(([group, items]) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              className="glass rounded-3xl p-6"
            >
              <div className="text-xs uppercase tracking-widest text-primary">{group}</div>
              <ul className="mt-4 space-y-2">
                {items.map(([name, level]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-3 text-sm border-b border-border/40 pb-2 last:border-0"
                  >
                    <span className="min-w-0">{name}</span>
                    <span
                      className={`shrink-0 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${
                        level === "Advanced"
                          ? "bg-primary/15 text-primary"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {level}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-4">
          <span className="glass inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-widest">
            Languages · Education
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold">Fluent across worlds</h2>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              ["English", "Fluent"],
              ["Shona", "Fluent"],
              ["Mandarin (Business)", "Intermediate+"],
            ].map(([l, lvl]) => (
              <div key={l} className="glass rounded-2xl p-3">
                <div className="text-sm font-semibold">{l}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {lvl}
                </div>
              </div>
            ))}
          </div>
          <div className="glass rounded-3xl p-6 space-y-3">
            <div className="text-xs uppercase tracking-widest text-primary">Education</div>
            <ul className="space-y-2 text-sm">
              <li>
                <b>Harare Institute of Technology</b> — B.Tech (Hons) in Electronic Commerce ·
                2024–Present
              </li>
              <li>
                <b>HIT</b> — Certificate in Higher & Tertiary Education (E-Commerce)
              </li>
              <li>
                <b>Red Cross Independent College</b> — A-Level: Economics, Business Studies,
                Computer Science · 2023
              </li>
              <li>
                <b>St John's High School, Chikwaka</b> — O-Level · 2021
              </li>
            </ul>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          className="glass-strong rounded-[2rem] p-2"
        >
          <img
            src={assetUrl(img2.url)}
            alt="Eustace at work"
            className="w-full aspect-[4/5] rounded-[1.6rem] object-cover"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </section>
    </div>
  );
}
