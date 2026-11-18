# Team Performance: landing page and one-click demo

Build issue: tekguyz/team-performance#1. Replaces the earlier version of this demo. Design approved by the founder on 2026-11-17. Sources read: the issue, `tekguyz-one/projects/team-performance/about.md` and `engineering.md`, the old repo's `README.md`, `INTERNAL_GUIDE.md` and help drawer (`components/dashboard/support-drawer.tsx`, `support-questions.ts`), `claude-config/DEMO-STANDARD.md` and `LOOKS.md`.

## Intent and the why

The owner of a small call center or phone-based service team (under 50 people, usually 5 to 30) tracks work today with timesheets and self-reports. Both cause friction, and good work goes uncredited. Their customer surveys go out after every call, so customers learn to ignore them.

Team Performance fixes both:

- **Credit and protect the team.** Each desk-phone extension is tied to a person and to their CRM user, so every call is credited to the right person with no manual entry. Offline work (paperwork, case reviews, file cleanups) is credited too. Nobody writes an end-of-day report.
- **Proof for the people paying.** The supervisor has calls, time and a focus rating to show clients and stakeholders, and to back reviews and incentives.
- **Fair, human review.** A low focus rating never stands as a verdict. It shows a "Review" tag; the supervisor opens the details and clears it with one click, so deep research or back-office work never counts against anyone.
- **Surveys that know when to stop.** After a call, the customer gets a one-to-five rating text, only when the call lasted at least 2 minutes and the customer has not had one in the last 24 hours (a transferred customer is asked once).

The line: "Phone logs that credit the right person, and surveys that know when to stop."

The moment that sells it: the visitor presses "Run sample batch" and watches a batch of calls go through the two rules, each one landing as Sent, Skipped (under 2 minutes) or Skipped (already asked today), and sees the text the customer got on a phone.

## Goals

- A landing page that sells the idea by itself, phone first, naming the best fit: small call centers and service teams under 50 people that take calls all day.
- A one-click demo with no signup, centered on the supervisor's view and the survey rules.
- The old build's working parts, designed and coded fresh: the extension-to-person mapping, the overview, the focus rating and review, the survey rule engine and the CSV export, plus the help drawer.

## Non-goals

- No real backend, sign-in or database (approach below). No real text, no real phone system, no real CRM call.
- No AI audit. The old Gemini audit was never mounted on a screen and would add cost.
- No "how did the visit go" flow; No-Show Rescue covers that.
- No editing of the survey rules in the demo ("Not available in the demo").

## Anti-goals

- Reading as employee surveillance. The focus rating is framed as credit and proof for the team, and every flag is a question for a person, not a verdict.
- Any claim of a measured result (time saved, response rate). None is measured.
- Saying it sends real texts or reaches a real CRM. The page says plainly that the text service is simulated.
- A real business or person's name anywhere, TEKGUYZ in the app name or URL, or the old client's name (the old repo, URL and title carried it). Only the small "Built by TEKGUYZ" credit.

## Constraints

- `claude-config/DEMO-STANDARD.md`: landing page, link preview (`opengraph-image`), "Try the demo" button, demo banner with a way out and the small credit, `noindex` on demo screens, works inside another site's frame, showcase pictures with `tools/capture`, the ship checklist.
- `claude-config/LOOKS.md`: differ from every shipped demo in shape, accent hue and one more column; nothing from the worn-out list (pill buttons with big soft cards, Bricolage Grotesque); 2 options that fit the app; a phone frame drawn properly.
- Regular workflow: Impeccable for the build, screen check and skills pass before the PR.
- Stack matches the recent demos: Next.js 16, React 19, TypeScript, Vitest with a `test:unit` script, Vercel.

## Approaches

1. **Browser-only demo (picked).** The sample business ships with the app; everything the visitor does lives in their own browser, like FancyFam, Quote to Paid, No-Show Rescue and Win-Back (their ADR 0001). Visitors are walled off by design, nothing costs money, nothing is sent. One store module holds all demo data so a real backend can replace it later.
2. **Supabase backend with the old ingest routes** (phone-system webhook, status events, batch). Closer to a real product, but needs anonymous sign-in, RLS walls, visit caps and a cleanup job to guard data nobody needs to keep. Rejected: cost and work with nothing to protect.
3. **Real Twilio texts to the visitor's own phone.** Rejected: the issue says the text service is simulated, every text costs money, and it opens the door to abuse.

## What the founder decided

- The approach and the design below (2026-11-17).
- Audience: a small call center or service team under 50 people, run by a small business owner.
- The focus rating and review flag stay as the old build had them.

