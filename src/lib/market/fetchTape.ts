import {
  type Candle,
  type Tape,
  type TapeSource,
  type Timeframe,
  TIMEFRAMES,
  PIP,
} from "./types";
import { getNyParts } from "./sessions";

const BINANCE_HOSTS = [
  "https://api.binance.com",
  "https://data-api.binance.vision",
  "https://api.binance.us",
];

const BINANCE_TF: Record<Timeframe, string> = {
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1d",
  "1w": "1w",
};

const OKX_TF: Record<Timeframe, string> = {
  "5m": "5m",
  "15m": "15m",
  "1h": "1H",
  "4h": "4H",
  "1d": "1D",
  "1w": "1W",
};

async function fetchJson(url: string, ms = 9000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function clean(rows: Candle[]): Candle[] {
  return rows
    .filter(
      (c) =>
        Number.isFinite(c.open) &&
        Number.isFinite(c.high) &&
        Number.isFinite(c.low) &&
        Number.isFinite(c.close) &&
        c.high >= c.low,
    )
    .sort((a, b) => a.time - b.time);
}

function parseBinance(raw: unknown): Candle[] {
  if (!Array.isArray(raw)) return [];
  return clean(
    raw.map((r) => {
      const row = r as Array<number | string>;
      return {
        time: Number(row[0]),
        open: Number(row[1]),
        high: Number(row[2]),
        low: Number(row[3]),
        close: Number(row[4]),
        volume: Number(row[5] ?? 0),
      };
    }),
  );
}

function parseOkx(raw: unknown): Candle[] {
  const payload = raw as { data?: string[][] };
  if (!payload?.data) return [];
  return clean(
    payload.data.map((row) => ({
      time: Number(row[0]),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5] ?? 0),
    })),
  );
}

