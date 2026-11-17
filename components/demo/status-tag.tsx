import { CheckIcon, DiamondIcon } from "@/components/demo/icons";
import { BRAND } from "@/lib/brand";
import type { PersonDay } from "@/lib/demo/types";

/** Review is a question (plum, diamond); cleared names who cleared it (DESIGN.md rule 5). */
export function StatusTag({ row }: { row: PersonDay }) {
  if (row.needsReview)
    return (
      <span className="t review">
        <DiamondIcon />
        Review
      </span>
    );
  if (row.cleared)
    return (
      <span className="t cleared">
        <CheckIcon />
        Cleared by {BRAND.supervisor}
      </span>
    );
  return (
    <span className="t ok">
      <CheckIcon />
      On track
    </span>
  );
}
