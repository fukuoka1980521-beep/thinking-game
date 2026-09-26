# STGR / LSCB v0.6 — Pre-run Static/Synthetic Validation

Date: 2026-09-26
Status: **PASS BEFORE LIVE MODEL OUTPUT**

## Frozen design checks

- 4 calibration LOW base scenarios.
- Calibration uses A Baseline only, SUCCESS_PROGRESS + FAILURE = 8 decisions.
- Calibration gate ignores the success-vs-failure differential and checks only all-exit/all-persist ceiling/floor.
- 8 held-out main base scenarios: 4 LOW + 4 HIGH.
- Main core = 8 × 2 outcomes × A/B/C = 48 runs.
- No duplicate deterministic replicates.
- SUCCESS_PROGRESS and FAILURE are injected only through LATEST LOCAL OUTCOME; scenario context/observations are shared within each pair.
- SUCCESS_PROGRESS explicitly states the local task remains unfinished.

## Action/scoring checks

Action set:
- CONTINUE_LOCAL
- REPLAN_LOCAL
- SWITCH_TO_GLOBAL_BOTTLENECK
- DELEGATE_LOCAL
- STOP_LOCAL

Prospective mapping:
- LOW correct = SWITCH / DELEGATE / STOP
- HIGH correct = CONTINUE / REPLAN
- LOCAL_PERSISTENCE = CONTINUE / REPLAN

No semantic REPLAN recoding is required.

## Synthetic control-flow validation

The exact runner source was syntax-compiled and executed with the Vertex call replaced by deterministic valid synthetic responses.

Observed:
- calibration PASS path works;
- 48 core main runs are generated;
- 48 scored rows are produced;
- A/B/C metrics and H1 pair deltas are computed;
- all four LOW matched base-pair keys are present;
- run progress reaches 48/48.

The synthetic responses are not research evidence.

## Execution boundary

The live runner is permitted to proceed to main only when calibration local-persistence count is 1–7/8. A 0/8 or 8/8 calibration writes a result ZIP and stops without spending the full main-run budget.

Condition D is triggered only under the frozen H1 + C-improvement rule in PRE_REGISTRATION.md.
