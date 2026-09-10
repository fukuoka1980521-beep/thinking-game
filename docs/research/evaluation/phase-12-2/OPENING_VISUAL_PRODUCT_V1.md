# Opening Visual Product V1 — PHASE 12.2

Directive Section 3. Uses the already-approved canonical opening text unchanged
(`OPENING_PRODUCT_SPEC_V1.md`, PHASE 12.0) — no copy was rewritten, only its presentation.

## What changed

| Before (PHASE 12.1) | After (PHASE 12.2) |
|---|---|
| Plain paragraph inside a generic `.ns-choices` panel, same visual class as every other button list in the app | Dedicated `.bgw-opening` full-viewport scene: soft top-to-bottom gradient background, a title (`チャレンジ町の30日間`), generously line-spaced prose, a single clearly-primary "町を歩き始める" button |
| No visual distinction between "reading an opening" and "choosing a menu item" | Reads as a scene-setting beat before interaction begins, not a settings/spec panel |

## Required facts — unchanged, all present (re-verified this phase)

57歳 / 長く勤めた仕事を辞めた / 次はまだ決めていない / 30日間の試住に応募した / チャレンジ町へ来た /
仮住まいの鍵、30日目に鍵を返す — all present in the existing prose, verified by
`tests/newlifeBgw121RenderedUI.test.tsx`'s pre-existing opening-text assertions (unchanged, still
passing).

## What was deliberately NOT done

- No anomaly explanation — none existed before, none added.
- No emotional prescription — the text remains SITUATION-only, matching
  `NEW_LIFE_SCENARIO_BIBLE_V1.md`'s binding discipline.
- No new establishing image — `CHARACTER_MAP_ART_DIRECTION_V1.md`'s optional
  `OPENING_CHALLENGE_TOWN_V1` was evaluated (directive Section 17) and NOT added to this phase's
  asset manifest — the text-plus-gradient treatment already reads as a story beginning without a
  dedicated image, and directive Section 17 explicitly says not to inflate the asset count without
  genuine need.

## Mobile readability

Verified in `mobile_visual_qa_script.mjs` at iPhone-13 viewport (390×844 logical px): no horizontal
scroll, text wraps naturally across 3 short lines via explicit `<br/>` breaks (avoiding a single
dense justified block), button is a clear single tap target above the fold. See
`screenshots/00_opening.png`.
