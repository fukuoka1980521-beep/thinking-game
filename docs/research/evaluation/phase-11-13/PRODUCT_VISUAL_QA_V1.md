# Product Visual QA V1 — PHASE 11.13

Real Playwright browser run against a live `vite` dev server (port 5201, started and cleanly
terminated this phase), `product_visual_qa_script.mjs`. Raw results:
`product_visual_qa_evidence.json`. Screenshots: `screenshots/`. **17/17 mechanical checks PASS.**
No FUN/UX judgment is made anywhere below (directive Section 22/26's explicit prohibition) —
every line is visible/not-visible, present/absent, or a literal text match.

## Checks and results

| # | Check | Result |
|---|---|---|
| 1 | Initial visible action count is 5 | PASS — `["playable11-accept","playable11-decline","playable11-ask-what","playable11-ask-festival","playable11-leave"]` |
| 2 | QA weather action absent | PASS |
| 3 | SALES not shown initially | PASS |
| 4 | Debug text absent from primary surface (initial) | PASS |
| 5 | Primary/secondary visual hierarchy classes present | PASS |
| 6 | ASK_WHAT reply does not name festival/towels | PASS — reply text: 「店先の箱を、値引き用の棚まで運んでくれるか。」 |
| 7 | ASK_WHAT removed from action list once answered | PASS |
| 8 | ASK_SALES becomes eligible after ASK_FESTIVAL | PASS |
| 9 | SALES answer grounded in real firsthand ~80% figure | PASS |
| 10 | Physical reveal narrated (towels become visible) | PASS |
| 11 | Reveal does NOT yet confirm festival-leftover status | PASS |
| 12 | Causal reveal visible before the new question button appears | PASS |
| 13 | ASK_WHAT (resolved-request action) removed after ACCEPT | PASS |
| 14 | New question genuinely answers something new | PASS — reply contains 「祭りの残り」 |
| 15 | DECLINE shows PLAYER line + separate Yohei acknowledgment | PASS |
| 16 | Post-DECLINE request-dependent ASK_WHAT removed | PASS |
| 17 | World continuation separate from social response line | PASS |

## Screenshots captured

| File | State |
|---|---|
| `00_initial_scene.png` | Initial scene, 5 buttons |
| `01_after_ask_what.png` | After ASK_WHAT — box task revealed, contents not |
| `02_after_ask_festival.png` | After ASK_FESTIVAL — SALES now offered |
| `03_after_contextual_sales.png` | After contextual SALES answered |
| `04_after_accept_reveal.png` | After ACCEPT — physical reveal narrated, new button present |
| `05_after_new_question_answered.png` | New question answered — festival-leftover confirmed |
| `06_after_decline.png` | After DECLINE — social response + resolved-action removal |
| `07_world_continuation_after_decline.png` | World-continuity line, separate from social response |

## Direct visual inspection (screenshots actually viewed, not only DOM-queried)

- `00_initial_scene.png`: 5 buttons in a single column. 手伝う/今日はやめておく render with a
  visibly bolder/darker border and bold text; 何を手伝えばいい？/祭りどうだった？ render lighter;
  その場を離れる renders with a dashed border, visually distinct from both groups.
- `04_after_accept_reveal.png`: the log shows the full accumulated conversation (ASK_WHAT →
  ASK_FESTIVAL → ASK_SALES → ACCEPT narration + reveal) followed by the world-continuity line and
  4 remaining buttons (祭りどうだった？, 売れ行きどうだった？, これ、祭りの残り？, その場を離れる)
  — 手伝う/今日はやめておく are gone (request resolved).

## Button labels, exact, initial screen

手伝う ／ 今日はやめておく ／ 何を手伝えばいい？ ／ 祭りどうだった？ ／ その場を離れる

## Button labels, exact, after ACCEPT (question order: ASK_WHAT → ASK_FESTIVAL → ASK_SALES → ACCEPT)

祭りどうだった？ ／ 売れ行きどうだった？ ／ これ、祭りの残り？ ／ その場を離れる
