# Art Asset Gate Result V1 — PHASE 12.2

Directive Section 0/1 (`CODE_DIRECTIVE_PHASE12_2_ART_INTEGRATION.txt`, delivered via
`thinking_game_PHASE12_2_FINAL_ART.zip` / `thinking_game_PHASE12_2_IMPLEMENTATION_HANDOFF.zip`,
2026-09-10). Result: **REJECT all 5 delivered images for direct integration.** No opening or
NEW LIFE product code was changed this phase; PHASE 12.1's accepted visual baseline
(`PHASE_12_1_ACCEPTED_BASELINE_V1.md`) stands unmodified.

## Baseline lock

- Baseline commit: `2c5809f` ("product: prepare new life visual world for final art"), sitting on
  the PHASE 12.1 accepted checkpoint `5cf68ef`.
- Test count at start: 107 test files, 1574 tests, all passing (`npx vitest run`). Unchanged by
  this phase — no source files were edited.
- Opening/NEW LIFE target files (unmodified): `src/newlifebgw121/NewlifeBgw121App.tsx`,
  `src/newlifebgw121/newlifebgw121.css`, `src/newlifebgw121/mapLayout.ts`.
- Canonical specs checked against: `ART_ASSET_MANIFEST_V1.md`, `CHARACTER_MAP_ART_DIRECTION_V1.md`
  (PHASE 12.0), `src/research/bounded-generative-world/canonData.ts` (NPC canon, authoritative for
  age/role), `OPENING_VISUAL_PRODUCT_V1.md`, `OPENING_PRODUCT_SPEC_V1.md`.

## Package received

`thinking_game_PHASE12_2_FINAL_ART.zip` (Desktop): `01_TOWN_MAP_V1.png` (1122×1402, RGBA),
`02_YOHEI_CHARACTER_V1.png` / `03_MIYOKO_CHARACTER_V1.png` / `04_SOMA_JIN_CHARACTER_V1.png`
(554×1305 each, RGBA, genuinely transparent at the outer margins — verified per-pixel, not just by
file mode), `REFERENCE_CHARACTER_SHEET.png` (reference only per its own MANIFEST.txt), and a
`MANIFEST.txt`. All 4 canonical files were opened and visually inspected.

## Per-asset gate result

### `01_TOWN_MAP_V1.png` — REJECT

| Manifest requirement (`ART_ASSET_MANIFEST_V1.md` §1) | Delivered |
|---|---|
| No baked Japanese text of any kind (location names are HTML overlays) | Heavily baked text throughout: building signage, a station name, a school name |
| 5 legible zones matching `TRIAL_HOUSE / SHOPPING_STREET / YOHEI_STORE / CAFE_NODOKA / COMMUNITY_HALL` | Shows unrelated buildings/signage: `赤町駅`, `なかまち商店街`, `山崎精肉店`, `やまぐち`, `ひまわりクリニック`, `大府第一中学校`, `中央公園` — none of the 5 canon locations appear anywhere, by name or by recognizable substitute |
| Small town, hub-and-spoke, 5 nodes — not a sprawling city | Depicts a full small **city**: train station, river with bridge, school grounds, multiple unrelated apartment blocks/factories in the skyline |
| Style: warm realism, **not anime-exaggerated** | Rendered as a clean, saturated, anime-painted illustration |

