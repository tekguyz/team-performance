import { describe, expect, it } from "vitest";
import { callsToCsv, csvFileName } from "@/lib/demo/csv";
import type { LoggedCall, Person } from "@/lib/demo/types";

const ana: Person = { id: "p1", name: 'Ana "Nana" Pérez, Jr.', extension: "101", crmUserId: "CRM-1" };
const sent: LoggedCall = {
  id: "a",
  at: "2026-11-17T09:00:00-05:00",
  extension: "101",
  customer: "(305) 555-0142",
  durationSec: 300,
  outcome: "sent",
  personId: "p1",
  text: "x",
};
const noMatch: LoggedCall = { ...sent, id: "b", extension: "120", outcome: "no_match", personId: null, text: null };

describe("callsToCsv", () => {
  const csv = callsToCsv([sent, noMatch], [ana]);
  const lines = csv.slice(1).split("\r\n");

  it("starts with a UTF-8 BOM", () => expect(csv.startsWith("﻿")).toBe(true));
  it("has the exact header", () => expect(lines[0]).toBe("Time,Extension,Person,CRM user,Customer,Duration (s),Outcome"));
  it("quotes names with commas and quotes, keeping accents", () => {
    expect(lines[1]).toContain('"Ana ""Nana"" Pérez, Jr."');
  });
  it("masks the customer as on screen", () => expect(lines[1]).toContain("(305) •••-0142"));
  it("leaves Person and CRM user empty for no_match", () => {
    expect(lines[2]).toBe("2026-11-17 09:00,120,,,(305) •••-0142,300,No match: extension not mapped");
  });
  it("uses CRLF and ends with one", () => {
    expect(csv.endsWith("\r\n")).toBe(true);
    expect(csv.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });
  it("quotes a field with a line break", () => {
    const odd: Person = { ...ana, name: "Line\nBreak" };
    expect(callsToCsv([sent], [odd])).toContain('"Line\nBreak"');
  });
});

describe("csvFileName", () => {
  it("matches the plan", () => expect(csvFileName("2026-11-17")).toBe("team-performance-calls-2026-11-17.csv"));
});
