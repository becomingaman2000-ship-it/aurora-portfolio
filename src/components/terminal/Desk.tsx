import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Crosshair,
  RefreshCw,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { loadTape } from "@/lib/market/fetchTape";
import { TIMEFRAMES, type Timeframe, formatPips, formatPrice } from "@/lib/market/types";
import {
  formatDuration,
  readLiveSession,
  type LiveSession,
} from "@/lib/market/sessions";
import { analyzeIct } from "@/lib/ict/engine";
import type { Bias, FrameAnalysis } from "@/lib/ict/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DEFAULT_OVERLAYS, IctChart, type OverlayFlags } from "./IctChart";
import { cn } from "@/lib/utils";

export function Desk() {
  const tapeQ = useQuery({
    queryKey: ["eurusd-tape"],
    queryFn: loadTape,
    refetchInterval: 45_000,
    staleTime: 20_000,
    retry: 1,
  });

  const [tf, setTf] = useState<Timeframe>("15m");
  const [overlays, setOverlays] = useState<OverlayFlags>(DEFAULT_OVERLAYS);
  const [highlight, setHighlight] = useState<{ top: number; bottom: number } | null>(null);
  const [tab, setTab] = useState<"forecast" | "setups" | "arrays" | "read" | "playbook">("forecast");
  const [now, setNow] = useState(() => Date.now());
  const [showDisc, setShowDisc] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const seen = sessionStorage.getItem("aurora-desk-disc");
    if (!seen) setShowDisc(true);
  }, []);

  const session = useMemo(() => readLiveSession(new Date(now)), [now]);
  const report = useMemo(
    () => (tapeQ.data ? analyzeIct(tapeQ.data, tapeQ.data.fetchedAt) : null),
    [tapeQ.data],
  );

  const candles = tapeQ.data?.frames[tf] ?? [];
  const analysis: FrameAnalysis | null = report?.frames[tf] ?? null;

  const extras = useMemo(() => {
    if (!report) return [];
    const rows = [
      report.weeklyOpen != null ? { price: report.weeklyOpen, label: "WEEK OPEN", color: "#c4b5fd", dash: true } : null,
      report.dailyOpen != null ? { price: report.dailyOpen, label: "DAY OPEN", color: "#93c5fd", dash: true } : null,
      report.pdh != null ? { price: report.pdh, label: "PDH", color: "rgba(255,93,115,0.85)" } : null,
      report.pdl != null ? { price: report.pdl, label: "PDL", color: "rgba(46,230,176,0.85)" } : null,
      report.pwh != null ? { price: report.pwh, label: "PWH", color: "rgba(255,93,115,0.55)" } : null,
      report.pwl != null ? { price: report.pwl, label: "PWL", color: "rgba(46,230,176,0.55)" } : null,
      report.asian
        ? { price: report.asian.high, label: "ASIAN H", color: "rgba(232,200,114,0.7)" }
        : null,
      report.asian
        ? { price: report.asian.low, label: "ASIAN L", color: "rgba(232,200,114,0.7)" }
        : null,
    ];
    return rows.filter(Boolean) as { price: number; label: string; color: string; dash?: boolean }[];
  }, [report]);

  const spot = tapeQ.data?.spot;
  const chg = tapeQ.data?.changePips ?? 0;
  const bias = report?.forecast.htfBias ?? "RANGE";

  return (
    <div className="desk min-h-dvh text-[13px] text-[#e8ecf5]">
      <div className="desk-bg" />
      <header className="relative z-10 border-b border-white/10 bg-[#070b12]/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 md:px-5">
          <Link to="/" className="flex items-center gap-2 pr-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-teal-300 to-violet-400 text-[10px] font-bold text-[#071018]">
              EM
            </span>
            <div className="leading-tight">
              <div className="font-display text-[11px] uppercase tracking-[0.22em] text-white/50">
                Aurora Desk
              </div>
              <div className="font-display text-sm font-semibold tracking-wide">EUR / USD</div>
            </div>
          </Link>

          <div className="hidden h-8 w-px bg-white/10 md:block" />

          <div className="min-w-[9.5rem]">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-semibold tabular-nums tracking-tight md:text-2xl">
                {spot != null ? formatPrice(spot) : "—"}
              </span>
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  chg >= 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {formatPips(chg)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 font-semibold",
                  tapeQ.data?.source === "demo"
                    ? "bg-amber-300/15 text-amber-200"
                    : "bg-emerald-400/15 text-emerald-300",
                )}
              >
                {tapeQ.data ? (tapeQ.data.source === "demo" ? "DEMO" : "LIVE") : "…"}
              </span>
              <span className="truncate">{tapeQ.data?.sourceLabel ?? "connecting tape…"}</span>
            </div>
          </div>

          <BiasChip bias={bias} label="HTF" />
          <BiasChip bias={report?.forecast.ltfBias ?? "RANGE"} label="LTF" />

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 lg:flex">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                session.silver ? "bg-amber-300 animate-pulse" : session.killzone ? "bg-emerald-400" : "bg-white/30",
              )}
            />
            <span className="font-mono text-[11px] text-white/80">{session.clock} NY</span>
            <span className="text-[11px] text-white/50">
              {session.silver?.label ?? session.killzone?.label ?? "Outside KZ"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => tapeQ.refetch()}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
              title="Refresh tape"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", tapeQ.isFetching && "animate-spin")} />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-t border-white/5 px-3 py-1.5 md:px-5">
          {report?.mtf.map((row) => (
            <button
              key={row.tf}
              onClick={() => setTf(row.tf)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider",
                tf === row.tf ? "bg-white/12 text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              <span className="font-semibold">{row.tf}</span>
              <Dot bias={row.bias} />
            </button>
          ))}
          <div className="ml-auto hidden items-center gap-3 text-[11px] text-white/45 md:flex">
            <span>Conf {report?.forecast.confidence ?? "—"}%</span>
            <span>Draw {report ? formatPrice(report.forecast.nextDraw.price) : "—"}</span>
            <span>{session.phaseLabel}</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 grid gap-3 p-3 md:p-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-rows-[minmax(420px,1fr)_auto] xl:items-stretch">
        <section className="desk-panel flex min-h-[420px] flex-col overflow-hidden xl:row-span-1">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-3 py-2">
            <div className="flex gap-1">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[11px]",
                    tf === t ? "bg-teal-300/20 text-teal-200" : "text-white/45 hover:text-white",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="ml-auto flex flex-wrap gap-1">
              {(
                [
                  ["fvg", "FVG"],
                  ["ob", "OB"],
                  ["liq", "LIQ"],
                  ["ote", "OTE"],
                  ["sessions", "SESS"],
                  ["structure", "BOS"],
                ] as const
              ).map(([k, lab]) => (
                <button
                  key={k}
                  onClick={() => setOverlays((o) => ({ ...o, [k]: !o[k] }))}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] uppercase tracking-wider",
                    overlays[k] ? "bg-white/12 text-white" : "text-white/35",
                  )}
                >
                  {lab}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-[360px] flex-1">
            <IctChart
              candles={candles}
              analysis={analysis}
              extras={extras}
              highlight={highlight}
              overlays={overlays}
            />
          </div>
        </section>

        <aside className="desk-panel flex flex-col gap-3 p-3 xl:row-span-2">
          <ForecastCard report={report} session={session} />
          <ConfluenceMeters report={report} />
          <PdList
            report={report}
            tf={tf}
            onFocus={(z) => setHighlight(z)}
          />
        </aside>

        <section className="desk-panel xl:col-start-1">
          <div className="flex gap-1 overflow-x-auto border-b border-white/8 px-2 pt-2">
            {(
              [
                ["forecast", "Delivery"],
                ["setups", "Models"],
                ["arrays", "PD Arrays"],
                ["read", "Full read"],
                ["playbook", "Playbook"],
              ] as const
            ).map(([id, lab]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-t-md px-3 py-2 text-[11px] uppercase tracking-wider",
                  tab === id ? "bg-white/8 text-white" : "text-white/40 hover:text-white/70",
                )}
              >
                {lab}
              </button>
            ))}
          </div>
          <div className="max-h-[360px] overflow-y-auto p-4">
            {tab === "forecast" && <DeliveryTab report={report} />}
            {tab === "setups" && <SetupsTab report={report} onFocus={setHighlight} />}
            {tab === "arrays" && <ArraysTab report={report} tf={tf} onFocus={setHighlight} />}
            {tab === "read" && (
              <div className="space-y-3">
                <p className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-white/75">
                  {report?.narrative ?? "Loading institutional read…"}
                </p>
                <ul className="space-y-1 font-mono text-[11px] text-teal-200/80">
                  {report?.bullets.map((b) => (
                    <li key={b}>▸ {b}</li>
                  ))}
                </ul>
              </div>
            )}
            {tab === "playbook" && <Playbook />}
          </div>
        </section>
      </div>

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 pb-4 text-[10px] uppercase tracking-wider text-white/35">
        <span>
          Educational ICT mapping · not a broker signal · {tapeQ.data?.source.toUpperCase() ?? "—"} feed
        </span>
        <button className="underline decoration-white/20" onClick={() => setShowDisc(true)}>
          Risk disclosure
        </button>
      </footer>

      {showDisc && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="desk-panel max-w-lg p-6">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <h2 className="font-display text-lg">Read this first</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Aurora Desk encodes Inner Circle Trader concepts — market structure, liquidity, fair
              value gaps, order blocks, killzones, SMT, AMD and the 2022 model — onto a live EUR/USD
              tape. It is a research terminal, not a crystal ball. No model predicts the market with
              certainty. Confluence scores are rule-based probabilities, not guarantees. You can lose
              money. This is not financial advice.
            </p>
            <button
              className="mt-5 rounded-full bg-teal-300 px-4 py-2 text-sm font-medium text-[#071018]"
              onClick={() => {
                sessionStorage.setItem("aurora-desk-disc", "1");
                setShowDisc(false);
              }}
            >
              I understand — open the desk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BiasChip({ bias, label }: { bias: Bias; label: string }) {
  return (
    <div
      className={cn(
        "rounded-full border px-2.5 py-1",
        bias === "BULLISH"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : bias === "BEARISH"
            ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
            : "border-white/10 bg-white/5 text-white/60",
      )}
    >
      <div className="text-[9px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="font-display text-xs font-semibold">{bias}</div>
    </div>
  );
}

function Dot({ bias }: { bias: Bias }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        bias === "BULLISH" ? "bg-emerald-400" : bias === "BEARISH" ? "bg-rose-400" : "bg-white/35",
      )}
    />
  );
}

