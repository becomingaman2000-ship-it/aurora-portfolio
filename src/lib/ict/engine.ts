import type { Candle, Tape, Timeframe } from "../market/types";
import { PIP, TIMEFRAMES, clamp, last, pips } from "../market/types";
import {
  candleNyMinutes,
  getNyParts,
  inWindow,
  readLiveSession,
} from "../market/sessions";
import type {
  Bias,
  Bpr,
  Confluence,
  DealingRange,
  Dir,
  Forecast,
  FrameAnalysis,
  FVG,
  IctReport,
  LiquidityPool,
  MtfRow,
  OrderBlock,
  Setup,
  StructureEvent,
  Sweep,
  Swing,
} from "./types";
import { buildNarrative } from "./narrative";

function calcAtr(candles: Candle[], period = 14): number {
  if (candles.length < 2) return 0.0008;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]!;
    const p = candles[i - 1]!;
    trs.push(Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close)));
  }
  const slice = trs.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function findSwings(candles: Candle[], k: number): Swing[] {
  const out: Swing[] = [];
  if (candles.length < k * 2 + 1) return out;
  for (let i = k; i < candles.length - k; i++) {
    let isH = true;
    let isL = true;
    const hi = candles[i]!.high;
    const lo = candles[i]!.low;
    for (let j = i - k; j <= i + k; j++) {
      if (j === i) continue;
      if (candles[j]!.high >= hi) isH = false;
      if (candles[j]!.low <= lo) isL = false;
    }
    if (isH) out.push({ index: i, time: candles[i]!.time, price: hi, kind: "high" });
    if (isL) out.push({ index: i, time: candles[i]!.time, price: lo, kind: "low" });
  }
  return out;
}

function readStructure(swings: Swing[]): { events: StructureEvent[]; trend: Bias } {
  const events: StructureEvent[] = [];
  let trend: Bias = "RANGE";
  let lastHigh: Swing | undefined;
  let lastLow: Swing | undefined;

  for (const s of swings) {
    if (s.kind === "high") {
      if (lastHigh && s.price > lastHigh.price) {
        const kind: StructureEvent["kind"] =
          trend === "BEARISH" ? "CHOCH" : trend === "BULLISH" ? "BOS" : "MSS";
        events.push({
          index: s.index,
          time: s.time,
          price: s.price,
          kind: kind === "CHOCH" ? "MSS" : kind,
          dir: "bull",
        });
        trend = "BULLISH";
      } else if (lastHigh && s.price < lastHigh.price && trend === "BULLISH") {
        /* lower high — potential weakening, wait for low break */
      }
      lastHigh = s;
    } else {
      if (lastLow && s.price < lastLow.price) {
        const kind: StructureEvent["kind"] =
          trend === "BULLISH" ? "CHOCH" : trend === "BEARISH" ? "BOS" : "MSS";
        events.push({
          index: s.index,
          time: s.time,
          price: s.price,
          kind: kind === "CHOCH" ? "MSS" : kind,
          dir: "bear",
        });
        trend = "BEARISH";
      }
      lastLow = s;
    }
  }
  return { events, trend };
}

function findFvgs(candles: Candle[], atr: number): FVG[] {
  const out: FVG[] = [];
  for (let i = 2; i < candles.length; i++) {
    const a = candles[i - 2]!;
    const b = candles[i - 1]!;
    const c = candles[i]!;
    const midBody = Math.abs(b.close - b.open);
    const displacement = midBody >= atr * 1.05 || b.high - b.low >= atr * 1.35;

    if (c.low > a.high && c.low - a.high > atr * 0.12) {
      const top = c.low;
      const bottom = a.high;
      out.push(fillFvg({
        id: `fvg-b-${i}`,
        dir: "bull",
        top,
        bottom,
        ce: (top + bottom) / 2,
        startIndex: i - 2,
        endIndex: i,
        startTime: a.time,
        endTime: c.time,
        fill: "unfilled",
        inverted: false,
        displacement,
      }, candles, i + 1));
    }
    if (c.high < a.low && a.low - c.high > atr * 0.12) {
      const top = a.low;
      const bottom = c.high;
      out.push(fillFvg({
        id: `fvg-s-${i}`,
        dir: "bear",
        top,
        bottom,
        ce: (top + bottom) / 2,
        startIndex: i - 2,
        endIndex: i,
        startTime: a.time,
        endTime: c.time,
        fill: "unfilled",
        inverted: false,
        displacement,
      }, candles, i + 1));
    }
  }
  return out.slice(-40);
}

function fillFvg(fvg: FVG, candles: Candle[], from: number): FVG {
  let fill: FVG["fill"] = "unfilled";
  let inverted = false;
  for (let i = from; i < candles.length; i++) {
    const c = candles[i]!;
    if (fvg.dir === "bull") {
      if (c.low <= fvg.top && c.low > fvg.bottom) fill = "partial";
      if (c.low <= fvg.bottom) {
        fill = "filled";
        if (c.close < fvg.bottom) inverted = true;
      }
    } else {
      if (c.high >= fvg.bottom && c.high < fvg.top) fill = "partial";
      if (c.high >= fvg.top) {
        fill = "filled";
        if (c.close > fvg.top) inverted = true;
      }
    }
  }
  return { ...fvg, fill, inverted };
}

