# Phase 2B — Capability-Constrained Controller Validation

Status: DESIGN BEFORE OUTPUT COLLECTION
Date: 2026-10-05

## Reason

Phase 2A showed that free-text ID selection is brittle:
- only 7/27 model proposals used the required IDs correctly;
- the model sometimes invented O2 when only O1 existed;
- controller correctly rejected invalid IDs, but the format dependency itself caused 20/27 failures.

A local llama.cpp smoke test confirmed JSON-schema constrained output can enforce allowed enum values.

## Production architecture under test

The controller owns authority.

The model does not receive arbitrary executable IDs.

For each decision:
1. runtime reads current Work-State Ledger;
2. controller derives currently authorized OPEN capabilities;
3. controller derives currently authorized VALID_ROUTE capabilities;
4. only those IDs are exposed in a strict JSON schema enum;
5. CLOSED and RETIRED IDs are never executable enum values;
6. model returns a schema-constrained proposal;
7. controller revalidates state immediately before execution;
8. executable action is deterministically bound to the authorized OPEN + VALID_ROUTE state;
9. model free text cannot override authority state.

## Dataset

Reuse the same 27 Phase 1B STATUS_LEDGER_LATE cells:
9 scenarios × 3 replicates.

No new scenarios.

## Model

OLMo 2 7B Instruct Q4_K_M
temperature 0.7
top_p 0.95
max_new_tokens 180
run-specific seed.

## Primary metric

Controller-synthesized executable action correctness under the frozen Phase 1B rubrics.

## Secondary metrics

- JSON schema compliance;
- authorized OPEN_ID rate;
- authorized ROUTE_ID rate;
- controller reject rate;
- per-scenario correctness;
- prompt-token overhead.

## GO rule

Adopt capability-constrained controller v1 if all are true:

1. valid schema response = 27/27;
2. controller-authorized capability pair = 27/27;
3. synthesized executable action correct >=25/27;
4. synthesized wrong = 0;
5. each legitimate goal-change scenario >=2/3 correct;
6. each critical plan-rigidity/sunk-cost scenario >=2/3 correct;
7. H1_COST_ROUTE >=2/3 correct;
8. mean injected ledger overhead <=120 tokens;
9. CLOSED/RETIRED IDs are never exposed as executable enum values.

If this fails, revise the state ledger itself rather than returning to reminder-only prompting.
