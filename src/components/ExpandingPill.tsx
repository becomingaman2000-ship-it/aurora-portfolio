import { motion } from "framer-motion";
import { useState } from "react";

/** Skiper3-inspired glass control pill that expands to reveal actions. */
export function ExpandingPill({
  actions,
  label = "Menu",
}: {
  actions: { icon: React.ReactNode; label: string; onClick: () => void }[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="flex items-center gap-3">
      <motion.div
        layout
        initial={false}
        animate={{ width: open ? 320 : 56 }}
        transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
        className="glass-strong flex h-14 items-center overflow-hidden rounded-full"
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-14 w-14 place-items-center text-lg"
          aria-label={label}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl"
          >
            +
          </motion.span>
        </button>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 pr-3"
          >
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="rounded-full bg-foreground/10 px-3 py-1.5 text-xs hover:bg-foreground/20 active:scale-95 transition"
              >
                <span className="mr-1">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
