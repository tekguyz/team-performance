import type { outcomeCounts } from "@/lib/demo/selectors";

/** Where the calls ended up: the line is as thick as the number of calls still on it (DESIGN.md rule 2). */
export function Flow({
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
  const summary = `${processed} calls came in. ${c.no_match} had no mapped extension, ${c.skipped_short} were under 2 minutes, ${c.skipped_daily_cap} were asked in the last 24 hours. ${sent} texts were sent.`;
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
