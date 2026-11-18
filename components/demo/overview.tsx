"use client";

import Link from "next/link";
import { Flow } from "@/components/demo/flow";
import { VolumeChart } from "@/components/demo/volume-chart";
import { dateKey } from "@/lib/demo/time";
import { outcomeCounts, overview, volumeByHour } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";

const DAY = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

function dayName(key: string): string {
  return DAY.format(new Date(`${key}T12:00:00Z`));
}

export function Overview() {
  const { state } = useDemo();
  const o = overview(state);
  const c = outcomeCounts(state);
  const mapped = o.processed - c.no_match;
  const long = mapped - c.skipped_short;
  const latest = state.calls.reduce((m, x) => Math.max(m, Date.parse(x.at)), 0);
  const chartDay = latest ? dayName(dateKey(latest)) : "";
  const days = new Set(state.calls.map((x) => dateKey(x.at))).size;

  return (
    <>
      <div className="top">
        <div>
          <h1 className="title">Overview</h1>
          <p className="sub">
            {state.batches === 0
              ? `${chartDay} · 8 AM to 6 PM · ${state.people.length} people`
              : `Sample day plus ${state.batches} sample ${state.batches === 1 ? "batch" : "batches"} · ${state.people.length} people`}
          </p>
        </div>
        <span className="sp" />
        <Link className="btn" href="/demo/surveys">
          Open surveys
        </Link>
      </div>

      <div className="figs">
        <div className="fig">
          <div className="k">Calls processed</div>
          <div className="v">{o.processed}</div>
          <div className="n">
            {c.no_match === 0 ? "All credited to a person" : `All credited to a person but ${c.no_match}`}
          </div>
        </div>
        <div className="fig">
          <div className="k">Texts sent</div>
          <div className="v">{o.sent}</div>
          <div className="n">One rating text each</div>
        </div>
        <div className="fig">
          <div className="k">Screened out</div>
          <div className="v">{o.screened}</div>
          <div className="n">
            {c.skipped_short} under 2 min · {c.skipped_daily_cap} asked today · {c.no_match} no match
          </div>
        </div>
        <div className="fig flag">
          <div className="k">Open review flags</div>
          <div className="v">{o.openFlags}</div>
          <div className="n">
            <Link href="/demo/team">{o.openFlags === 0 ? "See the team" : "See who on Team"}</Link>
          </div>
        </div>
      </div>

      <section className="section" aria-labelledby="flow-h">
        <h2 id="flow-h">Where {o.processed} calls ended up</h2>
        <p className="sub">The line is as thick as the number of calls still on it.</p>
        <Flow processed={o.processed} mapped={mapped} long={long} sent={o.sent} c={c} />
      </section>

      <section className="section" aria-labelledby="hrs-h">
        <h2 id="hrs-h">Calls by hour</h2>
        <p className="sub">
          {days > 1 ? `All ${days} days in the log, added up by hour` : `${chartDay}, 8 AM to 6 PM`}. The busiest hour is in plum.
        </p>
        <VolumeChart rows={volumeByHour(state)} />
      </section>
    </>
  );
}
