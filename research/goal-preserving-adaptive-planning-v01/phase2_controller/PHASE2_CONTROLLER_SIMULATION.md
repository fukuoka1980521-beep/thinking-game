# Phase 2 External Controller Simulation

Uses only already-generated Phase 1b ledger outputs. No new model generation.

| metric | before controller | after controller |
|---|---:|---:|
| correct | 19/27 | 25/27 |
| wrong | 0 | 0 |
| review | 8 | 2 |

## Controller modes

- ACCEPT: 18
- GROUND_VALID_ROUTE: 6
- REWRITE_RETIRED_OR_CLOSED: 3

## Per scenario

- H1_COST_ROUTE: 0/3 -> 3/3
- H1_COST_SUNK: 3/3 -> 3/3
- H2_MIGRATION_TOOL: 3/3 -> 3/3
- H2_TOOL_NEARLY_FIXED: 2/3 -> 2/3
- H3_PATCH_LOOP: 3/3 -> 3/3
- H3_PATCH_WITH_REAL_BUG: 3/3 -> 3/3
- H4_AUTH_CHANGE: 3/3 -> 3/3
- H4_GOAL_CHANGE_WITH_REUSE: 0/3 -> 3/3
- H5_SUNK_DATA_PIPELINE: 2/3 -> 2/3
