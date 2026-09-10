# Art Asset Status V1 — PHASE 12.1

Directive Section 11. Stated exactly, not softened. `CHARACTER_MAP_ART_DIRECTION_V1.md` (PHASE
12.0) specified a Product contract (portrait/standing image, name, visual identity, current visible
activity — visually legible, not text-only) and an explicit visual brief per NPC and for the map.
**None of it was implemented this phase.** `NewlifeBgw121App.tsx` contains zero `<img>` elements
and no visual character/map representation of any kind — every location, NPC, and activity is
plain text.

| Asset | Status | Basis |
|---|---|---|
| MAP ART | **MISSING** | No map graphic, no location icons, no route visualization — location choices render as plain text buttons |
| YOHEI ART | **MISSING** | No portrait/standing image; identified by text name only |
| MIYOKO ART | **MISSING** | Same |
| JIN ART | **MISSING** | Same |

## Why this happened

This phase's scope (directive Sections 1-10 of the resumed task) was entirely about proving the
generative pipeline, the live AI path, world authority, and NPC independence — none of which
required visual assets to demonstrate. `CHARACTER_MAP_ART_DIRECTION_V1.md` explicitly scoped itself
as "a brief for a separate image-generation step... No image-generation code, prompt-execution
pipeline, or asset files are created this phase" (PHASE 12.0) — that separate step has still not
happened. This is a real, unclosed gap, not an oversight being reported for the first time now —
PHASE 12.0 already flagged it as future work, and this phase did not close it because it was not
this phase's assigned scope.

## Consequence for readiness (directive Section 11's explicit rule)

**VISUAL PRODUCT ≠ PASS.** Per directive's own instruction, because MAP/YOHEI/MIYOKO/JIN art are
all `MISSING` (not merely `TEMPORARY`), **any Owner Play recommendation for this slice remains
explicitly subject to Strategist review** — this document does not itself recommend Owner Play
(see the final verdicts in `STRATEGIST_VERTICAL_SLICE_AUDIT_PACKET_V1.md`, which separates
"structural/mechanical readiness" from "visual Product readiness" rather than blending them into
one PASS).

## What is NOT claimed

This document does not claim engineering placeholders (e.g., emoji, colored boxes) are finished
Product art, because none were even added as placeholders — the current state is plain text, one
level below even a temporary placeholder. The next phase that addresses this should decide
explicitly whether to (a) add a genuinely temporary visual placeholder (emoji or simple shapes,
clearly labeled non-final) to at least satisfy "visually recognizable as people, not text labels"
minimally, or (b) commission/generate the real art per `CHARACTER_MAP_ART_DIRECTION_V1.md`'s brief
directly. Neither decision is made here.
