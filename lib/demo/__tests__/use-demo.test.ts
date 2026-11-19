import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The module keeps one store for the whole page, so each test loads a fresh copy.
async function freshStore() {
  vi.resetModules();
  return import("@/lib/demo/use-demo");
}

describe("demo store with browser storage blocked", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked");
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("keeps a dispatched change and reads it back", async () => {
    const { dispatch, getDemoState } = await freshStore();
    const before = getDemoState().calls.length;
    dispatch({ type: "runBatch" });
    expect(getDemoState().calls.length).toBeGreaterThan(before);
    expect(getDemoState().batches).toBe(1);
  });

  it("reset returns to the sample day", async () => {
    const { dispatch, getDemoState } = await freshStore();
    const start = getDemoState().calls.length;
    dispatch({ type: "runBatch" });
    dispatch({ type: "reset" });
    expect(getDemoState().calls.length).toBe(start);
    expect(getDemoState().batches).toBe(0);
  });
});
