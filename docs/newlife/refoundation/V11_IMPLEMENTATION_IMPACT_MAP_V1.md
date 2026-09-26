# NEW LIFE V11 — IMPLEMENTATION IMPACT MAP V1

Date: 2026-09-24
Status: PRE-IMPLEMENTATION MAP / NO PRODUCT CODE CHANGES

## Purpose

Prepare implementation without beginning it before the blind gates pass.

This document maps the current runtime architecture to the refoundation design so implementation can proceed without rediscovery once the design gate clears.

---

## 1. Current runtime findings

### `src/newlife/npcVoice.ts`

Current role:
- regex / deterministic conversational-act detection;
- deterministic fact-intent routing;
- fixed per-NPC answers;
- generic flavor lines.

Current problem for the refoundation:
- meaning is largely decided by hand-written regexes and fixed topic routes;
- this architecture is not suitable as the primary semantic engine for scenario-based free play;
- it should not be expanded with more case-specific regexes.

Refoundation action:
- retain only narrow deterministic utilities where appropriate;
- remove it from the position of primary semantic decision-maker for NEW LIFE refoundation cases;
- do not delete legacy behavior until the new vertical slice is isolated and verified.

### `src/newlife/semantic/coordinator.ts`

Current role:
- computes deterministic response first;
- uses live semantic AI mainly for ambiguous/unmapped input.

Refoundation issue:
- AI is fallback rather than semantic core.

Refoundation action:
- invert orchestration for new slice:
  1. free player text -> semantic structured interpretation;
  2. world/state validator checks what may actually happen;
  3. NPC expression generated from validated state;
  4. deterministic fallback only on provider failure / safety / timeout.

### `functions/newlife-dialogue/lib.js`

Current role:
- Vertex prompt / schema construction;
- canonical fact constraints;
- character profile constraints;
- model output is interpretive/display suggestion only.

Refoundation opportunity:
- this is the strongest reusable foundation.

Required schema evolution:
- ACTION
- BOUNDARY_HANDLING
- RELATIONAL_EVENTS
- LANGUAGE_STYLE
- target(s)
- requested information / proposition
- assigned owner
- time implication
- semantic summary
- confidence
- needsClarification

Important:
- world state must accompany the utterance when classification depends on:
  - who is present;
  - private/public context;
  - known boundary;
  - prior commitments;
  - current task owners.

### `src/newlife/content.ts`

Current role:
- authored Day1-Day30 scene calendar;
- options and variants tied to calendar days.

Refoundation issue:
- calendar became the content architecture.

Refoundation action:
- do not delete existing 30-day content initially;
- build the new vertical slice in an isolated event-first content module;
- time/day becomes a consequence of events, not authoring index.

---

## 2. New modules required after gate clearance

Suggested isolated namespace:

`src/newlife/refoundation/`

### `types.ts`

World state:
- clock / remaining time;
- situation;
- trust per NPC;
- clarity;
- boundary state;
- current location;
- characters present;
- active tasks;
- task owners;
- completed events;
- promises / commitments;
- learned thought tools.

### `semanticTypes.ts`

Structured interpretation contract.

### `stateReducer.ts`

Only this layer may commit canonical state changes.

AI output may propose:
- action;
- relational event;
- candidate state transition.

Reducer validates:
- current facts;
- prerequisites;
- time;
- boundary;
- task ownership.

### `caseTheater.ts`

First vertical-slice case data:
- Mika;
- Ryo;
- public facts;
- private facts;
- event triggers;
- task graph;
- time costs;
- ending vector.

### `npcEngine.ts`

Inputs:
- canonical character model;
- validated semantic action;
- current world state;
- NPC memory;
- allowed facts / hidden facts.

Outputs:
- natural NPC line;
- visible action;
- optional reveal proposal.

No direct state mutation.

### `taskEngine.ts`

Non-dialogue actions:
- assign rewrite;
- rehearse unaffected scenes;
- cut scene;
- use understudy;
- change staging;
- shorten final scene;
- move conversation private.

Supports parallel tasks.

### `thoughtTools.ts`

Implements actual mechanical effects:
- boundary check discount;
- alternative slot;
- task/personal split;
- counterfactual action candidate.

### `endingVector.ts`

No total score.

Example fields:
- SHOW;
- BOUNDARY;
- TRUST;
- CLARITY;
- TIME_LEFT;
- PERSONAL_TRACK;
- ARTISTIC_COST;
- RECOVERY_USED.

---

## 3. Critical rule: classification does not equal state mutation

Bad architecture:

```
model says PUBLIC_SHAMING -> trust -= 2
```

Required:

```
utterance + scene context
  -> interpretation proposal
  -> deterministic validation
  -> event accepted/rejected
  -> state reducer applies allowed transition
```

Example:
The text "美香が今さら騒いでるから..." is not automatically PUBLIC_SHAMING.

It becomes public shaming only if:
- Mika / relevant cast can hear it;
- the utterance attributes the disruption to Mika;
- no contradictory scene state exists.

World context owns the event truth.

---

## 4. Provider-failure fallback

The refoundation cannot return to old canned replies when live semantics fail.

Fallback order:

1. retry once if safe and cheap;
2. if action is obvious from structured UI action, continue deterministically;
3. otherwise ask a neutral clarification:
   > 「“実話を外して書き直したい”という意味で合ってる？」
4. clarification costs 0 world minutes when caused by language interpretation uncertainty.

Never:
- guess a high-impact player action;
- mutate trust from uncertain sarcasm;
- convert ambiguous text into an irreversible choice.

---

## 5. Legacy compatibility

Until the new slice is proven:
- legacy public NEW LIFE remains untouched on master;
- refoundation code must be isolated behind a route/feature flag;
- no migration of the 30-day state schema;
- no deletion of current tests;
- no replacement of current public route.

Prototype route suggestion after gate clearance:
- query flag or isolated route dedicated to refoundation slice.

Production replacement is a later decision.

---

## 6. First implementation order after gate clearance

1. semantic/state types only
2. deterministic case world + task/time reducer
3. fixed test actions without AI
4. ending vector and failure/recovery
5. semantic interpreter
6. NPC generation
7. thought tools
8. minimal UI
9. human + blind replay
10. only then consider visual assets

This order prevents natural dialogue from hiding broken game state logic.

---

## 7. Gate before Step 1

Do not implement until all are true:

- V10 blind state interpretation matrix reaches acceptance threshold;
- V10 blind design audit is not FAIL_REDESIGN;
- non-owner route generation demonstrates at least 3 materially different viable strategies;
- failure / recovery remains possible;
- no Owner interaction is required to proceed.

Current status:
- product code unchanged;
- gate pending external blind runs.