function findOrderBlocks(
  candles: Candle[],
  atr: number,
): OrderBlock[] {
  const blocks: OrderBlock[] = [];
  for (let i = 4; i < candles.length; i++) {
    const c = candles[i]!;
    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low;
    if (body < atr * 1.1 || range < atr * 1.35) continue;
    const bullish = c.close > c.open;
    for (let j = i - 1; j >= Math.max(0, i - 7); j--) {
      const o = candles[j]!;
      const bearish = o.close < o.open;
      if (bullish && bearish) {
        const mitigated = candles.slice(i + 1).some((x) => x.low <= o.low);
        const closedThrough = candles.slice(i + 1).some((x) => x.close < o.low);
        blocks.push({
          id: `ob-b-${j}-${i}`,
          dir: closedThrough ? "bear" : "bull",
          kind: closedThrough ? "BREAKER" : mitigated ? "MITIGATION" : "OB",
          top: o.high,
          bottom: o.low,
          time: o.time,
          index: j,
          mitigated,
          displacementPips: pips(c.high - o.low),
        });
        break;
      }
      if (!bullish && !bearish) {
        const mitigated = candles.slice(i + 1).some((x) => x.high >= o.high);
        const closedThrough = candles.slice(i + 1).some((x) => x.close > o.high);
        blocks.push({
          id: `ob-s-${j}-${i}`,
          dir: closedThrough ? "bull" : "bear",
          kind: closedThrough ? "BREAKER" : mitigated ? "MITIGATION" : "OB",
          top: o.high,
          bottom: o.low,
          time: o.time,
          index: j,
          mitigated,
          displacementPips: pips(o.high - c.low),
        });
        break;
      }
    }
  }
  return blocks.slice(-28);
}

function findBprs(fvgs: FVG[]): Bpr[] {
  const bulls = fvgs.filter((f) => f.dir === "bull" && f.fill !== "filled");
  const bears = fvgs.filter((f) => f.dir === "bear" && f.fill !== "filled");
  const out: Bpr[] = [];
  for (const b of bulls) {
    for (const s of bears) {
      const top = Math.min(b.top, s.top);
      const bot = Math.max(b.bottom, s.bottom);
      if (top > bot) {
        out.push({
          id: `bpr-${b.id}-${s.id}`,
          top,
          bottom: bot,
          time: Math.max(b.endTime, s.endTime),
        });
      }
    }
  }
  return out.slice(-8);
}

function findLiquidity(
  candles: Candle[],
  swings: Swing[],
  atr: number,
): { pools: LiquidityPool[]; sweeps: Sweep[] } {
  const pools: LiquidityPool[] = [];
  const highs = swings.filter((s) => s.kind === "high");
  const lows = swings.filter((s) => s.kind === "low");

  for (const s of highs.slice(-18)) {
    pools.push({
      id: `bsl-${s.index}`,
      side: "BSL",
      price: s.price,
      time: s.time,
      index: s.index,
      kind: "swing",
      swept: false,
      label: "Buy-side liquidity",
    });
  }
  for (const s of lows.slice(-18)) {
    pools.push({
      id: `ssl-${s.index}`,
      side: "SSL",
      price: s.price,
      time: s.time,
      index: s.index,
      kind: "swing",
      swept: false,
      label: "Sell-side liquidity",
    });
  }

  const eqTol = atr * 0.22;
  markEquals(highs, "BSL", "Equal highs", eqTol, pools);
  markEquals(lows, "SSL", "Equal lows", eqTol, pools);

  const sweeps: Sweep[] = [];
  for (const pool of pools) {
    for (let i = pool.index + 2; i < candles.length; i++) {
      const c = candles[i]!;
      if (pool.side === "BSL" && c.high > pool.price + atr * 0.05) {
        pool.swept = true;
        pool.sweptAt = c.time;
        const reversed = c.close < pool.price;
        sweeps.push({
          time: c.time,
          index: i,
          side: "BSL",
          poolPrice: pool.price,
          wickPrice: c.high,
          reversed,
        });
        break;
      }
      if (pool.side === "SSL" && c.low < pool.price - atr * 0.05) {
        pool.swept = true;
        pool.sweptAt = c.time;
        const reversed = c.close > pool.price;
        sweeps.push({
          time: c.time,
          index: i,
          side: "SSL",
          poolPrice: pool.price,
          wickPrice: c.low,
          reversed,
        });
        break;
      }
    }
  }
  return { pools, sweeps };
}

function markEquals(
  swings: Swing[],
  side: "BSL" | "SSL",
  label: string,
  tol: number,
  pools: LiquidityPool[],
) {
  for (let i = 1; i < swings.length; i++) {
    const a = swings[i - 1]!;
    const b = swings[i]!;
    if (Math.abs(a.price - b.price) <= tol) {
      pools.push({
        id: `eq-${side}-${b.index}`,
        side,
        price: (a.price + b.price) / 2,
        time: b.time,
        index: b.index,
        kind: "equal",
        swept: false,
        label,
      });
    }
  }
}

