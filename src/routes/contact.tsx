import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import img from "@/assets/eustace-5.asset.json";
import { CONTACT_EMAIL, gmailCompose } from "@/lib/contact";
import { absUrl, canonical } from "@/lib/site";
import { assetUrl } from "@/lib/asset";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Hire a Freelance Software & Website Engineer" },
      {
        name: "description",
        content:
          "Contact Eustace .T. Madawu to hire a freelance software & website engineer: quotes, timelines and delivery plans — remote worldwide, based in Harare, Zimbabwe.",
      },
      { property: "og:title", content: "Contact — Hire a Freelance Software & Website Engineer" },
      {
        property: "og:description",
        content: "Get a quote for your website or software build — remote engagements worldwide.",
      },
      { property: "og:url", content: absUrl("/contact") },
      { property: "og:image", content: absUrl(img.url) },
      { name: "twitter:image", content: absUrl(img.url) },
    ],
    links: [canonical("/contact")],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", message: "" });
  const composeUrl = gmailCompose(
    `Enquiry from ${form.name || "your website"}`,
    `${form.message}\n\n— ${form.name}`,
  );

  return (
    <div className="animate-fade-in grid gap-10 md:grid-cols-[1fr_1.1fr] items-start">
      <div className="space-y-6">
        <span className="glass inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-widest">
          Contact
        </span>
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
          Let's <span className="text-gradient">build something.</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-md">
          Available for freelance engineering engagements, product builds, industrial attachment,
          and founder partnerships.
        </p>

        <div className="space-y-3">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="glass block rounded-2xl p-4 hover:-translate-y-0.5 transition"
          >
            <div className="text-[10px] uppercase tracking-widest text-primary">Email</div>
            <div className="text-sm mt-1">{CONTACT_EMAIL}</div>
          </a>
          <div className="glass block rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-primary">Based in</div>
            <div className="text-sm mt-1">Harare, Zimbabwe</div>
          </div>
          <div className="glass block rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-primary">Affiliation</div>
            <div className="text-sm mt-1">
              Harare Institute of Technology — B.Tech (Hons) Electronic Commerce
            </div>
          </div>
        </div>

        <blockquote className="glass rounded-2xl p-5 text-sm italic text-muted-foreground border-l-2 border-primary">
          "Bringing world-class engineering discipline and proven leadership to every project."
        </blockquote>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-[2rem] p-6 md:p-8 space-y-4"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Send via Gmail
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider">Your name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Ada Lovelace"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider">What do you need?</span>
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Tell me about the project…"
          />
        </label>
        <a
          href={composeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-full bg-primary py-3 text-center text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98] transition"
        >
          Open in Gmail →
        </a>
        <p className="text-[11px] text-muted-foreground text-center">
          Opens Gmail with {CONTACT_EMAIL} already in the To field — just hit send.
        </p>
      </motion.div>
    </div>
  );
}
