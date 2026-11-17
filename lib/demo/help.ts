// The help drawer, written for an everyday team member. Plain words, no vendor names.

export type HelpItem = { title: string; body: string };

export const HELP: { credit: HelpItem[]; surveys: HelpItem[]; faq: { q: string; a: string }[] } = {
  credit: [
    {
      title: "Calls credit themselves",
      body: "Every call on your desk phone is logged against your extension and lands on your record. You never type a call in.",
    },
    {
      title: "Offline work counts too",
      body: "Case review, paperwork and file cleanup are credited as offline time, with the updates you log in the CRM while you do them.",
    },
    {
      title: "Credited time",
      body: "Your credited time is your call time plus your offline time. Both count the same.",
    },
    {
      title: "Focus rating",
      body: "Updates logged for each offline minute, times 100, capped at 100. It shows that offline time was spent on the work. It is not a score of how good you are.",
    },
  ],
  surveys: [
    {
      title: "Calls under 2 minutes get no text",
      body: "A quick transfer or a wrong number is not worth a survey. A call of 2 minutes or longer can get one.",
    },
    {
      title: "One text per customer in 24 hours",
      body: "If a customer was already sent a survey in the last 24 hours, they are not asked again, even if they call back.",
    },
    {
      title: "Extension not mapped",
      body: "A call from an extension that is not linked to a person is logged as No match, and no text goes out until the extension is mapped.",
    },
  ],
  faq: [
    {
      q: "What does a Review tag mean?",
      a: "Your focus rating is under 40 today. It asks your supervisor to take a look, nothing more. Long case reviews often log few updates, and that is fine.",
    },
    {
      q: "How is a Review tag cleared?",
      a: "Your supervisor opens your row on Team, checks your day and presses Clear flag. The tag then reads Cleared, with their name.",
    },
    {
      q: "Why did my customer not get a survey?",
      a: "Open the call on Surveys. It says which rule stopped the text: under 2 minutes, already asked in the last 24 hours, or the extension is not mapped.",
    },
    {
      q: "Do customers get more than one text?",
      a: "No. One rating text at most in any 24 hours, however many times they call.",
    },
  ],
};
