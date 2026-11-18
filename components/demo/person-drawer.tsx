"use client";

import { Drawer } from "@/components/demo/drawer";
import { CheckIcon } from "@/components/demo/icons";
import { StatusTag } from "@/components/demo/status-tag";
import { BRAND } from "@/lib/brand";
import { REVIEW_BELOW } from "@/lib/demo/focus";
import { formatClock, formatDuration, formatMinutes, formatWhen } from "@/lib/demo/format";
import { OUTCOME_LABEL } from "@/lib/demo/rules";
import { SAMPLE_DATE } from "@/lib/demo/sample";
import { teamRows } from "@/lib/demo/selectors";
import { dateKey, zonedParts } from "@/lib/demo/time";
import { useDemo } from "@/lib/demo/use-demo";

const DAY_START = 8 * 60;
const DAY_LEN = 10 * 60;

function minuteOfDay(at: string): number {
  const p = zonedParts(Date.parse(at));
  return p.hour * 60 + p.minute + p.second / 60;
}

const pct = (from: number, len: number) => ({
  left: `${(Math.max(0, from - DAY_START) / DAY_LEN) * 100}%`,
  width: `${(Math.min(len, DAY_START + DAY_LEN - from) / DAY_LEN) * 100}%`,
});

export function PersonDrawer({ personId, onClose }: { personId: string | null; onClose: () => void }) {
  const { state, dispatch } = useDemo();
  const row = personId ? teamRows(state).find((r) => r.person.id === personId) : undefined;
  if (!row) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;

  const first = row.person.name.split(" ")[0];
  const calls = state.calls
    .filter((c) => c.personId === row.person.id)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const blocks = state.blocks.filter((b) => b.personId === row.person.id);
  const dayCalls = calls.filter((c) => dateKey(c.at) === SAMPLE_DATE);
  const clearedAt = state.cleared[row.person.id];

  let why: string;
  if (row.focus === null) why = `${first} logged no offline work, so there is no focus rating. Credit comes from calls alone.`;
  else {
    why = `${row.updates} updates across ${row.offlineMinutes} offline minutes gives a focus rating of ${row.focus}.`;
    if (row.focus < REVIEW_BELOW)
      why += ` Under ${REVIEW_BELOW} asks for a look, not a verdict: long case reviews often log few updates.`;
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={row.person.name}
      sub={
        <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "4px 10px", alignItems: "center" }}>
          <span className="num">
            Ext {row.person.extension} · {row.person.crmUserId}
          </span>
          <StatusTag row={row} />
        </span>
      }
    >
      <dl className="kv">
        <dt>Calls</dt>
        <dd className="num">
          {row.calls} {row.calls === 1 ? "call" : "calls"} · {formatMinutes(row.callMinutes)}
        </dd>
        <dt>Offline work</dt>
        <dd className="num">
          {formatMinutes(row.offlineMinutes)} · {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
        </dd>
        <dt>Credited time</dt>
        <dd className="num">{formatMinutes(row.creditedMinutes)}</dd>
        <dt>Updates logged</dt>
        <dd className="num">{row.updates}</dd>
        <dt>Focus rating</dt>
        <dd>
          <span className={row.needsReview ? "rate low" : "rate"}>{row.focus ?? "None"}</span>
        </dd>
      </dl>

      <p className="why">{why}</p>

      {row.needsReview && (
        <div className="dactions">
          <button
            type="button"
            className="btn pri"
            onClick={() => {
              dispatch({ type: "clearFlag", personId: row.person.id, at: new Date().toISOString() });
              // The button goes away; keep keyboard focus on the result instead of the drawer body.
              requestAnimationFrame(() => document.getElementById("cleared-status")?.focus());
            }}
          >
            <CheckIcon />
            Clear flag
          </button>
        </div>
      )}
      {clearedAt && (
        <p className="sub" role="status" tabIndex={-1} id="cleared-status">
          Cleared by {BRAND.supervisor}. The flag stays cleared for the day.
        </p>
      )}

      <h3>{first}&rsquo;s sample day, 8 AM to 6 PM</h3>
      <div className="tl" aria-hidden="true">
        {dayCalls.map((c) => (
          <i key={c.id} className="c" style={pct(minuteOfDay(c.at), c.durationSec / 60)} />
        ))}
        {blocks.map((b) => (
          <i key={b.start} className="o" style={pct(minuteOfDay(b.start), b.minutes)} />
        ))}
      </div>
      <div className="tl-hours" aria-hidden="true">
        <span>8 AM</span>
        <span>1 PM</span>
        <span>6 PM</span>
      </div>
      <p className="key">
        <span>
          <i style={{ background: "var(--ink)" }} />
          Calls
        </span>
        <span>
          <i style={{ background: "var(--mid)" }} />
          Offline work
        </span>
      </p>

      <h3>Offline blocks</h3>
      {blocks.length === 0 ? (
        <p className="sub">None logged.</p>
      ) : (
        <ul className="dlist">
          {blocks.map((b) => (
            <li key={b.start}>
              <span className="num">{formatClock(b.start)}</span>
              <span>{b.label}</span>
              <span className="num">
                {formatMinutes(b.minutes)} · {b.updates} updates
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3>Calls, newest first</h3>
      {calls.length === 0 ? (
        <p className="sub">No calls yet.</p>
      ) : (
        <ul className="dlist">
          {calls.map((c) => (
            <li key={c.id}>
              <span className="num">{formatWhen(c.at, SAMPLE_DATE)}</span>
              <span className="num">{formatDuration(c.durationSec)}</span>
              <span className={c.outcome === "sent" ? "out sent" : "out"}>{OUTCOME_LABEL[c.outcome]}</span>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
