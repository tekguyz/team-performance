import { DAILY_CAP_MS, evaluateCalls } from "@/lib/demo/rules";
import { mulberry32, shuffle } from "@/lib/demo/random";
import { DEMO_TZ, nextDayAt, toIso, zonedMs, zonedParts } from "@/lib/demo/time";
import type { Call, LoggedCall, Person, WorkBlock } from "@/lib/demo/types";

export { DEMO_TZ };
export const SAMPLE_DATE = "2026-11-17";
export const UNMAPPED_EXTENSION = "120";

const NAMES = [
  "Rosa Delgado",
  "Marcus Bell",
  "Ines Carvalho",
  "Devon Okafor",
  "Lucia Moreno",
  "Tariq Hassan",
  "Priya Nair",
  "Jamal Whitfield",
  "Camila Reyes",
  "Noah Lindqvist",
  "Sofia Brandt",
  "Eli Abernathy",
  "Marisol Quintero",
  "Dante Okoro",
];

export const SAMPLE_PEOPLE: Person[] = NAMES.map((name, i) => ({
  id: `p${i + 1}`,
  name,
  extension: String(101 + i),
  crmUserId: `CRM-${1042 + i}`,
}));

// Fictional numbers only: South Florida area codes with the reserved 555-0100 to 555-0199 range.
const CUSTOMER_POOL: string[] = ["305", "786", "954", "561"].flatMap((area) =>
  Array.from({ length: 100 }, (_, i) => `(${area}) 555-${String(100 + i).padStart(4, "0")}`),
);

const [SAMPLE_Y, SAMPLE_M, SAMPLE_D] = SAMPLE_DATE.split("-").map(Number);
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18;
const BATCH_SIZE = 20;

// Calls per hour (8 to 17), heavier mid-morning and after lunch.
const HOUR_WEIGHTS = [10, 16, 20, 22, 14, 13, 20, 22, 18, 12];

// People who end the day under 40: indexes into SAMPLE_PEOPLE. The first is the clear offline-research case.
const FLAGGED = [2, 5, 10];
const OFFLINE_LABELS = ["Case review", "Paperwork", "File cleanup"];

