import { initialState, type DemoState } from "@/lib/demo/state";

export const STORAGE_KEY = "team-performance:v1";

function looksValid(v: unknown): v is DemoState {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    s.version === 1 &&
    Array.isArray(s.people) &&
    Array.isArray(s.calls) &&
    Array.isArray(s.blocks) &&
    typeof s.cleared === "object" &&
    s.cleared !== null &&
    typeof s.batches === "number" &&
    s.people.every((p) => typeof p?.id === "string" && typeof p?.extension === "string") &&
    s.calls.every(
      (c) => typeof c?.id === "string" && typeof c?.at === "string" && typeof c?.outcome === "string",
    ) &&
    s.blocks.every((b) => typeof b?.personId === "string" && typeof b?.minutes === "number")
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
