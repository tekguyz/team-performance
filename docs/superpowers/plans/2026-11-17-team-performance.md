# Team Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A landing page and a one-click, browser-only demo of Team Performance for the made-up call center Coral Line Support, deployed on Vercel.

**Architecture:** Next.js App Router app with no backend. All demo data lives in pure TypeScript modules under `lib/demo/` (rules, focus rating, sample data, CSV, a reducer) that are unit-tested; one client hook persists the reducer state to browser storage with an in-memory fallback. Screens under `app/demo/` read only that hook. The look comes from `DESIGN.md` tokens, chosen by the founder from 2 options before any screen is built.

**Tech Stack:** Next.js 16.3.8, React 19.2.8, TypeScript (strict), Tailwind 4, Vitest 5, ESLint 9, Vercel. Same versions and scripts as `C:/Projects/quote-to-paid`.

**Spec:** `docs/superpowers/specs/2026-11-17-team-performance-design.md`

## Global Constraints

- No real business or person name anywhere; no TEKGUYZ in the app name, title or URL; only "Built by TEKGUYZ" in the landing footer and the demo banner, linking to `https://tekguyz.com`.
- Never the old client's name (the old repo, URL and title carried it). CI greps the build output for it (Task 1).
- Nothing is sent: no network call leaves the browser for texts, phone system or CRM. Every simulated text is marked "Not sent: demo".
- Never claim a measured result (time saved, response rate).
- Short-call rule: a call under 120 seconds gets no survey; exactly 120 seconds is eligible.
- Daily cap: no survey if the same customer number had a *sent* survey less than 24 hours earlier (exactly 24 hours later is allowed); checked against history and earlier calls in the same batch.
- Focus rating = logged updates ÷ offline minutes × 100, rounded, capped at 100. Under 40 shows "Review" until cleared.
- Demo screens are `noindex`; the landing page is indexed. No `X-Frame-Options` or `frame-ancestors` header.
- Look: per `C:/Projects/claude-config/LOOKS.md` — differs from every shipped row in Shape, Accent hue and one more column; no pill buttons with large soft cards; no Bricolage Grotesque.
- Scripts: `test` prints an error on purpose; `test:unit` runs Vitest. Never run `npm test`.
- Markdown: one paragraph per line, no hard wrap.

## Review Focus

1. **Browser storage blocked or corrupt** (private window, a third-party frame on the portfolio, an old saved shape): the demo renders the sample day and works in memory, never a blank screen. Test in Task 5.
2. **"Run sample batch" pressed many times** (50 presses): no crash, totals on every screen agree with the call log, call times keep moving forward past 6 PM into the next morning, and the daily cap still lets most new callers through. Test in Task 4.
3. **Rule boundaries:** 119 s skipped, 120 s sent; a repeat caller at 23 h 59 m skipped, at 24 h 00 m sent; a skipped call does not count toward the cap. Tests in Task 2.
4. **CSV opened in Excel:** names or notes with commas, quotes or accents come through intact (quoted fields, UTF-8 BOM, CRLF lines). Test in Task 6.
5. **Phone width:** tables become readable rows, the drawer fills the screen and closes with Escape and a visible button, the drawn phone never overflows at 375 px or runs off the bottom at 1440 × 900. Checked by the screen check in Task 13.

---

### Task 1: Scaffold the app

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `.gitignore`, `.claude/launch.json`, `.github/workflows/ci.yml`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/adr/0001-browser-only-demo.md`, `lib/brand.ts`, `lib/site.ts`, `app/layout.tsx`, `app/page.tsx` (placeholder), `lib/__tests__/brand.test.ts`
- Copy the shape of each config from `C:/Projects/quote-to-paid` (same versions, same scripts).

**Interfaces:**
- Produces: `BRAND = { business: "Coral Line Support", product: "Team Performance", supervisor: "Odalys", place: "South Florida", teamSize: 14 } as const` in `lib/brand.ts`; `SITE_URL: string` in `lib/site.ts` (from `process.env.SITE_URL`, default `https://team-performance.vercel.app`).

