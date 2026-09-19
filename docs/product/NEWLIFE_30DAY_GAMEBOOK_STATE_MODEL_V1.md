# NEW LIFE 30-Day Gamebook — State Model V1 (Phase D)

Models only the state the story spine (Phase C) actually reads or writes -- no speculative fields
for content that doesn't exist in this design. `SYSTEM OWNS TRUTH, AI OWNS EXPRESSION`, restated at
gamebook scale (see `NEWLIFE_30DAY_GAMEBOOK_DESIGN_SYSTEMS_ADAPTATION_V1.md` for how this maps onto
the existing code's `NpcAiContext`/`NpcReplyEnvelope`/`validateNpcReply` discipline).

## Categories and concrete fields

**WORLD_FACT** -- true of the town, not of one person's relationship to it.
- `festival_flyer_seen` (bool, Day 3+)
- `festival_prep_progress` (int, accumulates Days 19/20/21)
- `yohei_festival_stock_level` (enum: minimal | modest | full, Day 20)
- `bench_fixed` (bool, Day 21, conditional on Day 10's `bench_noted`)
- `festival_day_outcome` (composite record, Day 24 -- see "composite state" note below)

**CHARACTER_FACT** -- true of one NPC, independent of the player's relationship to them.
- `hina.money_pressure_noticed`, `hina.true_reason_known` (bool, Day 14/22)
- `yohei.son_thread_noticed`, `yohei.son_contact_reestablished` (bool, Day 13/26)
- `daisuke.familiarity` (int, accumulates from Day 8), `daisuke.card_secret_known` (bool, Day 27)
- `daisuke.renovation_decided` (enum: yes | no, Day 12)
- `miyoko.daughter_pressure_active` (bool, Day 16), `miyoko.daughter_thread_outcome` (enum: stayed |
  compromise | undecided, Day 28)
- `fumiko.student_letter_received` (bool, Day 15)

**RELATIONSHIP** -- between two parties (player-NPC or NPC-NPC), a signed delta history, not a
single opaque "affection score" (this project's own established discipline explicitly bans a
visible relationship-value UI -- see `PHASE_12_6` canon; the ledger below is backend-only).
- `relationship(player, hina)`, `relationship(player, yohei)`, ... one per player-NPC pair.
- `relationship(yohei, hina)` -- NPC-NPC, moves independent of the player (Day 4/6).
- Represented as a short append-only list of small signed deltas with a day-stamp, never a single
  mutable integer the AI could be tempted to "explain" in dialogue.

**KNOWLEDGE** -- what a given NPC currently knows (distinct from CHARACTER_FACT, which is true of
them regardless of who knows it). Example: `yohei.knows(hina.true_reason)` stays false even after
`hina.true_reason_known` becomes true, unless the player or a specific scene explicitly shares it --
this is the mechanism that keeps Day 6/18's "independent NPC-NPC relationships" honest instead of
NPCs magically knowing everything the player has learned.

**PROMISE** -- a stated future commitment with a due day, exactly mirroring the existing code's
promise/social-memory mechanism (`PHASE_12_6`). Example: agreeing to help Fumiko with festival prep
on Day 19 creates `Promise(player, fumiko, festival_help, due=day19)`; missed vs. kept is read by
later scenes, never silently forgotten.

**OPEN_THREAD** -- an unresolved narrative thread the player can return to, distinct from a promise
(no due day, no obligation). Example: `OpenThread(daisuke.renovation)` from Day 1 through Day 12;
`OpenThread(fumiko.bench)` from Day 10 through Day 21.

**PLAYER_OBSERVED_VALUE** -- a value the player has been shown but does not control directly, kept
separate so it's never confused with a score. Example: `festival_prep_progress`'s numeric value is
observed (visible in scene text as qualitative description -- "the hall looks almost ready" -- never
shown as a raw number, matching the existing "no dashboard" discipline).

**VISUAL_STATE** -- N/A for this text-only phase by design (Phase E explicitly forbids images/UI);
the field exists in the model only so a later, real implementation has a named place to put the
`YOHEI_SHOP_DAY2_STOCKED_V1`-style asset deltas already specced in
`NEWLIFE_DAY1_DAY2_VISUAL_STATE_DELTA_ASSET_SPEC_V1.md`, extended to whichever days this design's
festival/world-change beats would need art for. Left empty here on purpose.

## Composite state (why `festival_day_outcome` is not itself a variable)

Day 24's scene is explicitly NOT a new independent flag the AI or the author sets directly. It is a
*read* over everything already true by Day 24: `yohei_festival_stock_level` +
`festival_prep_progress` (from helping Fumiko/Jin) + `bench_fixed` + whether `hina.true_reason_known`
and enough of her arc happened for her to have anything to bring. This is the gamebook-scale version
of the Arcweave "nodes hold state, connections hold conditions" idea (see the design-systems note) --
Day 24's knot in the text prototype (Phase E) is written as several `{VAR: ...}` conditional
paragraphs assembled from prior state, not one paragraph chosen from a lookup table of "outcomes."

## AI free conversation never mutates canonical state -- the Canon/Consistency Gate

Every free-talk exchange in the text prototype (Phase E) follows this exact shape, and it is the
single most important rule in this whole document:

```
PLAYER_FREE_TEXT: <whatever the player actually typed/said>
AI_CHARACTER_RESPONSE: <in-character line, may reference existing state, invents nothing new>
STATE_DELTA_PROPOSAL: <optional -- AI may propose e.g. "player asked about the bench;
                        relationship(player, fumiko) +1" but never applies it>
CANON_GATE_RESULT: ACCEPTED | REJECTED | MODIFIED <system decision, with reason>
NEXT_SCENE: <only reachable after the gate result, never skipped>
```

Gate rules (fail-closed, mirroring `validateNpcReply`'s real discipline):
- A proposal that would create a new named fact not present in Phase A-C (a new character, a new
  town history detail, a resolved arc outcome not yet earned by accumulated state) is REJECTED.
- A proposal that only nudges an existing, already-modeled field by a small amount within its
  established range (a `relationship` delta of the size already used elsewhere, a `familiarity`
  increment) is ACCEPTED.
- A proposal that's directionally right but sized wrong (e.g. proposing a full arc resolution from
  one line of free talk) is MODIFIED down to the accepted small delta, never rejected outright and
  never accepted at full size -- this is the gamebook-scale equivalent of `deterministicNpcReply`'s
  bounded fallback buckets: expression varies freely, consequence stays bounded.
- The gate itself is always system logic, deterministic and inspectable, never another AI call
  grading the first AI call -- consistent with this whole project's fail-closed default.
