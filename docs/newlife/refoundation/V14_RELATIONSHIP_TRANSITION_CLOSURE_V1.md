# NEW LIFE V14 — RELATIONSHIP TRANSITION CLOSURE V1

Date: 2026-09-24
Status: DESIGN CONTRACT PATCH / NO PRODUCT CODE

## Purpose

Close the remaining V13 blind-audit blockers without changing the four-layer architecture.

This document is normative over V13 where the two conflict.

---

## 1. Relationship states

Per NPC:

- OPEN
- NEUTRAL
- GUARDED
- WITHDRAWN

### WITHDRAWN is intentionally terminal for the current case

For the first vertical slice:

> WITHDRAWN means the NPC no longer participates voluntarily in the current conflict-resolution process.

It is **not** a permanent character judgment across the whole game.

A later case/day may begin from a new authored relationship state, but the current case cannot erase WITHDRAWN through one apology.

Reason:
- some failures must have irreversible local consequences;
- recovery must exist, but not every failure must be fully recoverable;
- this avoids "apology farming" that erases severe choices.

---

## 2. One relationship transition per NPC per turn

A single turn may generate multiple validated relational events.

Do not add point values.

Instead:

1. validate all candidate events;
2. map each accepted event to an event class;
3. choose the highest-precedence class;
4. apply at most one relationship-state transition for that NPC;
5. retain all accepted events in causal history.

Precedence:

```
SEVERE_RUPTURE
>
STRAIN
>
REPAIR
>
RELIABILITY
>
NONE
```

Multiple events in the same class do not stack into a larger hidden penalty.

Example:
- PUBLIC_SHAMING + PERSONAL_INSULT qualifies as SEVERE_RUPTURE by explicit combo rule.
- PUBLIC_SHAMING + DISMISSES_CONCERN is STRAIN, not "double strain."

---

## 3. Event classes

### SEVERE_RUPTURE

Triggers:
- explicit THREAT used to compel a known refusal;
- PUBLIC_SHAMING + PERSONAL_INSULT in the same public turn;
- third confirmed BREAKS_PROMISE while an earlier promise rupture remains unresolved.

Transition:
- OPEN -> GUARDED
- NEUTRAL -> GUARDED
- GUARDED -> WITHDRAWN
- WITHDRAWN -> WITHDRAWN

### STRAIN

Triggers:
- PERSONAL_INSULT
- PUBLIC_SHAMING
- confirmed FALSE_ATTRIBUTION
- DISMISSES_CONCERN
- BREAKS_PROMISE

Transition:
- OPEN -> NEUTRAL
- NEUTRAL -> GUARDED
- GUARDED -> GUARDED
- WITHDRAWN -> WITHDRAWN

### REPAIR

Trigger:
- ACKNOWLEDGES_MISTAKE

Immediate relationship transition:
- none.

Instead set:
- REPAIR_WINDOW = OPEN

A later corrective action that directly addresses the acknowledged mistake may clear one unresolved STRAIN:

- GUARDED -> NEUTRAL
- NEUTRAL -> OPEN

It cannot:
- repair WITHDRAWN in the current case;
- erase lost time;
- undo an already-triggered world consequence.

### RELIABILITY

Trigger:
- KEEPS_PROMISE

If no unresolved severe rupture:
- GUARDED -> NEUTRAL only when the guarded state came from a reversible STRAIN and at least one corrective action has completed;
- NEUTRAL -> OPEN when two separate reliability observations exist after the last strain;
- OPEN stays OPEN.

No positive-point total is stored.

---

## 4. Mixed positive and negative events in one turn

If a turn both apologizes and insults:

Example:
> 「さっきは悪かった。でも君も面倒くさいよ」

Accepted:
- ACKNOWLEDGES_MISTAKE
- PERSONAL_INSULT

Highest class:
- STRAIN

Result:
- STRAIN transition applies;
- no REPAIR_WINDOW opens from that same turn.

An apology does not cancel a simultaneous new offense.

If a turn keeps a promise but publicly shames:
- STRAIN wins;
- reliability evidence may be logged as a factual event but does not improve relationship that turn.

---

## 5. Borderline reconsideration versus override

### RECONSIDER

The player asks again for the refused act and leaves refusal operationally possible.

Examples:

> 「明日だけお願いできない？」
> 「一回だけでも無理？」
> 「もう一度だけ考えてもらえる？」

Even repeated:
- ACTION = REQUEST_RECONSIDERATION
- BOUNDARY_MODE = RECONSIDER

until the player actually declares or executes the crossing.

### Repeated pressure

After an explicit NO:

- first RECONSIDER: ordinary request;
- second immediate RECONSIDER with no new information: set PRESSURE_AFTER_NO = 1;
- third: PRESSURE_AFTER_NO = 2; NPC may shorten/close conversation according to character state.

PRESSURE_AFTER_NO is a world interaction flag, not a morality score.

It may contribute to NPC willingness to continue talking but does not reclassify the request as OVERRIDE.

### CROSS_WITHOUT_PERMISSION

Occurs only when the player:
- declares the refused plan as decided;
- orders execution of the refused plan;
- or actually advances the world action across the known boundary without agreement.

Examples:

> 「いや、そのままやってもらう」
> 「決定だから。続けて」
> [system action] START_REHEARSAL_UNCHANGED after NO

This distinction is based on operational commitment, not politeness.

---

## 6. Compound utterance rule

If one utterance contains both a request and an execution/commitment:

> 「お願いできない？ まあ無理でもこのまま行くけど」

Classify by the highest committed world action:
- ACTION = FORCE_UNCONFIRMED_PLAN
- BOUNDARY_MODE = CROSS_WITHOUT_PERMISSION

A nominal question mark cannot disguise an already-declared override.

---

## 7. Ambiguity protection

If an utterance sounds insistent but does not clearly commit the world action:

- do not infer OVERRIDE;
- use REQUEST_RECONSIDERATION / RECONSIDER if the requested act is clear;
- if even the requested act is unclear, CLARIFY at 0 in-world minutes.

Shortness, dialect, command form, frustration, and lack of honorifics remain non-state factors.

---

## 8. Prototype acceptance additions

The next blind matrix must include:

- repeated reconsideration without override;
- request + hidden declarative override in same utterance;
- apology + insult same turn;
- public/private identical blame wording;
- threat vs neutral fallback;
- WITHDRAWN terminal behavior stated in scenario tests.

Implementation remains blocked until classifier and audit gates pass.

READY_FOR_IMPLEMENTATION = NO
