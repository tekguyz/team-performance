import { describe, expect, it } from "vitest";
import { callsFiltered, overview, teamRows, volumeByHour } from "@/lib/demo/selectors";
import { initialState, reducer, type DemoState } from "@/lib/demo/state";

function after(n: number): DemoState {
  let s = initialState();
  for (let i = 0; i < n; i++) s = reducer(s, { type: "runBatch" });
  return s;
}

describe("selectors after 50 batches", () => {
  const s = after(50);

  it("processed equals the call log and sent + screened equals processed", () => {
    const o = overview(s);
    expect(o.processed).toBe(s.calls.length);
    expect(o.sent + o.screened).toBe(o.processed);
  });

  it("screened counts every call that was not sent", () => {
    expect(overview(s).screened).toBe(s.calls.filter((c) => c.outcome !== "sent").length);
  });

  it("every person's calls add up to the credited calls", () => {
    const credited = teamRows(s).reduce((n, r) => n + r.calls, 0);
    expect(credited).toBe(s.calls.filter((c) => c.personId !== null).length);
  });

  it("volume by hour covers hours 8 to 17 of the latest day and agrees with the log", () => {
    const rows = volumeByHour(s);
    expect(rows.map((r) => r.hour)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(rows.every((r) => r.sent <= r.calls)).toBe(true);
    expect(rows.reduce((n, r) => n + r.calls, 0)).toBeGreaterThan(0);
  });

  it("callsFiltered is newest first and filters by outcome", () => {
    const all = callsFiltered(s, "all");
    expect(all).toHaveLength(s.calls.length);
    for (let i = 1; i < all.length; i++) expect(Date.parse(all[i - 1].at)).toBeGreaterThanOrEqual(Date.parse(all[i].at));
    const sent = callsFiltered(s, "sent");
    expect(sent.every((c) => c.outcome === "sent")).toBe(true);
  });
});

describe("overview open flags", () => {
  it("starts at 3 and drops when one is cleared", () => {
    const s0 = initialState();
    expect(overview(s0).openFlags).toBe(3);
    const flagged = teamRows(s0).find((r) => r.needsReview)!;
    const s1 = reducer(s0, { type: "clearFlag", personId: flagged.person.id, at: "2026-11-17T12:00:00.000Z" });
    expect(overview(s1).openFlags).toBe(2);
  });
});
