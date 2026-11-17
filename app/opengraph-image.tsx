import { ImageResponse } from "next/og";
import { atkinson } from "@/lib/og-font";
import { BRAND } from "@/lib/brand";

export const alt = "Team Performance: phone logs that credit the right person, and surveys that know when to stop.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LINE = "Phone logs that credit the right person, and surveys that know when to stop.";
const STOPS = ["Call", "Extension mapped", "2 minutes", "24 hours", "Text sent"];
const INK = "#1c1824";
const PLUM = "#5c2d91";

/** The link preview, in the Route line look (DESIGN.md): ink on white, one plum route end, no cards. */
export default async function Image() {
  const [heavy, body] = await Promise.all([atkinson(800), atkinson(400)]);
  const fonts = [
    ...(heavy ? [{ name: "Atkinson", data: heavy, weight: 800 as const, style: "normal" as const }] : []),
    ...(body ? [{ name: "Atkinson", data: body, weight: 400 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff", color: INK, fontFamily: "Atkinson", padding: "56px 64px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="52" height="52" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" fill="#f4f1f7" />
            <path d="M9 8v16M13.5 8v16M18 8v16M22.5 8v16" stroke={INK} strokeWidth="2.4" fill="none" />
            <path d="M6 21 26 11" stroke={PLUM} strokeWidth="2.8" fill="none" />
          </svg>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.3 }}>{BRAND.product}</div>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 64, fontWeight: 800, lineHeight: 1.04, letterSpacing: -1.9, maxWidth: 1040 }}>
          {LINE}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <svg width="1072" height="40" viewBox="0 0 1072 40">
            <path d="M40 20H790" stroke={INK} strokeWidth="8" />
            <path d="M790 20H1040" stroke={PLUM} strokeWidth="8" />
            {[40, 290, 540, 790].map((x) => (
              <circle key={x} cx={x} cy="20" r="13" fill="#fff" stroke={INK} strokeWidth="7" />
            ))}
            <circle cx="1040" cy="20" r="17" fill={PLUM} />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 24 }}>
            {STOPS.map((s, i) => (
              <div key={s} style={{ display: "flex", color: i === 4 ? PLUM : INK, fontWeight: i === 4 ? 800 : 400 }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
