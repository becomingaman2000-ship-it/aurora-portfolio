export const TIMEFRAMES = ["5m", "15m", "1h", "4h", "1d", "1w"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type TapeSource = "yahoo" | "binance" | "okx" | "ecb" | "demo";

export type Tape = {
  pair: "EURUSD";
  source: TapeSource;
  sourceLabel: string;
  fetchedAt: number;
  spot: number;
  prevClose: number;
  changePips: number;
  frames: Record<Timeframe, Candle[]>;
  gbp: { "1h": Candle[]; "1d": Candle[] };
};

export const PIP = 0.0001;

export function pips(delta: number): number {
  return delta / PIP;
}

export function formatPrice(n: number, digits = 5): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function formatPips(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}p`;
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1]!;
}

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}