function ForecastCard({
  report,
  session,
}: {
  report: ReturnType<typeof analyzeIct> | null;
  session: LiveSession;
}) {
  if (!report) {
    return <div className="animate-pulse rounded-xl bg-white/5 p-4 text-white/40">Reading tape…</div>;
  }
  const f = report.forecast;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Daily delivery</div>
        <div className="font-mono text-[11px] text-amber-200/80">{f.confidence}% conf</div>
      </div>
      <div className="mt-1 font-display text-2xl font-semibold tracking-tight">
        {f.htfBias === "BULLISH" ? "Seeking buy-side" : f.htfBias === "BEARISH" ? "Seeking sell-side" : "Range / stand down"}
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-white/60">{f.path}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat icon={<Target className="h-3.5 w-3.5" />} k="Draw" v={formatPrice(f.nextDraw.price)} s={f.nextDraw.label} />
        <Stat icon={<Shield className="h-3.5 w-3.5" />} k="Invalidate" v={formatPrice(f.invalidation.price)} s="protected swing" />
      </div>
      <div className="mt-3 rounded-xl border border-white/8 bg-white/3 p-2.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40">
          <span>{session.silver ? "Silver Bullet" : session.killzone ? "Killzone" : "Next window"}</span>
          <span className="font-mono text-white/70">
            {session.silver || session.killzone
              ? formatDuration(session.msRemaining || session.msToNext)
              : formatDuration(session.msToNext)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[12px]">
          <Zap className={cn("h-3.5 w-3.5", session.silver ? "text-amber-300" : "text-teal-300")} />
          {session.silver?.label ?? session.killzone?.label ?? session.next.label}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  k,
  v,
  s,
}: {
  icon: ReactNode;
  k: string;
  v: string;
  s: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/40">
        {icon}
        {k}
      </div>
      <div className="mt-0.5 font-mono text-sm">{v}</div>
      <div className="truncate text-[10px] text-white/40">{s}</div>
    </div>
  );
}

