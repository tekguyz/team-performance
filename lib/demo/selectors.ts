import { personDay } from "@/lib/demo/focus";
import { dateKey, hourInDemoTz } from "@/lib/demo/time";
import type { DemoState } from "@/lib/demo/state";
import type { LoggedCall, Outcome, PersonDay } from "@/lib/demo/types";

export function teamRows(s: DemoState): PersonDay[] {
  const cleared = new Set(Object.keys(s.cleared));
  return s.people.map((p) => personDay(p, s.calls, s.blocks, cleared));
}

export function overview(s: DemoState): { processed: number; sent: number; screened: number; openFlags: number } {
  const sent = s.calls.filter((c) => c.outcome === "sent").length;
  return {
    processed: s.calls.length,
    sent,
    screened: s.calls.length - sent,
    openFlags: teamRows(s).filter((r) => r.needsReview).length,
  };
}

/** Hours 8 to 17 of the latest day in the log. */
export function volumeByHour(s: DemoState): { hour: number; calls: number; sent: number }[] {
  const rows = Array.from({ length: 10 }, (_, i) => ({ hour: 8 + i, calls: 0, sent: 0 }));
  if (s.calls.length === 0) return rows;
  const latest = s.calls.reduce((m, c) => Math.max(m, Date.parse(c.at)), 0);
  const day = dateKey(latest);
  for (const c of s.calls) {
    if (dateKey(c.at) !== day) continue;
    const row = rows[hourInDemoTz(c.at) - 8];
    if (!row) continue;
    row.calls += 1;
    if (c.outcome === "sent") row.sent += 1;
  }
  return rows;
}

/** Newest first. */
export function callsFiltered(s: DemoState, outcome: Outcome | "all"): LoggedCall[] {
  const list = outcome === "all" ? s.calls : s.calls.filter((c) => c.outcome === outcome);
  return [...list].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export type OutcomeCounts = Record<Outcome | "all", number>;

export function outcomeCounts(s: DemoState): OutcomeCounts {
  const c: OutcomeCounts = { all: s.calls.length, sent: 0, skipped_short: 0, skipped_daily_cap: 0, no_match: 0 };
  for (const call of s.calls) c[call.outcome] += 1;
  return c;
}
