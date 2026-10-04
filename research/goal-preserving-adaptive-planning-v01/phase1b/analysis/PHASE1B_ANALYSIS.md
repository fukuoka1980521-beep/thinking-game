# Phase 1B Work-State Ledger Robustness Validation

**Decision: PROMPT_ONLY_NO_GO_EXTERNAL_CONTROLLER**

| condition | correct | wrong | review | accuracy | mean injected tokens |
|---|---:|---:|---:|---:|---:|
| CTRL | 11/27 | 4 | 12 | 0.407 | 0.0 |
| STATUS_LEDGER_LATE | 24/27 | 0 | 3 | 0.889 | 81.3 |

## Paired result

- wins=14, losses=1, ties=12

## Gates

- PASS — accuracy_gain_ge_0_15
- PASS — wrong_rate_not_higher
- PASS — goal_change_each_ge_2_of_3
- FAIL — critical_each_ge_2_of_3
- PASS — paired_wins_gt_losses
- PASS — mean_token_overhead_le_100

## Per-scenario ledger result

- H1_COST_ROUTE: CTRL 1/3 correct; LEDGER 0/3 correct
- H1_COST_SUNK: CTRL 2/3 correct; LEDGER 3/3 correct
- H2_MIGRATION_TOOL: CTRL 0/3 correct; LEDGER 3/3 correct
- H2_TOOL_NEARLY_FIXED: CTRL 3/3 correct; LEDGER 3/3 correct
- H3_PATCH_LOOP: CTRL 0/3 correct; LEDGER 3/3 correct
- H3_PATCH_WITH_REAL_BUG: CTRL 0/3 correct; LEDGER 3/3 correct
- H4_AUTH_CHANGE: CTRL 3/3 correct; LEDGER 3/3 correct
- H4_GOAL_CHANGE_WITH_REUSE: CTRL 2/3 correct; LEDGER 3/3 correct
- H5_SUNK_DATA_PIPELINE: CTRL 0/3 correct; LEDGER 3/3 correct
