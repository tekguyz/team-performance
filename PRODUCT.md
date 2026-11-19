# Product

<!-- impeccable:product-schema 1 -->

Written 2026-11-17 from the founder-approved spec (`docs/superpowers/specs/2026-11-17-team-performance-design.md`) and `tekguyz-one/projects/team-performance/about.md`, not from a fresh interview.

## Platform

web

## Users

The owner or supervisor of a small call center or phone-based service team (under 50 people, usually 5 to 30) that takes calls all day. They check one screen during and after the day to see how the team is doing, review flags fairly, and show proof to the clients who pay them. Secondary: an everyday team member reading the help drawer to learn how they get credit.

## Product Purpose

Team Performance credits every desk-phone call to the right person with no manual entry, credits offline work too, and texts the customer a one-to-five rating only when asking is worth it. Success: the supervisor trusts the numbers, nobody writes an end-of-day report, and customers stop ignoring surveys.

## Positioning

"Phone logs that credit the right person, and surveys that know when to stop." Two plain rules decide every survey: no text for a call under 2 minutes, no second text to the same customer within 24 hours. A low focus rating is never a verdict: it is a "Review" tag a person clears.

## Operating Context

This repo is a landing page plus a one-click, browser-only demo for the made-up call center Coral Line Support (14 people, South Florida; supervisor Odalys). Screens: Overview, Team (with a person drawer), Surveys (call log, "Run sample batch", CSV export, a drawn phone showing the text), Extensions, a help drawer and a demo banner.

## Capabilities and Constraints

- No backend, no sign-in. Everything lives in the visitor's browser (`docs/adr/0001-browser-only-demo.md`).
- Nothing is ever sent. Simulated texts are marked "Not sent: demo".
- Made-up names only. TEKGUYZ appears only as the small "Built by TEKGUYZ" credit.
- The look must follow `C:/Projects/claude-config/LOOKS.md`: 2 options, the founder picks.

## Brand Commitments

No measured claims (time saved, response rate). Never reads as employee surveillance: the focus rating is credit and proof for the team. Words: "Review", "Cleared by {name}", "Skipped: under 2 minutes", "Skipped: asked in the last 24 hours", "No match: extension not mapped".

## Evidence on Hand

Sample data only (`lib/demo/`). No testimonials, customers or results exist; none may be invented.

## Product Principles

1. Credit first: the screen shows what people did before it shows what is missing.
2. A flag is a question for a person, never a verdict.
3. Rules are stated plainly, and every skipped text says which rule stopped it.
4. Honest demo: simulated is labelled simulated.
