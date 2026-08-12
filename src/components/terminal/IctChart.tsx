import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle } from "@/lib/market/types";
import { formatPrice } from "@/lib/market/types";
import { getNyParts, sessionOf } from "@/lib/market/sessions";
import type { FrameAnalysis, LiquidityPool } from "@/lib/ict/types";

export type OverlayFlags = {
  fvg: boolean;
  ob: boolean;
  liq: boolean;
  ote: boolean;
  sessions: boolean;
  structure: boolean;
};

export const DEFAULT_OVERLAYS: OverlayFlags = {
  fvg: true,
  ob: true,
  liq: true,
  ote: true,
  sessions: true,
  structure: true,
};

type ExtraLevel = { price: number; label: string; color: string; dash?: boolean };

type Props = {
  candles: Candle[];
  analysis: FrameAnalysis | null;
  extras?: ExtraLevel[];
  highlight?: { top: number; bottom: number } | null;
  overlays?: OverlayFlags;
  onHover?: (c: Candle | null, i: number) => void;
};

const BULL = "#2ee6b0";
const BEAR = "#ff5d73";
const GOLD = "#e8c872";
const MUTED = "rgba(232, 236, 245, 0.38)";

export function IctChart({
  candles,
  analysis,
  extras = [],
  highlight,
  overlays = DEFAULT_OVERLAYS,
  onHover,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState({ start: 0, count: 120 });
  const [hover, setHover] = useState<{ x: number; y: number; i: number } | null>(null);
  const drag = useRef<{ x: number; start: number } | null>(null);

  useEffect(() => {
    const n = candles.length;
    if (!n) return;
    setView((v) => {
      const count = Math.min(Math.max(v.count, 60), n);
      return { start: Math.max(0, n - count), count };
    });
  }, [candles.length]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, analysis, extras, highlight, overlays, view, hover]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, analysis, extras, highlight, overlays, view, hover]);

  const visible = useMemo(() => {
    const start = clamp(view.start, 0, Math.max(0, candles.length - 10));
    const end = Math.min(candles.length, start + view.count);
    return { start, end, bars: candles.slice(start, end) };
  }, [candles, view]);

  function draw() {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padL = 8;
    const padR = 72;
    const padT = 16;
    const padB = 28;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const { start, bars } = visible;
    if (!bars.length) {
      ctx.fillStyle = MUTED;
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText("Waiting for tape…", 24, h / 2);
      return;
    }

    let lo = Math.min(...bars.map((c) => c.low));
    let hi = Math.max(...bars.map((c) => c.high));
    if (analysis?.dealing && overlays.ote) {
      lo = Math.min(lo, analysis.dealing.low);
      hi = Math.max(hi, analysis.dealing.high);
    }
    const pad = (hi - lo) * 0.12 || 0.0008;
    lo -= pad;
    hi += pad;
    const span = hi - lo || 0.001;

    const xAt = (i: number) => padL + ((i - start + 0.5) / view.count) * plotW;
    const yAt = (p: number) => padT + ((hi - p) / span) * plotH;
    const barW = Math.max(1.2, (plotW / view.count) * 0.72);

    // session bands
    if (overlays.sessions && bars.length) {
      let runStart = 0;
      let runSess = sessionOf(bars[0]!.time);
      const flush = (from: number, to: number, sess: string) => {
        const colors: Record<string, string> = {
          ASIAN: "rgba(120, 140, 180, 0.05)",
          LONDON: "rgba(232, 200, 114, 0.06)",
          NY: "rgba(46, 230, 176, 0.05)",
          OTHER: "transparent",
        };
        ctx.fillStyle = colors[sess] ?? "transparent";
        const x0 = xAt(start + from) - barW;
        const x1 = xAt(start + to) + barW;
        ctx.fillRect(x0, padT, x1 - x0, plotH);
      };
      for (let i = 1; i < bars.length; i++) {
        const s = sessionOf(bars[i]!.time);
        if (s !== runSess) {
          flush(runStart, i - 1, runSess);
          runStart = i;
          runSess = s;
        }
      }
      flush(runStart, bars.length - 1, runSess);
    }

    // dealing / OTE
    if (overlays.ote && analysis?.dealing) {
      const d = analysis.dealing;
      ctx.fillStyle = "rgba(255, 93, 115, 0.05)";
      ctx.fillRect(padL, yAt(d.high), plotW, yAt(d.eq) - yAt(d.high));
      ctx.fillStyle = "rgba(46, 230, 176, 0.05)";
      ctx.fillRect(padL, yAt(d.eq), plotW, yAt(d.low) - yAt(d.eq));
      ctx.fillStyle = "rgba(232, 200, 114, 0.1)";
      ctx.fillRect(padL, yAt(d.oteBuy.top), plotW, yAt(d.oteBuy.bottom) - yAt(d.oteBuy.top));
      ctx.fillStyle = "rgba(232, 200, 114, 0.06)";
      ctx.fillRect(padL, yAt(d.oteSell.top), plotW, yAt(d.oteSell.bottom) - yAt(d.oteSell.top));
      dashed(ctx, padL, yAt(d.eq), padL + plotW, yAt(d.eq), GOLD, [4, 4]);
    }

    // FVGs
    if (overlays.fvg && analysis) {
      for (const f of analysis.fvgs.filter((x) => x.fill !== "filled").slice(-10)) {
        if (f.endIndex < start - 2) continue;
        const x0 = xAt(Math.max(f.endIndex, start));
        const x1 = padL + plotW;
        ctx.fillStyle =
          f.dir === "bull"
            ? f.fill === "partial"
              ? "rgba(46, 230, 176, 0.08)"
              : "rgba(46, 230, 176, 0.14)"
            : f.fill === "partial"
              ? "rgba(255, 93, 115, 0.08)"
              : "rgba(255, 93, 115, 0.14)";
        ctx.fillRect(x0, yAt(f.top), x1 - x0, yAt(f.bottom) - yAt(f.top));
        ctx.strokeStyle = f.dir === "bull" ? "rgba(46, 230, 176, 0.45)" : "rgba(255, 93, 115, 0.45)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, yAt(f.top), x1 - x0, yAt(f.bottom) - yAt(f.top));
        dashed(ctx, x0, yAt(f.ce), x1, yAt(f.ce), "rgba(255,255,255,0.25)", [2, 3]);
      }
    }

    // Order blocks
    if (overlays.ob && analysis) {
      for (const b of analysis.blocks.slice(-12)) {
        if (b.index < start - 20) continue;
        const x0 = xAt(Math.max(b.index, start));
        ctx.fillStyle =
          b.kind === "BREAKER"
            ? "rgba(232, 200, 114, 0.12)"
            : b.dir === "bull"
              ? "rgba(46, 230, 176, 0.1)"
              : "rgba(255, 93, 115, 0.1)";
        ctx.fillRect(x0, yAt(b.top), padL + plotW - x0, yAt(b.bottom) - yAt(b.top));
        ctx.strokeStyle = b.kind === "BREAKER" ? GOLD : b.dir === "bull" ? BULL : BEAR;
        ctx.globalAlpha = 0.55;
        ctx.strokeRect(x0, yAt(b.top), padL + plotW - x0, yAt(b.bottom) - yAt(b.top));
        ctx.globalAlpha = 1;
      }
    }

    if (highlight) {
      ctx.fillStyle = "rgba(232, 200, 114, 0.16)";
      ctx.fillRect(padL, yAt(highlight.top), plotW, yAt(highlight.bottom) - yAt(highlight.top));
      ctx.strokeStyle = GOLD;
      ctx.strokeRect(padL, yAt(highlight.top), plotW, yAt(highlight.bottom) - yAt(highlight.top));
    }

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const y = padT + (plotH * g) / 4;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
    }

    // candles
    for (let i = 0; i < bars.length; i++) {
      const c = bars[i]!;
      const x = xAt(start + i);
      const up = c.close >= c.open;
      ctx.strokeStyle = up ? BULL : BEAR;
      ctx.fillStyle = up ? BULL : BEAR;
      ctx.beginPath();
      ctx.moveTo(x, yAt(c.high));
      ctx.lineTo(x, yAt(c.low));
      ctx.lineWidth = 1.15;
      ctx.stroke();
      const top = yAt(Math.max(c.open, c.close));
      const bot = yAt(Math.min(c.open, c.close));
      const bh = Math.max(1, bot - top);
      ctx.globalAlpha = up ? 0.92 : 0.88;
      ctx.fillRect(x - barW / 2, top, barW, bh);
      ctx.globalAlpha = 1;
    }

    // liquidity
    if (overlays.liq && analysis) {
      const pools = pickPools(analysis.liquidity);
      for (const p of pools) {
        const y = yAt(p.price);
        dashed(
          ctx,
          padL,
          y,
          padL + plotW,
          y,
          p.swept ? "rgba(255,255,255,0.18)" : p.side === "BSL" ? "rgba(255,93,115,0.7)" : "rgba(46,230,176,0.7)",
          p.swept ? [2, 4] : [6, 4],
        );
        ctx.fillStyle = p.swept ? MUTED : p.side === "BSL" ? BEAR : BULL;
        ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${p.side}${p.kind === "equal" ? " EQ" : ""}${p.swept ? " ×" : ""}`, padL + 6, y - 3);
      }
    }

    // structure tags
    if (overlays.structure && analysis) {
      ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
      for (const e of analysis.structure.slice(-14)) {
        if (e.index < start || e.index >= start + bars.length) continue;
        const x = xAt(e.index);
        const y = yAt(e.price);
        ctx.fillStyle = e.dir === "bull" ? BULL : BEAR;
        ctx.textAlign = "center";
        ctx.fillText(e.kind, x, e.dir === "bull" ? y - 8 : y + 12);
      }
    }

    // extra HTF levels
    for (const lv of extras) {
      const y = yAt(lv.price);
      if (y < padT || y > padT + plotH) continue;
      dashed(ctx, padL, y, padL + plotW, y, lv.color, lv.dash ? [2, 4] : [8, 5]);
      ctx.fillStyle = lv.color;
      ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.fillText(lv.label, padL + plotW - 4, y - 3);
    }

    // last price
    const lastC = candles[candles.length - 1]!;
    const ly = yAt(lastC.close);
    dashed(ctx, padL, ly, padL + plotW, ly, lastC.close >= lastC.open ? BULL : BEAR, [1, 3]);
    roundRect(ctx, w - padR + 4, ly - 9, padR - 8, 18, 3, lastC.close >= lastC.open ? BULL : BEAR);
    ctx.fillStyle = "#081018";
    ctx.font = "11px JetBrains Mono, ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(formatPrice(lastC.close), w - padR / 2, ly + 4);

    // price scale
    ctx.fillStyle = MUTED;
    ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
    ctx.textAlign = "left";
    for (let g = 0; g <= 4; g++) {
      const p = hi - (span * g) / 4;
      ctx.fillText(formatPrice(p), w - padR + 8, padT + (plotH * g) / 4 + 3);
    }

    // time labels
    ctx.textAlign = "center";
    const step = Math.max(1, Math.floor(bars.length / 6));
    for (let i = 0; i < bars.length; i += step) {
      const ny = getNyParts(new Date(bars[i]!.time));
      ctx.fillText(
        `${String(ny.hour).padStart(2, "0")}:${String(ny.minute).padStart(2, "0")}`,
        xAt(start + i),
        h - 8,
      );
    }

    // watermark
    ctx.fillStyle = "rgba(255,255,255,0.045)";
    ctx.font = "600 18px Space Grotesk, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ICT DESK  ·  EUR/USD", padL + 10, padT + 22);

    if (hover && hover.i >= 0 && hover.i < candles.length) {
      const c = candles[hover.i]!;
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hover.x, padT);
      ctx.lineTo(hover.x, padT + plotH);
      ctx.moveTo(padL, hover.y);
      ctx.lineTo(padL + plotW, hover.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const boxW = 168;
      const bx = Math.min(hover.x + 14, w - padR - boxW - 8);
      const by = Math.max(padT + 8, hover.y - 78);
      roundRect(ctx, bx, by, boxW, 72, 8, "rgba(8, 12, 20, 0.88)");
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.strokeRect(bx, by, boxW, 72);
      ctx.fillStyle = "#e8ecf5";
      ctx.font = "11px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left";
      const ny = getNyParts(new Date(c.time));
      ctx.fillText(
        `${ny.weekday} ${String(ny.hour).padStart(2, "0")}:${String(ny.minute).padStart(2, "0")}`,
        bx + 10,
        by + 16,
      );
      ctx.fillStyle = c.close >= c.open ? BULL : BEAR;
      ctx.fillText(`O ${formatPrice(c.open)}  C ${formatPrice(c.close)}`, bx + 10, by + 34);
      ctx.fillStyle = MUTED;
      ctx.fillText(`H ${formatPrice(c.high)}  L ${formatPrice(c.low)}`, bx + 10, by + 52);
    }
  }

  function toIndex(clientX: number) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = clientX - rect.left;
    const padL = 8;
    const padR = 72;
    const plotW = rect.width - padL - padR;
    const t = (x - padL) / plotW;
    return Math.round(view.start + t * view.count);
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full min-h-[340px] cursor-crosshair"
      onWheel={(e) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? 1.12 : 0.88;
        setView((v) => {
          const count = clamp(Math.round(v.count * dir), 40, Math.min(400, candles.length));
          const end = Math.min(candles.length, v.start + v.count);
          const start = clamp(end - count, 0, Math.max(0, candles.length - count));
          return { start, count };
        });
      }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, start: view.start };
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerLeave={() => {
        drag.current = null;
        setHover(null);
        onHover?.(null, -1);
      }}
      onPointerMove={(e) => {
        if (drag.current) {
          const rect = canvasRef.current!.getBoundingClientRect();
          const dx = e.clientX - drag.current.x;
          const bars = Math.round((-dx / (rect.width - 80)) * view.count);
          setView((v) => ({
            ...v,
            start: clamp(drag.current!.start + bars, 0, Math.max(0, candles.length - v.count)),
          }));
        }
        const i = clamp(toIndex(e.clientX), 0, candles.length - 1);
        const rect = canvasRef.current!.getBoundingClientRect();
        setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, i });
        onHover?.(candles[i] ?? null, i);
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

function pickPools(pools: LiquidityPool[]): LiquidityPool[] {
  const unswept = pools.filter((p) => !p.swept);
  const swept = pools.filter((p) => p.swept).slice(-4);
  const eq = unswept.filter((p) => p.kind === "equal");
  const swings = unswept.filter((p) => p.kind === "swing").slice(-6);
  return [...eq, ...swings, ...swept].slice(-14);
}

function dashed(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  dash: number[],
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.setLineDash(dash);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
