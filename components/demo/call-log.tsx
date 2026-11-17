"use client";

import { useCallback, useState } from "react";
import { BatchButton, batchSummary } from "@/components/demo/batch-button";
import { Drawer } from "@/components/demo/drawer";
import { DownloadIcon } from "@/components/demo/icons";
import { Phone } from "@/components/demo/phone";
import { Route } from "@/components/demo/route";
import { callsToCsv, csvFileName } from "@/lib/demo/csv";
import { formatDuration, formatWhen, maskCustomer } from "@/lib/demo/format";
import { DAILY_CAP_MS, OUTCOME_LABEL } from "@/lib/demo/rules";
import { SAMPLE_DATE } from "@/lib/demo/sample";
import { callsFiltered, outcomeCounts } from "@/lib/demo/selectors";
import type { LoggedCall, Outcome, Person } from "@/lib/demo/types";
import { useDemo } from "@/lib/demo/use-demo";

const PAGE = 50;
const FILTERS: { key: Outcome | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "skipped_short", label: "Under 2 minutes" },
  { key: "skipped_daily_cap", label: "Already asked today" },
  { key: "no_match", label: "No match" },
];
const RULES = [
  { b: "Call comes in", s: "Every desk-phone call is logged." },
  { b: "Extension is mapped", s: "Credited to the right person." },
  { b: "2 minutes or longer", s: "Shorter calls get no text." },
  { b: "Not asked in 24 hours", s: "One text per customer a day." },
];

