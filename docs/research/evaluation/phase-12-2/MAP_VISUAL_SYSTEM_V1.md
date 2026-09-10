# Map Visual System V1 — PHASE 12.2

Directive Section 4/5. Map LOGIC (reachability, `TRAVEL_EDGES`) is unchanged — this document is
presentation only.

## What changed (directive Section 4)

Before: 5 plain text buttons in a flat vertical list (indistinguishable from an ordinary menu).
After: a single `.bgw-map` composition — a fixed-aspect-ratio canvas (currently a CSS gradient
placeholder) with each of the 5 canon locations rendered as a marker POSITIONED at its own
`(x, y)` coordinate (`src/newlifebgw121/mapLayout.ts`'s `MAP_NODE_POSITION`, normalized 0-1
fractions), not stacked in reading order. The player's current location is visually distinguished
(darker marker fill); a small badge appears on a location once a relevant consequence is active
there (currently wired for `YOHEI_STORE`/`yohei_help_promise`). This satisfies "these places have
positions / I am moving between places" without needing final art yet — see
`screenshots/01_first_map.png`.

## Map asset contract (directive Section 5)

| Property | Value | Rationale |
|---|---|---|
| Canvas aspect ratio | 4:5 (portrait) | Matches the app's mobile-first, single-column frame (`max-width: 480px`); avoids letterboxing on a phone |
| Master pixel dimensions | 1536 × 1920 px | A common, quality-sufficient AI-image-generation output size at this aspect; downscales cleanly for web delivery |
| Mobile safe/crop area | Center 1536 × 1728 px (top/bottom ~96px each trimmed) | Reserves room for the fixed topbar/caption overlay without cropping into location art |
| Location-marker coordinates | Normalized fractions, defined in `mapLayout.ts`'s `MAP_NODE_POSITION` (TRIAL_HOUSE 0.22,0.80 · SHOPPING_STREET 0.50,0.50 · YOHEI_STORE 0.78,0.32 · CAFE_NODOKA 0.24,0.28 · COMMUNITY_HALL 0.78,0.72) | Scale-independent — a new final-art canvas at any resolution reuses the same fractions unchanged |
| Location names: baked into art or HTML overlay? | **HTML overlay** (per directive's stated preference) | `mapLayout.ts`'s coordinates position an HTML label (`.bgw-map-node-label`) over the art; the master art file should contain NO Japanese text at all, so copy changes never require regenerating the image |
| Day/time visual treatment | Not implemented this phase (single fixed daytime palette) — deferred, matches `VERTICAL_SLICE_PRODUCT_FLOW_V1.md`'s Day-1-morning/afternoon-only scope | A future phase reaching a wider time window should extend this with a palette/lighting variant per time-of-day, still HTML/CSS-driven (e.g. an overlay tint), not a second full art asset per time-of-day unless art review determines otherwise |
| Interaction hit areas | Each marker is a real `<button>` (44×46px minimum rendered marker + label), independently tappable; reachability (`disabled` state) still comes from `TRAVEL_EDGES`, never redrawn per marker | Verified `>= 40px` in real mobile QA (`mobile_visual_qa_script.mjs`) |

## What remains a placeholder (directive Section 18)

The canvas itself (currently a flat CSS gradient) and the marker glyphs (each location's own
kanji initial in a plain bordered box) are engineering placeholders — **not final art, not called
complete**. See `ART_ASSET_MANIFEST_V1.md` for the actual production request
(`NEW_LIFE_MAP_V1`).
