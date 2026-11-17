import { describe, expect, it } from "vitest";
import { personDay } from "@/lib/demo/focus";
import { evaluateCalls } from "@/lib/demo/rules";
import { SAMPLE_PEOPLE, sampleBatch, sampleDay } from "@/lib/demo/sample";
import { hourInDemoTz } from "@/lib/demo/time";
import type { LoggedCall } from "@/lib/demo/types";

function runBatches(n: number): { log: LoggedCall[]; batches: LoggedCall[][]; raws: ReturnType<typeof sampleBatch>[] } {
  let log = sampleDay().calls;
  const batches: LoggedCall[][] = [];
  const raws: ReturnType<typeof sampleBatch>[] = [];
  for (let i = 1; i <= n; i++) {
    const raw = sampleBatch(i, log, SAMPLE_PEOPLE);
    const evaluated = evaluateCalls(raw, SAMPLE_PEOPLE, log);
    raws.push(raw);
    batches.push(evaluated);
    log = [...log, ...evaluated];
  }
  return { log, batches, raws };
}

describe("sampleDay", () => {
  it("is the same on every call", () => {
    expect(sampleDay()).toEqual(sampleDay());
  });
  it("has between 170 and 190 calls", () => {
    const n = sampleDay().calls.length;
    expect(n).toBeGreaterThanOrEqual(170);
    expect(n).toBeLessThanOrEqual(190);
  });
  it("has all four outcomes, including the unmapped extension 120", () => {
    const { calls } = sampleDay();
    expect(new Set(calls.map((c) => c.outcome))).toEqual(
      new Set(["sent", "skipped_short", "skipped_daily_cap", "no_match"]),
    );
    expect(calls.some((c) => c.extension === "120")).toBe(true);
  });
  it("has 14 people on extensions 101 to 114", () => {
    expect(SAMPLE_PEOPLE.map((p) => p.extension)).toEqual(Array.from({ length: 14 }, (_, i) => String(101 + i)));
  });
  it("exactly 3 people need review", () => {
    const { calls, blocks } = sampleDay();
    const days = SAMPLE_PEOPLE.map((p) => personDay(p, calls, blocks, new Set()));
    expect(days.filter((d) => d.needsReview)).toHaveLength(3);
    expect(days.every((d) => d.focus !== null)).toBe(true);
  });
  it("one flagged person did a long case review with few updates", () => {
    const { blocks } = sampleDay();
    expect(blocks.some((b) => b.label === "Case review" && b.minutes >= 90 && b.updates <= 10)).toBe(true);
  });
});

describe("sampleBatch", () => {
  it("returns 20 calls all after the latest logged call", () => {
    const log = sampleDay().calls;
    const latest = Math.max(...log.map((c) => Date.parse(c.at)));
    const batch = sampleBatch(1, log, SAMPLE_PEOPLE);
    expect(batch).toHaveLength(20);
    for (const c of batch) expect(Date.parse(c.at)).toBeGreaterThan(latest);
  });
  it("50 batches in a row keep times increasing and stay within 08:00-18:00", () => {
    const { raws } = runBatches(50);
    let prev = 0;
    for (const raw of raws) {
      for (const c of raw) {
        const t = Date.parse(c.at);
        expect(t).toBeGreaterThan(prev);
        prev = t;
        const h = hourInDemoTz(c.at);
        expect(h).toBeGreaterThanOrEqual(8);
        expect(h).toBeLessThan(18);
      }
    }
  });
  it("has unique call ids across 50 batches", () => {
    const { log } = runBatches(50);
    expect(new Set(log.map((c) => c.id)).size).toBe(log.length);
  });
  it("in each of 50 batches at least 10 calls are sent", () => {
    const { batches } = runBatches(50);
    for (const b of batches) expect(b.filter((c) => c.outcome === "sent").length).toBeGreaterThanOrEqual(10);
  });
  it("includes a repeat customer that comes back as skipped_daily_cap, short calls and one unmapped", () => {
    const { batches } = runBatches(10);
    for (const b of batches) {
      expect(b.filter((c) => c.outcome === "skipped_daily_cap").length).toBeGreaterThanOrEqual(3);
      expect(b.filter((c) => c.outcome === "skipped_short").length).toBeGreaterThanOrEqual(3);
      expect(b.filter((c) => c.extension === "120")).toHaveLength(1);
    }
  });
  it("hours are the same in any time zone", () => {
    const original = process.env.TZ;
    const snap = () => {
      const { log } = runBatches(10);
      return log.map((c) => c.at);
    };
    try {
      process.env.TZ = "UTC";
      const a = snap();
      process.env.TZ = "Asia/Tokyo";
      const b = snap();
      expect(b).toEqual(a);
      for (const iso of a) {
        const h = hourInDemoTz(iso);
        expect(h).toBeGreaterThanOrEqual(8);
        expect(h).toBeLessThan(18);
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });
});
