import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The landing page is found by search; the demo screens are not (DEMO-STANDARD.md, "Search engines").
// The demo is kept out by its noindex tag, not here: a crawler blocked here would never see that tag.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
