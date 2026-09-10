# Art Asset Manifest V1 — PHASE 12.2

Directive Section 17. Exact production requirements for the image-generation step that will occur
OUTSIDE Code. Not inflated beyond the required minimum plus one evaluated-and-rejected optional.

## Required assets (4)

### 1. `NEW_LIFE_MAP_V1`

- Canvas: 1536 × 1920 px, 4:5 portrait, transparent-not-required (opaque background acceptable —
  this is an environment, not a compositing layer).
- Mobile safe area: center 1536 × 1728 px.
- **No baked Japanese text of any kind** (location names render as HTML overlays,
  `MAP_VISUAL_SYSTEM_V1.md`).
- Must visually accommodate 5 distinguishable location "zones" at the normalized coordinates in
  `src/newlifebgw121/mapLayout.ts`'s `MAP_NODE_POSITION` (TRIAL_HOUSE, SHOPPING_STREET,
  YOHEI_STORE, CAFE_NODOKA, COMMUNITY_HALL) — the art should make each zone visually legible as a
  distinct place (a shopfront silhouette, a café frontage, a community-hall building, a small
  residential building, a connecting street), matching the town-scale/style direction in
  `CHARACTER_MAP_ART_DIRECTION_V1.md` (PHASE 12.0) and `NPC_VISUAL_PRESENTATION_V1.md`'s art
  direction (this phase).
- Single fixed daytime lighting/palette (no day/night variant requested this phase).

### 2. `YOHEI_CHARACTER_V1`

- Canvas: 1024 × 1536 px, 2:3 portrait, **transparent background (PNG)**.
- Half-body/standing, waist-up minimum framing.
- Brief: `NPC_VISUAL_PRESENTATION_V1.md`'s Yohei section.

### 3. `MIYOKO_CHARACTER_V1`

- Same canvas/background/framing spec as above.
- Brief: `NPC_VISUAL_PRESENTATION_V1.md`'s Miyoko section.

### 4. `JIN_CHARACTER_V1`

- Same canvas/background/framing spec as above.
- Brief: `NPC_VISUAL_PRESENTATION_V1.md`'s Jin section.

## Optional asset evaluated (directive Section 17)

### `OPENING_CHALLENGE_TOWN_V1` — **NOT requested this phase**

Considered and rejected for now: `OPENING_VISUAL_PRODUCT_V1.md` found the existing text-plus-
gradient opening treatment already reads as a story beginning without a dedicated establishing
image. Revisit only if a future Owner-play session specifically flags the opening as feeling
under-dressed once the 4 required assets above are installed and the overall visual bar has
shifted — do not add this asset speculatively now, per directive's explicit "do not inflate the
asset count" instruction.

## Common production notes (applies to all 4 required assets)

- No emoji, no generic silhouette treated as final (directive Section 6/18) — these must be actual
  generated character/scene art.
- Consistent art direction across all 4 (directive Section 8): adult narrative mobile game; warm
  but not childish; real-life-town-with-slight-literary-atmosphere; not anime-exaggerated, not
  photorealistic-uncanny, not children's-game style, not generic corporate illustration. The
  unexplained anomaly must not be visually referenced in any of these 4 (they are all
  "ordinary town" assets).
- File format: PNG (transparency required for the 3 character assets; the map may be PNG or JPEG
  since it has no transparency requirement).

## Status

**Manifest complete. Real art generation can begin against this document** once reviewed — no
further Code-side design work blocks it. See `STRATEGIST_VISUAL_PRODUCT_AUDIT_PACKET_V1.md` for
the explicit "can real art generation begin" verdict.