function buildDealingRange(swings: Swing[], price: number): DealingRange | null {
  const highs = swings.filter((s) => s.kind === "high");
  const lows = swings.filter((s) => s.kind === "low");
  if (!highs.length || !lows.length) return null;
  const recent = swings.slice(-10);
  const hi = Math.max(...recent.filter((s) => s.kind === "high").map((s) => s.price), highs[highs.length - 1]!.price);
  const lo = Math.min(...recent.filter((s) => s.kind === "low").map((s) => s.price), lows[lows.length - 1]!.price);
  if (!(hi > lo)) return null;
  const range = hi - lo;
  const eq = (hi + lo) / 2;
  const pctFromLow = (price - lo) / range;
  let position: DealingRange["position"] = "equilibrium";
  if (pctFromLow >= 0.55) position = "premium";
  else if (pctFromLow <= 0.45) position = "discount";
  return {
    high: hi,
    low: lo,
    eq,
    range,
    oteBuy: { top: hi - 0.62 * range, bottom: hi - 0.79 * range },
    oteSell: { top: lo + 0.79 * range, bottom: lo + 0.62 * range },
    position,
    pctFromLow,
  };
}

function swingK(tf: Timeframe): number {
  if (tf === "5m") return 4;
  if (tf === "15m") return 3;
  if (tf === "1h") return 3;
  return 2;
}

export function analyzeFrame(tf: Timeframe, candles: Candle[]): FrameAnalysis {
  const atr = calcAtr(candles);
  const swings = findSwings(candles, swingK(tf));
  const { events, trend } = readStructure(swings);
  const fvgs = findFvgs(candles, atr);
  const blocks = findOrderBlocks(candles, atr);
  const { pools, sweeps } = findLiquidity(candles, swings, atr);
  const dealing = buildDealingRange(swings, candles.length ? last(candles).close : 0);
  return {
    tf,
    candles,
    swings,
    structure: events,
    trend,
    fvgs,
    blocks,
    liquidity: pools,
    sweeps,
    dealing,
    bprs: findBprs(fvgs),
    atr,
  };
}

function dayKey(p: { year: number; month: number; day: number }): string {
  return `${p.year}-${p.month}-${p.day}`;
}

function prevDayKey(p: { year: number; month: number; day: number }): string {
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day));
  d.setUTCDate(d.getUTCDate() - 1);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function asianSessionKey(p: { year: number; month: number; day: number; minutes: number }): string {
  return p.minutes >= 20 * 60 ? dayKey(p) : prevDayKey(p);
}

function extremes(cs: Candle[]): { high: number; low: number; open: number; close: number } | null {
  if (!cs.length) return null;
  return {
    high: Math.max(...cs.map((c) => c.high)),
    low: Math.min(...cs.map((c) => c.low)),
    open: cs[0]!.open,
    close: last(cs).close,
  };
}

function asianRange(intraday: Candle[], now = Date.now()): { high: number; low: number; mid: number } | null {
  const ny = getNyParts(new Date(now));
  const current = asianSessionKey(ny);
  const bars = intraday.filter((c) => {
    const p = getNyParts(new Date(c.time));
    const asianHour = p.minutes >= 20 * 60 || p.minutes < 120;
    return asianHour && asianSessionKey(p) === current;
  });
  if (bars.length < 3) return null;
  const high = Math.max(...bars.map((c) => c.high));
  const low = Math.min(...bars.map((c) => c.low));
  return { high, low, mid: (high + low) / 2 };
}

function detectJudas(
  asian: { high: number; low: number } | null,
  intraday: Candle[],
): IctReport["judas"] {
  if (!asian) return { detected: false, side: null, detail: "Asian range not fully printed." };
  const london = intraday.filter((c) => {
    const m = candleNyMinutes(c.time);
    const p = getNyParts(new Date(c.time));
    const now = getNyParts();
    return (
      p.year === now.year &&
      p.month === now.month &&
      p.day === now.day &&
      m >= 120 &&
      m < 300
    );
  });
  if (!london.length) {
    return { detected: false, side: null, detail: "London window has not printed yet." };
  }
  const hi = Math.max(...london.map((c) => c.high));
  const lo = Math.min(...london.map((c) => c.low));
  const lastPx = last(london).close;
  if (lo < asian.low && lastPx > asian.low) {
    return {
      detected: true,
      side: "low",
      detail: `London ran the Asian low (${asian.low.toFixed(5)}) and reclaimed — classic bullish Judas.`,
    };
  }
  if (hi > asian.high && lastPx < asian.high) {
    return {
      detected: true,
      side: "high",
      detail: `London ran the Asian high (${asian.high.toFixed(5)}) and failed back inside — classic bearish Judas.`,
    };
  }
  if (lo < asian.low) {
    return {
      detected: true,
      side: "low",
      detail: "Asian low has been taken. Waiting to see if delivery reverses (Judas) or continues lower.",
    };
  }
  if (hi > asian.high) {
    return {
      detected: true,
      side: "high",
      detail: "Asian high has been taken. Waiting to see if delivery reverses (Judas) or continues higher.",
    };
  }
  return {
    detected: false,
    side: null,
    detail: "London has not raided the Asian range yet — still inside the overnight box.",
  };
}

