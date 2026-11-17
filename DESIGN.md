# Design: Route line

Picked by the founder on 2026-11-17 from `docs/design/looks-2.html` (option C). Options A and B (`docs/design/looks.html`) were passed on. Logo: B · Tally (`docs/design/logos.html`), strokes in ink with the slash in plum. This file is the rulebook for the look; read it before any screen work.

## The five columns (LOOKS.md)

| Ground | Accent | Display font | Body font | Shape |
|---|---|---|---|---|
| White work area, pale lilac-grey side bar `#f4f1f7` | Plum `#5c2d91` | Atkinson Hyperlegible Next, 800 | Atkinson Hyperlegible Next | Signage: no cards or shadows, thick 6px lines, round stops, flat plate buttons with a 4px bottom bar, rounded-square (6px) Review tag |

**Closest shipped row: no-show-rescue** (cool ground, square, no shadows). It differs in Accent (plum, not teal), both fonts, Ground (lilac-grey bar, not off-white) and Shape (thick route lines and plate buttons, not 1.5px outlines). It uses nothing on the worn-out list.

## Why it fits

The supervisor asks two things: who got credit, and why a survey did not go. A call is drawn as a trip along one line with stops (extension mapped, 2 minutes or longer, not asked in 24 hours); a text goes out only if the trip reaches the end, and a skipped text ends at the stop that held it. Plum is calm and is not the alarm color, so a Review tag reads as a question. Atkinson Hyperlegible keeps digits and letters hard to confuse in a dense table.

## Tokens

- Ink `#1c1824`, muted `#5a5368`, rule `#d8d3df`, shell `#f4f1f7`, accent `#5c2d91`, accent deep `#41206b`, tint `#ece2f6`, mid `#c3aedd`.
- Type: one family. Headings 800, tight tracking (-.015em to -.025em). Body 15 to 16px. Numbers use tabular figures.
- Plum is the only acting color: the main button, Review tags, the open-flags figure, the current stop in the menu, the "Texts sent" end of a route. Everything else is ink on white.

## Rules

1. **The route is the signature.** Menu: a vertical line with one round stop per screen, the current stop filled plum. Calls: a line with five stops (call, extension mapped, 2 minutes, 24 hours, text). Sent is plum to the end. A skipped call is ink up to the stop that held it, ends in a bar, and the rest is light grey. Never explain an outcome by color alone: the outcome words stay beside the route.
2. **Overview line:** its thickness is the number of calls still on it (182, 179, 125, 104), with dashed exits for 3, 54 and 21.
3. **No cards, no shadows, no rounded panels.** Sections are set apart by a 6px ink rule on top and white space. Drawers have a 6px plum left edge.
4. **Buttons are plates:** primary is plum with a 4px deep-plum bottom bar; secondary is ink text with a 4px ink bottom bar. No outlines, no pills.
5. **Review is a question:** plum tag with a diamond, never red. Cleared shows an ink 2px outlined tag with a check and "Cleared by {name}".
6. **Phone:** drawn properly (about 9:19.5, island, status bar, Messages header), device body in ink, avatar in plum, labelled "Not sent: demo".
7. **Contrast:** body text 4.5:1 or better; nothing smaller than 13px except the phone's own chrome.
8. **Words:** sentence case, no all-caps labels, plain verbs, the wording in `PRODUCT.md`.
