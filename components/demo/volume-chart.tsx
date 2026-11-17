const label = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`;
const long = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;

/** Calls by hour, drawn with plain elements (no chart library); the table underneath is for screen readers. */
export function VolumeChart({ rows }: { rows: { hour: number; calls: number; sent: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.calls));
  return (
    <>
      <div className="hrs" aria-hidden="true">
        {rows.map((r) => (
          <div key={r.hour} className={r.calls === max && r.calls > 0 ? "max" : undefined}>
            {r.calls}
            <i style={{ height: `${(r.calls / max) * 130}px` }} />
          </div>
        ))}
      </div>
      <div className="hl" aria-hidden="true">
        {rows.map((r) => (
          <span key={r.hour}>{label(r.hour)}</span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Calls by hour</caption>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Calls</th>
            <th>Texts sent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.hour}>
              <td>{long(r.hour)}</td>
              <td>{r.calls}</td>
              <td>{r.sent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
