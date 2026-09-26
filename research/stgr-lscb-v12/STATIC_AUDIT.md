# v1.2 Sequential Selection + Static Audit

Status: **PASS FOR LIVE SEQUENTIAL PILOT**

## Annotation agreement

Eligible shift sequences:
- V12S01_CLOUD_SHELL_MOMENTUM — agreed YES at T1/T2, first agreed NO at T3, NO at T4.
- V12S02_DIALOGUE_RULE_MOMENTUM — agreed YES at T1/T2, first agreed NO at T3, NO at T4.
- V12S03_VALIDATOR_REPAIR_MOMENTUM — agreed YES at T1; T2 disagreement; first agreed NO at T3; NO at T4.

Excluded:
- V12S04_RELEASE_MANUAL_FIX_MOMENTUM — no agreed YES state before the first agreed NO.

Eligible controls:
- V12C01_SCHEMA_INSPECTION_CONTROL
- V12C02_PUBLIC_SYNC_CONTROL
- V12C03_MED_DETAIL_CONTROL
- V12C04_BARRIER_SCHEMA_CONTROL

All 16 control turns were agreed YES.

Gate: 3 shift + 4 controls => PASS.

## Exact-state integrity
Acting runner reads the same global goal, local task and turn events frozen in SEQUENTIAL_TRAJECTORIES_V1_2.json.
No source_trace, gold_primary, annotation label or future event is shown ahead of its turn.

## Momentum preservation
Each condition keeps its own prior decisions/rationales and shows them at the next turn.
No prior decisions are shared across conditions.

## Canonical triggers
All hidden trigger labels in the selected sequences use only the fixed seven-trigger vocabulary.

## Measurement
Persistence is task_scope == SAME_LOCAL_TASK.
task_scope is chosen before action.
No post-hoc rationale recoding.

## Planned maximum
7 selected sequences × 3 conditions × up to 4 turns = maximum 84 final-model decisions.
Terminal exits shorten the run.

Pre-run scoring clarification remains binding.