- [ ] **Step 1:** Write `lib/__tests__/brand.test.ts`: `expect(BRAND.business).toBe("Coral Line Support")`; `expect(JSON.stringify(BRAND)).not.toMatch(/tekguyz/i)`.
- [ ] **Step 2:** Run `npx vitest run lib/__tests__/brand.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3:** Create the scaffold files above. `.claude/launch.json` has one config `team-performance` running `npm run dev` with `"autoPort": true` and no port flag. `ci.yml` runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, then fails if `grep -ri "advantage" .next/server .next/static` finds anything. ADR 0001 adapts `C:/Projects/quote-to-paid/docs/adr/0001-browser-only-demo.md` (state in browser storage with in-memory fallback, "Try the demo" is a plain link, no sign-in page). `CLAUDE.md` states the test rules and the browser-only rule.
- [ ] **Step 4:** Run `npm install`, then `npm run test:unit`. Expected: PASS. Run `npm run build`. Expected: build succeeds.
- [ ] **Step 5:** Commit `chore: scaffold Team Performance app` with `refs #1`.

### Task 2: Survey rules engine

**Files:**
- Create: `lib/demo/types.ts`, `lib/demo/rules.ts`
- Test: `lib/demo/__tests__/rules.test.ts`

**Interfaces:**
- Produces in `types.ts`:
  - `Person = { id: string; name: string; extension: string; crmUserId: string }`
  - `Call = { id: string; at: string /* ISO */; extension: string; customer: string /* sample number */; durationSec: number }`
  - `Outcome = "sent" | "skipped_short" | "skipped_daily_cap" | "no_match"`
  - `LoggedCall = Call & { outcome: Outcome; personId: string | null; text: string | null }`
- Produces in `rules.ts`:
  - `SHORT_CALL_SEC = 120`, `DAILY_CAP_MS = 86_400_000`
  - `evaluateCalls(calls: Call[], people: Person[], history: LoggedCall[]): LoggedCall[]` — sorts `calls` oldest first; per call: unmapped extension → `no_match`; else `durationSec < 120` → `skipped_short`; else a `sent` call for the same `customer` in history or earlier in this batch with `0 <= t - prior < DAILY_CAP_MS` → `skipped_daily_cap`; else `sent` with `text`.
  - `surveyText(person: Person): string` → exactly `Hi, thanks for speaking with ${firstName} at Coral Line Support. How did we do? Reply 1 to 5.`
  - `OUTCOME_LABEL: Record<Outcome, string>` = `{ sent: "Sent", skipped_short: "Skipped: under 2 minutes", skipped_daily_cap: "Skipped: already asked today", no_match: "No match: extension not mapped" }`

- [ ] **Step 1:** Write tests: `sends after a 120-second call`; `skips a 119-second call as skipped_short`; `skips a repeat customer 23h59m after a sent survey`; `sends to a repeat customer exactly 24h after`; `a skipped call does not start the cap` (a 60 s call then a 300 s call 10 min later → second is `sent`); `caps within the same batch`; `unmapped extension is no_match with personId null and no text`; `checks oldest first even when input is unordered`; `surveyText uses the first name` (`"Hi, thanks for speaking with Rosa at Coral Line Support. How did we do? Reply 1 to 5."` for "Rosa Delgado").
- [ ] **Step 2:** Run `npx vitest run lib/demo/__tests__/rules.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `types.ts` and `rules.ts` as specified.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit `feat: survey rules engine` with `refs #1`.

### Task 3: Credit and focus rating

**Files:**
- Create: `lib/demo/focus.ts`; add `WorkBlock` and `PersonDay` to `lib/demo/types.ts`
- Test: `lib/demo/__tests__/focus.test.ts`

**Interfaces:**
- Consumes: `Person`, `LoggedCall` (Task 2).
- Produces:
  - `WorkBlock = { personId: string; kind: "offline"; label: string /* "Case review", "Paperwork", "File cleanup" */; start: string; minutes: number; updates: number }`
  - `PersonDay = { person: Person; calls: number; callMinutes: number; offlineMinutes: number; creditedMinutes: number; updates: number; focus: number | null; needsReview: boolean; cleared: boolean }`
  - `REVIEW_BELOW = 40`
  - `focusRating(updates: number, offlineMinutes: number): number | null` — `null` when minutes is 0; else `Math.min(100, Math.round(updates / offlineMinutes * 100))`.
  - `personDay(person: Person, calls: LoggedCall[], blocks: WorkBlock[], clearedIds: ReadonlySet<string>): PersonDay` — call minutes from that person's calls (`durationSec / 60`, rounded at the end), `creditedMinutes = callMinutes + offlineMinutes`, `needsReview = focus !== null && focus < 40 && !cleared`.

