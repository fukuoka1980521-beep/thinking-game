# Phase 2A Structured-ID Controller Validation

**Decision: REVISE_CONTROLLER**

- correct: 6/27
- wrong: 20
- review: 1
- model ID-valid proposals: 7/27
- controller repairs: 0
- controller rejects: 20
- retired route selected: 0
- mean injected tokens: 88.3

## Gates

- FAIL — correct_ge_25_of_27
- FAIL — wrong_eq_0
- FAIL — goal_change_each_ge_2_of_3
- FAIL — critical_each_ge_2_of_3
- PASS — h1_cost_route_ge_2_of_3
- PASS — mean_tokens_le_120
- PASS — retired_route_never_authorized

## Per scenario

- H1_COST_ROUTE: 3/3 correct, 0 wrong, 0 review
- H1_COST_SUNK: 0/3 correct, 3 wrong, 0 review
- H2_MIGRATION_TOOL: 0/3 correct, 3 wrong, 0 review
- H2_TOOL_NEARLY_FIXED: 0/3 correct, 3 wrong, 0 review
- H3_PATCH_LOOP: 2/3 correct, 1 wrong, 0 review
- H3_PATCH_WITH_REAL_BUG: 1/3 correct, 2 wrong, 0 review
- H4_AUTH_CHANGE: 0/3 correct, 3 wrong, 0 review
- H4_GOAL_CHANGE_WITH_REUSE: 0/3 correct, 3 wrong, 0 review
- H5_SUNK_DATA_PIPELINE: 0/3 correct, 2 wrong, 1 review
