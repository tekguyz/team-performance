"use client";

import { dispatch } from "@/lib/demo/use-demo";

// A screen that throws (for example on an old saved demo) offers the sample day again instead of a blank page.
export default function DemoError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section className="section" aria-labelledby="err-h">
      <h1 id="err-h" className="title">
        This screen could not open
      </h1>
      <p className="sub">The demo saved in this browser could not be read. Starting over brings back the sample day.</p>
      <p>
        <button
          type="button"
          className="btn pri"
          onClick={() => {
            dispatch({ type: "reset" });
            retry();
          }}
        >
          Start the demo over
        </button>
      </p>
    </section>
  );
}
