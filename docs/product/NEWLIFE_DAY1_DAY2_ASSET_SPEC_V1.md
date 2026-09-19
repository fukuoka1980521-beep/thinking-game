# NEW LIFE — Day 1 + Day 2 Asset Spec V1 (PHASE_22)

Generation-ready specification, per directive Section 3. **No image has been generated against
this spec** — no image-generation tool is available in this environment (re-confirmed this phase:
Vertex AI's Imagen was directly tested with the same credentials that already work for Gemini
text, and returned 404/no-access on every model name and region tried). This document exists so
that whoever/whatever *does* generate these images (the Owner, an external tool, or a future
environment with Imagen access) can do so without re-deriving the design. Style canon:
`NEWLIFE_VISUAL_BIBLE_V1.md`. Character/role source: `NEWLIFE_CHARACTER_ROSTER_V2.md`.

## Forbidden similarities (checked against every asset below)

- Hina must not read as elderly, idol-like, or generically "anime heroine."
- Hina must not be visually confusable with Miyoko or Fumiko (both older, both rounder/softer
  builds per the roster doc) or with any existing older-female stamp asset.
- Yohei must not be visually confusable with Jin (both older men) -- see the differentiation table
  below for the specific, checkable differences required.
- No new asset may be a third "generic old man" -- Yohei's design must be specific to *him*, not
  swappable with any other older male NPC.

## Asset 1 — Hina (陽菜), canonical portrait

- **Subject**: 陽菜, 28, bakery owner-to-be (canonical age/role, `npcDefs.ts`)
- **Apparent age**: late 20s, clearly younger than every other currently-portrayed NPC
- **Role**: newcomer, small-business owner mid-setup
- **Silhouette**: shortest, slightest build of the eventual 6-person cast; upright but slightly
  restless posture (someone still finding their feet, not yet settled)