function detectSmt(eur: Candle[], gbp: Candle[]): IctReport["smt"] {
  if (eur.length < 30 || gbp.length < 30) {
    return { bias: "RANGE", present: false, detail: "Not enough correlated tape for SMT." };
  }
  const eSw = findSwings(eur, 2).slice(-8);
  const gSw = findSwings(gbp, 2).slice(-8);
  const eH = eSw.filter((s) => s.kind === "high");
  const gH = gSw.filter((s) => s.kind === "high");
  const eL = eSw.filter((s) => s.kind === "low");
  const gL = gSw.filter((s) => s.kind === "low");

  if (eH.length >= 2 && gH.length >= 2) {
    const eHH = eH[eH.length - 1]!.price > eH[eH.length - 2]!.price;
    const gHH = gH[gH.length - 1]!.price > gH[gH.length - 2]!.price;
    if (eHH && !gHH) {
      return {
        bias: "BEARISH",
        present: true,
        detail: "Bearish SMT: EUR printed a higher high while GBP failed to confirm — smart money divergence against the Euro.",
      };
    }
    if (!eHH && gHH) {
      return {
        bias: "BULLISH",
        present: true,
        detail: "Bullish relative SMT: GBP made the higher high, EUR lagged. If EUR reclaims, it can catch up; if not, EUR is the weaker major.",
      };
    }
  }
  if (eL.length >= 2 && gL.length >= 2) {
    const eLL = eL[eL.length - 1]!.price < eL[eL.length - 2]!.price;
    const gLL = gL[gL.length - 1]!.price < gL[gL.length - 2]!.price;
    if (eLL && !gLL) {
      return {
        bias: "BULLISH",
        present: true,
        detail: "Bullish SMT: EUR made a lower low while GBP held — sell-side divergence. Institutions often reverse the weaker print.",
      };
    }
    if (!eLL && gLL) {
      return {
        bias: "BEARISH",
        present: true,
        detail: "GBP is making the lower low. EUR relative strength — fade only if EUR then fails its own discount array.",
      };
    }
  }
  return {
    bias: "RANGE",
    present: false,
    detail: "No active SMT between EUR and GBP on the correlated swings. Both majors are confirming.",
  };
}

function locLabel(d: DealingRange | null): string {
  if (!d) return "—";
  if (d.position === "premium") return `Premium ${(d.pctFromLow * 100).toFixed(0)}%`;
  if (d.position === "discount") return `Discount ${(d.pctFromLow * 100).toFixed(0)}%`;
  return "Equilibrium";
}

function structureLabel(f: FrameAnalysis): string {
  const ev = f.structure[f.structure.length - 1];
  if (!ev) return f.trend === "RANGE" ? "Balanced" : f.trend;
  return `${ev.kind} ${ev.dir === "bull" ? "↑" : "↓"}`;
}

function liqLabel(f: FrameAnalysis): string {
  const recent = f.sweeps.slice(-3);
  if (!recent.length) {
    const unsweptB = f.liquidity.filter((l) => l.side === "BSL" && !l.swept);
    const unsweptS = f.liquidity.filter((l) => l.side === "SSL" && !l.swept);
    return `BSL ${unsweptB.length} · SSL ${unsweptS.length}`;
  }
  const s = last(recent);
  return `${s.side} ${s.reversed ? "sweep+reject" : "run"}`;
}

function nearestUnswept(
  frames: FrameAnalysis[],
  side: "BSL" | "SSL",
  price: number,
): { price: number; label: string } | null {
  const cands: { price: number; label: string; dist: number }[] = [];
  for (const f of frames) {
    for (const p of f.liquidity) {
      if (p.side !== side || p.swept) continue;
      const dist = Math.abs(p.price - price);
      if (dist < PIP * 3) continue;
      if (side === "BSL" && p.price <= price) continue;
      if (side === "SSL" && p.price >= price) continue;
      cands.push({ price: p.price, label: `${p.label} (${f.tf})`, dist });
    }
  }
  cands.sort((a, b) => a.dist - b.dist);
  return cands[0] ? { price: cands[0].price, label: cands[0].label } : null;
}

function scoreConfluence(args: {
  htf: Bias;
  ltf: Bias;
  dealing: DealingRange | null;
  judas: IctReport["judas"];
  smt: IctReport["smt"];
  sessionPhase: string;
  inKz: boolean;
  inSb: boolean;
  sweepAlign: boolean;
  mssAlign: boolean;
  arrayQuality: number;
}): Confluence {
  const structure =
    args.htf === args.ltf && args.htf !== "RANGE"
      ? args.mssAlign
        ? 88
        : 72
      : args.htf === "RANGE"
        ? 40
        : 48;
  const liquidity = args.sweepAlign ? 86 : args.judas.detected ? 70 : 42;
  const time = args.inSb ? 92 : args.inKz ? 78 : args.sessionPhase === "dead" ? 22 : 50;
  const smt = args.smt.present ? (args.smt.bias === args.htf ? 90 : 55) : 28;
  const array = clamp(args.arrayQuality, 10, 95);
  const delivery =
    (args.htf === "BULLISH" && args.dealing?.position === "discount") ||
    (args.htf === "BEARISH" && args.dealing?.position === "premium")
      ? 84
      : args.dealing?.position === "equilibrium"
        ? 46
        : 38;
  return { structure, liquidity, time, smt, array, delivery };
}