- [ ] **Step 1:** Write tests: `focusRating(14, 15)` → `93`; `focusRating(30, 10)` → `100`; `focusRating(0, 45)` → `0`; `focusRating(3, 0)` → `null`; `focusRating(6, 15)` → `40` and not flagged; `personDay` with focus 20 → `needsReview: true`; same with the id in `clearedIds` → `needsReview: false, cleared: true`; `creditedMinutes` includes offline minutes even when focus is 0; calls of other people are ignored.
- [ ] **Step 2:** Run `npx vitest run lib/demo/__tests__/focus.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `focus.ts`.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit `feat: credit and focus rating` with `refs #1`.

### Task 4: Sample day and sample batch

**Files:**
- Create: `lib/demo/sample.ts`, `lib/demo/random.ts`
- Test: `lib/demo/__tests__/sample.test.ts`

**Interfaces:**
- Consumes: `evaluateCalls` (Task 2), `WorkBlock` (Task 3).
- Produces:
  - `mulberry32(seed: number): () => number` in `random.ts` (seeded, so the sample is the same for every visitor and every test).
  - `SAMPLE_PEOPLE: Person[]` — 14 made-up people, extensions `"101"`–`"114"`, CRM ids like `"CRM-1042"`.
  - `SAMPLE_DATE = "2026-11-17"`; the day runs 08:00–18:00 local, stored as ISO.
  - `sampleDay(): { calls: LoggedCall[]; blocks: WorkBlock[] }` — about 180 calls run through `evaluateCalls`, every outcome present, at least one call on an unmapped extension `"120"`; blocks such that exactly 3 people have focus under 40, one of them (a long "Case review" with few updates) clearly offline research.
  - `sampleBatch(seed: number, log: LoggedCall[], people: Person[]): Call[]` — 20 calls, timed after the latest call in `log` at 2–6 minute gaps; when the next time passes 18:00 it jumps to 08:00 the next day; 3 to 4 customers taken from customers already `sent` in the last 24 h, the rest new; at least 3 under 120 s; one on extension `"120"`.

- [ ] **Step 1:** Write tests: `sampleDay is the same on every call` (deep equal twice); `sampleDay has between 170 and 190 calls`; `sampleDay has all four outcomes`; `exactly 3 people need review`; `sampleBatch returns 20 calls all after the latest logged call`; `50 batches in a row keep times increasing and stay within 08:00–18:00`; `in each of 50 batches at least 10 calls are sent` (cap never swallows a batch); `a batch includes a repeat customer that comes back as skipped_daily_cap`.
- [ ] **Step 2:** Run `npx vitest run lib/demo/__tests__/sample.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `random.ts` and `sample.ts`. Names and numbers are made up; customer numbers use the fictional `(555) 01xx` range and display masked as `(555) •••-0142`.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit `feat: sample day and sample batch` with `refs #1`.

### Task 5: Demo state and storage

**Files:**
- Create: `lib/demo/state.ts`, `lib/demo/storage.ts`, `lib/demo/use-demo.ts`, `lib/demo/selectors.ts`
- Test: `lib/demo/__tests__/state.test.ts`, `lib/demo/__tests__/storage.test.ts`, `lib/demo/__tests__/selectors.test.ts`

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces:
  - `DemoState = { version: 1; people: Person[]; calls: LoggedCall[]; blocks: WorkBlock[]; cleared: Record<string, string /* ISO */>; batches: number }`
  - `DemoAction = { type: "runBatch" } | { type: "clearFlag"; personId: string; at: string } | { type: "addExtension"; person: Person } | { type: "reset" }`
  - `initialState(): DemoState`, `reducer(state: DemoState, action: DemoAction): DemoState` in `state.ts`. `runBatch` uses `sampleBatch(state.batches + 1, …)` then `evaluateCalls`. `addExtension` rejects an extension already mapped (returns state unchanged) and never re-credits earlier `no_match` calls.
  - `loadState(store: Pick<Storage, "getItem"> | null): DemoState` and `saveState(store: Pick<Storage, "setItem"> | null, s: DemoState): void` in `storage.ts`, key `"team-performance:v1"`; any throw, bad JSON or wrong `version` → `initialState()`; `saveState` swallows errors.
  - `useDemo(): { state: DemoState; dispatch: (a: DemoAction) => void }` in `use-demo.ts` (`"use client"`; reads storage after mount to avoid a hydration mismatch; renders `initialState()` first).
  - In `selectors.ts`: `overview(s): { processed: number; sent: number; screened: number; openFlags: number }`, `volumeByHour(s): { hour: number; calls: number; sent: number }[]` (hours 8–17 of the latest day in the log), `teamRows(s): PersonDay[]`, `callsFiltered(s, outcome: Outcome | "all"): LoggedCall[]` newest first.

