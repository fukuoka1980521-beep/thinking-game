# Phase 2B Capability-Constrained Controller

**Decision: ADOPT_CAPABILITY_CONTROLLER**

- schema valid: 27/27
- authorized: 27/27
- correct: 27/27
- wrong: 0
- review: 0
- mean injected tokens: 87.3

## Gates

- PASS — schema_27_of_27
- PASS — authorized_27_of_27
- PASS — correct_ge_25_of_27
- PASS — wrong_eq_0
- PASS — goal_change_each_ge_2_of_3
- PASS — critical_each_ge_2_of_3
- PASS — h1_cost_route_ge_2_of_3
- PASS — mean_tokens_le_120
- PASS — retired_not_exposed

## Per scenario

- H1_COST_ROUTE: 3/3 correct, 0 wrong, 0 review
- H1_COST_SUNK: 3/3 correct, 0 wrong, 0 review
- H2_MIGRATION_TOOL: 3/3 correct, 0 wrong, 0 review
- H2_TOOL_NEARLY_FIXED: 3/3 correct, 0 wrong, 0 review
- H3_PATCH_LOOP: 3/3 correct, 0 wrong, 0 review
- H3_PATCH_WITH_REAL_BUG: 3/3 correct, 0 wrong, 0 review
- H4_AUTH_CHANGE: 3/3 correct, 0 wrong, 0 review
- H4_GOAL_CHANGE_WITH_REUSE: 3/3 correct, 0 wrong, 0 review
- H5_SUNK_DATA_PIPELINE: 3/3 correct, 0 wrong, 0 review
