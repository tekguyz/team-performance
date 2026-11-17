import { describe, expect, it } from "vitest";
import { focusRating, personDay } from "@/lib/demo/focus";
import type { LoggedCall, Person } from "@/lib/demo/types";
import type { WorkBlock } from "@/lib/demo/types";

const rosa: Person = { id: "p1", name: "Rosa Delgado", extension: "101", crmUserId: "CRM-1" };
const ben: Person = { id: "p2", name: "Ben Ortiz", extension: "102", crmUserId: "CRM-2" };

const call = (id: string, personId: string, durationSec: number): LoggedCall => ({
  id,
  at: "2026-11-17T09:00:00-05:00",
  extension: personId === "p1" ? "101" : "102",
  customer: "(555) 0100",
  durationSec,
  outcome: "sent",
  personId,
  text: "x",
});
const block = (personId: string, minutes: number, updates: number): WorkBlock => ({
  personId,
  kind: "offline",
  label: "Case review",
  start: "2026-11-17T10:00:00-05:00",
  minutes,
  updates,
});

describe("focusRating", () => {
  it("rounds updates over minutes", () => expect(focusRating(14, 15)).toBe(93));
  it("caps at 100", () => expect(focusRating(30, 10)).toBe(100));
  it("is 0 with no updates", () => expect(focusRating(0, 45)).toBe(0));
  it("is null with no offline minutes", () => expect(focusRating(3, 0)).toBeNull());
});

describe("personDay", () => {
  it("40 is not flagged", () => {
    const d = personDay(rosa, [], [block("p1", 15, 6)], new Set());
    expect(d.focus).toBe(40);
    expect(d.needsReview).toBe(false);
  });
  it("flags focus under 40", () => {
    const d = personDay(rosa, [], [block("p1", 10, 2)], new Set());
    expect(d.focus).toBe(20);
    expect(d.needsReview).toBe(true);
    expect(d.cleared).toBe(false);
  });
  it("cleared id is not flagged", () => {
    const d = personDay(rosa, [], [block("p1", 10, 2)], new Set(["p1"]));
    expect(d.needsReview).toBe(false);
    expect(d.cleared).toBe(true);
  });
  it("credits offline minutes even at focus 0", () => {
    const d = personDay(rosa, [call("a", "p1", 600)], [block("p1", 45, 0)], new Set());
    expect(d.focus).toBe(0);
    expect(d.callMinutes).toBe(10);
    expect(d.offlineMinutes).toBe(45);
    expect(d.creditedMinutes).toBe(55);
  });
  it("ignores other people's calls and blocks", () => {
    const d = personDay(rosa, [call("a", "p2", 600), call("b", "p1", 90)], [block("p2", 30, 1)], new Set());
    expect(d.calls).toBe(1);
    expect(d.callMinutes).toBe(2); // 1.5 rounds to 2
    expect(d.offlineMinutes).toBe(0);
    expect(d.updates).toBe(0);
    expect(d.focus).toBeNull();
    expect(d.needsReview).toBe(false);
    void ben;
  });
});