- [ ] **Step 1:** Write tests: `runBatch adds 20 calls and bumps batches`; `clearFlag sets cleared and teamRows shows needsReview false`; `addExtension with a taken extension changes nothing`; `addExtension does not change earlier no_match calls`; `reset returns initialState`; `loadState(null)` and a store whose `getItem` throws both return `initialState()`; `{ version: 0 }` and `"not json"` return `initialState()`; `saveState` with a throwing store does not throw; `overview.processed === calls.length` and `sent + screened === processed` after 50 batches.
- [ ] **Step 2:** Run `npx vitest run lib/demo/__tests__`. Expected: FAIL on the new files.
- [ ] **Step 3:** Implement the four files.
- [ ] **Step 4:** Run `npm run test:unit`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: demo state with storage fallback` with `refs #1`.

### Task 6: CSV export

**Files:**
- Create: `lib/demo/csv.ts`
- Test: `lib/demo/__tests__/csv.test.ts`

**Interfaces:**
- Consumes: `LoggedCall`, `Person`, `OUTCOME_LABEL`.
- Produces: `callsToCsv(calls: LoggedCall[], people: Person[]): string` — UTF-8 BOM, CRLF lines, header `Time,Extension,Person,CRM user,Customer,Duration (s),Outcome`, customer masked as on screen, every field quoted when it holds a comma, quote or line break (quotes doubled); `csvFileName(date: string): string` → `team-performance-calls-2026-11-17.csv`.

- [ ] **Step 1:** Write tests: starts with `"\uFEFF"`; header line exact; a person named `Ana "Nana" Pérez, Jr.` comes out as `"Ana ""Nana"" Pérez, Jr."`; a `no_match` row has an empty Person and CRM user; lines end in `\r\n`; filename exact.
- [ ] **Step 2:** Run `npx vitest run lib/demo/__tests__/csv.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `csv.ts`. The download itself (Blob + temporary link) lives in the Surveys screen (Task 10).
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit `feat: CSV export` with `refs #1`.

### Task 7: The look — options page, logo page, founder's pick (STOP POINT)

Runs with the Impeccable skill. The founder's design references are in `docs/design/refs/`; read every file there first.

**Files:**
- Create: `docs/design/looks.html`, `docs/design/logos.html`, then `DESIGN.md`, `app/globals.css` (tokens), `app/icon.svg`, `.impeccable/config.json`

- [ ] **Step 1:** Read `C:/Projects/claude-config/LOOKS.md` in full, the spec, `tekguyz-one/projects/team-performance/about.md` and every file in `docs/design/refs/`. Write the one line at the top of `looks.html`: what the app is, who uses it (the owner or supervisor of a small call center under 50 people), the feeling (clear and dense without being cold; fair to the team).
- [ ] **Step 2:** Build `docs/design/looks.html` with 2 options. Each option shows: the Overview, a Team row with a Review tag and the open drawer, a Surveys row and the drawn phone (real proportions about 9:19.5, status bar, island, messages header), a landing hero, and its five `LOOKS.md` columns with the one-line "why it fits". Each differs from every shipped row in Shape, Accent hue and at least one more column.
- [ ] **Step 3:** Build `docs/design/logos.html` per `DEMO-STANDARD.md` "Logo, icons and link preview": 2–3 options, each with the logo on light and dark, the favicon at 16 and 32 px in a fake tab, and the link-preview card. Names: "Team Performance" with "Coral Line Support" as the sample business.
- [ ] **Step 4:** Open both pages in the browser pane, check them at 375 px and 1440 px, commit `docs: look and logo options` with `refs #1`, push, and **stop**. Ask the founder to pick one look and one logo.
- [ ] **Step 5:** After the pick: write `DESIGN.md` (the pick and its five columns at the top, the closest shipped row and how it differs, tokens, type scale, spacing, motion rules), put the tokens in `app/globals.css` with light and dark, ship `app/icon.svg`. Commit `docs: DESIGN.md from the founder's pick` with `refs #1`.