- **Clothing**: ordinary, contemporary, practical -- an apron (flour-dusted) over plain everyday
  clothes, not fashion-forward or glamorous (directive Section 4's explicit "not idol-like" ban);
  hair tied back or under a simple kitchen cloth (practical, not styled)
- **Props**: one newcomer/working cue -- a rolled-up shop-fitting sketch, a small delivery box, or
  flour on her hands/apron (pick one, not all three, to avoid clutter)
- **Expression**: open, slightly hopeful, a little unguarded -- someone still deciding if this town
  will work out, not performing confidence
- **Pose**: mid-task (wiping a counter, checking a list) rather than a static greeting pose --
  reinforces "still setting up," distinct from every other NPC's "already settled" default pose
- **Background requirements** (for any scene-pose variant): unfinished/in-progress shop interior --
  visible bareness, a few finished touches, boxes not yet unpacked
- **Mobile crop**: bust-up, matching the existing `.nlc-portrait` aspect ratio; face and the chosen
  prop both visible without cropping either out
- **Visual distinction requirements**: lighter overall color value than the older cast (younger
  skin tone rendering, less muted palette) + visibly shorter/slighter build + the only MAIN NPC in
  visible mid-task motion by default
- **Style canon references**: Owner felt/stamp texture and proportions (`assets/newlife-stamps-
  source*/`), NOT the existing photorealistic-adjacent `newlifev02` register
- **Forbidden**: idol/glamour styling, elderly features, any color/texture treatment that reads
  closer to Miyoko's or Fumiko's existing warmth-palette than to a distinctly younger register
- **Provenance if generated**: `AI_GENERATED_FROM_USER_STAMP_STYLE_REFERENCE`

## Asset 2 — Yohei (洋平), canonical portrait

- **Subject**: 洋平, 63, general store owner (canonical age/role)
- **Apparent age**: early-to-mid 60s
- **Role**: settled, practical shopkeeper
- **Silhouette**: stocky, grounded, wider/heavier build than Jin's -- see the differentiation table
- **Clothing**: a shop apron over ordinary clothes (distinct garment from Jin's workwear+tool-belt
  silhouette), practical not stylish
- **Props**: a stock item or clipboard/delivery box -- reinforces "shop owner mid-task," never
  shown idle
- **Expression**: kind but a little guarded/practical -- warms slowly, not performatively friendly
  from the first frame
- **Pose**: stocking a shelf or checking a delivery, not a static greeting wave -- Yohei is
  "someone usually doing work" (directive Section 5), the same "mid-task, not posed" principle
  applied to Hina above, applied here too
- **Background requirements**: general-store interior, visible shelved stock, a delivery box
  nearby
- **Mobile crop**: bust-up, same aspect ratio convention as Hina
- **Visual distinction requirements**: see the Yohei/Jin table below -- every listed row must be
  checkable at a glance
- **Style canon references**: Owner felt/stamp texture; may reference the existing
  `newlifev02/yohei.png` for continuity of "who this character already is" but must NOT simply
  re-skin it in the same silhouette that reads too close to Jin -- the Owner's own complaint
  ("Yohei and Soma Jin look too similar") is the defect this asset exists to fix
- **Forbidden**: any silhouette, hair treatment, or prop that overlaps with Jin's row below
- **Provenance if generated**: `AI_GENERATED_FROM_USER_STAMP_STYLE_REFERENCE` (or `DERIVED_FROM_
  USER_STAMP` only if literally cropped/recolored from an Owner original -- not expected here)

## Yohei vs. Jin differentiation table (Section 5/6 of PHASE_21, restated as a generation checklist)

| Dimension | Yohei (this spec) | Jin (existing/future asset, for contrast -- NOT built this phase) |
|---|---|---|
| Build | Stockier, heavier-set | Taller, leaner, broader-shouldered |
| Hair | Fuller, dark-grey, neat | Thinner/greyer or a cap, less groomed |
| Facial hair | Clean-shaven or trimmed | A more weathered, less-maintained look |
| Clothing | Shop apron over ordinary clothes | Workwear + visible tool/tool belt, no apron |
| Default prop | Stock item / clipboard | A held tool (wrench, screwdriver) |
| Default pose | Stocking shelves (upright, contained motion) | Crouched/reaching, mid-repair |
| Expression | Practical warmth, slightly guarded | Terse, minimal expression, comfortable silence read |

This table is the literal 2-second-test (PHASE_21 Section 6) checklist -- if a generated Yohei
image doesn't clearly diverge from Jin on at least 4 of these 7 rows, it fails the differentiation
requirement and must be regenerated before the Visual First Gate can pass.

## Asset 3 — 仮住まい (Trial House), location hero

- **Subject**: the player's temporary living space
- **Visual concept**: small, plain, safe but not luxurious -- boxes not fully unpacked, a note with
  a return date visible, morning light through a window
- **Background requirements**: single small room, lived-in-but-temporary feeling, no other person
  present (this is the player's own space)
- **Time-of-day treatment**: pale morning gold (Day open) vs. warm lamp-amber (Day close) -- one
  base image + CSS time-tint, per the visual bible's existing-pattern reuse rule, not two separate
  paintings
- **Mobile crop**: wide hero, `object-fit: cover`, matching the existing `.nlc-hero` convention
- **Style canon references**: same felt/warm-town palette as every other location
- **Forbidden**: anything that reads as fully moved-in/decorated (would contradict "I just
  arrived") or as bleak/miserable (the town should feel safe, per the design's own tone)
- **Provenance if generated**: `AI_GENERATED_FROM_USER_STAMP_STYLE_REFERENCE`

## Asset 4 — 洋平商店 (Yohei's Store), location hero

- **Subject**: the general store, exterior or interior (interior preferred -- matches where the
  player actually spends time per the flow doc)
- **Visual concept**: a real working neighborhood shop -- shelves, delivery boxes, a counter,
  legible signage reading「よろず屋」or the shop's canonical name, consistent with the existing
  `newlifev02/general-store.png` concept but rebuilt to genuinely differ from a generic shop
  background (specific enough that a player recognizes it instantly on return visits)
- **Background requirements**: visibly stocked, not empty; one or two specific, memorable props
  (a particular stack of boxes, a specific shelf arrangement) that can recur as a visual anchor
  across Day 1 and Day 2
- **Time-of-day treatment**: open/bright daytime vs. shuttered/closed evening (a real state
  difference, not just a tint -- matches the town design doc's existing spec)
- **Mobile crop**: wide hero, same convention as Asset 3
- **Provenance if generated**: `AI_GENERATED_FROM_USER_STAMP_STYLE_REFERENCE`

## Asset 5 — 商店街 (Shopping Street / town common area), location hero

- **Subject**: the town's outdoor common area -- establishes "this is a real, inhabited town," not
  a generic backdrop
- **Visual concept**: a short street with at least 2 distinguishable storefronts visible (one of
  them readable as Hina's shop-in-progress, even before she's introduced, via visible
  under-construction cues), a bit of foot traffic implied (not necessarily rendered people),
  greenery/signage for texture
- **Day1/Day2 state-difference requirement** (directive Section 8/6): this asset must support at
  least one visible variant state -- e.g. a delivery truck present vs. absent, a shop shutter
  open vs. closed, a small poster appearing -- so Day 2's "the town moved without you" can be
  partly *shown*, not only *told*. Exact mechanism to be finalized in
  `NEWLIFE_DAY1_DAY2_EVENT_SPEC_V1.md`; this asset spec requires the base image to be composed so a
  small element CAN plausibly change without repainting the whole scene (e.g. via a layered
  foreground element, not baked permanently into the single image).
- **Mobile crop**: wide hero, same convention as Assets 3-4
- **Provenance if generated**: `AI_GENERATED_FROM_USER_STAMP_STYLE_REFERENCE`

## Alt text (accessibility, all 5 assets)

Each image's alt text names the subject and role in plain Japanese (matching the existing
`alt="洋平"` / `alt="夕暮れの住宅街"` convention already used in `newlifecore`) -- never the
internal asset filename or provenance tag.

## Status

All 5 entries: **SPEC ONLY, NOT GENERATED.** No file exists yet for any of them.
