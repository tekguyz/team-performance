import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The landing page is found by search; the demo screens are not (DEMO-STANDARD.md, "Search engines").
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/demo" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
