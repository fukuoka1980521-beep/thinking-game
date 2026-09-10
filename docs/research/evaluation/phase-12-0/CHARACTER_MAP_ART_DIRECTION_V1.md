# Character / Map Art Direction V1 — PHASE 12.0

Directive Section 7, 23. A visual-production brief for a LATER, separate image-generation step —
no final art generated in Code this phase (no approved asset path exists yet for this cast; the
existing `public/newlife-assets/ossan-*.png` art belongs to a different product surface, CASE1's
detective-mystery track, and its visual identity is not reusable here without Owner decision).

## Product contract for character presentation (directive Section 7)

Each active NPC (and the protagonist) needs, as a Product contract regardless of final art style:

- **portrait/standing image** — one static image per NPC sufficient for V1 (no animation
  requirement stated by the directive).
- **name** — always shown alongside the portrait, never portrait-only.
- **visual identity** — consistent across every scene the NPC appears in (same image or a small,
  clearly-linked set, not a different look per location).
- **current visible activity** — a short visible label or pose distinct from mere presence (e.g.
  "在庫を運んでいる" as a caption, or a distinct pose/prop in the art itself) — directly
  representing `NPC_CURRENT_ACTIVITY` from `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`, so the
  independent-activity requirement (directive Section 3.D/Section 6) is visually legible, not only
  logically true.

**Do not use generic emoji as the final solution** (directive's explicit instruction) — emoji may
be an acceptable PLACEHOLDER during PHASE 12.1 implementation before real art exists, but the
Product contract above is what real assets must satisfy.

## Per-NPC visual brief (directive Section 23)

### Yohei (62, general store owner)

| Field | Direction |
|---|---|
| Age impression | Early 60s, weathered but sturdy, not frail |
| Body/build | Solid, working build — someone who still physically moves stock himself |
| Clothing | Practical shopkeeper wear — an apron or work vest over ordinary clothes, not a suit |
| Occupation cues | Visible stock/crate/apron props when depicting his `MOVING_DELIVERY_STOCK` activity state |
| Facial impression | Plain-spoken, a little gruff-looking but not unfriendly — matches his "friendly, practically skeptical" canon trait |
| Visual motif | General-store clutter (boxes, shelving) as background texture |
| Avoidances | Not comic-relief exaggerated; not elderly-frail; not a "quest-giver" glowing-icon treatment |

### Miyoko (68, café owner)

| Field | Direction |
|---|---|
| Age impression | Late 60s, visibly a little tired but composed |
| Body/build | Average, unremarkable — the point is warmth, not physical presence |
| Clothing | Café apron over modest, neat everyday wear |
| Occupation cues | Café counter/apron/cup props |
| Facial impression | Warm, welcoming, with a trace of something held-back (matches her canonical "sometimes intrudes" / peripheral-anomaly texture, without visually spoiling anything) |
| Visual motif | Café Nodoka's warm, lived-in interior tones |
| Avoidances | Not a mystical/spooky visual treatment (the anomaly stays peripheral in Chapter 1, per canon) |

### Kamiya (36, Challenge Center employee)

| Field | Direction |
|---|---|
| Age impression | Mid-30s, professional but approachable |
| Body/build | Neutral, office-appropriate |
| Clothing | Business-casual, name badge or lanyard (administrative-office cue) |
| Occupation cues | Desk, forms/tablet, Challenge Center signage/props |
| Facial impression | Earnest, attentive — genuinely wants to help, not a bored bureaucrat |
| Visual motif | Clean, slightly institutional office palette, distinct from the shopping-street warmth |
| Avoidances | Not a stiff "NPC terminal" look; not condescending |

### Protagonist (57, player character)

| Field | Direction |
|---|---|
| Age impression | Late 50s, ordinary, not stylized-heroic |
| Body/build | Average — matches canon's explicit "not omniscient, ordinary" framing |
| Clothing | Practical, unremarkable travel/everyday wear appropriate to just having relocated |
| Facial impression | Approachable, "ほっこり" (warm/soft) per the working title itself |
| Visual motif | Carries one small recurring personal object (matches the recent-loss texture detail, e.g. a mug) as a quiet visual thread, never spotlighted |
| Avoidances | Not drawn as visibly sad/grieving (the loss "surfaces peripherally," per canon, never as visual exposition) |

## Map visual brief (directive Section 23)

| Field | Direction |
|---|---|
| Town scale | Small — 5 nodes (`CHALLENGE_TOWN_MAP_SYSTEM_V1.md`), not a sprawling city map |
| Visual style | Warm, small-regional-city realism — matches Challenge Town's "historically supported by factories and a shopping district, demographic decline" texture without being bleak |
| Location icons/landmarks | One clear, distinct icon per location (a shop-front icon for YOHEI_STORE, a cup icon for CAFE_NODOKA, an office/building icon for CHALLENGE_CENTER, a door/house icon for TRIAL_HOUSE, a street icon for SHOPPING_STREET as the hub) |
| Route readability | Hub-and-spoke layout (SHOPPING_STREET central) should be visually obvious, not requiring a legend |
| Mobile layout | 5 nodes must fit and remain tappable at 320-375px width without horizontal scroll (matches this project's established mobile-QA discipline seen elsewhere in the test suite) |
| Time-of-day presentation | V1 scope is morning→afternoon only (`VERTICAL_SLICE_PRODUCT_FLOW_V1.md`) — a single daytime palette is sufficient; do not build a day/night asset set prematurely |

## Explicit scope boundary

This document is a BRIEF for a separate image-generation step, not an implementation task. No
image-generation code, prompt-execution pipeline, or asset files are created this phase.
