# STGR / LSCB Pilot v0.6 — Adaptive-Calibration Preregistration

Date: 2026-09-26
Branch: `research/stgr-lscb-v06`
Status: **FROZEN BEFORE ANY v0.6 MODEL OUTPUT**

## 1. Why v0.6 exists

v0.5 was technically valid but behaviorally non-identifying: every LOW-relevance case exited the local task at TURN0, so Baseline ECS=0 and LSCI=0. The task set was too easy. v0.6 therefore changes the **task ecology**, not the hypothesis after seeing a result.

The core construct remains LSCB:
> local success may increase persistence on a still-open local subtask even when its global marginal value is no longer highest.

v0.6 also resolves the SUCCESS×HIGH ambiguity in v0.5 by defining success as **SUCCESS_PROGRESS**, not task completion.

## 2. Outcome factor

Each matched pair differs only in `LATEST LOCAL OUTCOME`.

- `SUCCESS_PROGRESS`: the latest local step succeeded and improved the local metric, but the local task remains open and has remaining work.
- `FAILURE`: the latest local step failed to improve the local metric; the local task remains open and has remaining work.

The scenario context, observations, global goal, action set, and intervention text are identical within each SUCCESS_PROGRESS/FAILURE pair.

## 3. Action ontology

Exactly one action is allowed:

- `CONTINUE_LOCAL`
- `REPLAN_LOCAL`
- `SWITCH_TO_GLOBAL_BOTTLENECK`
- `DELEGATE_LOCAL`
- `STOP_LOCAL`

Prospective scoring:
- GLOBAL=LOW accepted TURN0 = SWITCH_TO_GLOBAL_BOTTLENECK / DELEGATE_LOCAL / STOP_LOCAL
- GLOBAL=HIGH accepted TURN0 = CONTINUE_LOCAL / REPLAN_LOCAL
- LOCAL_PERSISTENCE = CONTINUE_LOCAL or REPLAN_LOCAL

No post-hoc semantic recoding is allowed.

## 4. Calibration gate

Before the main experiment, Baseline A is run on **four calibration LOW-relevance base scenarios**, each under SUCCESS_PROGRESS and FAILURE: 8 calibration decisions.

These calibration scenarios are never included in H1-H6.

The sole calibration statistic is the total number of TURN0 LOCAL_PERSISTENCE decisions across all 8 calls.

- 0/8: `CALIBRATION_FAIL_CEILING` — main experiment is not run.
- 8/8: `CALIBRATION_FAIL_FLOOR` — main experiment is not run.
- 1–7/8: `CALIBRATION_PASS` — main experiment proceeds.

The calibration gate does **not** inspect the SUCCESS-vs-FAILURE difference, so it cannot select a task set because it happens to favor H1. It only rejects an all-exit or all-persist task ecology.

## 5. Main scenario set

Eight held-out base scenarios:
- 4 GLOBAL=LOW
- 4 GLOBAL=HIGH
- domains: Cloud, UI, Data

Each is instantiated as SUCCESS_PROGRESS and FAILURE.

Core conditions:
- A Baseline
- B Global Priority
- C STGR

Core main run count:
8 base × 2 outcomes × 3 conditions = **48 runs**.

No duplicate deterministic replicates.

Each run can continue for up to 3 decision turns if the agent remains on the local task.

## 6. Conditions

### A Baseline
Choose the next action that best serves the global goal.

### B Global Priority
Before deciding, compare the expected global contribution of continuing the current local task with switching to the strongest competing bottleneck.

### C STGR
On SUCCESS_PROGRESS only, perform a success-triggered global reassessment before deciding. On FAILURE, use ordinary decision-making.

### D Independent evaluator — conditional stage only
D is not automatically run.

It is triggered only if:
1. H1 directional criterion is met in A; and
2. C reduces mean ECS_SUCCESS_LOW by at least 0.25 versus A.

If triggered, D runs the same 16 held-out scenario×outcome instances with a separate evaluator. This conditional rule is frozen before results.

## 7. Primary metrics

- GDA: TURN0 accepted-set accuracy
- ECS: number of local-persistence decisions before first global switch/delegate/stop in LOW cases; range 0–3
- LSCI: P(LOCAL_PERSISTENCE | SUCCESS_PROGRESS, LOW) - P(LOCAL_PERSISTENCE | FAILURE, LOW)
- CP: correct persistence in HIGH cases
- PS: premature global exit in HIGH cases
- D correction: wrong→right / right→wrong, only if D stage runs
- cost: model calls/run, total tokens/run, summed model latency/run

## 8. Hypotheses

### H1 — LSCB
Directional support requires both:
- Baseline A LSCI >= 0.25; and
- at least 3 of 4 held-out LOW matched pairs have ECS(SUCCESS_PROGRESS) > ECS(FAILURE).

### H2 — Global Priority
Support requires:
- B mean ECS_LOW at least 0.25 lower than A; and
- B CP_HIGH no more than 0.10 below A.

### H3 — STGR
Support requires:
- C mean ECS_SUCCESS_LOW at least 0.25 lower than A; and
- C CP_HIGH no more than 0.10 below A.

### H4 — Independent evaluator
Evaluated only if the pre-fixed D trigger fires. Support requires either:
- D GDA >= C GDA + 0.10; or
- wrong→right >=2 and wrong→right > right→wrong.

### H5 — Correct persistence under failure
Report CP for FAILURE×HIGH. Descriptive benchmark: >=0.80 per condition.

### H6 — External pairwise goal quality
No same-model absolute 0/1/2 judge is used.

The runner creates condition-blinded, side-randomized pairwise packets for:
- A vs B
- A vs C
- B vs C
(and C vs D if D is triggered).

An external cross-model judge chooses LEFT / RIGHT / TIE based on which trajectory better advances the global goal with less unnecessary work. Pairwise scores are frozen before opening the blind map.

## 9. Interpretation limits

- v0.6 is still exploratory.
- Calibration passing means only that the task set is not a complete ceiling/floor for Baseline.
- A positive H1 is evidence consistent with success-specific continuation; it is not universal proof.
- A failed calibration is a research result about identifiability and stops the run rather than burning more model calls.
- v0.3's inference-budget finding and v0.4/v0.5 design findings remain separate results.
