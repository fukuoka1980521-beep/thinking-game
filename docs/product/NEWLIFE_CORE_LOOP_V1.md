# NEW LIFE — Core Loop V1 (PHASE_21)

## The loop

```
NOTICE → CHOOSE → GO → INTERACT → SOMETHING CHANGES → REMEMBER → WONDER WHAT'S NEXT
気づく  → 決める  → 行く → 関わる  → 何かが変わる      → 覚える  → 明日が気になる
```

This is the whole game. Everything else in this design exists to make each of these seven words
true and felt, not just structurally present.

## Daily structure: 2 actions, not unlimited

```
MORNING (notice the town -- one line, system-driven)
  ↓
ACTION 1: choose a place → scene/event/conversation/action there
  ↓
ACTION 2: choose a (different) place → scene/event/conversation/action there
  ↓
EVENING (today's change -- one line, system-driven)
  ↓
NEXT DAY
```

**2 actions/day is the first candidate, not a settled decision.** Comparison against 3:

| | 2 actions/day | 3 actions/day |
|---|---|---|
| Total actions over 7 days | 14 | 21 |
| Can the player "see everyone" if they try? | No -- 14 actions across 6 NPCs/locations means real, felt tradeoffs even for a completionist-leaning player | Borderline -- 21 actions makes "just visit everyone, every day" achievable by Day 4-5, which directly undermines Section 9's "回れる設計にしない" |
| Scarcity feeling | Strong from Day 1 | Only strong if the player deliberately restrains themselves -- the game would be relying on player self-restraint rather than system design |
| Risk | Might feel thin on a very quiet day | Bigger content budget needed per day (Section 39) |

**Decision: 2 actions/day.** The directive's own hard requirement ("誰に時間を使うかが自然な選択に
なること") is best served by a budget tight enough that the choice is real without the player
having to self-impose restraint. 3/day is kept as a documented fallback if the 5-type paper
playtest (`NEWLIFE_PAPER_PLAYTEST_V1.md`) finds 2/day reads as too thin for the social/completionist
player type.

## What "SOMETHING CHANGES" means (never skipped)

Every ACTION must leave a trace, even a tiny one, in at least one of: relationship warmth, a dated
future fact, a WorldFact another NPC might reference, or a visible town-state change. An action
that produces literally nothing memorable is a design bug, not an acceptable "quiet" interaction --
"ordinary life" content (Section 21) still changes *something* (even just "you've now talked to
Yohei 3 times," which unlocks nothing mechanically flashy but is real, tracked state).

## Free talk's position (Section 33)

```
SCENE (what's visibly happening here right now)
  ↓
CONTEXT (who's here, what's changed since last time)
  ↓
STRUCTURAL ACTION (buy / help / promise / draw a card / get a haircut / ...)
  ↓
optional: "もう少し話す" → free talk
```

Free talk is never the first thing offered and never required to progress. This is the direct fix
for "AIチャットボット感" (Section 33) -- the player always has something concrete to do that isn't
typing at a chatbot, and free talk is what's available *after* that, for players who want it.

## Interaction verbs actually used in the 7-day core

TALK · BUY · HELP · WATCH · ASK · PROMISE · DECLINE · RETURN_LATER · LEAVE. `JOIN` folds into HELP
for this scope (Community Hall event prep); a dedicated JOIN verb is deferred until there's a
second use case that actually needs it (avoiding a verb that exists for only one scene).
**Never all nine shown at once** -- each scene shows only the 2-4 verbs that are actually meaningful
there (Section 20's explicit rule), matching the existing engine's own "specialActions" pattern.

## Ordinary life vs. event (Section 21/22)

Most visits to most locations on most days are **ordinary life**: Yohei checking stock, Miyoko
pouring a drink, Jin mid-repair, Daisuke between customers. Events are small, dated, and rare
enough to matter: a delivery that doesn't come, a bench getting fixed, a shop opening. The ratio
target for the 7-day core is roughly **1 dated event per NPC across the whole week**, everything
else ordinary -- consistent with `NEWLIFE_CONTENT_BUDGET_V1.md`'s scope limits and with the
existing engine's own event-cooldown philosophy (events are not meant to fire on every visit).

## Future pull, concretely (Section 23)

"また来てね" is not banned but does not count as a future-pull mechanism on its own. What counts:
a dated resolution ("祭りの仕入れがどうなったか" — resolves in N days), someone else's expected
reaction ("清さんが今日どうだったか"), a standing arrangement's next occurrence (Jin's odd job), or
a promised future activity (Miyoko's new beans, Hina's tasting). Every MAIN NPC's per-character
design already names at least one of these (see roster doc) -- this is a requirement checked per
NPC, not an aspiration.

## AI boundary inside the loop (Section 32, unchanged from PHASE_18/19)

SYSTEM decides: whether a scene/event/promise exists, its resolution, all state changes, day
progression. AI decides: the words a character uses to express what the system has already
decided. This phase's design changes what content exists inside that boundary; it does not move
the boundary itself.
