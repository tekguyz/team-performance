import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the Tally mark (DESIGN.md logo B), ink strokes and a plum slash on the shell tint. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f1f7" }}>
        <svg width="150" height="150" viewBox="0 0 32 32">
          <path d="M9 8v16M13.5 8v16M18 8v16M22.5 8v16" stroke="#1c1824" strokeWidth="2.4" fill="none" />
          <path d="M6 21 26 11" stroke="#5c2d91" strokeWidth="2.8" fill="none" />
        </svg>
      </div>
    ),
    size,
  );
}
