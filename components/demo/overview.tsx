"use client";

import Link from "next/link";
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
          {chartDay}, 8 AM to 6 PM. The busiest hour is in plum.
        </p>
        <VolumeChart rows={volumeByHour(state)} />
      </section>
    </>
  );
}

function Flow({
  processed,
  mapped,
  long,
  sent,
  c,
}: {
  processed: number;
  mapped: number;
  long: number;
  sent: number;
  c: ReturnType<typeof outcomeCounts>;
}) {
  const w = (n: number) => (processed === 0 ? 3 : Math.max(3, (26 * n) / processed));
  const summary = `${processed} calls came in. ${c.no_match} had no mapped extension, ${c.skipped_short} were under 2 minutes, ${c.skipped_daily_cap} were already asked today. ${sent} texts were sent.`;
  const exits = [
    { x: 200, n: c.no_match, label: "No match", from: w(processed) },
    { x: 380, n: c.skipped_short, label: "Under 2 minutes", from: w(mapped) },
    { x: 560, n: c.skipped_daily_cap, label: "Asked today", from: w(long) },
  ];
  return (
    <>
      <svg className="flow" viewBox="0 0 800 250" role="img" aria-label={summary}>
        <g fontWeight="700" fontSize="14" fill="var(--ink)" textAnchor="middle">
          <text x="50" y="34">Call comes in</text>
          <text x="200" y="34">Extension mapped</text>
          <text x="380" y="34">2 minutes or longer</text>
          <text x="560" y="34">Not asked in 24 hours</text>
          <text x="740" y="34">Text sent</text>
        </g>
        <g fill="none">
          <path d="M50 100H200" stroke="var(--ink)" strokeWidth={w(processed)} />
          <path d="M200 100H380" stroke="var(--ink)" strokeWidth={w(mapped)} />
          <path d="M380 100H560" stroke="var(--ink)" strokeWidth={w(long)} />
          <path d="M560 100H740" stroke="var(--accent)" strokeWidth={w(sent)} />
          {exits.map((e) => (
            <g key={e.x}>
              <path d={`M${e.x} ${100 + e.from / 2 + 3}V170`} stroke="var(--exit)" strokeWidth="5" strokeDasharray="4 4" />
              <path d={`M${e.x - 10} 172h20`} stroke="var(--ink)" strokeWidth="5" />
            </g>
          ))}
        </g>
        <g fill="#fff" stroke="var(--ink)" strokeWidth="6">
          <circle cx="50" cy="100" r="13" />
          <circle cx="200" cy="100" r="11" />
          <circle cx="380" cy="100" r="11" />
          <circle cx="560" cy="100" r="11" />
        </g>
        <circle cx="740" cy="100" r="15" fill="var(--accent)" stroke="#fff" strokeWidth="3" />
        <g fontWeight="800" fontSize="22" fill="var(--ink)" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
          <text x="125" y="72">{processed}</text>
          <text x="290" y="72">{mapped}</text>
          <text x="470" y="74">{long}</text>
          <text x="650" y="74" fill="var(--accent)">
            {sent}
          </text>
          {exits.map((e) => (
            <text key={e.x} x={e.x} y="208" fontSize="28">
              {e.n}
            </text>
          ))}
        </g>
        <g fontSize="13" fill="var(--muted)" textAnchor="middle">
          {exits.map((e) => (
            <text key={e.x} x={e.x} y="228">
              {e.label}
            </text>
          ))}
          <text x="740" y="134" fill="var(--accent)" fontWeight="700">
            Texts sent
          </text>
        </g>
      </svg>
      {/* Phone width: the same trip as a list, top to bottom. */}
      <ul className="flow-list">
        <li>
          <span>Call comes in</span>
          <b>{processed}</b>
        </li>
        <li className="exit">
          <span>No match</span>
          <b>{c.no_match}</b>
        </li>
        <li>
          <span>Extension mapped</span>
          <b>{mapped}</b>
        </li>
        <li className="exit">
          <span>Under 2 minutes</span>
          <b>{c.skipped_short}</b>
        </li>
        <li>
          <span>2 minutes or longer</span>
          <b>{long}</b>
        </li>
        <li className="exit">
          <span>Asked today</span>
          <b>{c.skipped_daily_cap}</b>
        </li>
        <li className="end">
          <span>Text sent</span>
          <b>{sent}</b>
        </li>
      </ul>
    </>
  );
}
