# NEW LIFE — Day 1 + Day 2 Event Spec V1 (PHASE_22)

Exactly one small event, per directive Section 9. Design-only; reuses the existing recurring-
world-event engine shape (`content/day1WorldEvents.ts`'s pattern: a deterministic, day/time-gated
state flip plus a WorldFact), not a new mechanic.

## The event: 「配達が来ない」(The delivery hasn't arrived)

**Why this one, of the candidates considered**: it's specific to Yohei and his shop (not a generic
town happening), requires no new NPC, produces an obviously visible Day 2 difference (a location
visual/state change, not just new dialogue), and has a natural, ungated way for the player to
either engage (help, ask around) or ignore it (per directive's explicit "no quest accepted"
framing).

### Trigger

Canonical, deterministic: on Day 1, if the player visits 洋平商店, Yohei is visibly waiting on a
delivery that was due that morning and hasn't come ("今朝来るはずの荷物が、まだ届いてなくてな").
This is ambient/observable regardless of whether the player engages -- matches the existing
`scene.ambientLine` pattern, not a hidden flag.

### Engagement (optional, per directive Section 10 -- this IS the slice's one meaningful choice)

If the player is at 洋平商店 on Day 1, one structural action becomes available:
**「配達のことを気にかけておく」(keep an eye out about the delivery) / leave it alone.**

This is *not* a real physical task the player performs (no minigame) -- it is the directive's own
named choice shape: "spend one of your limited actions' *attention* here, or go elsewhere." The
cost is genuinely just having spent this visit's attention on it (acknowledging it, maybe asking
Hina at 商店街 if she's seen a delivery truck) rather than something else Yohei might have said or
shown the player instead.

### What changes on Day 2 (the actual "town moved without you" proof)

Deterministic, canonical, independent of player engagement:

- **If the player never went to 洋平商店 on Day 1**: on Day 2, the shop looks different --
  the delivery arrived overnight/this morning, boxes are now visibly stacked (a real, checkable
  location-state difference per the asset spec's "layered foreground element" requirement, not
  just new dialogue text), and Yohei's opening line references it as already resolved
  ("さっきの荷物、さっき届いたよ") -- the player missed the moment, and the game says so plainly,
  without punishing them for it.
- **If the player engaged (kept an eye out) on Day 1**: on Day 2, the delivery has still
  arrived (the outcome is not different -- this is deliberately NOT a skill check), but Yohei
  acknowledges the player specifically noticed/asked ("お前が気にしてくれてたやつ、届いたよ") --
  the same real-world outcome, a different, specific, personal acknowledgment line. This is the
  design's proof that the choice mattered for the *relationship*, not for controlling the plot
  outcome (matching `NEWLIFE_KEEP_REWORK_REMOVE_MATRIX_V1.md`'s "never a reward system" discipline
  already established for Miyoko).
- **If the player asked Hina about it on Day 1** (the cross-location option): on Day 2, Hina
  has her own small observation to share ("そういえば、昨日トラック見かけましたよ") -- a second,
  independent confirmation that the town has continuity across people, not just per-NPC memory
  (a light version of PHASE_21's Day 6 "town is one place" beat, pulled forward as a small proof
  point even in this 2-day slice).

### Explicit non-requirements (per directive Section 9)

No "quest accepted" framing, no reward, no XP, no visible progress bar. The event is legible
entirely through: one ambient line (Day 1), one optional structural choice (Day 1), one visible
state difference + one changed opening line (Day 2). If the player ignores it entirely, Day 2 is
still coherent (the shop simply looks resolved, Yohei mentions it in passing) -- ignorability is a
requirement, not a fallback.

### Reused engine mapping (for the implementation phase, not built now)

- Trigger/ambient line: `scene.ambientLine` pattern (`content/day1.ts`).
- The optional "keep an eye out" choice: a `WorldFact` written with `knownBy: ["yohei"]` (and
  `["hina"]` if the cross-location branch is taken), mirroring the existing `addWorldFact` pattern
  used throughout `engine.ts` -- no new state shape.
- The Day 2 resolution: a single deterministic flag flip on `startNewDay`, mirroring
  `content/day1WorldEvents.ts`'s existing shelf-repair precedent almost exactly (a delivery instead
  of a repair, but the identical mechanism: a flag that flips between two fixed points in time,
  read by `activeEventContextFor`/`knownLocalProblemMentions` at query time).
