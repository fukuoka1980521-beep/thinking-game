# STGR / LSCB v0.5 — Live Result Analysis

Date: 2026-09-26
Status: **LIVE RUN COMPLETE / TECHNICAL VALIDITY PASS / TARGET EFFECT NOT IDENTIFIED**

## 1. Execution validity

The live Gemini 3.5 Flash v0.5 run completed successfully.

- result: `STGR_LSCB_RESULTS_V0_5.zip`
- Drive file id: `1PIqXfXmKwpeMZsh7gvOYuAYdmNN_FSYI`
- started: 2026-09-26T02:09:30.459495Z
- completed: 2026-09-26T02:19:29.943250Z
- scored runs: 96/96
- unique run IDs: 96
- A/B/C/D: 24 runs each
- model: Gemini 3.5 Flash
- region: asia-southeast1
- maxOutputTokens: 4096
- temperature: 0
- technical validity: PASS

No `TECHNICAL_FAILURE.json` was present.

## 2. Primary automated metrics

| Condition | GDA | ECS LOW | LSCI | CP HIGH | PS HIGH |
|---|---:|---:|---:|---:|---:|
| A Baseline | 0.875 | 0.000 | 0.000 | 0.750 | 0.250 |
| B Global Priority | 0.917 | 0.000 | 0.000 | 0.833 | 0.167 |
| C STGR | 0.792 | 0.000 | 0.000 | 0.583 | 0.417 |
| D Independent Evaluator | 0.792 | 0.000 | 0.000 | 0.583 | 0.417 |

All 48 LOW-relevance decision instances (12 per condition) exited the local task at TURN0. Therefore:

- Baseline A SUCCESS×LOW ECS = 0.0
- Baseline A FAILURE×LOW ECS = 0.0
- Baseline A LSCI = 0.0
- all six matched LOW pairs had ECS(SUCCESS)-ECS(FAILURE) = 0

This is a clear **ceiling / task-easiness result**. The baseline already recognized the global bottleneck immediately, leaving no behavioral room for B/C/D to improve LOW-relevance stopping.

## 3. Hypotheses

- **H1 LSCB:** NOT SUPPORTED DIRECTIONALLY. LSCI_A=0.0 and 0/6 matched LOW pairs show greater SUCCESS persistence.
- **H2 Global Priority:** NOT SUPPORTED DIRECTIONALLY. Baseline ECS_LOW was already 0.
- **H3 STGR incremental value:** NOT SUPPORTED DIRECTIONALLY. B and C both had ECS_SUCCESS_LOW=0.
- **H4 Independent evaluator:** NOT SUPPORTED DIRECTIONALLY. The evaluator changed 0/24 TURN0 executor decisions; wrong→right=0, right→wrong=0.
- **H5 Correct persistence after FAILURE×HIGH:** SUPPORTED DESCRIPTIVELY. CP=1.0 in A/B/C/D.
- **H6:** external cross-model blind judgment completed separately; see §6.

## 4. STGR side-effect signal and a new design inconsistency

For SUCCESS×HIGH only, CP was:

- A: 0.500
- B: 0.667
- C: 0.167
- D: 0.167

C/D therefore selected `SWITCH_TO_GLOBAL_BOTTLENECK` in 5/6 SUCCESS×HIGH scenarios.

Under the preregistered action-gold mapping this counts as premature switching. However, inspection of the matched-counterfactual semantics reveals an internal design conflict:

`LATEST LOCAL OUTCOME = SUCCESS` was defined as:

> the immediately preceding local work achieved that local task's own objective.

If the local objective is already achieved, switching to the next global step can be rational even when that local task was highly relevant before completion. Example: after successfully identifying a missing IAM permission, moving to permission application/redeployment is reasonable global progress.

This means the v0.5 SUCCESS×HIGH gold mapping (which prospectively accepts only CONTINUE_LOCAL / REPLAN_LOCAL) is too rigid. The apparent C/D "over-stopping" signal cannot be interpreted as a clean intervention harm without separating:
- high relevance **and unresolved local task**
from
- high relevance **but local objective just completed**.

This issue does not alter H1's LOW-relevance ceiling result, but it weakens H2/H3 safety-side-effect interpretation.

## 5. Independent evaluator cost

Per-run cost:

| Condition | model calls/run | total tokens/run | summed latency/run |
|---|---:|---:|---:|
| A | 1.75 | 1655 | 6.25 s |
| B | 1.83 | 1894 | 7.11 s |
| C | 1.58 | 1630 | 6.10 s |
| D | 3.17 | 3318 | 11.57 s |

D made no TURN0 corrections while approximately doubling C's model calls and tokens.

## 6. External cross-model blind judgment

Before opening `blind_judge_map.json`, GPT-5.6 Sol scored all 96 `blind_judge_packets.jsonl` trajectories using the preregistered 0/1/2 rubric.

Frozen blind-score SHA-256:
`2468f5ff748b506fa4dd2374312bde0f78a71b1f832a3148d03ab39c8ed95438`

Blind score distribution:
- 0: 0
- 1: 0
- 2: 96

After the scores were fixed, the blind map was opened. Mean external goal-quality score was 2.0 in A/B/C/D.

Interpretation: H6 is **non-discriminating** in this pilot. All conditions produced trajectories that were globally reasonable to an external model judge, so there is no evidence that B/C/D improve final goal quality over baseline.

The perfect score ceiling also shows that this quality rubric/scenario set is currently too easy to discriminate intervention quality.

## 7. Current research conclusion

v0.5 does not provide evidence for a success-specific continuation bias under the tested tasks.

More precisely:
1. LOW-relevance cases were too explicit/easy; baseline already switched away from the local task immediately in every matched SUCCESS and FAILURE case.
2. STGR and the independent evaluator therefore had no opportunity to reduce LOW-relevance persistence.
3. The independent evaluator added substantial cost and changed no TURN0 action.
4. FAILURE×HIGH persistence was robust across all conditions.
5. SUCCESS×HIGH exposed a separate construct-design problem: "local success means objective completed" conflicts with a gold rule that requires continued local work.
6. The external blind quality judge also hit a ceiling (96/96 score=2), so H6 cannot distinguish conditions.

## 8. Required next research move

Do **not** simply increase repetitions.

The next experiment must make the construct identifiable:

- distinguish `SUCCESS_PROGRESS` from `SUCCESS_COMPLETION`;
- for H1, use SUCCESS_PROGRESS: a local step succeeds but the local task remains open;
- keep SUCCESS/FAILURE pairs exactly matched except for the local outcome;
- make global-relevance changes implicit enough that baseline does not trivially switch in every LOW case;
- include naturalistic momentum/history where continuing the local task is genuinely tempting;
- prospectively define whether each local task remains open after the outcome;
- use harder blind-quality cases or a pairwise preference judge rather than a rubric that saturates at 2.

No positive LSCB/STGR claim should be published from v0.5.
