import { describe, expect, it } from "vitest";
import { HELP } from "@/lib/demo/help";

const all = (items: { title: string; body: string }[]) => items.map((i) => `${i.title} ${i.body}`).join(" ");

describe("HELP", () => {
  it("names no real vendor anywhere", () => {
    const text = [all(HELP.credit), all(HELP.surveys), ...HELP.faq.map((f) => `${f.q} ${f.a}`)].join(" ");
    expect(text).not.toMatch(/3cx|zoho|twilio/i);
  });

  it("states both survey rules plainly", () => {
    const text = all(HELP.surveys);
    expect(text).toContain("2 minutes");
    expect(text).toContain("24 hours");
  });

  it("has something in every section", () => {
    expect(HELP.credit.length).toBeGreaterThan(0);
    expect(HELP.surveys.length).toBeGreaterThan(0);
    expect(HELP.faq.length).toBeGreaterThan(0);
  });
});
