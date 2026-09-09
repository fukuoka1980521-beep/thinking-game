# Product Visual QA V1 — PHASE 11.14

Real Playwright browser run against a live `npx vite --port 5211` dev server, script:
`product_visual_qa_script.mjs`, evidence: `product_visual_qa_evidence.json`, screenshots:
`screenshots/*.png`. Two independent browser sessions (PATH B and PATH D).

## Mechanical checks — 16/16 PASS

| # | Check | Result |
|---|---|---|
| 1 | Pre-scene paragraph grounds the relationship (顔なじみ) | PASS |
| 2 | Opening: exact 5-action set (accept/decline/what/festival/leave) | PASS |
| 3 | Opening narration uses 話しかけてきた, not 洋平が言った | PASS |
| 4 | Festival response contains the real captured sales result | PASS |
| 5 | SEMANTIC OPTION EXHAUSTION: ask-festival disappears (one-shot) | PASS |
| 6 | REDUNDANT QUESTION SUPPRESSION: ask-sales never appears | PASS |
| 7 | ask-what remains (independent target, not yet asked) | PASS |
| 8 | PLAYER acceptance line uses the action-grounded rewrite | PASS |
| 9 | Physical reveal narrates the towels becoming visible | PASS |
| 10 | REDUNDANT QUESTION SUPPRESSION: ask-leftover never appears (PATH B) | PASS |
| 11 | ask-what gone (request resolved by accept) | PASS |
| 12 | Debug evidence shows targetStatus KNOWN_TRUE via the festival response | PASS |
| 13 | No debug/research text leaks onto the primary player surface | PASS |
| 14 | PATH D: ask-leftover remains legitimately eligible | PASS |
| 15 | PATH D: direct leftover question still genuinely confirms the target | PASS |
| 16 | PATH C: ask-leftover disappears once its own target is resolved | PASS |

`allPass: true` in `product_visual_qa_evidence.json`.

## Human-eye dialogue inspection (directive Section 18: "also visually inspect the dialogue as a
human, not only via selectors")

Reviewed `00_opening.png` and `02_after_accept_path_b.png` directly (not just their text content):

- `00_opening.png`: opening narration reads as one natural beat, not two disconnected sentences;
  the five buttons (手伝う / 今日はやめておく / 何を手伝えばいい？ / 祭りどうだった？ / その場を
  離れる) are visually distinct (primary vs. secondary styling unchanged from PHASE 11.13) and
  none looks like leftover test/debug chrome.
- `02_after_accept_path_b.png`: after asking about the festival and accepting, the full
  conversation log reads naturally top-to-bottom in Japanese with no repeated information, and the
  action list has narrowed to exactly one item (その場を離れる) plus the always-present debug
  toggle — a visibly "wound down," concluded-feeling conversation rather than a persistent FAQ
  panel. This is the clearest visual confirmation of directive Section 13's "progressive
  narrowing, not a questionnaire dashboard" property.

No debug/research text, no raw JSON, no English scaffolding text is visible anywhere on the
primary player surface in either screenshot (only visible with the explicit debug toggle, in
`03_debug_after_path_b.png`, which is out of scope for the primary surface check by design).

## Server hygiene

Dev server started on port 5211 (`npx vite --port 5211 --strictPort`) specifically for this
phase's QA run, separate from the still-running PHASE 11.13 Owner-play server on port 5210 (which
was stopped before this phase's code changes, to avoid serving stale pre-repair content). Left
running after this QA pass so an Owner replay can reuse the exact same URL once Strategist audit
clears this phase for a new Owner session; no additional server was started or left running beyond
this one.
