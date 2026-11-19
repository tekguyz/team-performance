import { formatDateTime, maskCustomer } from "@/lib/demo/format";
import { OUTCOME_LABEL } from "@/lib/demo/rules";
import { dateKey } from "@/lib/demo/time";
import type { LoggedCall, Person } from "@/lib/demo/types";

const HEADER = ["Time", "Extension", "Person", "CRM user", "Customer", "Duration (s)", "Outcome"];

/** A text field starting with = + - or @ opens as a formula in Excel, so it gets a leading '. */
function field(value: string | number): string {
  let s = String(value);
  if (typeof value === "string" && /^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Opens cleanly in Excel: UTF-8 BOM, CRLF lines, quoted fields where needed. */
export function callsToCsv(calls: LoggedCall[], people: Person[]): string {
  const byId = new Map(people.map((p) => [p.id, p]));
  const rows = calls.map((c) => {
    const person = c.personId ? byId.get(c.personId) : undefined;
    return [
      formatDateTime(c.at),
      c.extension,
      person?.name ?? "",
      person?.crmUserId ?? "",
      maskCustomer(c.customer),
      c.durationSec,
      OUTCOME_LABEL[c.outcome],
    ];
  });
  return "﻿" + [HEADER, ...rows].map((r) => r.map(field).join(",")).join("\r\n") + "\r\n";
}

/** "team-performance-calls-2026-11-17.csv", or "...-2026-11-16-to-2026-11-17-skipped-short.csv" for a range and a filter. */
export function csvFileName(calls: Pick<LoggedCall, "at">[], filter: string = "all"): string {
  const days = calls.map((c) => dateKey(c.at)).sort();
  const range = days.length === 0 ? "" : days[0] === days[days.length - 1] ? days[0] : `${days[0]}-to-${days[days.length - 1]}`;
  return ["team-performance-calls", range, filter === "all" ? "" : filter.replace(/_/g, "-")].filter(Boolean).join("-") + ".csv";
}