### Task 8: Demo shell, banner and help drawer

**Files:**
- Create: `app/demo/layout.tsx`, `components/demo/shell.tsx`, `components/demo/banner.tsx`, `components/demo/help-drawer.tsx`, `components/demo/drawer.tsx`, `lib/demo/help.ts`
- Test: `lib/demo/__tests__/help.test.ts`

**Interfaces:**
- Consumes: `useDemo` (Task 5), tokens (Task 7).
- Produces: `<Drawer open onClose title>` (focus trapped, Escape closes, returns focus to the opener, full screen under 768 px) used by Tasks 9 and 10; `<DemoShell>` with nav to Overview, Team, Surveys, Extensions; `HELP: { credit: Item[]; surveys: Item[]; faq: { q: string; a: string }[] }` in `lib/demo/help.ts`.

- [ ] **Step 1:** Write `help.test.ts`: every FAQ answer mentions no real vendor name (`/3cx|zoho|twilio/i` not found) and the surveys section states "2 minutes" and "24 hours".
- [ ] **Step 2:** Run `npx vitest run lib/demo/__tests__/help.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Write `help.ts` in plain words for an everyday team member, adapted from the old `support-questions.ts` (how you get credit for calls and offline work, how the two survey rules work, how a review flag is cleared). Build the layout: `export const metadata = { robots: { index: false, follow: false } }`; the banner reads "Sample data. No text goes out and no CRM is reached.", with "Reset demo" (dispatches `reset` after a confirm), "Back to the overview page" (links `/`), and "Built by TEKGUYZ" → `https://tekguyz.com`; the banner carries `data-demo-banner` so `tools/capture` can hide it.
- [ ] **Step 4:** Run `npm run test:unit` and open `/demo` in the preview pane. Expected: tests PASS; nav, banner, help drawer open and close with Escape.
- [ ] **Step 5:** Commit `feat: demo shell, banner and help` with `refs #1`.

### Task 9: Overview and Team screens

**Files:**
- Create: `app/demo/page.tsx`, `app/demo/team/page.tsx`, `components/demo/overview.tsx`, `components/demo/volume-chart.tsx`, `components/demo/team-table.tsx`, `components/demo/person-drawer.tsx`

**Interfaces:**
- Consumes: `overview`, `volumeByHour`, `teamRows`, `reducer` action `clearFlag`, `<Drawer>`.

- [ ] **Step 1:** Overview: four figures from `overview(state)` (Calls processed, Texts sent, Screened out, Open review flags) and an hourly chart from `volumeByHour` drawn in SVG (no chart library), with a text table for screen readers. Open review flags links to `/demo/team`.
- [ ] **Step 2:** Team: one row per `PersonDay` with extension, name, CRM user, credited time (calls + offline), updates, focus rating, status ("Review", "Cleared by Odalys", or "On track"). Phone width shows stacked rows. A row opens the person drawer: their calls, offline blocks, the focus rating explained in one sentence, and "Clear flag" when flagged, which dispatches `clearFlag` and shows the cleared state.
- [ ] **Step 3:** Check both screens in the preview pane at 375, 768 and 1440 px, and press "Run sample batch" from Surveys later to confirm the figures move (after Task 10).
- [ ] **Step 4:** Commit `feat: overview and team screens` with `refs #1`.

### Task 10: Surveys screen with the phone

**Files:**
- Create: `app/demo/surveys/page.tsx`, `components/demo/call-log.tsx`, `components/demo/phone.tsx`, `components/demo/batch-button.tsx`

**Interfaces:**
- Consumes: `callsFiltered`, `OUTCOME_LABEL`, `callsToCsv`, `csvFileName`, action `runBatch`, `<Drawer>`.

- [ ] **Step 1:** Call log: time, extension and person, duration, masked customer, outcome label; filter by outcome with counts; newest first; phone width shows stacked rows.
- [ ] **Step 2:** "Run sample batch" dispatches `runBatch`; the new 20 rows land at the top with one short entrance (none under `prefers-reduced-motion: reduce`), and a one-line summary reads like "20 calls: 13 sent, 4 too short, 2 already asked today, 1 not mapped".
- [ ] **Step 3:** "Export CSV" downloads `callsToCsv` of the current filter as `csvFileName(SAMPLE_DATE)`.
- [ ] **Step 4:** A Sent row opens the drawer with the drawn phone: the message thread showing `text`, marked "Not sent: demo". A skipped row shows which rule stopped it in one sentence. Rules strip on the screen states both rules plainly, with "Edit rules" showing "Not available in the demo".
- [ ] **Step 5:** Check in the preview pane at 375, 768 and 1440 px; press the batch 10 times and confirm Overview and Team move. Commit `feat: surveys screen with batch, phone and CSV` with `refs #1`.

