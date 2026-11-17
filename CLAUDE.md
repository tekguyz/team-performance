@AGENTS.md

# Team Performance

A landing page and a one-click demo of Team Performance for the made-up call center Coral Line Support. Rules for every demo: `C:/Projects/claude-config/DEMO-STANDARD.md`. Design: `docs/superpowers/specs/2026-11-17-team-performance-design.md`. Plan: `docs/superpowers/plans/2026-11-17-team-performance.md`.

## Hard rules

- **No backend** (`docs/adr/0001-browser-only-demo.md`). The demo lives in the visitor's browser. No sign-in, database or visit cap.
- **Nothing is ever sent.** No text, phone system or CRM call. Simulated texts are marked "Not sent: demo".
- **Made-up names only.** No real business or person. TEKGUYZ appears only as the small "Built by TEKGUYZ" credit. Never the old client's name (CI greps the build for it).
- **No measured claims** (time saved, response rate).

## Commands

- `npm run dev` · `npm run lint` · `npm run typecheck` · `npm run test:unit` · `npm run build`
- Run the least that proves the change: `npx vitest run <file>`, then `npm run test:unit` once before a commit.
- **Never `npm test`.** It prints an error on purpose.
