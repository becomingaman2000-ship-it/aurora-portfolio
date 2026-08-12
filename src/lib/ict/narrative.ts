import type { Tape } from "../market/types";
import { formatPips, formatPrice } from "../market/types";
import type { LiveSession } from "../market/sessions";
import type { IctReport } from "./types";

type Input = {
  tape: Tape;
  report: Omit<IctReport, "narrative" | "bullets">;
  session: LiveSession;
};

export function buildNarrative({ tape, report, session }: Input): {
  narrative: string;
  bullets: string[];
} {
  const { forecast, judas, smt, asian, frames } = report;
  const px = formatPrice(tape.spot);
  const chg = formatPips(tape.changePips);
  const bias = forecast.htfBias;
  const d = frames["1d"];
  const w = frames["1w"];
  const h4 = frames["4h"];
  const m15 = frames["15m"];

  const lastDaily = d.structure[d.structure.length - 1];
  const lastH4 = h4.structure[h4.structure.length - 1];
  const last15 = m15.structure[m15.structure.length - 1];

  const loc = h4.dealing
    ? `${h4.dealing.position} of the 4H dealing range (${formatPrice(h4.dealing.low)}–${formatPrice(h4.dealing.high)}, EQ ${formatPrice(h4.dealing.eq)})`
    : "an unfinished dealing range";

  const wo = report.weeklyOpen ? formatPrice(report.weeklyOpen) : "n/a";
  const vsWeek =
    report.weeklyOpen == null
      ? ""
      : tape.spot >= report.weeklyOpen
        ? `trading above the true week open (${wo})`
        : `trading below the true week open (${wo})`;

  const p1 = [
    `EUR/USD is printing ${px} (${chg} vs prior daily close) while ${session.marketOpen ? "the cash FX book is open" : "the cash FX book is closed"}.`,
    `${session.weekday} ${session.clock} New York. ${session.silver ? session.silver.label + " is LIVE." : session.killzone ? session.killzone.label + " is active." : `Dead zone — next window is ${session.next.label}.`}`,
    `Higher-timeframe book is ${bias}${vsWeek ? ", " + vsWeek : ""}.`,
  ].join(" ");

  const p2 = [
    `Weekly structure: ${w.trend.toLowerCase()}${w.structure.length ? ` after a ${w.structure[w.structure.length - 1]!.kind} ${w.structure[w.structure.length - 1]!.dir}.` : "."}`,
    `Daily: ${d.trend.toLowerCase()}${lastDaily ? ` — last event ${lastDaily.kind} ${lastDaily.dir} at ${formatPrice(lastDaily.price)}.` : "."}`,
    `4H: ${h4.trend.toLowerCase()}${lastH4 ? ` (${lastH4.kind} ${lastH4.dir})` : ""}. Price is dealing in ${loc}.`,
    report.pdh && report.pdl
      ? `Yesterday's range is ${formatPrice(report.pdl)}–${formatPrice(report.pdh)}${report.pdc ? ` (close ${formatPrice(report.pdc)})` : ""}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const p3 = [
    asian
      ? `Asian range: ${formatPrice(asian.low)}–${formatPrice(asian.high)} (mid ${formatPrice(asian.mid)}).`
      : "Asian range is still forming.",
    judas.detail,
    last15
      ? `On the 15-minute, last structure is ${last15.kind} ${last15.dir} at ${formatPrice(last15.price)}.`
      : "",
    smt.detail,
  ]
    .filter(Boolean)
    .join(" ");

  const p4 = [
    forecast.path,
    `Invalidation: ${formatPrice(forecast.invalidation.price)}. ${forecast.invalidation.reason}`,
    `Active horizon: ${forecast.horizon}. Confidence on the primary path is ${forecast.confidence}% — this is a probabilistic delivery model, not a promise.`,
  ].join(" ");

  const narrative = [p1, p2, p3, p4].join("\n\n");

  const unfilled = m15.fvgs.filter((f) => f.fill === "unfilled").slice(-3);
  const bullets = [
    `HTF bias ${bias} · LTF ${forecast.ltfBias} · confidence ${forecast.confidence}%`,
    `Draw on liquidity → ${forecast.nextDraw.side} ${forecast.nextDraw.label} @ ${formatPrice(forecast.nextDraw.price)}`,
    `Invalidate on a close through ${formatPrice(forecast.invalidation.price)}`,
    ...unfilled.map(
      (f) =>
        `${f.dir === "bull" ? "▲" : "▼"} ${f.fill} ${f.dir} FVG ${formatPrice(f.bottom)}–${formatPrice(f.top)} (CE ${formatPrice(f.ce)})`,
    ),
    report.weeklyOpen ? `Week open ${formatPrice(report.weeklyOpen)}` : "",
    report.dailyOpen ? `Day open ${formatPrice(report.dailyOpen)}` : "",
    session.phaseLabel,
  ].filter(Boolean);

  return { narrative, bullets };
}
