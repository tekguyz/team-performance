import { formatDateTime, maskCustomer } from "@/lib/demo/format";
import { OUTCOME_LABEL } from "@/lib/demo/rules";
import type { LoggedCall, Person } from "@/lib/demo/types";

const HEADER = ["Time", "Extension", "Person", "CRM user", "Customer", "Duration (s)", "Outcome"];

function field(value: string | number): string {
  const s = String(value);
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

export function csvFileName(date: string): string {
  return `team-performance-calls-${date}.csv`;
}
