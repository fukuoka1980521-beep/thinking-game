# NEW LIFE — Visual First Gate, Round 1 Review

Source: `newlife_phase22_canonical_assets.zip` (verified present at
`C:\Users\user\Downloads\` before extraction). All 5 expected files received. Originals archived
unmodified at `assets/newlife7-canonical-source/v1/`; working copies for this review at
`docs/research/evaluation/phase-22/visual-first-gate-v1/`. Compared against
`NEWLIFE_DAY1_DAY2_ASSET_SPEC_V1.md`'s per-asset requirements and the character roster's hard
requirements (Section 5/6 of the directive).

## Per-asset result

### HINA_CANONICAL_V1.png — **FAIL**

- Same artistic world as the Owner's felt canon: yes, texture and rendering are consistent.
- Newcomer/approachable/curious expression: yes, this part lands well.
- Modern everyday clothing: yes (cardigan, striped shirt, denim, backpack) -- appropriate register.
- **Age read: fails.** The proportions (very large head-to-body ratio, small nose, extremely
  rounded cheeks, small stature implied by the framing, a plush-toy charm hanging off the
  backpack) read as a child or young tween, not a woman in her late 20s starting her own business.
  This is exactly the directive's own explicitly-banned outcome ("Must NOT look like: ... child").
- Distinct from Miyoko/Fumiko: yes, trivially (they don't exist as comparable young-adult designs)
  -- but that's a low bar this image clears for the wrong reason (it reads as a different
  generation from them by reading as a *child*, not by correctly reading as a *young adult*).

**WHAT MUST CHANGE**: regenerate with adult female proportions -- a more naturalistic head-to-body
ratio, a taller/more adult torso-to-head relationship, and adult styling cues (the current
backpack-charm detail specifically skews younger and should be dropped or replaced with a plainer,
adult-appropriate accessory). The felt-doll stylization itself can stay; the *proportions* are the
problem, not the medium.

### YOHEI_CANONICAL_V1.png — **PASS**

- Reads immediately as a man in his 60s: yes (grey/thinning hair, soft wrinkles, warm smile lines).
- Active neighborhood shop owner, practical, grounded, currently working: yes -- green bib-apron
  over a sweater, holding a wooden produce box (apples, carrots, greens) with both hands.
- Visual cues present: apron ✓, merchandise/box ✓, practical posture ✓, working-hands pose ✓ --
  4 of the 5 suggested cues, satisfying "multiple."

**Yohei vs. Jin differentiation** (compared directly against the existing, already-shipped
`src/assets/newlifev02/soma-jin.png` -- the asset the Owner's original "look too similar"
complaint was about):

| Dimension | Yohei (this asset) | Jin (existing) | Differs? |
|---|---|---|---|
| Build | Softer/rounder implied silhouette | Broader-shouldered in coveralls | Mild |
| Hair/head shape | Grey/white, thinning, neatly side-parted | Black-with-grey, thick, tousled/spiky | **Clear** |
| Facial hair | Clean-shaven | Visible stubble across jaw | **Clear** |
| Clothing | Cream sweater + dark green bib-apron | Navy work coveralls + white neck towel | **Clear** |
| Prop | Produce box in both hands | Empty-handed wave (no prop in this pose) | Clear (presence vs. absence) |
| Pose | Both hands occupied, forward lean, eyes closed | One hand raised in a wave, eyes open | **Clear** |
| Expression | Closed-eye jovial grin | Open-eye warm smile | Mild |

**5 of 7 dimensions clearly differ** (hair, facial hair, clothing, prop, pose), comfortably above
the required 4-of-7 bar. **PASS.**

### TEMP_HOME_V1.png — **FAIL**

- Warm, well-composed, tonally consistent with the rest of the canon: yes.
- **Concept read: fails.** The spec's requirement is "the place I just moved into" -- boxes not
  fully unpacked, a sense of impermanence. This image shows a fully decorated, lived-in room:
  framed pictures already hung, multiple thriving potted plants, a neatly stocked bookshelf, a
  rug, curtains, a jacket already hung on a hook, a mug and book left out. The only "just arrived"
  cue is a single packed bag leaning against the dresser, which reads as incidental rather than
  as the room's dominant story. As composed, this reads as "someone's settled home," not Day 1.

**WHAT MUST CHANGE**: remove or reduce the settled-in signals (fewer/no framed pictures on the
wall, fewer plants, an empty or near-empty shelf instead of a filled one) and make the packed
bag/box(es) the visually dominant story of the room, consistent with the asset spec's explicit
"boxes not fully unpacked" requirement.

### YOHEI_SHOP_V1.png — **PASS**

Reads immediately as a working neighborhood shop: visibly stocked shelves and crates (fruit,
vegetables, packaged goods), a green-striped awning (which usefully echoes Yohei's own apron
color -- good cross-asset cohesion), a shop cat, flowers out front. Concept match is strong and
specific (not a generic storefront).

### SHOPPING_STREET_V1.png — **CONDITIONAL, flagged**

Reads clearly as "a town center where other lives continue" -- multiple distinguishable
storefronts (different awning colors), foot-level detail (sandwich boards, planters, lanterns),
a real sense of depth and activity. This part of the spec is met well.

**Flag, not a clean pass**: the architecture (terracotta barrel-tile roofs on every building,
wrought-iron lamp posts, a Tuscan/Mediterranean-hills mountain backdrop, stucco-textured walls) is
a different *world* register from the already-shipped, already-canonical
`src/assets/newlifev02/challenge-town.png` (a recognizably Japanese townscape -- traditional dark
tile roofing, a footbridge over a canal, Japanese-style building forms). New Life is set in a
Japanese regional town; this image's architecture, taken on its own, reads as Mediterranean/
Southern-European rather than Japanese. This does not fail the asset's *own* concept requirement
(it succeeds at "town center, multiple shops, lived-in") but is a real risk to
`VISUAL_WORLD_COHERENCE` once placed next to the rest of the game's Japanese-town framing.
**Judgment call, not an automatic fail** -- flagged for an explicit decision rather than silently
waved through or silently rejected.

## Cross-checks (directive Section 4)

- Hina and Yohei instantly distinguishable from each other: **yes**, trivially (age, gender,
  palette all differ) -- not in question.
- The three locations distinguishable from each other without text: **yes** -- an interior bedroom,
  an exterior shop storefront, and an outdoor street are unambiguous even before considering the
  Mediterranean-vs-Japanese concern above (that concern is about consistency with the *wider game
  world*, not about confusability with the *other two Day1/Day2 locations*).
- Same artistic world across all 5 (felt-doll characters, painterly-illustration locations): the
  two location styles used elsewhere in this project (felt characters + painterly-illustration
  backdrops) are already an accepted, precedented pairing from PHASE_17 -- not a new coherence
  problem introduced here.

## Mobile legibility (directive Section 8) -- not the deciding factor this round

Not exhaustively tested at all 4 viewports this round, since the content-level failures above
(Hina's age read, Temp Home's "just moved in" read) are decisive on their own and would need to be
re-generated regardless of how they crop on mobile. Worth noting for the next round: Hina's and
Yohei's portraits are both tight, high-contrast bust crops that should scale down cleanly; the two
detailed location images (shop, street) carry enough fine detail that a mobile legibility pass is
still warranted once a corrected Shopping Street (if the architecture concern is acted on) exists.

## GATE RESULT

- HINA_VISUAL_IDENTITY = **FAIL**
- YOHEI_VISUAL_IDENTITY = **PASS**
- CHARACTER_DIFFERENTIATION = **PASS** (Yohei vs. Jin, 5/7 dimensions clearly differ)
- LOCATION_IDENTITY = **CONDITIONAL** (Temp Home fails its own concept; Shop passes cleanly; Street
  passes its own concept but flags a world-coherence risk)
- VISUAL_WORLD_COHERENCE = **CONDITIONAL** (Shopping Street's architecture vs. established
  Japanese-town canon)

**VISUAL_FIRST_GATE = FAIL** (2 of 5 assets do not pass; per directive Section 9, gameplay
implementation does not proceed this round).

## What must change before the next round

| Asset | Failed dimension | Why | What must change |
|---|---|---|---|
| `HINA_CANONICAL_V1.png` | Apparent age | Proportions read as a child, not a woman in her 20s | Regenerate with adult proportions (larger body-to-head ratio, more mature styling); drop the plush-charm backpack detail |
| `TEMP_HOME_V1.png` | "Just moved in" concept | Room reads fully decorated/settled, not temporary | Regenerate with fewer settled-in details (no hung pictures, fewer/no plants, bare shelf) and a visually dominant packed bag/box |
| `SHOPPING_STREET_V1.png` (flag, not a hard fail) | World coherence | Mediterranean/European architecture vs. the established Japanese-town canon | Owner decision needed: regenerate toward Japanese architectural cues, or accept the department from `challenge-town.png`'s established look as an intentional evolution |

No CSS, label, border, or explanatory text is proposed to compensate for any of the above, per
directive Section 9's explicit instruction -- these are asset-level fixes only.
