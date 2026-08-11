import { useEffect, useRef, type ReactNode } from "react";

/**
 * Dissolves blocks as they leave the reading band — content above (already
 * read) and below fades + blurs away, and re-materialises when scrolled back.
 * Uses one passive rAF-throttled scroll listener and writes only
 * opacity/filter/transform, so it stays smooth on long pages.
 */
export function ScrollDissolve({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let ready = false;
    let items: { el: HTMLElement; last: number }[] = [];

    const collect = () => {
      const direct = Array.from(root.children) as HTMLElement[];
      const targets: HTMLElement[] = [];
      for (const child of direct) {
        const grand = Array.from(child.children) as HTMLElement[];
        if (grand.length > 1) targets.push(...grand);
        else targets.push(child);
      }
      items = targets
        // leave framer-motion-controlled blocks alone so the two never fight
        .filter((el) => !el.style.opacity && !el.style.transform)
        .map((el) => {
          el.style.willChange = "opacity, filter, transform";
          return { el, last: -1 };
        });
    };

    const update = () => {
      frame = 0;
      if (!ready) return;
      const vh = window.innerHeight;
      for (const item of items) {
        const r = item.el.getBoundingClientRect();
        if (r.height === 0) continue;
        const center = r.top + r.height / 2;
        // 1 inside the reading band, ramping to 0 past the edges
        const topFade = Math.min(1, Math.max(0, (center + r.height * 0.35) / (vh * 0.42)));
        const bottomFade = Math.min(1, Math.max(0, (vh * 1.05 - center) / (vh * 0.35)));
        const v = Math.min(topFade, bottomFade);
        if (Math.abs(v - item.last) < 0.02) continue;
        item.last = v;
        item.el.style.opacity = String(0.05 + 0.95 * v);
        item.el.style.filter = v > 0.99 ? "none" : `blur(${((1 - v) * 8).toFixed(2)}px)`;
        item.el.style.transform =
          v > 0.99
            ? "none"
            : `translate3d(0, ${((1 - v) * 18).toFixed(2)}px, 0) scale(${(0.97 + 0.03 * v).toFixed(3)})`;
      }
    };

    const onScroll = () => {
      if (ready && !frame) frame = requestAnimationFrame(update);
    };

    // wait for hydration (incl. lazily hydrated routes) before touching styles
    let start = 0;
    const begin = () => {
      start = window.setTimeout(() => {
        ready = true;
        collect();
        update();
      }, 600);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(root);
    const mo = new MutationObserver(() => {
      collect();
      onScroll();
    });
    mo.observe(root, { childList: true, subtree: false });

    return () => {
      window.clearTimeout(start);
      window.removeEventListener("load", begin);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      mo.disconnect();
      for (const item of items) {
        item.el.style.opacity = "";
        item.el.style.filter = "";
        item.el.style.transform = "";
        item.el.style.willChange = "";
      }
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