### Task 11: Extensions screen

**Files:**
- Create: `app/demo/settings/page.tsx`, `components/demo/extensions.tsx`

**Interfaces:**
- Consumes: action `addExtension`, `state.people`.

- [ ] **Step 1:** Table of extension → person → CRM user. An "Add extension" form (extension, name, CRM user) dispatches `addExtension`; a taken extension shows "Extension 104 is already mapped to …" next to the field. A note says "Saved in this browser only."
- [ ] **Step 2:** Check in the preview pane: add extension `"120"`, run a batch, confirm its new calls are credited and earlier "No match" calls stay.
- [ ] **Step 3:** Commit `feat: extensions screen` with `refs #1`.

### Task 12: Landing page, link preview and icons

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx`
- Create: `app/opengraph-image.tsx`, `app/apple-icon.tsx`, `app/robots.ts`, `app/sitemap.ts`

- [ ] **Step 1:** Landing page per `DEMO-STANDARD.md`: the line "Phone logs that credit the right person, and surveys that know when to stop.", who it is for (small call centers and service teams under 50 people that take calls all day), how the credit works, the two survey rules shown plainly, fair review, a real screen of the demo, "Try the demo" as a plain link to `/demo`, a plain statement that texts and the CRM are simulated in the demo, footer "Built by TEKGUYZ". No sign-in link (ADR 0001).
- [ ] **Step 2:** `opengraph-image.tsx` in the app's own look; title and description in `metadata` using `SITE_URL`; `robots.ts` allows `/` and disallows `/demo`; `sitemap.ts` lists `/` only.
- [ ] **Step 3:** Check in the preview pane at 375 and 1440 px. Commit `feat: landing page and link preview` with `refs #1`.

### Task 13: Checks before the PR

- [ ] **Step 1:** Run `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`. Expected: all pass.
- [ ] **Step 2:** Run the screen check skill on `/`, `/demo`, `/demo/team`, `/demo/surveys`, `/demo/settings`; fix what it finds. Include the Review Focus phone-width items.
- [ ] **Step 3:** Run `web-design-guidelines` on the changed screen files and `vercel-react-best-practices` on the React code; fix what they find; note it for the PR body as `Skills pass: …`.
- [ ] **Step 4:** Frame test: load `/demo` inside an iframe on another origin in the preview pane, run a batch, clear a flag. With storage blocked it still works in memory.
- [ ] **Step 5:** Request a code review (superpowers:requesting-code-review) of the whole branch, fix findings, write `README.md` per `C:/Projects/claude-config/README-STANDARD.md`, commit, open the PR with `closes #1` only if every ship box is done, otherwise `refs #1`.

### Task 14: Ship

- [ ] **Step 1:** Create the Vercel project; use `team-performance.vercel.app` if free, otherwise a close plain name and set `SITE_URL`. Say "push means live" before the push. Merge the PR once checks pass.
- [ ] **Step 2:** Showcase: add `C:/Projects/claude-config/tools/capture/apps/team-performance.json` (3 desktop at 1440 × 900, 2 phone at 780 × 1688, light and dark if the look has dark, a 4.5 s video of the Surveys batch) and run it into `showcase/`.
- [ ] **Step 3:** Docs: the Team Performance row in `DEMO-STANDARD.md` "Where each app stands" and its row in `LOOKS.md` (one claude-config PR); `tekguyz-one/projects/team-performance/` points at this repo and the "Proved by" lines in `brand/solutions.md`; a box under Demos on tekguyz/tekguyz-one#17; site and portfolio links.
- [ ] **Step 4:** Tell tekguyz/tekguyz-web#6 with a comment (the founder has asked for this in the issue). Ask the founder whether to take down or redirect `advantage-teams.vercel.app`, and list the site and portfolio links that point at it.
- [ ] **Step 5:** Ask the founder once whether the post media can be made. Box the `DEMO-STANDARD.md` ship checklist on #1 and close it when every box is ticked.
