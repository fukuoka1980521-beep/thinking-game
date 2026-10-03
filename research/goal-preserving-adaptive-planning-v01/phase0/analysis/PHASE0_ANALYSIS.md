# Goal-Preserving Adaptive Planning — Phase 0 Analysis

**Decision: NO_GO_REVISE**

| condition | correct | stable goals | legitimate goal change | injected tokens |
|---|---:|---:|---:|---:|
| CTRL | 4/4 | 3/3 | PASS | 0 |
| GOAL10 | 4/4 | 3/3 | PASS | 206 |
| FULL10 | 3/4 | 2/3 | PASS | 556 |
| STATE10 | 4/4 | 3/3 | PASS | 1298 |
| STATE_EVENT | 3/4 | 2/3 | PASS | 1315 |

## State-condition gates

### STATE10
- FAIL — beats_ctrl_on_at_least_2_stable_scenarios
- PASS — handles_legitimate_goal_change
- PASS — no_more_plan_rigidity_than_ctrl
- FAIL — fewer_injected_tokens_than_full10
- Overall: NO_GO

### STATE_EVENT
- FAIL — beats_ctrl_on_at_least_2_stable_scenarios
- PASS — handles_legitimate_goal_change
- PASS — no_more_plan_rigidity_than_ctrl
- FAIL — fewer_injected_tokens_than_full10
- Overall: NO_GO

## Failure classes

- CTRL: {}
- GOAL10: {}
- FULL10: {'UNPARSEABLE': 1}
- STATE10: {}
- STATE_EVENT: {'UNPARSEABLE': 1}

Phase 0 is mechanism/format calibration only. It does not establish frontier-model generalization.
