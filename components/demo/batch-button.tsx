import { PlayIcon } from "@/components/demo/icons";

export function BatchButton({ onRun }: { onRun: () => void }) {
  return (
    <button type="button" className="btn pri" onClick={onRun}>
      <PlayIcon />
      Run sample batch
    </button>
  );
}

/** "20 calls: 13 sent, 4 too short, 2 already asked today, 1 not mapped". Zero parts are left out. */
export function batchSummary(c: { all: number; sent: number; skipped_short: number; skipped_daily_cap: number; no_match: number }): string {
  const parts = [
    [c.sent, "sent"],
    [c.skipped_short, "too short"],
    [c.skipped_daily_cap, "already asked today"],
    [c.no_match, "not mapped"],
  ]
    .filter(([n]) => n !== 0)
    .map(([n, w]) => `${n} ${w}`);
  return `${c.all} calls: ${parts.join(", ")}`;
}
