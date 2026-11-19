import { describe, expect, it } from "vitest";
import { batchSummary } from "@/components/demo/batch-button";

describe("batchSummary", () => {
  it("reads like the plan's example", () => {
    expect(batchSummary({ all: 20, sent: 13, skipped_short: 4, skipped_daily_cap: 2, no_match: 1 })).toBe(
      "20 calls: 13 sent, 4 too short, 2 asked in the last 24 hours, 1 not mapped",
    );
  });
  it("leaves out zero parts", () => {
    expect(batchSummary({ all: 20, sent: 20, skipped_short: 0, skipped_daily_cap: 0, no_match: 0 })).toBe("20 calls: 20 sent");
  });
});
