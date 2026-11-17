// Every hour check in the demo reads the clock in Coral Line Support's zone,
// never the machine's, so CI (UTC), a laptop and a visitor's browser all agree.
export const DEMO_TZ = "America/New_York";

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: DEMO_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

export function zonedParts(ms: number): Parts {
  const o: Record<string, number> = {};
  for (const p of fmt.formatToParts(ms)) if (p.type !== "literal") o[p.type] = Number(p.value);
  return { year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second };
}

/** Offset of DEMO_TZ from UTC at this instant, in ms (negative in the US). */
function offsetMs(ms: number): number {
  const p = zonedParts(ms);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}

/** The instant for a wall-clock time in DEMO_TZ. */
export function zonedMs(year: number, month: number, day: number, hour: number, minute = 0, second = 0): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const first = guess - offsetMs(guess);
  return guess - offsetMs(first);
}

const two = (n: number) => String(n).padStart(2, "0");

/** ISO string with the DEMO_TZ offset, e.g. 2026-11-17T08:00:00-05:00. */
export function toIso(ms: number): string {
  const p = zonedParts(ms);
  const off = Math.round(offsetMs(ms) / 60_000);
  const sign = off < 0 ? "-" : "+";
  const abs = Math.abs(off);
  return `${p.year}-${two(p.month)}-${two(p.day)}T${two(p.hour)}:${two(p.minute)}:${two(p.second)}${sign}${two(Math.floor(abs / 60))}:${two(abs % 60)}`;
}

export function hourInDemoTz(at: string | number): number {
  return zonedParts(typeof at === "number" ? at : Date.parse(at)).hour;
}

/** YYYY-MM-DD of the instant in DEMO_TZ. */
export function dateKey(at: string | number): string {
  const p = zonedParts(typeof at === "number" ? at : Date.parse(at));
  return `${p.year}-${two(p.month)}-${two(p.day)}`;
}

/** The next calendar day (in DEMO_TZ) at the given wall-clock time. */
export function nextDayAt(ms: number, hour: number, minute = 0): number {
  const p = zonedParts(ms);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
  return zonedMs(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hour, minute);
}
