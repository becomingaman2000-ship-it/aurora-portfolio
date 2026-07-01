import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** Skiper19-style scroll-drawn accent stroke behind a section. */
export function ScrollStroke({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative">
      <svg
        aria-hidden
        viewBox="0 0 800 600"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-40"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="stroke-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-aurora-1)" />
            <stop offset="50%" stopColor="var(--color-aurora-2)" />
            <stop offset="100%" stopColor="var(--color-aurora-3)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M40 500 C 180 380, 220 220, 400 260 S 700 460, 760 120"
          fill="none"
          stroke="url(#stroke-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>
      {children}
    </section>
  );
}
