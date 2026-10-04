# Goal-Preserving Adaptive Planning — Final Research Synthesis v1.0

Date: 2026-10-05
Status: RESEARCH OBJECTIVE REACHED FOR INITIAL OPERATIONAL ARCHITECTURE

## Original practical problem

Long AI conversations and development work can lose important goals or constraints as conversation grows.

The practical objective was not to study Lost in the Middle for its own sake.

The objective was:

Find the lowest-cost mechanism that lets an AI continue using important goals in current decisions while still changing methods when circumstances change.

The mechanism also had to tolerate legitimate goal change.

## Initial hypothesis

A short recurring goal anchor might restore goal utilization when important information moves into the middle of context.

This was tested and progressively revised.

## What did not work

### Arbitrary symbols

No evidence supported treating G1-like strings as special attention magnets.

They remain useful only as human/log identifiers.

### Fixed-turn reminders

The research moved away from fixed 5/10/20-turn repetition.

Decision boundaries matter more than turn count.

### Goal-only reminder

Forced-choice calibration sometimes improved with a short goal reminder.

But in open-action generation:
- goal-only reminder did not beat CTRL;
- it could increase pursuit pressure while losing a binding constraint.

Therefore goal recall is not sufficient for good decisions.

### Full original brief repetition

Full repetition was more expensive and did not reliably break Plan Rigidity.

### Compact prompt-only state

A Work-State Ledger strongly improved behavior but did not satisfy every frozen critical gate.

Phase 1B:
- CTRL: 11/27 correct
- STATUS_LEDGER_LATE: 24/27 correct
- wrong rate: 0
- paired wins/losses: 14/1
- mean injected tokens: 81.3

However H1_COST_ROUTE failed the frozen critical-scenario threshold under the strict text rubric.

Frozen decision:
PROMPT_ONLY_NO_GO_EXTERNAL_CONTROLLER.

### Free-text structured IDs

Phase 2A asked the model to type OPEN_ID/ROUTE_ID.

Result:
- only 7/27 proposals followed the required IDs;
- the model sometimes invented O2 when only O1 existed.

Conclusion:
do not make free-text ID compliance part of the authority boundary.

## What worked

### Work-State Ledger

OPEN / CLOSED / RETIRED / VALID_ROUTE was the strongest prompt-level abstraction.

It reduced local re-entry into completed or failed work and supported legitimate goal change.

### External deterministic controller

Post-hoc controller simulation on the 27 Phase 1B ledger outputs:

- strict-rubric correct: 19/27 before deterministic correction;
- 25/27 after controller;
- wrong: 0;
- H1_COST_ROUTE: 0/3 -> 3/3.

The two remaining strict REVIEW items were semantically consistent with ledger state but omitted rubric vocabulary.

### Capability-constrained controller

Phase 2B removed free-text authority selection.

Controller compiled only authorized OPEN and VALID_ROUTE IDs into strict JSON schema enums.

Result:

- schema valid: 27/27
- authorized capability pair: 27/27
- controller-synthesized correct action: 27/27
- wrong: 0
- review: 0
- all legitimate goal-change gates: PASS
- all critical plan-rigidity/sunk-cost gates: PASS
- H1_COST_ROUTE: PASS
- mean injected ledger overhead: 87.3 tokens
- RETIRED executable capability exposure: 0

Frozen decision:
ADOPT_CAPABILITY_CONTROLLER.

## Final model

The observed problem is not adequately described as memory failure.

A model can:
- know the goal;
- repeat the goal;
- still choose the wrong local action.

A better operational decomposition is:

Context contains state
-> model proposes
-> external state machine determines authority
-> side effect executes only if proposal is valid against current state.

## Final architectural principle

Goal Stability
+
Plan Plasticity
+
Execution Authority Separation
+
Versioned State Validation

## Why plan changes remain possible

The system does not freeze a plan.

Plans/routes are disposable.

A failed route moves to RETIRED.
A new VALID_ROUTE can replace it.
Useful completed work stays CLOSED and can be reused as state.
The TARGET remains protected unless an authoritative Goal Change occurs.

This directly handles:

"Reach the mountain summit" remains TARGET.
Car may become RETIRED.
Bike or walking becomes VALID_ROUTE.

If the mountain is closed by authority:
TARGET itself changes through GOAL_CHANGE.

## External consistency

The architecture is consistent with recent external work on:
- multi-turn unreliability and recovery;
- goal drift;
- pre-execution guardrails;
- stale-plan validation;
- versioned execution;
- tool-call authorization.

The important common principle is that current state and execution authority must be checked outside the model immediately before side effects.

## Claim boundary

This research does not prove a universal cognitive theory of LLM memory.

It establishes an engineering result in the tested local-model scenarios:

Prompt-only reminders materially help but remain fallible.
External structured state plus capability-constrained execution can eliminate the observed failure modes in the frozen Phase 2B set.

Generalization to all frontier models and all real projects remains an operational validation question.

## Final practical recommendation

Adopt:

Decision-Bound Work-State Ledger
+
Capability-Constrained Controller
+
State Version Validation

Do not adopt G1 reminder repetition as the primary mechanism.

The user's manual reminder burden should approach zero.