function pickWeighted(weights: number[], rand: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

export function sampleDay(): { calls: LoggedCall[]; blocks: WorkBlock[] } {
  const rand = mulberry32(20261117);
  const total = 180;

  const times: number[] = [];
  for (let i = 0; i < total; i++) {
    const hour = DAY_START_HOUR + pickWeighted(HOUR_WEIGHTS, rand);
    times.push(zonedMs(SAMPLE_Y, SAMPLE_M, SAMPLE_D, hour, Math.floor(rand() * 60), Math.floor(rand() * 60)));
  }
  times.sort((a, b) => a - b);

  const unmappedAt = new Set([17, 71, 133]);
  const pool = shuffle(CUSTOMER_POOL, rand);
  let nextNew = 0;
  const used: string[] = [];

  const raw: Call[] = times.map((t, i) => {
    const short = rand() < 0.15;
    const durationSec = short ? 20 + Math.floor(rand() * 91) : 120 + Math.floor(rand() * 780);
    // About one call in seven is from someone already called today, so the daily cap shows.
    const repeat = !short && used.length > 5 && rand() < 0.14;
    const customer = repeat ? used[Math.floor(rand() * used.length)] : pool[nextNew++ % pool.length];
    if (!repeat) used.push(customer);
    const extension = unmappedAt.has(i)
      ? UNMAPPED_EXTENSION
      : SAMPLE_PEOPLE[Math.floor(rand() * SAMPLE_PEOPLE.length)].extension;
    return { id: `d-${i + 1}`, at: toIso(t), extension, customer, durationSec };
  });

  const calls = evaluateCalls(raw, SAMPLE_PEOPLE, []);

  const blocks: WorkBlock[] = [];
  SAMPLE_PEOPLE.forEach((person, idx) => {
    const flagged = FLAGGED.includes(idx);
    if (idx === FLAGGED[0]) {
      // Clearly offline research: one long case review, almost nothing logged.
      blocks.push({
        personId: person.id,
        kind: "offline",
        label: "Case review",
        start: toIso(zonedMs(SAMPLE_Y, SAMPLE_M, SAMPLE_D, 10, 15)),
        minutes: 120,
        updates: 9,
      });
      return;
    }
    const count = 1 + Math.floor(rand() * 3);
    for (let b = 0; b < count; b++) {
      const minutes = 10 + Math.floor(rand() * 8) * 5;
      const ratio = flagged ? 0.1 + rand() * 0.2 : 0.7 + rand() * 0.5;
      blocks.push({
        personId: person.id,
        kind: "offline",
        label: OFFLINE_LABELS[Math.floor(rand() * OFFLINE_LABELS.length)],
        start: toIso(
          zonedMs(SAMPLE_Y, SAMPLE_M, SAMPLE_D, 9 + b * 3 + Math.floor(rand() * 2), Math.floor(rand() * 4) * 15),
        ),
        minutes,
        updates: Math.max(0, Math.round(minutes * ratio)),
      });
    }
  });

  return { calls, blocks };
}

export function sampleBatch(seed: number, log: LoggedCall[], people: Person[]): Call[] {
  const rand = mulberry32(seed * 7919 + 13);
  const extensions = people.length ? people.map((p) => p.extension) : ["101"];

  const latest = log.reduce((m, c) => Math.max(m, Date.parse(c.at)), 0);

  // Times first: 2 to 6 minute gaps, jumping to 8 AM the next morning at 6 PM.
  const times: number[] = [];
  let t = latest;
  for (let i = 0; i < BATCH_SIZE; i++) {
    t += (120 + Math.floor(rand() * 241)) * 1000;
    if (zonedParts(t).hour >= DAY_END_HOUR) t = nextDayAt(t, DAY_START_HOUR);
    times.push(t);
  }

  const lastSent = new Map<string, number>();
  for (const c of log) {
    if (c.outcome !== "sent") continue;
    const at = Date.parse(c.at);
    if (at > (lastSent.get(c.customer) ?? 0)) lastSent.set(c.customer, at);
  }

  const repeats = 3 + Math.floor(rand() * 2);
  const shorts = 3 + Math.floor(rand() * 2);
  const kinds = shuffle(
    [
      "unmapped",
      ...Array<string>(repeats).fill("repeat"),
      ...Array<string>(shorts).fill("short"),
      ...Array<string>(BATCH_SIZE - 1 - repeats - shorts).fill("normal"),
    ],
    rand,
  );

  const chosen = new Set<string>();
  const newCustomer = (at: number): string => {
    const free = CUSTOMER_POOL.filter((n) => !chosen.has(n) && at - (lastSent.get(n) ?? -Infinity) >= DAILY_CAP_MS);
    const from = free.length ? free : CUSTOMER_POOL.filter((n) => !chosen.has(n));
    return from[Math.floor(rand() * from.length)];
  };
  // A repeat comes back inside the 24-hour window (with a margin), so the cap always shows.
  const repeatCustomer = (at: number): string | null => {
    const near = [...lastSent.entries()]
      .filter(([n, s]) => !chosen.has(n) && at - s > 0 && at - s < DAILY_CAP_MS - 3_600_000)
      .map(([n]) => n)
      .sort();
    return near.length ? near[Math.floor(rand() * near.length)] : null;
  };

  return kinds.map((kind, i): Call => {
    const at = times[i];
    const customer = kind === "repeat" ? (repeatCustomer(at) ?? newCustomer(at)) : newCustomer(at);
    chosen.add(customer);
    const durationSec = kind === "short" ? 20 + Math.floor(rand() * 91) : 120 + Math.floor(rand() * 600);
    const extension = kind === "unmapped" ? UNMAPPED_EXTENSION : extensions[Math.floor(rand() * extensions.length)];
    return { id: `b${seed}-${i + 1}`, at: toIso(at), extension, customer, durationSec };
  });
}
