export type NyParts = {
  weekday: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  minutes: number;
};

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function getNyParts(date: Date = new Date()): NyParts {
  const parts = fmt.formatToParts(date);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const hour = Number(g("hour"));
  const minute = Number(g("minute"));
  const second = Number(g("second"));
  return {
    weekday: g("weekday"),
    year: Number(g("year")),
    month: Number(g("month")),
    day: Number(g("day")),
    hour,
    minute,
    second,
    minutes: hour * 60 + minute,
  };
}

export type KillzoneId =
  | "ASIAN"
  | "LONDON"
  | "NY_AM"
  | "LONDON_CLOSE"
  | "NY_LUNCH"
  | "NY_PM"
  | "SILVER_BULLET"
  | "DEAD";

export type WindowSpec = {
  id: KillzoneId;
  label: string;
  start: number;
  end: number;
  kind: "session" | "killzone" | "silver" | "dead";
};

/** All windows in minutes from midnight America/New_York. */
export const WINDOWS: WindowSpec[] = [
  { id: "ASIAN", label: "Asian Range", start: 20 * 60, end: 24 * 60, kind: "session" },
  { id: "LONDON", label: "London Open KZ", start: 2 * 60, end: 5 * 60, kind: "killzone" },
  { id: "NY_AM", label: "New York AM KZ", start: 7 * 60, end: 10 * 60, kind: "killzone" },
  { id: "LONDON_CLOSE", label: "London Close KZ", start: 10 * 60, end: 12 * 60, kind: "killzone" },
  { id: "NY_LUNCH", label: "NY Lunch", start: 12 * 60, end: 13 * 60 + 30, kind: "session" },
  { id: "NY_PM", label: "New York PM KZ", start: 13 * 60 + 30, end: 16 * 60, kind: "killzone" },
];

export const SILVER_BULLETS: WindowSpec[] = [
  { id: "SILVER_BULLET", label: "London Silver Bullet", start: 3 * 60, end: 4 * 60, kind: "silver" },
  { id: "SILVER_BULLET", label: "NY AM Silver Bullet", start: 10 * 60, end: 11 * 60, kind: "silver" },
  { id: "SILVER_BULLET", label: "NY PM Silver Bullet", start: 14 * 60, end: 15 * 60, kind: "silver" },
];

export function inWindow(mins: number, start: number, end: number): boolean {
  if (start <= end) return mins >= start && mins < end;
  return mins >= start || mins < end;
}

export function windowRemainingMs(now: Date, start: number, end: number): number {
  const ny = getNyParts(now);
  const cur = ny.minutes * 60_000 + ny.second * 1000;
  const endMs = end * 60_000;
  if (inWindow(ny.minutes, start, end)) {
    if (end > ny.minutes) return endMs - cur;
    return (24 * 60 - ny.minutes) * 60_000 - ny.second * 1000 + end * 60_000;
  }
  return 0;
}

export function msUntil(now: Date, startMin: number): number {
  const ny = getNyParts(now);
  const cur = ny.minutes * 60 + ny.second;
  const start = startMin * 60;
  let delta = start - cur;
  if (delta <= 0) delta += 24 * 3600;
  return delta * 1000;
}

export type LiveSession = {
  killzone: WindowSpec | null;
  silver: WindowSpec | null;
  next: WindowSpec;
  msToNext: number;
  msRemaining: number;
  phase: "accumulation" | "manipulation" | "distribution" | "dead";
  phaseLabel: string;
  marketOpen: boolean;
  clock: string;
  weekday: string;
};

export function isFxOpen(ny: NyParts): boolean {
  if (ny.weekday === "Sat") return false;
  if (ny.weekday === "Fri" && ny.minutes >= 17 * 60) return false;
  if (ny.weekday === "Sun" && ny.minutes < 17 * 60) return false;
  return true;
}

export function readLiveSession(now: Date = new Date()): LiveSession {
  const ny = getNyParts(now);
  const killzone =
    WINDOWS.find((w) => w.kind === "killzone" && inWindow(ny.minutes, w.start, w.end)) ??
    WINDOWS.find((w) => w.id === "ASIAN" && inWindow(ny.minutes, w.start, w.end)) ??
    WINDOWS.find((w) => w.id === "NY_LUNCH" && inWindow(ny.minutes, w.start, w.end)) ??
    null;
  const silver = SILVER_BULLETS.find((w) => inWindow(ny.minutes, w.start, w.end)) ?? null;

  const upcoming = [...WINDOWS.filter((w) => w.kind === "killzone"), ...SILVER_BULLETS]
    .map((w) => ({ w, eta: msUntil(now, w.start) }))
    .sort((a, b) => a.eta - b.eta)[0]!;

  let phase: LiveSession["phase"] = "dead";
  let phaseLabel = "Dead / mid-session";
  if (inWindow(ny.minutes, 20 * 60, 24 * 60) || inWindow(ny.minutes, 0, 2 * 60)) {
    phase = "accumulation";
    phaseLabel = "AMD · Accumulation (Asian range)";
  } else if (inWindow(ny.minutes, 2 * 60, 5 * 60)) {
    phase = "manipulation";
    phaseLabel = "AMD · Manipulation (London Judas window)";
  } else if (inWindow(ny.minutes, 7 * 60, 12 * 60) || inWindow(ny.minutes, 13 * 60 + 30, 16 * 60)) {
    phase = "distribution";
    phaseLabel = "AMD · Distribution (New York delivery)";
  }

  const hh = String(ny.hour).padStart(2, "0");
  const mm = String(ny.minute).padStart(2, "0");
  const ss = String(ny.second).padStart(2, "0");

  return {
    killzone,
    silver,
    next: upcoming.w,
    msToNext: upcoming.eta,
    msRemaining: killzone ? windowRemainingMs(now, killzone.start, killzone.end) : 0,
    phase,
    phaseLabel,
    marketOpen: isFxOpen(ny),
    clock: `${hh}:${mm}:${ss}`,
    weekday: ny.weekday,
  };
}

export function candleNyMinutes(time: number): number {
  return getNyParts(new Date(time)).minutes;
}

export function sessionOf(time: number): "ASIAN" | "LONDON" | "NY" | "OTHER" {
  const m = candleNyMinutes(time);
  if (m >= 20 * 60 || m < 2 * 60) return "ASIAN";
  if (m >= 2 * 60 && m < 7 * 60) return "LONDON";
  if (m >= 7 * 60 && m < 16 * 60) return "NY";
  return "OTHER";
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
