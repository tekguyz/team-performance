import { describe, expect, it } from "vitest";
import { formatClock, formatDuration, formatMinutes, formatWhen } from "@/lib/demo/format";

describe("display formats", () => {
  it("shows call length as m:ss", () => {
    expect(formatDuration(252)).toBe("4:12");
    expect(formatDuration(59)).toBe("0:59");
    expect(formatDuration(120)).toBe("2:00");
  });

  it("shows minutes as hours and minutes", () => {
    expect(formatMinutes(190)).toBe("3h 10m");
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(120)).toBe("2h 0m");
    expect(formatMinutes(0)).toBe("0m");
  });

  it("shows a clock time in the demo time zone", () => {
    expect(formatClock("2026-11-17T14:41:00-05:00")).toBe("2:41 PM");
    expect(formatClock("2026-11-17T09:05:00-05:00")).toBe("9:05 AM");
    expect(formatClock("2026-11-17T12:00:00-05:00")).toBe("12:00 PM");
  });

  it("adds the date only when the call is not on the sample day", () => {
    expect(formatWhen("2026-11-17T09:05:00-05:00", "2026-11-17")).toBe("9:05 AM");
    expect(formatWhen("2026-11-18T08:14:00-05:00", "2026-11-17")).toBe("Nov 18, 8:14 AM");
  });
});
