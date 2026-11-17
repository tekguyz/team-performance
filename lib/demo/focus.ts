import type { LoggedCall, Person, PersonDay, WorkBlock } from "@/lib/demo/types";

export const REVIEW_BELOW = 40;

export function focusRating(updates: number, offlineMinutes: number): number | null {
  if (offlineMinutes <= 0) return null;
  return Math.min(100, Math.round((updates / offlineMinutes) * 100));
}

export function personDay(
  person: Person,
  calls: LoggedCall[],
  blocks: WorkBlock[],
  clearedIds: ReadonlySet<string>,
): PersonDay {
  const mine = calls.filter((c) => c.personId === person.id);
  const myBlocks = blocks.filter((b) => b.personId === person.id);
  const callMinutes = Math.round(mine.reduce((s, c) => s + c.durationSec, 0) / 60);
  const offlineMinutes = myBlocks.reduce((s, b) => s + b.minutes, 0);
  const updates = myBlocks.reduce((s, b) => s + b.updates, 0);
  const focus = focusRating(updates, offlineMinutes);
  const cleared = clearedIds.has(person.id);
  return {
    person,
    calls: mine.length,
    callMinutes,
    offlineMinutes,
    creditedMinutes: callMinutes + offlineMinutes,
    updates,
    focus,
    needsReview: focus !== null && focus < REVIEW_BELOW && !cleared,
    cleared,
  };
}
