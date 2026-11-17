import { describe, expect, it } from "vitest";
import { initialState, reducer } from "@/lib/demo/state";
import { teamRows } from "@/lib/demo/selectors";

describe("reducer", () => {
  it("runBatch adds 20 calls and bumps batches", () => {
    const s0 = initialState();
    const s1 = reducer(s0, { type: "runBatch" });
    expect(s1.calls.length).toBe(s0.calls.length + 20);
    expect(s1.batches).toBe(s0.batches + 1);
  });

  it("clearFlag sets cleared and teamRows shows needsReview false", () => {
    const s0 = initialState();
    const flagged = teamRows(s0).find((r) => r.needsReview)!;
    const s1 = reducer(s0, { type: "clearFlag", personId: flagged.person.id, at: "2026-11-17T12:00:00.000Z" });
    expect(s1.cleared[flagged.person.id]).toBe("2026-11-17T12:00:00.000Z");
    const row = teamRows(s1).find((r) => r.person.id === flagged.person.id)!;
    expect(row.needsReview).toBe(false);
    expect(row.cleared).toBe(true);
  });

  it("addExtension with a taken extension changes nothing", () => {
    const s0 = initialState();
    const s1 = reducer(s0, {
      type: "addExtension",
      person: { id: "x1", name: "Zed Zane", extension: "104", crmUserId: "CRM-9" },
    });
    expect(s1).toBe(s0);
  });

  it("addExtension does not change earlier no_match calls", () => {
    const s0 = initialState();
    const noMatch = s0.calls.filter((c) => c.outcome === "no_match");
    expect(noMatch.length).toBeGreaterThan(0);
    const s1 = reducer(s0, {
      type: "addExtension",
      person: { id: "x1", name: "Zed Zane", extension: "120", crmUserId: "CRM-9" },
    });
    expect(s1.people).toHaveLength(s0.people.length + 1);
    expect(s1.calls.filter((c) => c.outcome === "no_match")).toEqual(noMatch);
  });

  it("new extension is credited on later batches", () => {
    let s = reducer(initialState(), {
      type: "addExtension",
      person: { id: "x1", name: "Zed Zane", extension: "120", crmUserId: "CRM-9" },
    });
    s = reducer(s, { type: "runBatch" });
    const fresh = s.calls.slice(-20).filter((c) => c.extension === "120");
    expect(fresh.length).toBeGreaterThanOrEqual(1);
    expect(fresh.every((c) => c.personId === "x1" && c.outcome !== "no_match")).toBe(true);
  });

  it("reset returns initialState", () => {
    const s = reducer(initialState(), { type: "runBatch" });
    expect(reducer(s, { type: "reset" })).toEqual(initialState());
  });
});
