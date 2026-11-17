"use client";

import { useCallback, useState } from "react";
import { PersonDrawer } from "@/components/demo/person-drawer";
import { StatusTag } from "@/components/demo/status-tag";
import { formatMinutes } from "@/lib/demo/format";
import { teamRows } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";

export function TeamTable() {
  const { state } = useDemo();
  const rows = teamRows(state);
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  const maxCredit = Math.max(1, ...rows.map((r) => r.creditedMinutes));
  const flagged = rows.filter((r) => r.needsReview).length;

  return (
    <>
      <div className="top">
        <div>
          <h1 className="title">Team</h1>
          <p className="sub">
            Credit for calls and offline work, by extension.{" "}
            {flagged === 0 ? "No open review flags." : `${flagged} open review ${flagged === 1 ? "flag" : "flags"}.`}
          </p>
        </div>
      </div>
      <table className="log stack">
        <thead>
          <tr>
            <th>Ext</th>
            <th>Person</th>
            <th>Credited time</th>
            <th>Updates</th>
            <th>Focus</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.person.id} className={openId === r.person.id ? "sel" : undefined} onClick={() => setOpenId(r.person.id)}>
              <td className="num hide-s">{r.person.extension}</td>
              <td>
                <div className="who">
                  <button type="button" className="rowbtn" onClick={(e) => (e.stopPropagation(), setOpenId(r.person.id))}>
                    {r.person.name}
                  </button>
                  <small>
                    <span className="num">Ext {r.person.extension}</span> · {r.person.crmUserId}
                  </small>
                </div>
              </td>
              <td className="ct full">
                <div className="bar" aria-hidden="true">
                  <i className="c" style={{ width: `${(r.callMinutes / maxCredit) * 100}%` }} />
                  <i className="o" style={{ width: `${(r.offlineMinutes / maxCredit) * 100}%` }} />
                </div>
                <small className="num">
                  {formatMinutes(r.creditedMinutes)} · calls {formatMinutes(r.callMinutes)} + offline {formatMinutes(r.offlineMinutes)}
                </small>
              </td>
              <td className="num hide-s">{r.updates}</td>
              <td className="end">
                <small className="m-only">Focus </small>
                <span className={r.needsReview ? "rate low" : "rate"} aria-label={r.focus === null ? "No focus rating" : `Focus rating ${r.focus}`}>
                  {r.focus ?? "–"}
                </span>
              </td>
              <td className="full st">
                <StatusTag row={r} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PersonDrawer personId={openId} onClose={close} />
    </>
  );
}
