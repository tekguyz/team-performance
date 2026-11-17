import { BackIcon } from "@/components/demo/icons";
import { BRAND } from "@/lib/brand";
import { formatClock } from "@/lib/demo/format";

/** A drawn phone (about 9:19.5, island, status bar, Messages header) showing the survey text. */
export function Phone({ text, at }: { text: string; at: string }) {
  const clock = formatClock(at);
  const initials = BRAND.business
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className="phone" role="img" aria-label={`The text the customer would get: ${text}`}>
      <i className="sd" style={{ left: -3, top: "17%", height: "4.5%" }} />
      <i className="sd" style={{ left: -3, top: "24%", height: "8%" }} />
      <i className="sd" style={{ right: -3, top: "26%", height: "11%" }} />
      <div className="scr">
        <div className="island" />
        <div className="status" aria-hidden="true">
          <span>{clock.replace(/ (AM|PM)$/, "")}</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="18" height="12" viewBox="0 0 18 12">
              <path d="M1 11V8M6 11V5.5M11 11V3M16 11V1" stroke="#111" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
            <svg width="27" height="12" viewBox="0 0 27 12">
              <rect x=".5" y=".5" width="23" height="11" rx="3.2" fill="none" stroke="#111" opacity=".5" />
              <rect x="2" y="2" width="17" height="8" rx="2" fill="#111" />
              <path d="M25 4v4" stroke="#111" strokeWidth="1.6" opacity=".5" />
            </svg>
          </span>
        </div>
        <div className="mhead" aria-hidden="true">
          <BackIcon />
          <span className="av">{initials}</span>
          <span>{BRAND.business}</span>
        </div>
        <div className="thread" aria-hidden="true">
          <div className="when">Text Message · {clock}</div>
          <div className="bub">{text}</div>
        </div>
        <div className="compose" aria-hidden="true">
          Text Message
        </div>
        <span className="home" />
      </div>
    </div>
  );
}