## The rules (from the old build)

- **Short-call rule:** a call under 120 seconds gets no survey. Shown as "Skipped: under 2 minutes".
- **Daily cap:** a customer number with a survey sent in the last 24 hours gets no second one. Shown as "Skipped: already asked today". Checked against earlier calls in the same batch too.
- **Order:** calls are checked oldest first; the short-call rule runs before the daily cap.
- **The text:** "Hi, thanks for speaking with {first name} at {Sample Business}. How did we do? Reply 1 to 5." Simulated; marked "Not sent: demo".
- **Unknown extension:** the call is still logged, shown as "No match: extension not mapped", and no survey goes out. It never fails the batch.
- **Focus rating:** logged updates divided by minutes worked, times 100, capped at 100. Under 40 shows "Review". The supervisor clears it in the drawer with one click and the row shows "Cleared by {supervisor}".

## Screens

- `/` **Landing page.** The line, who it is for, how the credit works, the two survey rules shown plainly, a real screen from the demo, "Try the demo", and the credit in the footer.
- `/demo` **Overview.** Calls processed, texts sent, calls screened out, open review flags, and call volume by hour across the day.
- `/demo/team` **Team.** One row per person: extension, name, CRM user, time on calls and offline work, logged updates, focus rating, status. A row opens a drawer with the person's day and, when flagged, "Clear flag".
- `/demo/surveys` **Surveys.** Every call with time, extension and person, duration, customer number (sample, masked) and outcome. "Run sample batch" adds a batch of calls through the rules; filter by outcome; "Export CSV". Opening a Sent row shows the text on a drawn phone.
- `/demo/settings` **Extensions.** The extension-to-person-to-CRM-user map. Editing adds an extension in the browser only.
- **Help drawer** from every demo screen, written for an everyday team member, in three parts: how you get credit, how the surveys work, common questions. Adapted from the old `support-questions.ts`, in plain words.
- **Demo banner** on every demo screen: "Sample data. No text goes out and no CRM is reached.", "Reset demo", a way back to the landing page, "Built by TEKGUYZ".

No sign-in page: there is no product to sign in to (same as Quote to Paid's ADR 0001).

## Calls Claude made (the founder can change them)

- **Sample Business:** Coral Line Support, a 14-person call center in South Florida that answers phones for local service companies. Supervisor: Odalys. All names and numbers made up.
- **State:** kept in the visitor's browser storage, so a cleared flag or a batch survives moving between screens and a reload; "Reset demo" starts over.
- **Sample day:** one working day (8 AM to 6 PM) of about 180 calls already processed, with 2 or 3 people flagged for review, one of them clearly doing offline case work.
- **Sample batch:** about 20 calls per press, built so every outcome shows up, including a repeat caller and one unmapped extension. Batch calls are timed after the latest call so far (the day continues toward 6 PM, then the next morning). Each press mixes new callers with a few who already got a text, so the daily cap shows without most of a batch becoming "already asked". Every screen reads one call log, so a batch moves the overview totals, the hourly chart and each person's Team numbers.
- **Focus rating minutes:** the rating counts logged updates against minutes of offline work (case reviews, paperwork), as in the old build. Credited time is calls plus offline work and is shown on its own, so offline work always counts as credit; a low rating only means few updates were logged during that offline time, which is why it goes to a person to review.
- **New extension in Settings:** credits calls from then on. Earlier "No match" calls stay as they were logged.
- **The earlier demo** is removed everywhere, with no redirect (founder, 2026-11-18).
- **Looks and logo:** the founder picks (2026-11-17). The plan stops after the options page and the logo page, and the screens are built once the pick is in `DESIGN.md`.

## Left to the builder

- The look: 2 options on one mockup page per `LOOKS.md`, the founder picks, written into `DESIGN.md`.
- Logo, favicon and link preview options (`docs/design/logos.html`), the founder picks.
- Copy, the sample people, numbers and call times.
- The URL: `team-performance.vercel.app` if free, otherwise a close plain name with `SITE_URL` set.
- An ADR `docs/adr/0001-browser-only-demo.md` recording the approach.
- Where motion earns its place (rows landing during a batch is the likely one).

## Done when

Deployed; landing page and one-click demo work; the `DEMO-STANDARD.md` ship checklist is boxed on the issue; the row is added to `LOOKS.md` and `DEMO-STANDARD.md`; `tekguyz-one/projects/team-performance/` points at this repo; tekguyz/tekguyz-web#6 is told.
