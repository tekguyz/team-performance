import { describe, expect, it } from "vitest";
import { BRAND } from "@/lib/brand";

describe("BRAND", () => {
  it("names the sample business", () => {
    expect(BRAND.business).toBe("Coral Line Support");
  });
  it("never carries the TEKGUYZ name", () => {
    expect(JSON.stringify(BRAND)).not.toMatch(/tekguyz/i);
  });
});
