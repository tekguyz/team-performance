import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-atkinson",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

const DESCRIPTION =
  "Every desk-phone call credited to the right person, offline work counted too, and a rating text only when asking is worth it. Try the demo with a made-up call center.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${BRAND.product}: phone logs that credit the right person`,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "/",
    siteName: BRAND.product,
    title: `${BRAND.product}: phone logs that credit the right person`,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={atkinson.variable}>
      <body>{children}</body>
    </html>
  );
}