function buildSetups(args: {
  htf: Bias;
  ltfFrame: FrameAnalysis;
  m5: FrameAnalysis;
  dealing: DealingRange | null;
  judas: IctReport["judas"];
  session: ReturnType<typeof readLiveSession>;
  spot: number;
  nextDraw: Forecast["nextDraw"];
  invalidation: Forecast["invalidation"];
}): Setup[] {
  const setups: Setup[] = [];
  const { htf, ltfFrame, m5, dealing, judas, session, spot, nextDraw } = args;
  const dir: Dir | null = htf === "BULLISH" ? "bull" : htf === "BEARISH" ? "bear" : null;

  const activeFvg = ltfFrame.fvgs
    .filter((f) => f.fill !== "filled" && (dir ? f.dir === dir : true) && f.displacement)
    .slice(-3);
  const lastSweep = ltfFrame.sweeps.filter((s) => s.reversed).slice(-1)[0];
  const lastMss = ltfFrame.structure.filter((e) => e.kind === "MSS" || e.kind === "CHOCH").slice(-1)[0];

  if (dir && lastSweep && lastMss && lastMss.dir === dir) {
    const fvg = activeFvg[activeFvg.length - 1];
    setups.push({
      id: "m2022",
      model: "MODEL_2022",
      dir,
      status: fvg ? "active" : "forming",
      title: "ICT 2022 Model",
      detail: `HTF ${htf.toLowerCase()} · LTF ${lastSweep.side} sweep with rejection · ${lastMss.kind} ${lastMss.dir}. ${
        fvg
          ? `Entry array is the ${fvg.dir} FVG ${fvg.bottom.toFixed(5)}–${fvg.top.toFixed(5)} (CE ${fvg.ce.toFixed(5)}).`
          : "Waiting for a displacement FVG to print."
      }`,
      entry: fvg ? [fvg.bottom, fvg.top] : undefined,
      stop: args.invalidation.price,
      targets: [nextDraw.price],
      rr: fvg
        ? Math.abs(nextDraw.price - fvg.ce) / Math.max(PIP * 4, Math.abs(fvg.ce - args.invalidation.price))
        : undefined,
      confluence: 86,
    });
  }

  if (session.silver || (session.killzone && inWindow(getNyParts().minutes, 10 * 60, 11 * 60))) {
    const fvg = (session.silver ? m5 : ltfFrame).fvgs
      .filter((f) => f.fill !== "filled" && (!dir || f.dir === dir))
      .slice(-1)[0];
    setups.push({
      id: "sb",
      model: "SILVER_BULLET",
      dir: fvg?.dir ?? dir ?? "bull",
      status: session.silver ? (fvg ? "active" : "forming") : "forming",
      title: session.silver ? session.silver.label : "Silver Bullet (next window)",
      detail: session.silver
        ? `Inside the one-hour Silver Bullet. ${
            fvg
              ? `Trade the ${fvg.dir === "bull" ? "discount" : "premium"} FVG at ${fvg.bottom.toFixed(5)}–${fvg.top.toFixed(5)} toward ${nextDraw.label}.`
              : "Hunt the first liquidity raid + FVG in the HTF direction. Do not chase the displacement candle."
          }`
        : `Next Silver Bullet is ${session.next.label}. Prepare the draw on liquidity first.`,
      entry: fvg ? [fvg.bottom, fvg.top] : undefined,
      stop: args.invalidation.price,
      targets: [nextDraw.price],
      confluence: session.silver ? 80 : 55,
    });
  }

  if (judas.detected) {
    const jdir: Dir = judas.side === "low" ? "bull" : "bear";
    setups.push({
      id: "judas",
      model: "JUDAS",
      dir: jdir,
      status: "triggered",
      title: "Judas Swing",
      detail: judas.detail,
      targets: [nextDraw.price],
      confluence: 74,
    });
  }

  if (dealing && dir) {
    const zone = dir === "bull" ? dealing.oteBuy : dealing.oteSell;
    const inside = spot <= zone.top && spot >= zone.bottom;
    setups.push({
      id: "ote",
      model: "OTE",
      dir,
      status: inside ? "active" : dealing.position === (dir === "bull" ? "discount" : "premium") ? "forming" : "invalid",
      title: "Optimal Trade Entry (62–79)",
      detail: inside
        ? `Price is inside the OTE pocket ${zone.bottom.toFixed(5)}–${zone.top.toFixed(5)}. This is the institutional retracement window.`
        : `OTE pocket sits at ${zone.bottom.toFixed(5)}–${zone.top.toFixed(5)}. Wait for the retracement — do not buy premium / sell discount.`,
      entry: [zone.bottom, zone.top],
      stop: dir === "bull" ? dealing.low : dealing.high,
      targets: [dir === "bull" ? dealing.high : dealing.low, nextDraw.price],
      confluence: inside ? 77 : 48,
    });
  }

  setups.push({
    id: "amd",
    model: "AMD",
    dir: dir ?? "bull",
    status: session.phase === "dead" ? "forming" : "active",
    title: "Power of Three (AMD)",
    detail: `${session.phaseLabel}. Accumulation builds the range, manipulation raids it, distribution delivers to external liquidity (${nextDraw.label}).`,
    confluence: session.phase === "distribution" ? 70 : session.phase === "manipulation" ? 66 : 44,
  });

  const unicorn = ltfFrame.bprs[0];
  const breaker = ltfFrame.blocks.find((b) => b.kind === "BREAKER" && !b.mitigated);
  if (unicorn || breaker) {
    const top = unicorn?.top ?? breaker!.top;
    const bot = unicorn?.bottom ?? breaker!.bottom;
    setups.push({
      id: "uni",
      model: "UNICORN",
      dir: breaker?.dir ?? (htf === "BEARISH" ? "bear" : "bull"),
      status: "active",
      title: unicorn ? "Unicorn / BPR" : "Breaker block",
      detail: unicorn
        ? `Balanced Price Range (overlapping FVGs) at ${bot.toFixed(5)}–${top.toFixed(5)} — high-quality magnet then continuation.`
        : `Breaker at ${bot.toFixed(5)}–${top.toFixed(5)} after a failed order block. Trade the retest in the new direction.`,
      entry: [bot, top],
      confluence: 73,
    });
  }

  if (activeFvg.length && !setups.some((s) => s.model === "MODEL_2022")) {
    const f = last(activeFvg);
    setups.push({
      id: "fvg",
      model: "FVG_ENTRY",
      dir: f.dir,
      status: f.fill === "unfilled" ? "active" : "forming",
      title: "Displacement FVG",
      detail: `${f.dir === "bull" ? "Bullish" : "Bearish"} imbalance. Consequent encroachment (50%) at ${f.ce.toFixed(5)}.`,
      entry: [f.bottom, f.top],
      confluence: 62,
    });
  }

  return setups.sort((a, b) => b.confluence - a.confluence);
}

