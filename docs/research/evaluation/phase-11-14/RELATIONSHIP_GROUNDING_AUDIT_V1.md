# Relationship Grounding Audit V1 — PHASE 11.14

Directive Section 2: determine, from canonical/source documents, whether PLAYER has already met
Yohei at this exact isolated-scene point. No invented history.

## Canonical evidence found

`docs/product/NEWLIFE_3DAY_MASTER_PLOT_V3.md` (DAY 1 — "ordinary arrival, one unplanned slip"):

> Life activities: unpacking a little more, a first coffee at the café ..., a walk down the
> shopping street, **helping Yohei carry a delivery crate into his storeroom** ... The one Day1
> thread ... while the player is helping him move crates (ordinary physical work, hands busy, talk
> looser than a sit-down conversation) ...

This establishes, canonically:

- Day 1 (the protagonist's arrival day) already includes an ordinary, ongoing pattern of *helping
  Yohei physically move things* (a delivery crate) as part of settling into the town.
- `docs/product/NEWLIFE_JAPANESE_CHARACTER_VOICE_BIBLE_V1.md`'s Yohei entry describes a
  first-meeting register (short, businesslike, minimal self-introduction) that gives way, once
  acquainted, to a casual register ("すぐくだけた「〜だな」「〜だよ」に落ちる。ただし乱暴ではない").

Our isolated scene (`?newlifeplayable11=1`) is explicitly **post-festival** ("祭りの翌日"), a later
point in the story than Day 1's arrival. By the time a festival has already happened, the
canonical Day-1 crate-carrying beat (and, per the calendar, very likely further ordinary
interactions between Day 1 and the festival) has already occurred.

## Finding

**KNOWN_PRIOR_ACQUAINTANCE.**

Not `UNDEFINED`/`AUTHORING_GAP`: the canon does not merely fail to say they're strangers, it
affirmatively establishes an existing, recurring "I help Yohei move things" pattern that predates
this scene. The immediate help request in this scene is a continuation of an established pattern,
not a stranger's presumption — resolving Owner observation #2 without inventing any new backstory.

## Smallest Product-consistent grounding chosen

The isolated scene does not carry the full game's day-by-day state (it is explicitly a
"隔離プロトタイプ" / isolated prototype), so it cannot literally reference the Day 1 crate scene.
The smallest change that removes the "why is this socially plausible?" gap without requiring
hidden author knowledge is to name the *kind* of relationship directly, once, in the scene's own
opening line:

- **Before:** `祭りの翌日。洋平商店を訪れた。洋平は、値引き用の棚の準備をしている。`
- **After:** `祭りの翌日。顔なじみの洋平の店を訪れた。洋平は、値引き用の棚の準備をしている。`

`顔なじみ` ("a familiar face" / "someone I know") is the minimal grounding clause: it tells the
player, in-scene, that this is not a first meeting, without asserting any fact beyond what canon
already establishes, and without a history recap that would over-narrate (directive Section 3's
explicit caution).

## What this does NOT change

Yohei's own speech register was already appropriately casual-but-not-rude for an acquainted
relationship per the voice bible; no additional grounding was needed in his own lines beyond the
verb-register fix covered in `NATURAL_DIALOGUE_REPAIR_V1.md`.