function download(name: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CallLog() {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<Outcome | "all">("all");
  const [shown, setShown] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  // Calls at or after this index in the log arrived in the last batch.
  const [batchFrom, setBatchFrom] = useState<number | null>(null);
  const close = useCallback(() => setOpenId(null), []);

  const counts = outcomeCounts(state);
  const list = callsFiltered(state, filter);
  const people = new Map(state.people.map((p) => [p.id, p]));
  const fresh =
    batchFrom !== null && batchFrom < state.calls.length ? state.calls.slice(batchFrom) : [];
  const freshIds = new Set(fresh.map((c) => c.id));
  const open = openId ? state.calls.find((c) => c.id === openId) : undefined;

  const run = () => {
    setBatchFrom(state.calls.length);
    dispatch({ type: "runBatch" });
  };

  return (
    <>
      <div className="top">
        <div>
          <h1 className="title">Surveys</h1>
          <p className="sub">Every call, newest first, and where its trip ended</p>
        </div>
        <span className="sp" />
        <button
          type="button"
          className="btn"
          onClick={() => download(csvFileName(SAMPLE_DATE), callsToCsv(list, state.people))}
        >
          <DownloadIcon />
          Export CSV
        </button>
        <BatchButton onRun={run} />
      </div>

      <div className="rules">
        <div className="rt">
          {RULES.map((r, i) => (
            <div key={r.b}>
              <svg viewBox="0 0 200 22" preserveAspectRatio="none" aria-hidden="true">
                <path d={`M0 11H${i === 3 ? 14 : 200}`} stroke="var(--ink)" strokeWidth="6" />
                <circle cx="12" cy="11" r="8" fill="#fff" stroke="var(--ink)" strokeWidth="5" />
              </svg>
              <b>{r.b}</b>
              <span>{r.s}</span>
            </div>
          ))}
        </div>
        <p className="edit">
          <b>Edit rules</b>
          Not available in the demo
        </p>
      </div>

      <p className="summary" role="status" aria-live="polite">
        {fresh.length > 0 ? batchSummary(countList(fresh)) : ""}
      </p>

      <div className="filters" role="group" aria-label="Show calls">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => {
              setFilter(f.key);
              setShown(PAGE);
            }}
          >
            {f.label}
            <span className="num">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <table className="log stack">
        <thead>
          <tr>
            <th>Time</th>
            <th>Person</th>
            <th>Length</th>
            <th>Customer</th>
            <th className="hide-m">Trip</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          {list.slice(0, shown).map((c) => {
            const p = c.personId ? people.get(c.personId) : undefined;
            const cls = [freshIds.has(c.id) && "new", openId === c.id && "sel"].filter(Boolean).join(" ");
            return (
              <tr key={c.id} className={cls || undefined} onClick={() => setOpenId(c.id)}>
                <td className="num">{formatWhen(c.at, SAMPLE_DATE)}</td>
                <td className="end">
                  <div className="who">
                    <button
                      type="button"
                      className="rowbtn"
                      onClick={(e) => (e.stopPropagation(), setOpenId(c.id))}
                    >
                      {p?.name ?? "Unknown"}
                    </button>
                    <small className="num">Ext {c.extension}</small>
                  </div>
                </td>
                <td className="num hide-s">{formatDuration(c.durationSec)}</td>
                <td className="num hide-s">{maskCustomer(c.customer)}</td>
                <td className="hide-s hide-m">
                  <Route outcome={c.outcome} />
                </td>
                <td className="full">
                  <span className={c.outcome === "sent" ? "out sent" : "out"}>{OUTCOME_LABEL[c.outcome]}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {list.length === 0 && <p className="sub">No calls with this outcome yet.</p>}
      {list.length > shown && (
        <div className="more">
          <button type="button" className="btn" onClick={() => setShown((n) => n + PAGE)}>
            Show {Math.min(PAGE, list.length - shown)} more of {list.length - shown}
          </button>
        </div>
      )}

      <CallDrawer call={open} person={open?.personId ? people.get(open.personId) : undefined} log={state.calls} onClose={close} />
    </>
  );
}

function countList(calls: LoggedCall[]) {
  const c = { all: calls.length, sent: 0, skipped_short: 0, skipped_daily_cap: 0, no_match: 0 };
  for (const x of calls) c[x.outcome] += 1;
  return c;
}

/** Which rule let the text through, or which stopped it, in one sentence. */
export function reason(call: LoggedCall, log: LoggedCall[]): string {
  const len = formatDuration(call.durationSec);
  switch (call.outcome) {
    case "sent":
      return `Sent because the call ran ${len} and this number had no text in the last 24 hours.`;
    case "skipped_short":
      return `No text: the call ran ${len}, under 2 minutes.`;
    case "skipped_daily_cap": {
      const t = Date.parse(call.at);
      const prior = log.find(
        (c) => c.outcome === "sent" && c.customer === call.customer && t - Date.parse(c.at) >= 0 && t - Date.parse(c.at) < DAILY_CAP_MS,
      );
      return prior
        ? `No text: this number was already asked at ${formatWhen(prior.at, SAMPLE_DATE)}, less than 24 hours before.`
        : "No text: this number was already asked in the 24 hours before this call.";
    }
    case "no_match":
      return `No text: extension ${call.extension} is not mapped to a person, so the call could not be credited.`;
  }
}

function CallDrawer({
  call,
  person,
  log,
  onClose,
}: {
  call: LoggedCall | undefined;
  person: Person | undefined;
  log: LoggedCall[];
  onClose: () => void;
}) {
  if (!call)
    return (
      <Drawer open={false} onClose={onClose} title="">
        {null}
      </Drawer>
    );
  return (
    <Drawer
      open
      onClose={onClose}
      title={OUTCOME_LABEL[call.outcome]}
      sub={
        <span className="num">
          {formatWhen(call.at, SAMPLE_DATE)} · {person?.name ?? "Unknown"} · Ext {call.extension} · {formatDuration(call.durationSec)} ·{" "}
          {maskCustomer(call.customer)}
        </span>
      }
    >
      <div className="call-route">
        <Route outcome={call.outcome} />
      </div>
      {call.outcome === "sent" && call.text ? (
        <div className="phone-wrap">
          <span className="notsent">Not sent: demo</span>
          <Phone text={call.text} at={call.at} />
          <p className="phone-note">{reason(call, log)}</p>
        </div>
      ) : (
        <p className="why">{reason(call, log)}</p>
      )}
      <p className="sub">
        {call.outcome === "no_match"
          ? `Map extension ${call.extension} on Extensions and later calls from it are credited.`
          : `The call still counts toward ${person?.name.split(" ")[0] ?? "the person"}’s credited time.`}
      </p>
    </Drawer>
  );
}
