# NEW LIFE — Visual Bible V1 (PHASE_21)

Design-only (no image is generated in this phase). This is the canon future image generation must
follow, per directive Section 19. Order of operations for every future asset: **ROLE → CHARACTER
DESIGN → VISUAL DESIGN → IMAGE GENERATION** (Section 16) -- the character roster doc's per-NPC
silhouette/build descriptions were written *before* this document for exactly that reason, and
image generation should never start from "what does the existing stamp look like" first.

## Canon source

The Owner's own LINE-sticker/felt-character art (`assets/newlife-stamps-source/`,
`assets/newlife-stamps-source-v2/`) remains the style canon for texture and warmth. It does NOT
constrain who may exist in the cast (directive Section 7/16) -- the roster was designed from role
first (see `NEWLIFE_CHARACTER_ROSTER_V2.md`), and any portrait built from it that isn't a literal
Owner original must be labeled `AI_GENERATED_FROM_USER_STAMP_STYLE_REFERENCE`, never passed off as
an Owner original.

## Character proportions

Soft, slightly rounded chibi-adjacent proportions (matching the Owner canon's felt-doll register) --
NOT photorealistic, NOT sharp-edged anime. Head-to-body ratio stays close across all 6 MAIN NPCs
(no character drawn "small" or "large" relative to the others except where the roster doc
specifically calls for it, e.g. Hina being the shortest/youngest-read build, Jin being the
broadest).

## Felt texture

Visible woven/felt texture on hair, clothing, and soft surfaces, consistent density and grain
across every character and location -- this is the single most identity-defining trait of the
canon and must not visibly vary in "how felted" a given asset looks.

## Eyes / face style

Large, simple, warm eyes; visible but soft brow shapes for expression; blush/cheek color used
consistently as the primary warmth cue across all ages (not just younger characters). Wrinkles
(Yohei, Miyoko, Fumiko) are soft creases, never harsh linework -- age is readable without becoming
severe or unflattering.

## Outlines

Soft, slightly irregular outline (hand-felted look), never a crisp vector line. Consistent outline
weight across characters and backgrounds so nothing looks pasted from a different render pipeline.

## Clothing detail

Occupation-legible at a glance (Section 5's role-first principle, restated visually): Yohei's
apron, Miyoko's café apron/cardigan, Jin's work clothes + visible tool, Daisuke's barber
smock + scissors/comb, Hina's flour-dusted apron, Fumiko's cardigan + glasses-on-cord. No two MAIN
NPCs share a silhouette-defining garment.

## Background density

Locations carry real, specific detail (signage, props, weather cues) -- never a flat gradient
behind a character. Characters read clearly against their background via a soft vignette/shade
behind the figure, not by simplifying the background into nothing (matching the existing
`.nlc-hero-shade` pattern already proven in the codebase's day-end/opening screens).

## Color temperature

Warm overall palette (ambers, warm browns, soft greens) across all 6 locations, with each location
getting its own accent within that warmth (Fortune House: dusty rose/plum; Café: warm cream/wood;
Yohei's shop: olive/brown; Community Hall: muted teal/cream; Shopping Street: mixed warm daytime
tones; Trial House: pale morning gold vs. lamp-amber evening).

## Signage

Where a location plausibly has a sign (shop, café, barber), the sign is a real, readable
(in-image, not baked as unreadable decoration) Japanese name matching the game's own place names --
mirroring the already-proven pattern in `newlifev02/challenge-town.png`.

## Daytime / evening

Every location needs a legible day/evening distinction (per the town design doc's per-location
day/night notes) -- warm golden daylight vs. lamp-lit warm-dark evening, achieved via a consistent
lighting-treatment rule, not a per-location bespoke palette.

## Weather (future-reserved)

Not required for the 7-day core's minimum asset set, but the canon should tolerate an overcast/
rain variant later without breaking the palette rules above (soft grey-blue added to the existing
warm base, never replacing it).

## UI integration

Portraits: fixed-aspect card, `object-fit: cover`, matching the existing `.nlc-portrait` pattern.
Location heroes: wide `object-fit: cover` banner with a bottom gradient for text legibility,
matching the existing `.nlc-hero` pattern. No new CSS treatment is proposed -- the existing
patterns already satisfy this bible's needs.

## Image crop / mobile readability

Character portraits: bust-up, face and upper-body occupation cue both visible without cropping
either out, at the existing `.nlc-portrait` aspect ratio. Verified legible at the smallest target
viewport (360px) using the same clamp-based sizing already proven in PHASE_17.

## Provenance labeling requirement

Every future asset file gets one of: `SOURCE_ORIGINAL_USER_STAMP`, `DERIVED_FROM_USER_STAMP`,
`AI_GENERATED_FROM_USER_STAMP_STYLE_REFERENCE`, `OLD_AI_GENERATED_ART` -- recorded in
`NEWLIFE_VISUAL_ASSET_MANIFEST_V2.md` at production time. No unlabeled asset ships.
