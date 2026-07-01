import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import img from "@/assets/eustace-5.asset.json";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Eustace Madawu" },
      {
        name: "description",
        content:
          "Get in touch with Eustace Madawu for engineering engagements, product builds, or leadership opportunities.",
      },
      { property: "og:title", content: "Contact — Eustace Madawu" },
      { property: "og:image", content: img.url },
      { name: "twitter:image", content: img.url },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const mailto = `mailto:eustacemadawu1@gmail.com?subject=${encodeURIComponent(
    `Enquiry from ${form.name || "your site"}`,
  )}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)}`;

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
          Available for freelance engineering engagements, product builds,
          industrial attachment, and founder partnerships.
        </p>

        <div className="space-y-3">
          {[
            { label: "Email", value: "eustacemadawu1@gmail.com", href: "mailto:eustacemadawu1@gmail.com" },
            { label: "Phone", value: "+263 78 682 2202", href: "tel:+263786822202" },
            { label: "Address", value: "3058 Mainway Meadows, Waterfalls, Harare, Zimbabwe" },
            {
              label: "Affiliation",
              value: "Harare Institute of Technology — B.Tech (Hons) Electronic Commerce",
            },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href ?? "#"}
              className="glass block rounded-2xl p-4 hover:-translate-y-0.5 transition"
            >
              <div className="text-[10px] uppercase tracking-widest text-primary">
                {c.label}
              </div>
              <div className="text-sm mt-1">{c.value}</div>
            </a>
          ))}
        </div>

        <blockquote className="glass rounded-2xl p-5 text-sm italic text-muted-foreground border-l-2 border-primary">
          "Bringing world-class engineering discipline and proven leadership to every
          project."
        </blockquote>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailto;
        }}
        className="glass-strong rounded-[2rem] p-6 md:p-8 space-y-4"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Direct line
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider">Your name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Ada Lovelace"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="you@company.com"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider">Message</span>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="glass w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Tell me about the project…"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.98] transition"
        >
          Send message →
        </button>
        <p className="text-[11px] text-muted-foreground text-center">
          Opens your email client, pre-filled and ready to send.
        </p>
      </motion.form>
    </div>
  );
}
