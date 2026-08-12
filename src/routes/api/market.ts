import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { Candle, Tape, Timeframe } from "@/lib/market/types";
import { PIP, TIMEFRAMES } from "@/lib/market/types";

const YAHOO_TF: Record<Timeframe, { interval: string; range: string }> = {
  "5m": { interval: "5m", range: "5d" },
  "15m": { interval: "15m", range: "10d" },
  "1h": { interval: "60m", range: "3mo" },
  "4h": { interval: "60m", range: "6mo" },
  "1d": { interval: "1d", range: "2y" },
  "1w": { interval: "1wk", range: "5y" },
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function yahooChart(symbol: string, interval: string, range: string): Promise<Candle[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`yahoo ${res.status}`);
  const json = (await res.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: { quote?: Array<{ open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[]; volume?: (number | null)[] }> };
      }>;
    };
  };
  const r = json.chart?.result?.[0];
  const ts = r?.timestamp ?? [];
  const q = r?.indicators?.quote?.[0];
  if (!ts.length || !q) throw new Error("yahoo empty");
  const out: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const open = q.open?.[i];
    const high = q.high?.[i];
    const low = q.low?.[i];
    const close = q.close?.[i];
    if (open == null || high == null || low == null || close == null) continue;
    out.push({
      time: ts[i]! * 1000,
      open,
      high,
      low,
      close,
      volume: q.volume?.[i] ?? 0,
    });
  }
  return out;
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

async function fetchYahooTape(): Promise<Tape> {
  const frames = {} as Record<Timeframe, Candle[]>;
  await Promise.all(
    TIMEFRAMES.map(async (tf) => {
      const spec = YAHOO_TF[tf];
      const raw = await yahooChart("EURUSD=X", spec.interval, spec.range);
      frames[tf] = tf === "4h" ? aggregate(raw, 4 * 60 * 60 * 1000) : raw;
    }),
  );
  const [gbpH, gbpD] = await Promise.all([
    yahooChart("GBPUSD=X", "60m", "3mo"),
    yahooChart("GBPUSD=X", "1d", "2y"),
  ]);
  const d = frames["1d"];
  const lastD = d[d.length - 1]!;
  const prev = d[d.length - 2] ?? lastD;
  const spot = (frames["5m"].at(-1) ?? lastD).close;
  return {
    pair: "EURUSD",
    source: "yahoo",
    sourceLabel: "FX spot · Yahoo EURUSD=X",
    fetchedAt: Date.now(),
    spot,
    prevClose: prev.close,
    changePips: (spot - prev.close) / PIP,
    frames,
    gbp: { "1h": gbpH, "1d": gbpD },
  };
}

export const Route = createFileRoute("/api/market")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const tape = await fetchYahooTape();
          return Response.json(tape, {
            headers: { "Cache-Control": "public, max-age=20" },
          });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "feed unavailable" },
            { status: 502 },
          );
        }
      },
    },
  },
});
