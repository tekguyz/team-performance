import { describe, expect, it } from "vitest";
import { evaluateCalls, surveyText } from "@/lib/demo/rules";
import type { Call, LoggedCall, Person } from "@/lib/demo/types";

const rosa: Person = { id: "p1", name: "Rosa Delgado", extension: "101", crmUserId: "CRM-1" };
const people = [rosa];
const T0 = Date.parse("2026-11-17T09:00:00-05:00");
const at = (ms: number) => new Date(T0 + ms).toISOString();
const MIN = 60_000;
const HOUR = 3_600_000;

const call = (id: string, offsetMs: number, durationSec: number, customer = "(555) 0100", extension = "101"): Call => ({
  id,
  at: at(offsetMs),
  extension,
  customer,
  durationSec,
});

describe("evaluateCalls", () => {
  it("sends after a 120-second call", () => {
    const [r] = evaluateCalls([call("a", 0, 120)], people, []);
    expect(r.outcome).toBe("sent");
    expect(r.text).toBe(surveyText(rosa));
    expect(r.personId).toBe("p1");
  });

  it("skips a 119-second call as skipped_short", () => {
    const [r] = evaluateCalls([call("a", 0, 119)], people, []);
    expect(r.outcome).toBe("skipped_short");
    expect(r.text).toBeNull();
  });

  it("skips a repeat customer 23h59m after a sent survey", () => {
    const history = evaluateCalls([call("a", 0, 300)], people, []);
    const [r] = evaluateCalls([call("b", 24 * HOUR - MIN, 300)], people, history);
    expect(r.outcome).toBe("skipped_daily_cap");
  });

  it("sends to a repeat customer exactly 24h after", () => {
    const history = evaluateCalls([call("a", 0, 300)], people, []);
    const [r] = evaluateCalls([call("b", 24 * HOUR, 300)], people, history);
    expect(r.outcome).toBe("sent");
  });

  it("a skipped call does not start the cap", () => {
    const out = evaluateCalls([call("a", 0, 60), call("b", 10 * MIN, 300)], people, []);
    expect(out.map((c) => c.outcome)).toEqual(["skipped_short", "sent"]);
  });

  it("caps within the same batch", () => {
    const out = evaluateCalls([call("a", 0, 300), call("b", 10 * MIN, 300)], people, []);
    expect(out.map((c) => c.outcome)).toEqual(["sent", "skipped_daily_cap"]);
  });

  it("unmapped extension is no_match with personId null and no text", () => {
    const [r] = evaluateCalls([call("a", 0, 300, "(555) 0100", "120")], people, []);
    expect(r.outcome).toBe("no_match");
    expect(r.personId).toBeNull();
    expect(r.text).toBeNull();
  });

  it("checks oldest first even when input is unordered", () => {
    const out = evaluateCalls([call("late", 10 * MIN, 300), call("early", 0, 300)], people, []);
    expect(out.map((c) => [c.id, c.outcome])).toEqual([
      ["early", "sent"],
      ["late", "skipped_daily_cap"],
    ]);
  });

  it("does not count history calls that were not sent", () => {
    const history: LoggedCall[] = [{ ...call("h", 0, 60), outcome: "skipped_short", personId: "p1", text: null }];
    const [r] = evaluateCalls([call("b", 10 * MIN, 300)], people, history);
    expect(r.outcome).toBe("sent");
  });
});

describe("surveyText", () => {
  it("uses the first name", () => {
    expect(surveyText(rosa)).toBe("Hi, thanks for speaking with Rosa at Coral Line Support. How did we do? Reply 1 to 5.");
  });
});
