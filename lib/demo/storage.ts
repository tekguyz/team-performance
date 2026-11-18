import { initialState, type DemoState } from "@/lib/demo/state";
import type { Outcome } from "@/lib/demo/types";

export const STORAGE_KEY = "team-performance:v1";

const str = (v: unknown): v is string => typeof v === "string";
const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const strOrNull = (v: unknown) => v === null || str(v);
const OUTCOMES: readonly string[] = ["sent", "skipped_short", "skipped_daily_cap", "no_match"] satisfies Outcome[];

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null;

/** Checks every field the screens read, so an old or hand-edited save can never blank the demo. */
function looksValid(v: unknown): v is DemoState {
  if (!isRec(v)) return false;
  const { version, people, calls, blocks, cleared, batches } = v;
  return (
    version === 1 &&
    num(batches) &&
    isRec(cleared) &&
    !Array.isArray(cleared) &&
    Object.values(cleared).every(str) &&
    Array.isArray(people) &&
    people.every((p) => isRec(p) && str(p.id) && str(p.name) && str(p.extension) && str(p.crmUserId)) &&
    Array.isArray(calls) &&
    calls.every(
      (c) =>
        isRec(c) &&
        str(c.id) &&
        str(c.at) &&
        !Number.isNaN(Date.parse(c.at)) &&
        str(c.extension) &&
        str(c.customer) &&
        num(c.durationSec) &&
        str(c.outcome) &&
        OUTCOMES.includes(c.outcome) &&
        strOrNull(c.personId) &&
        strOrNull(c.text),
    ) &&
    Array.isArray(blocks) &&
    blocks.every(
      (b) =>
        isRec(b) && str(b.personId) && str(b.label) && str(b.start) && num(b.minutes) && num(b.updates),
    )
  );
}

/** Never throws and never returns nothing: a blocked, empty or corrupt store gives the sample day. */
export function loadState(store: Pick<Storage, "getItem"> | null): DemoState {
  try {
    const raw = store?.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed: unknown = JSON.parse(raw);
    return looksValid(parsed) ? parsed : initialState();
  } catch {
    return initialState();
  }
}

export function saveState(store: Pick<Storage, "setItem"> | null, s: DemoState): void {
  try {
    store?.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Blocked or full: the demo keeps working in memory.
  }
}