async function fetchBinanceSymbol(
  symbol: string,
  tf: Timeframe,
  limit = 500,
): Promise<Candle[]> {
  let lastErr: unknown;
  for (const host of BINANCE_HOSTS) {
    try {
      const url = `${host}/api/v3/klines?symbol=${symbol}&interval=${BINANCE_TF[tf]}&limit=${limit}`;
      const json = await fetchJson(url);
      const candles = parseBinance(json);
      if (candles.length > 20) return candles;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("binance failed");
}

async function fetchOkx(instId: string, tf: Timeframe, limit = 300): Promise<Candle[]> {
  const url = `https://www.okx.com/api/v5/market/candles?instId=${instId}&bar=${OKX_TF[tf]}&limit=${limit}`;
  const candles = parseOkx(await fetchJson(url));
  if (candles.length < 20) throw new Error("okx empty");
  return candles;
}

async function fetchAllFrames(
  get: (tf: Timeframe) => Promise<Candle[]>,
): Promise<Record<Timeframe, Candle[]>> {
  const entries = await Promise.all(
    TIMEFRAMES.map(async (tf) => [tf, await get(tf)] as const),
  );
  return Object.fromEntries(entries) as Record<Timeframe, Candle[]>;
}

function buildTape(
  source: TapeSource,
  sourceLabel: string,
  frames: Record<Timeframe, Candle[]>,
  gbp: Tape["gbp"],
): Tape {
  const d = frames["1d"];
  const lastD = d[d.length - 1]!;
  const prev = d[d.length - 2] ?? lastD;
  const intraday = frames["5m"];
  const spot = (intraday[intraday.length - 1] ?? lastD).close;
  const prevClose = prev.close;
  return {
    pair: "EURUSD",
    source,
    sourceLabel,
    fetchedAt: Date.now(),
    spot,
    prevClose,
    changePips: (spot - prevClose) / PIP,
    frames,
    gbp,
  };
}

async function tryYahooViaApi(): Promise<Tape | null> {
  try {
    const res = await fetch("/api/market", { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const json = (await res.json()) as Tape | { error?: string };
    if ("frames" in json && json.frames?.["15m"]?.length) return json as Tape;
    return null;
  } catch {
    return null;
  }
}

export async function loadTape(): Promise<Tape> {
  const yahoo = await tryYahooViaApi();
  if (yahoo) return yahoo;

  try {
    const [frames, gbpH, gbpD] = await Promise.all([
      fetchAllFrames((tf) => fetchBinanceSymbol("EURUSDT", tf, tf === "5m" ? 800 : 500)),
      fetchBinanceSymbol("GBPUSDT", "1h", 300),
      fetchBinanceSymbol("GBPUSDT", "1d", 260),
    ]);
    return buildTape(
      "binance",
      "EURUSDT global tape · tracks spot EUR/USD",
      frames,
      { "1h": gbpH, "1d": gbpD },
    );
  } catch {
    /* next venue */
  }

  try {
    const [frames, gbpH, gbpD] = await Promise.all([
      fetchAllFrames((tf) => fetchOkx("EUR-USDT", tf)),
      fetchOkx("GBP-USDT", "1h"),
      fetchOkx("GBP-USDT", "1d"),
    ]);
    return buildTape("okx", "OKX EUR-USDT tape · FX-linked Euro", frames, {
      "1h": gbpH,
      "1d": gbpD,
    });
  } catch {
    /* demo */
  }

  return buildDemoTape();
}

/* -------------------------------------------------------------------------- */
/*  Seeded demo tape — used only when every live venue is unreachable.        */
/*  Builds ICT-shaped delivery (Asian range → London Judas → NY expansion).   */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function aggregate(candles: Candle[], ms: number): Candle[] {
  const out: Candle[] = [];
  let bucket: Candle | null = null;
  let start = -1;
  for (const c of candles) {
    const s = Math.floor(c.time / ms) * ms;
    if (!bucket || s !== start) {
      if (bucket) out.push(bucket);
      bucket = { ...c, time: s };
      start = s;
    } else {
      bucket.high = Math.max(bucket.high, c.high);
      bucket.low = Math.min(bucket.low, c.low);
      bucket.close = c.close;
      bucket.volume += c.volume;
    }
  }
  if (bucket) out.push(bucket);
  return out;
}

export function buildDemoTape(now = Date.now()): Tape {
  const daySeed = Math.floor(now / 86_400_000);
  const rand = mulberry32(daySeed * 97 + 11);
  const step = 5 * 60_000;
  const days = 18;
  const start = now - days * 86_400_000;
  const aligned = Math.floor(start / step) * step;

    let price = 1.1624;
    const anchor = 1.1624;
    const raw: Candle[] = [];

    for (let t = aligned; t <= now; t += step) {
    const ny = getNyParts(new Date(t));
    if (ny.weekday === "Sat") continue;
    if (ny.weekday === "Sun" && ny.minutes < 17 * 60) continue;
    if (ny.weekday === "Fri" && ny.minutes >= 17 * 60) continue;

    const dayNum = Math.floor(t / 86_400_000);
    const dayBias = dayNum % 5 === 2 ? -1 : 1;
    const m = ny.minutes;
    let vol = 0.00009;
    let drift = 0;

    if (m >= 20 * 60 || m < 120) {
      vol = 0.00007;
      drift = ((m % 40) - 20) * 0.0000015;
    } else if (m >= 120 && m < 175) {
      vol = 0.00022;
      drift = -dayBias * 0.00028;
    } else if (m >= 175 && m < 300) {
      vol = 0.0002;
      drift = dayBias * 0.00022;
    } else if (m >= 420 && m < 660) {
      vol = 0.00018;
      drift = dayBias * 0.00016;
    } else if (m >= 840 && m < 960) {
      vol = 0.00016;
      drift = dayBias * 0.0001;
    }

    if (rand() < 0.035) {
      drift += (rand() > 0.45 ? 1 : -1) * dayBias * 0.00045;
      vol *= 1.8;
    }

    const open = price;
    const revert = (anchor - price) * 0.045;
    const shock = (rand() - 0.48) * vol + drift + revert;
    let close = open + shock;
    const wick = vol * (0.35 + rand() * 1.4);
    let high = Math.max(open, close) + wick * rand();
    let low = Math.min(open, close) - wick * rand();
    if (m >= 120 && m < 175 && dayBias > 0) {
      low = Math.min(low, open - 0.00055 - rand() * 0.00025);
    }
    if (m >= 120 && m < 175 && dayBias < 0) {
      high = Math.max(high, open + 0.00055 + rand() * 0.00025);
    }
    close = Math.min(high, Math.max(low, close));
    raw.push({
      time: t,
      open,
      high,
      low,
      close,
      volume: 40 + rand() * 220,
    });
    price = close;
  }

  const frames: Record<Timeframe, Candle[]> = {
    "5m": raw.slice(-900),
    "15m": aggregate(raw, 15 * 60_000).slice(-500),
    "1h": aggregate(raw, 60 * 60_000).slice(-400),
    "4h": aggregate(raw, 4 * 60 * 60_000).slice(-300),
    "1d": aggregate(raw, 24 * 60 * 60_000).slice(-200),
    "1w": aggregate(raw, 7 * 24 * 60 * 60_000).slice(-80),
  };

  const gbpShift = 0.184;
  const mapGbp = (cs: Candle[]) =>
    cs.map((c) => ({
      ...c,
      open: c.open + gbpShift + (c.time % 7) * 0.00001,
      high: c.high + gbpShift + 0.00008,
      low: c.low + gbpShift - 0.00008,
      close: c.close + gbpShift,
    }));

  return buildTape("demo", "DEMO TAPE · live venues unreachable", frames, {
    "1h": mapGbp(frames["1h"]),
    "1d": mapGbp(frames["1d"]),
  });
}
