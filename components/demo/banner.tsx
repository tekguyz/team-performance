"use client";

import Link from "next/link";
import { dispatch } from "@/lib/demo/use-demo";

export function Banner() {
  return (
    <div className="banner" data-demo-banner role="region" aria-label="About this demo">
      <span>Sample data. No text goes out and no CRM is reached.</span>
      <span className="sp" />
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Reset the demo to the sample day? Sample batches and cleared flags are removed.")) {
            dispatch({ type: "reset" });
          }
        }}
      >
        Reset demo
      </button>
      <Link href="/">Back to the overview page</Link>
      <a href="https://tekguyz.com">Built by TEKGUYZ</a>
    </div>
  );
}
