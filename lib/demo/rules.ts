import { BRAND } from "@/lib/brand";
import type { Call, LoggedCall, Outcome, Person } from "@/lib/demo/types";

export const SHORT_CALL_SEC = 120;
export const DAILY_CAP_MS = 86_400_000;

export const OUTCOME_LABEL: Record<Outcome, string> = {
  sent: "Sent",
  skipped_short: "Skipped: under 2 minutes",
  skipped_daily_cap: "Skipped: asked in the last 24 hours",
  no_match: "No match: extension not mapped",
};

export function surveyText(person: Person): string {
  const firstName = person.name.split(" ")[0];
  return `Hi, thanks for speaking with ${firstName} at ${BRAND.business}. How did we do? Reply 1 to 5.`;
}

export function evaluateCalls(calls: Call[], people: Person[], history: LoggedCall[]): LoggedCall[] {
  const byExtension = new Map(people.map((p) => [p.extension, p]));
  // Last sent time per customer, from history first.
  const lastSent = new Map<string, number[]>();
  const remember = (customer: string, t: number) => {
    const list = lastSent.get(customer);
    if (list) list.push(t);
    else lastSent.set(customer, [t]);
  };
  for (const h of history) if (h.outcome === "sent") remember(h.customer, Date.parse(h.at));

  const ordered = [...calls].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  return ordered.map((c): LoggedCall => {
    const person = byExtension.get(c.extension);
    if (!person) return { ...c, outcome: "no_match", personId: null, text: null };
    if (c.durationSec < SHORT_CALL_SEC) return { ...c, outcome: "skipped_short", personId: person.id, text: null };
    const t = Date.parse(c.at);
    const capped = (lastSent.get(c.customer) ?? []).some((prior) => t - prior >= 0 && t - prior < DAILY_CAP_MS);
    if (capped) return { ...c, outcome: "skipped_daily_cap", personId: person.id, text: null };
    remember(c.customer, t);
    return { ...c, outcome: "sent", personId: person.id, text: surveyText(person) };
  });
}
