import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMemo, useRef, type ReactNode } from "react";

export type StrokeVariant = "wave" | "orbit" | "zigzag" | "spiral" | "ribbon" | "arc";

type Shape = { d: string; w?: number; o?: number; dash?: boolean };

/**
 * Abstract structural line-work. Every variant is drawn inside a fixed
 * 1000x1000 canvas and rendered with a uniform (aspect-preserving) scale so it
 * never stretches or jitters as page height changes.
 */
const STRUCTURES: Record<StrokeVariant, Shape[]> = {
  // Layered lattice — stacked parallelograms fanning across the canvas
  ribbon: [
    { d: "M60 700 L340 300 L700 340 L940 180", w: 14 },
    { d: "M60 780 L360 400 L720 440 L940 280", w: 6, o: 0.5 },
    { d: "M340 300 L360 400 M700 340 L720 440", w: 4, o: 0.45 },
    { d: "M120 240 L420 180 L620 620 L880 560", w: 5, dash: true },
    { d: "M200 900 L520 640 L780 880", w: 8, o: 0.35 },
  ],
  // Concentric orbital rings with radial spokes
  orbit: [
    { d: "M500 130 A370 370 0 1 1 499 130", w: 12 },
    { d: "M500 265 A235 235 0 1 0 501 265", w: 5, o: 0.5 },
    { d: "M500 380 A120 120 0 1 1 499 380", w: 4, dash: true },
    { d: "M500 130 L500 380 M130 500 L380 500 M620 500 L870 500 M500 620 L500 870", w: 3, o: 0.4 },
    { d: "M240 240 L385 385 M760 760 L615 615", w: 3, o: 0.4 },
  ],
  // Angular circuit lattice
  zigzag: [
    { d: "M40 620 L200 380 L360 620 L520 340 L680 620 L840 400 L960 560", w: 13 },
    { d: "M40 720 L200 480 L360 720 L520 440 L680 720 L840 500 L960 660", w: 5, o: 0.45 },
    { d: "M200 380 L200 480 M520 340 L520 440 M840 400 L840 500", w: 4, o: 0.5 },
    { d: "M120 180 L420 180 L420 300 L780 300 L780 140 L960 140", w: 4, dash: true },
  ],
  // Nested rotating squares (spiral of frames)
  spiral: [
    { d: "M180 180 H820 V820 H180 Z", w: 11 },
    { d: "M500 240 L760 500 L500 760 L240 500 Z", w: 5, o: 0.5 },
    { d: "M330 330 H670 V670 H330 Z", w: 4, dash: true },
    { d: "M500 380 L620 500 L500 620 L380 500 Z", w: 4, o: 0.5 },
    { d: "M180 180 L500 380 M820 820 L500 620 M820 180 L620 500 M180 820 L380 500", w: 2.5, o: 0.35 },
  ],
  // Interference waves with vertical scaffolding
  wave: [
    { d: "M20 520 C 200 300, 320 740, 500 520 S 800 300, 980 480", w: 14 },
    { d: "M20 620 C 220 420, 340 840, 520 620 S 800 400, 980 580", w: 5, o: 0.45 },
    { d: "M20 420 C 180 220, 300 640, 480 420 S 780 200, 980 380", w: 4, dash: true },
    { d: "M260 300 L260 720 M620 260 L620 700 M860 300 L860 660", w: 3, o: 0.35 },
  ],
  // Faceted arch structure
  arc: [
    { d: "M40 820 C 200 180, 800 180, 960 820", w: 14 },
    { d: "M140 820 C 280 300, 720 300, 860 820", w: 5, o: 0.45 },
    { d: "M40 820 L280 360 L500 250 L720 360 L960 820", w: 4, dash: true },
    { d: "M280 360 L280 820 M500 250 L500 820 M720 360 L720 820", w: 3, o: 0.35 },
  ],
};

export function ScrollStroke({
  children,
  variant = "wave",
  className = "",
}: {
  children: ReactNode;
  variant?: StrokeVariant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0.05, 0.7], [0.06, 1], { clamp: true });
  const draw = useSpring(raw, { stiffness: 60, damping: 30, mass: 0.6, restDelta: 0.001 });
  const pathLength = reduced ? raw : draw;
  const fade = useTransform(scrollYProgress, [0.05, 0.35], [0, 0.7], { clamp: true });

  const gid = useMemo(() => `struct-${variant}`, [variant]);
  const shapes = STRUCTURES[variant] ?? STRUCTURES.wave;

  return (
    <section ref={ref} className={`relative isolate ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <svg
          aria-hidden
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="animate-ribbon-hue absolute inset-0 h-full w-full opacity-90"
          style={{ willChange: "transform" }}
        >
          <defs>
            <linearGradient
              id={gid}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
              className="animate-ribbon-aurora"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="var(--color-aurora-2)" />
              <stop offset="28%" stopColor="var(--color-aurora-1)" />
              <stop offset="55%" stopColor="var(--color-aurora-3)" />
              <stop offset="80%" stopColor="var(--color-aurora-4)" />
              <stop offset="100%" stopColor="var(--color-aurora-5)" />
            </linearGradient>
            <filter id={`${gid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter={`url(#${gid}-glow)`} vectorEffect="non-scaling-stroke">
            {shapes.map((s, i) => (
              <motion.path
                key={i}
                d={s.d}
                fill="none"
                stroke={`url(#${gid})`}
                strokeWidth={s.w ?? 6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={s.o ?? 0.55}
                {...(s.dash
                  ? {
                      strokeDasharray: "18 30",
                      className: "animate-ribbon-dash",
                      style: { opacity: fade },
                    }
                  : { style: { pathLength } })}
              />
            ))}
          </g>

          {/* Particles riding along the ribbons */}
          {!reduced && (
            <g>
              {shapes
                .filter((s) => !s.dash)
                .slice(0, 3)
                .flatMap((s, si) =>
                  [0, 1, 2, 3].map((pi) => {
                    const dur = 9 + si * 3 + pi * 1.7;
                    return (
                      <circle
                        key={`${si}-${pi}`}
                        r={2.4 + (pi % 3)}
                        fill={`url(#${gid})`}
                        opacity={0.75}
                      >
                        <animateMotion
                          dur={`${dur}s`}
                          begin={`${-pi * (dur / 4)}s`}
                          repeatCount="indefinite"
                          path={s.d}
                          rotate="auto"
                        />
                        <animate
                          attributeName="opacity"
                          values="0;0.85;0"
                          dur={`${dur}s`}
                          begin={`${-pi * (dur / 4)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    );
                  }),
                )}
            </g>
          )}
        </svg>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

