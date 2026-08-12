import type { Candle, Timeframe } from "../market/types";

export type Bias = "BULLISH" | "BEARISH" | "RANGE";
export type Dir = "bull" | "bear";

export type Swing = {
  index: number;
  time: number;
  price: number;
  kind: "high" | "low";
};

export type StructureEvent = {
  index: number;
  time: number;
  price: number;
  kind: "BOS" | "CHOCH" | "MSS";
  dir: Dir;
};

export type FVG = {
  id: string;
  dir: Dir;
  top: number;
  bottom: number;
  ce: number;
  startIndex: number;
  endIndex: number;
  startTime: number;
  endTime: number;
  fill: "unfilled" | "partial" | "filled";
  inverted: boolean;
  displacement: boolean;
};

export type OrderBlock = {
  id: string;
  dir: Dir;
  kind: "OB" | "BREAKER" | "MITIGATION";
  top: number;
  bottom: number;
  time: number;
  index: number;
  mitigated: boolean;
  displacementPips: number;
};

export type LiquidityPool = {
  id: string;
  side: "BSL" | "SSL";
  price: number;
  time: number;
  index: number;
  kind: "swing" | "equal" | "session" | "pdh" | "pdl" | "pwh" | "pwl" | "pmh" | "pml";
  swept: boolean;
  sweptAt?: number;
  label: string;
};

export type Sweep = {
  time: number;
  index: number;
  side: "BSL" | "SSL";
  poolPrice: number;
  wickPrice: number;
  reversed: boolean;
};

export type DealingRange = {
  high: number;
  low: number;
  eq: number;
  range: number;
  oteBuy: { top: number; bottom: number };
  oteSell: { top: number; bottom: number };
  position: "premium" | "discount" | "equilibrium";
  pctFromLow: number;
};

export type Bpr = {
  id: string;
  top: number;
  bottom: number;
  time: number;
};

export type Setup = {
  id: string;
  model: "SILVER_BULLET" | "MODEL_2022" | "JUDAS" | "OTE" | "AMD" | "FVG_ENTRY" | "UNICORN";
  dir: Dir;
  status: "forming" | "active" | "triggered" | "invalid";
  title: string;
  detail: string;
  entry?: [number, number];
  stop?: number;
  targets?: number[];
  rr?: number;
  confluence: number;
};

export type Forecast = {
  htfBias: Bias;
  ltfBias: Bias;
  confidence: number;
  nextDraw: { price: number; label: string; side: "BSL" | "SSL" };
  path: string;
  invalidation: { price: number; reason: string };
  entries: { label: string; zone: [number, number]; tf: Timeframe }[];
  targets: { price: number; label: string }[];
  horizon: string;
  scenarios: { name: string; prob: number; text: string }[];
};

export type FrameAnalysis = {
  tf: Timeframe;
  candles: Candle[];
  swings: Swing[];
  structure: StructureEvent[];
  trend: Bias;
  fvgs: FVG[];
  blocks: OrderBlock[];
  liquidity: LiquidityPool[];
  sweeps: Sweep[];
  dealing: DealingRange | null;
  bprs: Bpr[];
  atr: number;
};

export type MtfRow = {
  tf: Timeframe;
  bias: Bias;
  structure: string;
  location: string;
  liquidity: string;
};

export type Confluence = {
  structure: number;
  liquidity: number;
  time: number;
  smt: number;
  array: number;
  delivery: number;
};

export type IctReport = {
  analyzedAt: number;
  frames: Record<Timeframe, FrameAnalysis>;
  mtf: MtfRow[];
  weeklyOpen: number | null;
  dailyOpen: number | null;
  pdh: number | null;
  pdl: number | null;
  pdc: number | null;
  pwh: number | null;
  pwl: number | null;
  pmh: number | null;
  pml: number | null;
  asian: { high: number; low: number; mid: number } | null;
  judas: { detected: boolean; side: "high" | "low" | null; detail: string };
  amd: { phase: string; detail: string };
  smt: { bias: Bias; detail: string; present: boolean };
  setups: Setup[];
  forecast: Forecast;
  confluence: Confluence;
  narrative: string;
  bullets: string[];
};
