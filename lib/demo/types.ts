export type Person = { id: string; name: string; extension: string; crmUserId: string };

export type Call = {
  id: string;
  at: string; // ISO
  extension: string;
  customer: string; // sample number
  durationSec: number;
};

export type Outcome = "sent" | "skipped_short" | "skipped_daily_cap" | "no_match";

export type LoggedCall = Call & { outcome: Outcome; personId: string | null; text: string | null };

export type WorkBlock = {
  personId: string;
  kind: "offline";
  label: string; // "Case review", "Paperwork", "File cleanup"
  start: string; // ISO
  minutes: number;
  updates: number;
};

export type PersonDay = {
  person: Person;
  calls: number;
  callMinutes: number;
  offlineMinutes: number;
  creditedMinutes: number;
  updates: number;
  focus: number | null;
  needsReview: boolean;
  cleared: boolean;
};