function decideBias(weekly: Bias, daily: Bias, h4: Bias, smt: IctReport["smt"], dealing: DealingRange | null): {
  htf: Bias;
  confidenceAdj: number;
} {
  const votes = [weekly, daily, h4];
  const bulls = votes.filter((v) => v === "BULLISH").length;
  const bears = votes.filter((v) => v === "BEARISH").length;
  let htf: Bias = "RANGE";
  if (bulls >= 2 && bulls > bears) htf = "BULLISH";
  else if (bears >= 2 && bears > bulls) htf = "BEARISH";
  else htf = daily === "RANGE" ? h4 : daily;

  let adj = 0;
  if (weekly === daily && daily !== "RANGE") adj += 8;
  if (smt.present && smt.bias === htf) adj += 6;
  if (smt.present && smt.bias !== "RANGE" && smt.bias !== htf) adj -= 8;
  if (htf === "BULLISH" && dealing?.position === "premium") adj -= 6;
  if (htf === "BEARISH" && dealing?.position === "discount") adj -= 6;
  if (htf === "BULLISH" && dealing?.position === "discount") adj += 6;
  if (htf === "BEARISH" && dealing?.position === "premium") adj += 6;
  return { htf, confidenceAdj: adj };
}

export function analyzeIct(tape: Tape, now = Date.now()): IctReport {
  const frames = Object.fromEntries(
    TIMEFRAMES.map((tf) => [tf, analyzeFrame(tf, tape.frames[tf] ?? [])]),
  ) as Record<Timeframe, FrameAnalysis>;

  const daily = tape.frames["1d"] ?? [];
  const weekly = tape.frames["1w"] ?? [];
  const h1 = tape.frames["1h"] ?? [];
  const m15 = tape.frames["15m"] ?? [];
  const m5 = tape.frames["5m"] ?? [];

  const thisWeek = extremes(weekly.slice(-1));
  const prevDay = extremes(daily.slice(-2, -1));
  const today = extremes(daily.slice(-1));
  const prevWeek = extremes(weekly.slice(-2, -1));
  const thisMonth = (() => {
    const ny = getNyParts(new Date(now));
    const monthBars = daily.filter((c) => {
      const p = getNyParts(new Date(c.time));
      return p.year === ny.year && p.month === ny.month;
    });
    return extremes(monthBars);
  })();
  const prevMonth = (() => {
    const ny = getNyParts(new Date(now));
    const prev = ny.month === 1 ? { year: ny.year - 1, month: 12 } : { year: ny.year, month: ny.month - 1 };
    const bars = daily.filter((c) => {
      const p = getNyParts(new Date(c.time));
      return p.year === prev.year && p.month === prev.month;
    });
    return extremes(bars);
  })();

  const weeklyOpen = thisWeek?.open ?? weekly[weekly.length - 1]?.open ?? null;
  const dailyOpen = today?.open ?? null;
  const pdh = prevDay?.high ?? null;
  const pdl = prevDay?.low ?? null;
  const pdc = prevDay?.close ?? null;
  const pwh = prevWeek?.high ?? null;
  const pwl = prevWeek?.low ?? null;
  const pmh = prevMonth?.high ?? null;
  const pml = prevMonth?.low ?? null;

  const asian = asianRange(m15.length ? m15 : m5, now);
  const judas = detectJudas(asian, m15.length ? m15 : m5);
  const smt = detectSmt(h1, tape.gbp["1h"]);
  const session = readLiveSession(new Date(now));

  const { htf, confidenceAdj } = decideBias(
    frames["1w"].trend,
    frames["1d"].trend,
    frames["4h"].trend,
    smt,
    frames["4h"].dealing ?? frames["1d"].dealing,
  );
  const ltf = frames["15m"].trend === "RANGE" ? frames["1h"].trend : frames["15m"].trend;
  const dealing = frames["4h"].dealing ?? frames["1h"].dealing ?? frames["1d"].dealing;
  const spot = tape.spot;

  const drawSide: "BSL" | "SSL" = htf === "BEARISH" ? "SSL" : "BSL";
  const keyLevels: LiquidityPool[] = [];
  if (pdh)
    keyLevels.push({
      id: "pdh",
      side: "BSL",
      price: pdh,
      time: 0,
      index: 0,
      kind: "pdh",
      swept: spot > pdh,
      label: "Previous day high",
    });
  if (pdl)
    keyLevels.push({
      id: "pdl",
      side: "SSL",
      price: pdl,
      time: 0,
      index: 0,
      kind: "pdl",
      swept: spot < pdl,
      label: "Previous day low",
    });
  if (pwh)
    keyLevels.push({
      id: "pwh",
      side: "BSL",
      price: pwh,
      time: 0,
      index: 0,
      kind: "pwh",
      swept: spot > pwh,
      label: "Previous week high",
    });
  if (pwl)
    keyLevels.push({
      id: "pwl",
      side: "SSL",
      price: pwl,
      time: 0,
      index: 0,
      kind: "pwl",
      swept: spot < pwl,
      label: "Previous week low",
    });

  const extraFrame: FrameAnalysis = {
    ...frames["1d"],
    liquidity: [...frames["1d"].liquidity, ...keyLevels],
  };

  const next =
    nearestUnswept([extraFrame, frames["4h"], frames["1h"], frames["15m"]], drawSide, spot) ??
    (drawSide === "BSL"
      ? { price: pdh ?? spot + 40 * PIP, label: "Next buy-side pool" }
      : { price: pdl ?? spot - 40 * PIP, label: "Next sell-side pool" });

  const lastMss = [...frames["15m"].structure, ...frames["1h"].structure]
    .filter((e) => e.kind === "MSS" || e.kind === "CHOCH")
    .slice(-1)[0];

  const invalidation = (() => {
    if (htf === "BULLISH") {
      const lows = [...frames["1h"].swings, ...frames["15m"].swings]
        .filter((s) => s.kind === "low" && s.price < spot - 6 * PIP)
        .slice(-8);
      const swing = lows.length
        ? lows.slice(-3).sort((a, b) => a.price - b.price)[0]
        : undefined;
      return {
        price: swing?.price ?? pdl ?? spot - Math.max(18 * PIP, frames["1h"].atr * 1.4),
        reason: "A close back below the protected swing / MSS low negates the long delivery model.",
      };
    }
    if (htf === "BEARISH") {
      const highs = [...frames["1h"].swings, ...frames["15m"].swings]
        .filter((s) => s.kind === "high" && s.price > spot + 6 * PIP)
        .slice(-8);
      const swing = highs.length
        ? highs.slice(-3).sort((a, b) => b.price - a.price)[0]
        : undefined;
      return {
        price: swing?.price ?? pdh ?? spot + Math.max(18 * PIP, frames["1h"].atr * 1.4),
        reason: "A close back above the protected swing / MSS high negates the short delivery model.",
      };
    }
    return {
      price: dealing?.eq ?? spot,
      reason: "Range conditions — fade only at extremes. Mid-range is not a thesis.",
    };
  })();

  const entries: Forecast["entries"] = [];
  const fvg = frames["15m"].fvgs.filter((f) => f.fill !== "filled" && (htf === "RANGE" || (htf === "BULLISH" ? f.dir === "bull" : f.dir === "bear"))).slice(-2);
  for (const f of fvg) {
    entries.push({ label: `${f.dir === "bull" ? "Bullish" : "Bearish"} FVG · CE ${f.ce.toFixed(5)}`, zone: [f.bottom, f.top], tf: "15m" });
  }
  const ob = frames["1h"].blocks.filter((b) => !b.mitigated && (htf === "RANGE" || (htf === "BULLISH" ? b.dir === "bull" : b.dir === "bear"))).slice(-1)[0];
  if (ob) entries.push({ label: `${ob.kind} ${ob.dir}`, zone: [ob.bottom, ob.top], tf: "1h" });
  if (dealing && htf === "BULLISH") entries.push({ label: "4H OTE (62–79)", zone: [dealing.oteBuy.bottom, dealing.oteBuy.top], tf: "4h" });
  if (dealing && htf === "BEARISH") entries.push({ label: "4H OTE (62–79)", zone: [dealing.oteSell.bottom, dealing.oteSell.top], tf: "4h" });

  const targets: Forecast["targets"] = [{ price: next.price, label: next.label }];
  if (pdh && htf !== "BEARISH") targets.push({ price: pdh, label: "PDH" });
  if (pdl && htf !== "BULLISH") targets.push({ price: pdl, label: "PDL" });
  if (pwh && htf === "BULLISH") targets.push({ price: pwh, label: "PWH" });
  if (pwl && htf === "BEARISH") targets.push({ price: pwl, label: "PWL" });
  if (asian) {
    targets.push({ price: asian.high, label: "Asian high" });
    targets.push({ price: asian.low, label: "Asian low" });
  }

  const sweepAlign =
    (htf === "BULLISH" && frames["15m"].sweeps.slice(-4).some((s) => s.side === "SSL" && s.reversed)) ||
    (htf === "BEARISH" && frames["15m"].sweeps.slice(-4).some((s) => s.side === "BSL" && s.reversed));
  const mssAlign = lastMss ? (lastMss.dir === "bull" && htf === "BULLISH") || (lastMss.dir === "bear" && htf === "BEARISH") : false;

  const arrayQuality = Math.min(
    95,
    30 +
      fvg.length * 18 +
      (ob ? 16 : 0) +
      (frames["15m"].bprs.length ? 12 : 0) +
      (dealing && ((htf === "BULLISH" && dealing.position === "discount") || (htf === "BEARISH" && dealing.position === "premium")) ? 14 : 0),
  );

  const confluence = scoreConfluence({
    htf,
    ltf,
    dealing,
    judas,
    smt,
    sessionPhase: session.phase,
    inKz: Boolean(session.killzone && session.killzone.kind === "killzone"),
    inSb: Boolean(session.silver),
    sweepAlign,
    mssAlign,
    arrayQuality,
  });

  const avg =
    (confluence.structure +
      confluence.liquidity +
      confluence.time +
      confluence.smt +
      confluence.array +
      confluence.delivery) /
    6;
  const confidence = clamp(Math.round(avg + confidenceAdj), 12, 91);

  const path =
    htf === "BULLISH"
      ? dealing?.position === "premium"
        ? `Bullish weekly/daily book, but price is dealing in premium. Expect a retracement into discount arrays (FVG / OB / OTE) before the algorithm seeks ${next.label} at ${next.price.toFixed(5)}.`
        : `Bullish delivery is in gear from discount. Expansion toward ${next.label} at ${next.price.toFixed(5)} is the path of least resistance. Pullbacks into unfilled bullish FVGs are continuation, not reversal.`
      : htf === "BEARISH"
        ? dealing?.position === "discount"
          ? `Bearish book, but price is already in discount. Wait for a premium retracement (OTE / bearish FVG) before looking short toward ${next.label} at ${next.price.toFixed(5)}.`
          : `Bearish delivery from premium. The algorithm should continue to seek ${next.label} at ${next.price.toFixed(5)}. Rallies into bearish FVGs are sells.`
        : `No clean HTF agreement. Trade only range extremes (PDH/PDL / Asian box) and stand down in the middle.`;

  const scenarios: Forecast["scenarios"] =
    htf === "RANGE"
      ? [
          { name: "Range fade", prob: 48, text: "Fade PDH/PDL and the Asian extremes. Mid-range is noise." },
          { name: "Break and go", prob: 32, text: "A displacement close through PDH or PDL with FVG is the first real bias of the day." },
          { name: "Stand down", prob: 20, text: "If both London and NY fail to raid liquidity, do nothing." },
        ]
      : htf === "BULLISH"
        ? [
            {
              name: "Primary · continuation",
              prob: confidence,
              text: `Hold the long model while price respects ${invalidation.price.toFixed(5)}. Draw remains ${next.label}.`,
            },
            {
              name: "Alternate · deeper discount",
              prob: clamp(100 - confidence - 10, 10, 45),
              text: "If the first FVG fails, allow a deeper raid of SSL into the 1H/4H order block before giving up the bid.",
            },
            {
              name: "Invalid",
              prob: clamp(100 - confidence - 20, 8, 30),
              text: `A 15m close below ${invalidation.price.toFixed(5)} flips the book. Then the draw becomes sell-side.`,
            },
          ]
        : [
            {
              name: "Primary · continuation",
              prob: confidence,
              text: `Hold the short model while ${invalidation.price.toFixed(5)} holds. Draw remains ${next.label}.`,
            },
            {
              name: "Alternate · higher premium",
              prob: clamp(100 - confidence - 10, 10, 45),
              text: "A stop-run above a minor high that reclaims the FVG is still a sell. Only the MSS high invalidates.",
            },
            {
              name: "Invalid",
              prob: clamp(100 - confidence - 20, 8, 30),
              text: `A 15m close above ${invalidation.price.toFixed(5)} ends the short model.`,
            },
          ];

  const forecast: Forecast = {
    htfBias: htf,
    ltfBias: ltf,
    confidence,
    nextDraw: { ...next, side: drawSide },
    path,
    invalidation,
    entries,
    targets: uniqueTargets(targets),
    horizon: session.silver
      ? "This Silver Bullet hour"
      : session.killzone
        ? "Rest of the active killzone"
        : "Next London / New York killzone",
    scenarios,
  };

  const setups = buildSetups({
    htf,
    ltfFrame: frames["15m"],
    m5: frames["5m"],
    dealing,
    judas,
    session,
    spot,
    nextDraw: forecast.nextDraw,
    invalidation,
  });

  const mtf: MtfRow[] = TIMEFRAMES.map((tf) => ({
    tf,
    bias: frames[tf].trend,
    structure: structureLabel(frames[tf]),
    location: locLabel(frames[tf].dealing),
    liquidity: liqLabel(frames[tf]),
  }));

  const amd = {
    phase: session.phaseLabel,
    detail:
      session.phase === "accumulation"
        ? "Let the Asian box print. Do not invent a bias from the overnight grind."
        : session.phase === "manipulation"
          ? "London is engineered to raid the obvious high/low. The first run is often the Judas — wait for the shift."
          : session.phase === "distribution"
            ? "New York delivers the daily objective. Trade with the HTF draw, not against the displacement."
            : "Outside killzones the algorithm is quiet. Setups here have a much lower hit-rate.",
  };

  const base: Omit<IctReport, "narrative" | "bullets"> = {
    analyzedAt: now,
    frames,
    mtf,
    weeklyOpen,
    dailyOpen,
    pdh,
    pdl,
    pdc,
    pwh,
    pwl,
    pmh,
    pml,
    asian,
    judas,
    amd,
    smt,
    setups,
    forecast,
    confluence,
  };

  const { narrative, bullets } = buildNarrative({
    tape,
    report: base,
    session,
  });

  return { ...base, narrative, bullets };
}

function uniqueTargets(targets: Forecast["targets"]): Forecast["targets"] {
  const seen = new Set<string>();
  const out: Forecast["targets"] = [];
  for (const t of targets) {
    const key = t.price.toFixed(5);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.slice(0, 6);
}

export { calcAtr, findSwings };
