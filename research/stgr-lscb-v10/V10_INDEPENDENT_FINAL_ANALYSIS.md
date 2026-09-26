# STGR / Global Reassessment v1.0 — Independent Final Analysis

Date: 2026-09-26
Status: **TECHNICAL PASS / MEASUREMENT REPAIR PASS / BEHAVIORAL CEILING**

## 1. Technical validity

GitHub Actions run 36224582092 completed successfully.

- model: Gemini 3.5 Flash
- region: asia-southeast1
- temperature: 0
- exact-state blind annotation: GPT-5.6 Sol and Gemini 3.5 Flash agreed 10/10
- 30/30 acting decisions completed
- hierarchical task_scope output used
- scope/action consistency = 1.00
- canonical trigger vocabulary used end-to-end
- no Owner terminal / Cloud Shell intervention

## 2. Primary metrics

| Condition | PRIMARY=NO local persistence | PRIMARY=YES CP |
|---|---:|---:|
| A baseline | 0.00 | 1.00 |
| B always global reassessment | 0.00 | 1.00 |
| E multi-trigger gate | 0.00 | 1.00 |

The baseline solved all 10 exact-state cases correctly.

Therefore:
- H1: NOT SUPPORTED — no room for B to improve A.
- H2: NOT SUPPORTED — no room for E to improve A.
- H3: mechanically supported, but trivial because A/B/E all have zero unnecessary persistence.
- H5: supported, E preserved all 5 correct-continuation cases.
- H6: supported, scope/action consistency = 1.00.

## 3. Trigger detection

For E:
- trigger-positive cases = 5
- trigger-negative cases = 5
- sensitivity = 4/5 = 0.80
- false-trigger rate = 0/5 = 0.00
- H4: SUPPORTED

Missed trigger:
- V10B03 (calendar code already fixed, PROD still not deployed)
- gold = LIVE_EVIDENCE_GAP
- E did not fire the gate, but the model still selected DIFFERENT_TASK_OR_LAYER / SWITCH_TO_GLOBAL_BOTTLENECK correctly.

Thus trigger detection is not required for correct behavior on an already-easy case.

## 4. Cost

Per-run average:

| Condition | tokens | latency |
|---|---:|---:|
| A | 1296.5 | 5.06 s |
| B | 1356.2 | 5.29 s |
| E | 1583.9 | 6.06 s |

Relative to A:
- B: about +4.6% tokens and +4.7% latency
- E: about +22.2% tokens and +19.8% latency

Because A was already perfect, both intervention conditions were pure overhead on this corpus.

## 5. What v1.0 establishes

v1.0 successfully fixes the three measurement defects identified in v0.8/v0.9:

1. exact-state relevance labels are stable because annotators see latest_step;
2. hierarchical task_scope removes REPLAN/action-semantic ambiguity;
3. canonical trigger gold is directly comparable to intervention trigger output.

The measurement architecture is now substantially cleaner.

## 6. What v1.0 does NOT establish

v1.0 does not show an intervention benefit because the independent corpus is too easy for Gemini 3.5 Flash.

The exact-state histories explicitly contain enough evidence that the baseline can already identify:
- completed tasks,
- source-of-truth violations,
- operational-phase transitions,
- action-first bottlenecks,
- remaining bounded work.

This is a ceiling effect, not evidence that global reassessment is useless.

## 7. Combined interpretation v0.7–v1.0

v0.7:
- baseline unnecessary persistence existed (35.7% overall on PRIMARY=NO);
- always-on reassessment reduced it to 14.3%;
- success-only STGR was weaker.

v0.8:
- multi-trigger E showed promising reduction, but measurement defects weakened interpretation.

v0.9:
- exact-state annotation repair exposed ambiguity and correctly stopped before acting run.

v1.0:
- corrected measurement architecture passes, but the new corpus produces baseline ceiling.

The remaining research bottleneck is therefore **task difficulty / ecological ambiguity**, not measurement plumbing.

## 8. Next research gate

Do not run another intervention test on hand-written obvious cases.

Next phase must construct **earlier naturalistic decision points**, before the later evidence makes the correct global switch explicit.

Required design:

1. extract real histories at the moment before Owner intervention / architecture switch / post-hoc conclusion;
2. keep enough context for two independent annotators to agree on global relevance;
3. exclude explicit sentences that already state the correct next action or that the task is complete;
4. use a separate baseline-difficulty calibration model from the final acting model;
5. retain a balanced set of:
   - relevance-NO cases where baseline sometimes persists,
   - relevance-YES controls where baseline often continues;
6. freeze the selected set before the final Gemini intervention run.

This is the shortest path to identifying whether B/E adds value beyond a capable baseline.
