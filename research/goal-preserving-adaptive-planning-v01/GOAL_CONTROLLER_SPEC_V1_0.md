# Goal-Preserving External Controller v1.0

Status: IMPLEMENTATION CANDIDATE
Date: 2026-10-05

## Why an external controller is required

Phase 1B prompt-only validation:

- CTRL: 11/27 correct
- STATUS_LEDGER_LATE: 24/27 correct by strict rubric, 0 wrong, 3 review
- Paired wins/losses: 14/1
- Mean ledger overhead: 81.3 tokens

The preregistered prompt-only GO rule failed because one critical scenario did not achieve >=2/3 strict-rubric correctness.

The failure was not goal drift or reuse of a retired route.
In H1_COST_ROUTE the model selected the correct OPEN work ("reconcile remaining rows") but omitted the explicit VALID_ROUTE ("local CSV export") from the action string.

A post-hoc deterministic controller simulation using the existing 27 ledger outputs raised strict-rubric correctness from 19/27 to 25/27 with zero new model generation.

The two remaining REVIEW outputs are semantically consistent with OPEN/VALID_ROUTE but miss rubric vocabulary.

Therefore natural-language semantic scoring is not the production solution.

## Production principle

The model is advisory.
The controller is authoritative.

Do not ask the controller to infer project state from prose.

Represent state with stable IDs.

Example:

GOAL: G1
OPEN:
- O1 = reconcile remaining rows
- O2 = produce reviewable Friday report

CLOSED:
- C1 = quota diagnosis

RETIRED:
- R1 = paid connector this week
  reason = additional spend prohibited

VALID_ROUTE:
- V1 = local CSV export

The model must propose:

OPEN_ID: O1
ROUTE_ID: V1
ACTION: Use the local CSV export to reconcile the remaining rows.

The controller validates IDs before execution.

## Controller rules

1. OPEN_ID must exist in OPEN.
2. ROUTE_ID must exist in VALID_ROUTE, unless the OPEN item explicitly requires no route.
3. Any CLOSED_ID or RETIRED_ID is rejected.
4. A RETIRED item may become usable only through an explicit state transition with changed evidence/reason.
5. GOAL changes require a GOAL_CHANGE event with authority/reason.
6. If the model proposes a valid OPEN_ID but no required ROUTE_ID, return REPAIR_REQUIRED rather than executing.
7. The controller may deterministically synthesize a safe action from OPEN + VALID_ROUTE.
8. Completed useful work is retained when plans change; only the invalid route is retired.
9. No prompt repetition can override controller state.

## State transitions

OPEN -> CLOSED
when completion/acceptance evidence exists.

OPEN -> RETIRED
when the work item itself becomes irrelevant or superseded.

VALID_ROUTE -> RETIRED
when blocked, prohibited, dominated, or superseded.

RETIRED -> VALID_ROUTE
only if the retirement reason is explicitly invalidated by new evidence.

GOAL old -> GOAL new
only with explicit authoritative change, impossibility, higher-priority conflict, or correction of an invalid original goal.

## Operational objective

Goal Stability + Plan Plasticity

Protect the goal while allowing route replacement.

Do not confuse:
- goal persistence with plan persistence;
- reminder strength with decision quality;
- natural-language recall with execution authorization.
