# NEW LIFE — Day 1/Day 2 Visual State-Delta Asset Spec V1 (PHASE_22_5)

Per PHASE_22_5's own instruction: visual-diff assets are not blocking this Run's non-image
improvements, and are specced here rather than stalling implementation. All Day 1 -> Day 2 world
changes in this slice are currently proven through TEXT only (ambient line + dialogue line); no
location image itself changes between Day 1 and Day 2. This is the one remaining gap the player
review's Q4/"WHAT FELT FAKE" both point at (the room image especially: identical art under a "new
day" claim).

None of this blocks PHASE_22_5's CLOSE. `VISUAL_STATE_DELTA` is reported `NOT_IMPLEMENTED` for this
Run specifically because of this gap, with the reason recorded here rather than silently accepted.

## Needed assets (2, both optional/additive -- current art stays valid as the Day 1 state)

### 1. `YOHEI_SHOP_DAY2_STOCKED_V1`
- Same shop, same camera angle/composition as the existing `YOHEI_SHOP_V2.png` (do not re-block the
  storefront or change Yohei's own portrait).
- Difference from the Day 1 art: the delivery has visibly arrived -- several open/stacked boxes
  placed in the foreground or on a shelf that reads empty-ish in the current asset, the delivery
  hand-cart (already present in `YOHEI_SHOP_V2.png`) now shown unloaded/empty rather than laden.
- Purpose: pairs with the already-implemented Day 2 ambient line ("昨日まで空だった棚に、届いたば
  かりの箱が積まれている") so the claim is checkable in the image itself, not only in text.

### 2. `SHOPPING_STREET_HINA_SHOP_DAY2_PROGRESS_V1`
- Same street composition as `SHOPPING_STREET_V2.png` and Hina's own portrait unchanged.
- If a dedicated interior/shopfront crop of Hina's shop exists or is added, show a visible, minor
  addition consistent with the implemented Day 2 line ("焼き菓子の型がいくつか並び始めている") --
  a few small baking molds/trays visible through a window or on a front table, not a full interior
  redesign.
- Purpose: same pairing as above, for the shopping-street/Hina side of the Day 2 world-change proof.

## Explicitly out of scope for this spec

- Any change to Hina's or Yohei's own character portraits.
- A distinct TEMP_HOME image for Day 2 morning (the room being unchanged day-to-day is actually
  correct -- the player still lives in the same room; the "same room, new day" framing is accurate,
  it's just not this doc's problem to fix by inventing an image change that isn't real).
- Any Day 3+ asset (out of this Run's scope entirely).

## Implementation note for whenever these arrive

Both would slot into `src/newlife7day/Newlife7DayApp.tsx`'s existing `LOCATION_IMAGE` lookup as a
day-conditional swap, exactly mirroring how `YOHEI_AMBIENT_LINE_DAY1`/`DAY2` and
`HINA_AMBIENT_LINE_DAY1`/`DAY2` already branch on `state.day` in `content.ts` -- no new state field
needed, since `state.day` already carries everything required to pick the right image.
