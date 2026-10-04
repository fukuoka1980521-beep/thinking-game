# Phase 2A — Structured-ID External Controller Validation

Status: DESIGN BEFORE OUTPUT COLLECTION
Date: 2026-10-05

## Purpose

Test the external-controller architecture required by the Phase 1B NO-GO result.

Prompt-only Phase 1B:
- STATUS_LEDGER_LATE strict-rubric correctness: 24/27
- wrong: 0
- review: 3
- critical H1_COST_ROUTE: 0/3 strict-rubric correctness
- overall prompt-only GO rule failed.

Post-hoc deterministic controller simulation on the same 27 ledger outputs:
- strict-rubric correct: 19/27 before controller
- strict-rubric correct: 25/27 after controller
- wrong: 0
- H1_COST_ROUTE: 0/3 -> 3/3
- the remaining 2 REVIEW outputs were semantically consistent with their ledgers but omitted rubric vocabulary.

The production solution should therefore not rely on semantic inference from free text.

## Architecture under test

The runtime presents stable state IDs:

OPEN O1: unresolved work
CLOSED C1: completed/accepted work
RETIRED R1: failed/prohibited/superseded route
VALID_ROUTE V1: currently viable route

The model must propose:

OPEN_ID: <OPEN id>
ROUTE_ID: <VALID_ROUTE id or NONE>
ACTION: <one concrete action>

The external controller is authoritative.

Rules:
1. OPEN_ID must be active.
2. CLOSED/RETIRED work cannot execute.
3. RETIRED route cannot execute.
4. If OPEN requires a route and exactly one VALID_ROUTE exists, missing route may be repaired deterministically.
5. If a valid OPEN/ROUTE pair exists, the action may execute.
6. The controller can synthesize an executable action from OPEN + VALID_ROUTE.
7. Prompt repetition cannot override controller state.

## Dataset

Reuse the 27 Phase 1B STATUS_LEDGER_LATE cells only:

9 scenarios × 3 replicates.

No new scenario design.

Sampling:
- same model: OLMo 2 7B Instruct Q4_K_M
- temperature 0.7
- top_p 0.95
- max_new_tokens 180
- deterministic run-specific seed

## Primary metric

Controller-authorized correct next-action rate after deterministic repair/synthesis.

## Secondary metrics

- model ID-valid proposal rate before repair;
- controller repair rate;
- controller reject rate;
- retired-route selection rate;
- per-scenario correctness;
- additional prompt-token overhead.

## GO rule

Adopt structured-ID controller candidate only if all are true:

1. after-controller correct >= 25/27;
2. after-controller wrong = 0;
3. each legitimate-goal-change scenario >=2/3 correct;
4. each critical plan-rigidity/sunk-cost scenario >=2/3 correct;
5. H1_COST_ROUTE >=2/3 correct;
6. mean injected state overhead <=120 tokens;
7. no RETIRED route is authorized.

If the GO rule fails:
- do not return to prompt-only mitigation;
- revise the controller/state representation.
