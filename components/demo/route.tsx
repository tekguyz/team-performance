import { OUTCOME_LABEL } from "@/lib/demo/rules";
import type { Outcome } from "@/lib/demo/types";

// Stops: call comes in, extension mapped, 2 minutes, 24 hours, text sent (DESIGN.md rule 1).
const XS = [8, 40, 72, 104, 136];
const LAST_STOP: Record<Outcome, number> = { no_match: 1, skipped_short: 2, skipped_daily_cap: 3, sent: 4 };

/** A call drawn as a trip: plum to the end when sent, ink up to the stop that held it otherwise. */
export function Route({ outcome, className = "mini" }: { outcome: Outcome; className?: string }) {
  const idx = LAST_STOP[outcome];
  const sent = outcome === "sent";
  const col = sent ? "var(--accent)" : "var(--ink)";
  return (
    <svg className={className} viewBox="0 0 144 20" role="img" aria-label={OUTCOME_LABEL[outcome]} preserveAspectRatio="xMinYMid meet">
      <path d="M8 10H136" stroke="var(--rule)" strokeWidth="5" />
      <path d={`M8 10H${XS[idx]}`} stroke={col} strokeWidth="5" />
      {XS.map((x, i) => {
        const r = i === 4 ? 5.5 : 4.2;
        return i <= idx ? (
          <circle key={x} cx={x} cy="10" r={r} fill={col} />
        ) : (
          <circle key={x} cx={x} cy="10" r={r} fill="#fff" stroke="var(--rule)" strokeWidth="2.4" />
        );
      })}
      {!sent && <path d={`M${XS[idx] + 7} 3V17`} stroke="var(--ink)" strokeWidth="3" />}
    </svg>
  );
}
