import { describe, expect, it } from "vitest";
import { initialState, reducer } from "@/lib/demo/state";
import { loadState, saveState, STORAGE_KEY } from "@/lib/demo/storage";

const throwing = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};
const withValue = (v: string | null) => ({ getItem: () => v });

describe("storage", () => {
  it("falls back to initialState with no store or a blocked store", () => {
    expect(loadState(null)).toEqual(initialState());
    expect(loadState(throwing)).toEqual(initialState());
  });
  it("falls back on bad JSON and the wrong version", () => {
    expect(loadState(withValue("not json"))).toEqual(initialState());
    expect(loadState(withValue(JSON.stringify({ version: 0 })))).toEqual(initialState());
    expect(loadState(withValue("null"))).toEqual(initialState());
    expect(loadState(withValue(JSON.stringify({ version: 1, calls: "oops" })))).toEqual(initialState());
  });
  it("falls back on an old saved shape that is version 1 but half-valid", () => {
    const good = reducer(initialState(), { type: "runBatch" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the test breaks the shape on purpose
    const broken = (mutate: (s: Record<string, any>) => void) => {
      const copy = JSON.parse(JSON.stringify(good));
      mutate(copy);
      return loadState(withValue(JSON.stringify(copy)));
    };
    expect(broken((s) => delete s.calls[0].customer)).toEqual(initialState());
    expect(broken((s) => (s.calls[0].durationSec = "90"))).toEqual(initialState());
    expect(broken((s) => (s.calls[0].outcome = "lost"))).toEqual(initialState());
    expect(broken((s) => (s.calls[0].personId = 7))).toEqual(initialState());
    expect(broken((s) => delete s.people[0].name)).toEqual(initialState());
    expect(broken((s) => delete s.blocks[0].start)).toEqual(initialState());
    expect(broken((s) => (s.cleared = { a: 1 }))).toEqual(initialState());
    expect(broken(() => {})).toEqual(good);
  });
  it("returns nothing saved as the sample day", () => {
    expect(loadState(withValue(null))).toEqual(initialState());
  });
  it("saveState with a throwing store does not throw", () => {
    expect(() => saveState(throwing, initialState())).not.toThrow();
    expect(() => saveState(null, initialState())).not.toThrow();
  });
  it("round-trips a saved state", () => {
    const saved: Record<string, string> = {};
    const store = {
      getItem: (k: string) => saved[k] ?? null,
      setItem: (k: string, v: string) => {
        saved[k] = v;
      },
    };
    const s = reducer(initialState(), { type: "runBatch" });
    saveState(store, s);
    expect(STORAGE_KEY).toBe("team-performance:v1");
    expect(loadState(store)).toEqual(s);
  });
});