The baked text is not a cosmetic defect fixable by crop/overlay: it is spread across the entire
frame (the one text-free strip — sky/distant hills — reads as generic scenery, not "Challenge
Town," and still carries a dense, modern-city skyline incompatible with the "small declining
regional town" brief). Cropping cannot repair a town that is structurally the wrong town. Per
directive Section 1 ("画像があるから使うは禁止" / "プロダクト価値を落とすなら採用しない"), this
asset is not used, in whole or in crop.

### `02_YOHEI_CHARACTER_V1.png` — REJECT

Canon: 62, "early 60s, weathered but sturdy," apron/work-vest over ordinary clothes, general-store
clutter. Delivered: photorealistic photo of a man reading closer to mid-40s/early-50s than "early
60s weathered," in a produce-crate setting consistent with a general store. Role framing is the
closest fit of the three delivered characters, but the asset shares the same hard style violation
below.

### `03_MIYOKO_CHARACTER_V1.png` — REJECT

Canon: 68, "late 60s, visibly a little tired but composed," café apron, café-counter warmth.
Delivered: photorealistic, styled/posed photo of a woman reading as roughly 30s. This is the
directive's own named failure mode (Section 7: "人物が若すぎる... 宣材写真風になっていないか") —
a 30-year age gap from canon on a character whose entire visual brief is "late 60s, tired but
composed." Reference sheet confirms this is not a crop/lighting artifact; it is the character's
depicted age.

### `04_SOMA_JIN_CHARACTER_V1.png` — REJECT

Canon (`canonData.ts`): 57, freelance handyman/repair generalist. Delivered: photorealistic photo,
rugged/muscular, towel and tool belt — the closest age/role match of the three, plausibly
mid-40s-to-mid-50s. Rejected for the same style violation as the other two (below), not for
canon/role conflict.

### Shared, decisive reason all 3 character assets fail together

`ART_ASSET_MANIFEST_V1.md`'s common production notes (§ "Common production notes") require, for
all character assets: **"not anime-exaggerated, not photorealistic-uncanny... not generic corporate
illustration."** All 3 delivered characters are straightforwardly photorealistic, styled/posed
photographs (stock-photography register) — the exact register the manifest rules out. This is not
a matter of individual taste: it is a written spec violation, verifiable by looking at the files.

It also collides with the product's actual, already-shipped visual identity: `HomeScreen.tsx` —
the screen the player is on immediately before entering NEW LIFE — uses a soft, rounded,
felt/chibi-doll character illustration style (`src/assets/ossan-cheerful.png`,
`home-welcome-felt.png`, etc.). Dropping photorealistic human faces into the very next screen
would be a jarring, mid-experience style break, directly contradicting must-preserve value
"読まないと分からないUIに戻さない" / "画像がゲームプレイを邪魔しない" and gate criterion A
(世界観が既存openingと一致するか). Using 2-of-3 or 1-of-3 would only compound this by mixing
photoreal and placeholder/illustrated npcs in the same cast, so all 3 are rejected together rather
than cherry-picked.

### `REFERENCE_CHARACTER_SHEET.png`

Reference-only per the package's own `MANIFEST.txt` — not evaluated for direct use, matches the
same 3 photoreal portraits composited together.

## What was NOT done, and why

No opening/NEW LIFE code was touched. No `OpeningVisual` / `CharacterPortrait` components were
added, because there is nothing accepted to render through them — building that scaffolding now
would be dead code with no valid asset behind it, which the directive's own anti-inflation
instruction (Section 5: "抽象化のための抽象化は禁止") argues against. The existing
`PortraitPlaceholder` in `NewlifeBgw121App.tsx` (explicitly marked "Never a final visual") is left
in place unchanged, exactly as PHASE 12.1 left it.

No tests were added for image render/path/context-gating, since there are no accepted image assets
for those tests to exercise; writing them against the placeholder would be testing nothing new.

## Recommendation for the next art pass

Re-brief image generation strictly against `ART_ASSET_MANIFEST_V1.md` and
`CHARACTER_MAP_ART_DIRECTION_V1.md` as written, with two concrete corrections for the generator:

1. Map: no baked text, small-town scale (5 buildings/zones, not a city with a station/school/river),
   warm non-photographic illustration register — matching the felt/chibi tone already established
   by `src/assets/ossan-*.png`, not an anime-painted or photoreal register.
2. Characters: illustrated (not photographic) register in the same family as the existing
   `ossan-*` assets; Miyoko specifically needs to read as late-60s and "a little tired" per canon,
   not as a styled young adult.

## CLOSE summary

- BASELINE COMMIT: `2c5809f`
- FINAL COMMIT: this documentation-only change (no product code modified)
- Files changed: this document only (new)
- Images adopted: none (0 of 5)
- Images rejected: all 5 — `01_TOWN_MAP_V1.png` (wrong baked locations/text, wrong town scale,
  banned anime style), `02_YOHEI_CHARACTER_V1.png` / `03_MIYOKO_CHARACTER_V1.png` /
  `04_SOMA_JIN_CHARACTER_V1.png` (banned photorealistic style; Miyoko additionally fails
  canon age by ~30 years), `REFERENCE_CHARACTER_SHEET.png` (reference-only, not evaluated for use)
- Tests: 107 files / 1574 tests, unchanged and passing (no code touched, so no new run needed
  beyond the baseline confirmation already recorded above)
- Viewport screenshots: not applicable — no visual change was made to screenshot
- Visual review: not applicable — nothing was implemented to review
- Safe fixes: none needed
- Regressions: none — no product code changed
- Accepted baseline (PHASE 12.1): fully preserved, verified unmodified
- Deployed: no — no product change exists to deploy