function ConfluenceMeters({ report }: { report: ReturnType<typeof analyzeIct> | null }) {
  const c = report?.confluence;
  const rows = [
    ["Structure", c?.structure],
    ["Liquidity", c?.liquidity],
    ["Time", c?.time],
    ["SMT", c?.smt],
    ["PD array", c?.array],
    ["AMD", c?.delivery],
  ] as const;
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Confluence radar</div>
      <div className="space-y-1.5">
        {rows.map(([lab, v]) => (
          <div key={lab} className="flex items-center gap-2">
            <span className="w-16 text-[10px] uppercase tracking-wider text-white/45">{lab}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-300 to-violet-400"
                initial={{ width: 0 }}
                animate={{ width: `${v ?? 0}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              />
            </div>
            <span className="w-7 text-right font-mono text-[10px] text-white/50">{v ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PdList({
  report,
  tf,
  onFocus,
}: {
  report: ReturnType<typeof analyzeIct> | null;
  tf: Timeframe;
  onFocus: (z: { top: number; bottom: number } | null) => void;
}) {
  const f = report?.frames[tf];
  const items = [
    ...(f?.fvgs
      .filter((x) => x.fill !== "filled")
      .slice(-5)
      .reverse()
      .map((x) => ({
        id: x.id,
        tag: "FVG",
        dir: x.dir,
        label: `${x.dir} FVG · ${x.fill}`,
        zone: [x.bottom, x.top] as [number, number],
        extra: `CE ${formatPrice(x.ce)}`,
      })) ?? []),
    ...(f?.blocks
      .filter((b) => !b.mitigated || b.kind === "BREAKER")
      .slice(-4)
      .reverse()
      .map((b) => ({
        id: b.id,
        tag: b.kind,
        dir: b.dir,
        label: `${b.kind} ${b.dir}`,
        zone: [b.bottom, b.top] as [number, number],
        extra: `${b.displacementPips.toFixed(1)}p disp`,
      })) ?? []),
  ].slice(0, 8);

  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
        Active PD arrays · {tf}
      </div>
      <div className="space-y-1">
        {items.length === 0 && <div className="text-[12px] text-white/35">No live arrays on this frame.</div>}
        {items.map((it) => (
          <button
            key={it.id}
            onMouseEnter={() => onFocus({ bottom: it.zone[0], top: it.zone[1] })}
            onMouseLeave={() => onFocus(null)}
            className="flex w-full items-center justify-between rounded-lg border border-white/6 bg-white/3 px-2.5 py-1.5 text-left hover:bg-white/6"
          >
            <div>
              <div className="text-[11px] text-white/80">{it.label}</div>
              <div className="font-mono text-[10px] text-white/40">
                {formatPrice(it.zone[0])}–{formatPrice(it.zone[1])} · {it.extra}
              </div>
            </div>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] uppercase",
                it.dir === "bull" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300",
              )}
            >
              {it.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DeliveryTab({ report }: { report: ReturnType<typeof analyzeIct> | null }) {
  if (!report) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="font-display text-lg">Primary path</h3>
        <p className="mt-1 text-white/65">{report.forecast.path}</p>
        <div className="mt-3 space-y-2">
          {report.forecast.scenarios.map((s) => (
            <div key={s.name} className="rounded-xl border border-white/8 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium">{s.name}</span>
                <span className="font-mono text-[11px] text-teal-200">{s.prob}%</span>
              </div>
              <p className="mt-1 text-[12px] text-white/55">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg">MTF matrix</h3>
        <div className="mt-2 overflow-hidden rounded-xl border border-white/8">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-white/4 text-[10px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-2 py-1.5">TF</th>
                <th>Bias</th>
                <th>Structure</th>
                <th>Location</th>
                <th>Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {report.mtf.map((r) => (
                <tr key={r.tf} className="border-t border-white/6">
                  <td className="px-2 py-1.5 font-mono">{r.tf}</td>
                  <td className={r.bias === "BULLISH" ? "text-emerald-300" : r.bias === "BEARISH" ? "text-rose-300" : "text-white/50"}>
                    {r.bias}
                  </td>
                  <td>{r.structure}</td>
                  <td>{r.location}</td>
                  <td className="text-white/55">{r.liquidity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
          <Note title="SMT" body={report.smt.detail} />
          <Note title="Judas" body={report.judas.detail} />
          <Note title="AMD" body={report.amd.detail} />
          <Note title="Invalidation" body={report.forecast.invalidation.reason} />
        </div>
      </div>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/8 p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-white/40">{title}</div>
      <p className="mt-1 text-[11px] leading-relaxed text-white/60">{body}</p>
    </div>
  );
}

function SetupsTab({
  report,
  onFocus,
}: {
  report: ReturnType<typeof analyzeIct> | null;
  onFocus: (z: { top: number; bottom: number } | null) => void;
}) {
  if (!report) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {report.setups.map((s) => (
        <button
          key={s.id}
          onMouseEnter={() => s.entry && onFocus({ bottom: s.entry[0], top: s.entry[1] })}
          onMouseLeave={() => onFocus(null)}
          className="rounded-2xl border border-white/8 bg-white/3 p-3 text-left hover:bg-white/5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-display text-base">{s.title}</div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] uppercase",
                s.dir === "bull" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300",
              )}
            >
              {s.dir} · {s.status}
            </span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-white/60">{s.detail}</p>
          <div className="mt-2 flex flex-wrap gap-3 font-mono text-[11px] text-white/50">
            {s.entry && (
              <span>
                IN {formatPrice(s.entry[0])}–{formatPrice(s.entry[1])}
              </span>
            )}
            {s.stop != null && <span>SL {formatPrice(s.stop)}</span>}
            {s.targets?.[0] != null && <span>TP {formatPrice(s.targets[0])}</span>}
            {s.rr != null && <span>R {s.rr.toFixed(1)}</span>}
            <span className="text-teal-200">{s.confluence} conf</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ArraysTab({
  report,
  tf,
  onFocus,
}: {
  report: ReturnType<typeof analyzeIct> | null;
  tf: Timeframe;
  onFocus: (z: { top: number; bottom: number } | null) => void;
}) {
  if (!report) return null;
  const f = report.frames[tf];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-white/40">Fair value gaps</h4>
        <div className="mt-2 space-y-1">
          {f.fvgs
            .slice(-8)
            .reverse()
            .map((x) => (
              <button
                key={x.id}
                onMouseEnter={() => onFocus({ top: x.top, bottom: x.bottom })}
                onMouseLeave={() => onFocus(null)}
                className="block w-full rounded-lg border border-white/6 px-2 py-1.5 text-left text-[11px]"
              >
                <span className={x.dir === "bull" ? "text-emerald-300" : "text-rose-300"}>
                  {x.dir}
                </span>{" "}
                {formatPrice(x.bottom)}–{formatPrice(x.top)} · {x.fill}
                {x.inverted ? " · IFVG" : ""}
              </button>
            ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-white/40">Order / breaker</h4>
        <div className="mt-2 space-y-1">
          {f.blocks
            .slice(-8)
            .reverse()
            .map((b) => (
              <button
                key={b.id}
                onMouseEnter={() => onFocus({ top: b.top, bottom: b.bottom })}
                onMouseLeave={() => onFocus(null)}
                className="block w-full rounded-lg border border-white/6 px-2 py-1.5 text-left text-[11px]"
              >
                {b.kind} {b.dir} {formatPrice(b.bottom)}–{formatPrice(b.top)}
                {b.mitigated ? " · mitigated" : ""}
              </button>
            ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-white/40">Liquidity + targets</h4>
        <ul className="mt-2 space-y-1 font-mono text-[11px] text-white/65">
          {report.forecast.targets.map((t) => (
            <li key={t.label + t.price}>
              {t.label} · {formatPrice(t.price)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Playbook() {
  const items = [
    {
      t: "2022 Model",
      d: "HTF bias → LTF raids opposing liquidity → market structure shift (MSS/CHoCH) → enter the displacement FVG → target the next external pool.",
    },
    {
      t: "Silver Bullet",
      d: "Only 10:00–11:00 or 14:00–15:00 (and London 03:00–04:00) New York. First raid + FVG in the daily direction. One hour. No chase.",
    },
    {
      t: "Judas + AMD",
      d: "Asian accumulates. London manipulates (raids the obvious high/low). New York distributes toward the opposite external liquidity.",
    },
    {
      t: "OTE",
      d: "Buy 62–79% retracements of a bullish dealing range (discount). Sell 62–79% of a bearish range (premium). Equilibrium is not an entry.",
    },
    {
      t: "SMT",
      d: "EUR vs GBP. If one major makes a new extreme and the other refuses, delivery often reverses the unconfirmed pair.",
    },
    {
      t: "Risk",
      d: "Every setup has an invalidation. Size as if the next trade is wrong. This desk does not place orders.",
    },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((x) => (
        <div key={x.t} className="rounded-2xl border border-white/8 p-3">
          <div className="flex items-center gap-2 font-display text-base">
            <BookOpen className="h-3.5 w-3.5 text-teal-300" />
            {x.t}
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">{x.d}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 md:col-span-2">
        <div className="flex items-center gap-2 text-amber-200">
          <Activity className="h-3.5 w-3.5" />
          How the engine reads
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">
          Swings are confirmed fractals. BOS continues the book; MSS/CHoCH flips it. FVGs require a
          three-candle imbalance and prefer displacement. Order blocks are the last opposing candle
          before that displacement; a close through them promotes a breaker. Liquidity is tagged at
          swing and equal highs/lows, plus PDH/PDL/PWH/PWL. Killzones are New York local. SMT uses
          GBP as the correlated major. The forecast is a weighted confluence of those six factors —
          never 100.
        </p>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-white/40">
          <Crosshair className="h-3 w-3" /> Scroll to zoom · drag to pan · hover arrays to focus
        </div>
      </div>
    </div>
  );
}
