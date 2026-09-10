# NEW LIFE V0.2 — Three-Day Living Town Loop — CLOSE V1

Directive: `NEW_LIFE_V0_2_REBUILD_WITH_APPROVED_ART` (2026-09-10). Rebuild, not an extension of the
single-choice-per-day prototype reviewed under the prior `NEW_LIFE_V0_1_PLAYABLE_INTEGRATION` task
(that task was interrupted before any code was written, so there was no V0.1 integration to carry
forward — this Run is a fresh build).

## Baseline

- BASELINE COMMIT: `8766d5d` (PHASE 12.2 art gate rejection, previous Run).
- FINAL COMMIT: see below (this Run adds one commit on top).
- No files outside this Run's own scope were modified. `src/App.tsx` already carried a large,
  unrelated in-progress diff (routing for many pre-existing `src/newlife/*` experiments) at Run
  start; that diff was left untouched in the working tree — only 4 lines (one import, one `View`
  variant, one query-param branch, one render branch) were committed, isolated by resetting
  `App.tsx` to HEAD, reapplying just those 4 lines, committing, then restoring the rest of the
  pre-existing diff on top so it remains exactly as uncommitted as it was before this Run.

## Approved art — used as delivered, not regenerated

Source: `thinking_game_NEW_LIFE_V0_1_PLAYABLE.zip` / `..._INTEGRATION_HANDOFF.zip` (Desktop),
`prototype/assets/{town,yohei,miyoko,soma}.png`. Copied verbatim (no re-encoding, no crop, no
regeneration) into the repo under safe ASCII names and imported via Vite's static-asset pipeline
(not raw string paths) — this is also the root-cause fix for "images don't show in the real app":
a hardcoded `src="assets/x.png"` string breaks under this project's GitHub Pages `base:
"/thinking-game/"` build config (see `vite.config.ts`); an `import img from "../assets/...png"`
is rewritten correctly by Vite for both dev and the production base path, and the production
`npm run build` output was inspected directly to confirm all 4 files land in `dist/assets/` with
correct hashed names.

| Asset | Repo path |
|---|---|
| Challenge Town (夕暮れの商店街と川辺) | `src/assets/newlifev02/challenge-town.png` |
| 洋平 | `src/assets/newlifev02/yohei.png` |
| 美代子 | `src/assets/newlifev02/miyoko.png` |
| 相馬迅 | `src/assets/newlifev02/soma-jin.png` |

No image was judged, re-generated, or rejected this Run, per directive Section 1.

## What was built

New, isolated module `src/newlifev02/` (route `?newlifev02=1`, not linked from Home — same
query-param-only pattern already used by every other `src/newlife*` experiment in this repo):

- `types.ts` — local state shape only (`V02Flags`, `V02State`, `Scene`). Imports, but does not
  modify, `LifeMaterial` from `../research/life-material-7day/types` — the existing schema.
- `content.ts` — the authored 3-day script: intro/morning, a 3-way location choice (洋平商店 /
  喫茶のどか / 集会所), a fixed afternoon 商店街 beat, a passive evening beat, and day-summary
  logic. Every `LifeMaterial.concreteContent` IS the natural-language phrase shown on screen
  (e.g. `"洋平から借りた古い工具箱"`) — the type tag (`OBJECT`/`PROMISE`/...) is used internally
  for sorting/testing only and is never rendered.
- `engine.ts` — small pure reducer (`applyChoice`, `applyAutoEffect`, `startNextDay`).
- `NewlifeV02App.tsx` / `newlifev02.css` — the React surface.

No new life-material type was introduced (directive Section 5/9); the prototype's non-canonical
`RUMOR`/`KNOWLEDGE`/`STATE` labels do not appear anywhere in this module — see "Rejected prototype
elements" below.

## Causal chains actually implemented (not just designed)

**Toolbox → shelf → Jin** (borrow branch): DAY1 borrowing Yohei's toolbox → DAY2 morning shelf
breaks and can be fixed with it → DAY2, if the player also visits Yohei and reports this, Jin
(present at the store per this project's existing canon direction) says *「それ、洋平さんのだろ」*
→ DAY3 morning narration reflects the fixed shelf. Verified end-to-end by
`tests/newlifeV02RenderedUI.test.tsx` and the Playwright script (both viewport screenshots and an
automated text-match on the payoff line).

**Toolbox → shelf → Jin** (no-borrow branch): DAY1 not borrowing → DAY2 shelf still breaks, player
asks Jin for help → Jin turns up unprompted at the trial house that afternoon and fixes it himself
— the world resolving the same problem through a different route depending on DAY1's choice, not a
single forced path.

**Flowerbed, world-without-player**: skipping Miyoko entirely on DAY1 still produces an evening
glimpse of her tidying the flower bed (a `WORLD_CHANGE` material, `authority:
WORLD_EVENT_WITNESSED`, never chosen by the player) — DAY2 she opens with *「昨日、見てたでしょ」*
instead of the DAY1 first-meeting line, and the promise/help path is still reachable, just entered
differently. Meeting her and promising on DAY1 instead skips straight to *「昨日言ってた花壇なんだ
けどね」* on DAY2.

**NPC memory**: Jin, met at 集会所 on DAY1, opens DAY2 with *「昨日の掲示、ありがとな。残りは片付
けといた」* instead of a first-meeting line.

## Rejected prototype elements (directive Section 5)

- `RUMOR` (商店街 "ask around" choice) and `STATE` ("do nothing, rest" choice) from the original
  single-scene prototype had no safe existing-schema mapping (an unverified rumor is not the same
  epistemic status as `PLACE_KNOWLEDGE`'s confirmed fact; "nothing happened" is exactly the vague
  non-content `LifeMaterial.concreteContent`'s own doc-comment says must never become a material).
  Both were dropped rather than force-mapped, per directive Section 5's explicit instruction.
- All UI copy that explained the player's own psychology ("頼まれてはいない", "このゲームではこれ
  も選択だ" etc., from the single-scene prototype reviewed under the interrupted V0.1 task) was
  not carried forward — every line in this Run's script is SITUATION-only dialogue/narration.

## Tests

`tests/newlifeV02RenderedUI.test.tsx`, 13 tests, all passing: town/Yohei/Miyoko/Jin images
actually render (`<img>` tag + resolved `src`, not just DOM presence); DAY1 is confirmed to be
multiple scenes (afternoon step reached, summary step NOT reached, after exactly one NPC choice);
DAY1→DAY2 and DAY2→DAY3 state propagation (both the borrow-branch and the no-borrow/Jin-fixes
branch); the world-without-player flowerbed trace; Jin's remembered-meeting line; a material
surviving from a day's own summary into the next day's "carried over" list; no raw
`OBJECT`/`PROMISE`/`SHARED_EVENT`/`WORLD_CHANGE`/`PENDING_TASK`/`PLACE_KNOWLEDGE` token anywhere
in the rendered DOM across a full playthrough; a simulated portrait `error` event degrades to a
fallback without removing the scene's choices; no horizontal overflow at 360/390/430px
(`document.body.scrollWidth`, matching this repo's existing mobile-test convention).

Full-suite results this Run: **108 test files / 1587 tests, all passing** (baseline before this
Run: 107 files / 1574 tests — the +1 file / +13 tests are this Run's own addition; zero
regressions elsewhere). `npm run typecheck` clean. `npm run build` succeeds; all 4 images confirmed
present in `dist/assets/` with correct hashed filenames.

## Visual gate (Section 20)

Real Chromium (Playwright), all 4 required viewports (360×800, 390×844, 430×932, 1440×900), full
OPENING → DAY1 (morning/NPC/afternoon/evening/summary) → DAY2 (morning/branch) → DAY3 sequence.
Script: `docs/research/evaluation/newlife-v0-2/v02_visual_qa_script.mjs`; evidence:
`v02_visual_qa_evidence.json` (36/36 automated checks pass — image `naturalWidth > 0` at every
viewport, no horizontal scroll, choices within viewport bounds, cross-day state reflected);
screenshots under `screenshots/`. A second short script,
`v02_check_ending.mjs`, specifically confirms DAY3's summary has no "翌日へ" button and instead
shows a soft, non-final closing line.

Claude's own visual read of the screenshots:
- Opening reads as a game world immediately — full-bleed town art, gradient-legible title/copy,
  one clear CTA, no "settings panel" impression.
- Portraits are unmistakably the felt/wool-chibi register, consistent with each other and with
  this project's existing `ossan-cheerful.png`-family art — no photorealistic/promotional-photo
  impression, and none of the three reads as too young for its role.
- One real issue was found and fixed during this review: at the 1440px viewport the portrait was
  only 120px wide (a fixed value) and looked undersized against the "人物画像は必ず大きく見せる"
  requirement. Changed to `clamp(140px, 26vw, 260px)` (mobile keeps its own narrower override via
  the existing `max-width:480px` rule) — re-verified via a second full script run plus a direct
  screenshot re-read at 1440px and 360px; mobile was unaffected and now reads clearly larger at
  desktop without approaching half the viewport.
- Choice buttons stay above the fold at every mobile viewport in every captured beat; the topbar
  home button and DAY label never get pushed out.
- DAY-end summaries read as natural sentences ("洋平から借りた古い工具箱", "美代子が商店街の花壇
  を片づけていた"), never as raw type labels.
- The DAY3 closing screen intentionally leaves a thread open (the empty shop turning out to hold
  flower crates, no shop name yet; 洋平's festival-prep invitation for "next week") rather than
  resolving into a finale — matching the "もう1日やりたい" success bar rather than "3日クリアした".

## Regressions

None found. Full pre-existing suite (108 files after this Run's addition) passes unchanged;
`npm run typecheck` and `npm run build` are both clean; PHASE 12.1's bounded-generative-world
slice (`?newlifebgw121=1`) and every other existing route are untouched (no shared files were
edited besides the 4-line, isolated `App.tsx` addition above).

## Deploy

Not deployed. Local verification only, per directive Section 21 / this project's standing release
discipline (local PASS is a precondition for, not a trigger of, any production sync).
