# STGR / Global Reassessment v1.2 — Sequential Momentum Final Analysis

Date: 2026-09-26
Status: **TECHNICAL PASS / SEQUENTIAL PILOT COMPLETE / H1-H3 NOT SUPPORTED**

## 1. Technical validity

GitHub Actions run 36226358509 completed successfully.

- model: Gemini 3.5 Flash
- region: asia-southeast1
- temperature: 0
- selected sequences: 3 shift + 4 controls
- total decisions: 78
- no Owner terminal/Cloud Shell action
- exact cumulative history and prior model decisions preserved per trajectory
- task_scope/action mechanical consistency: 1.00
- all four control sequences stayed on-task through all four turns in A/B/E

## 2. Primary preregistered results

| Condition | FIRST_NO_PERSIST | shift premature exit | mean post-shift persistence turns | control premature exit | control CP |
|---|---:|---:|---:|---:|---:|
| A baseline | 0.333 | 0 | 0.333 | 0 | 1.00 |
| B always reassess | 0.333 | 0 | 0.333 | 0 | 1.00 |
| E multi-trigger | 0.333 | 0 | 0.333 | 0 | 1.00 |

Directional hypotheses:
- H1 baseline sequential momentum >=0.50: **NOT SUPPORTED**
- H2 B reduces FIRST_NO_PERSIST by >=0.25: **NOT SUPPORTED**
- H3 E reduces FIRST_NO_PERSIST by >=0.25: **NOT SUPPORTED**
- H4 E no worse than B by >0.25: **SUPPORTED, but non-discriminating**
- H5 trigger detection: **SUPPORTED**
- H6 task_scope/action mechanical consistency >=0.90: **SUPPORTED**

## 3. Trigger behavior

E:
- trigger sensitivity on reached post-shift trigger-positive turns = 1.00
- false-trigger rate on 16 reached control turns = 0.00

The gate therefore recognized the source-derived process triggers cleanly on this small corpus and did not fire on the same-task controls.

However this did not improve primary behavior because two shift trajectories were already solved by baseline and the third exhibited a scope-label semantic problem.

## 4. Sequence-level behavior

### S01 — Cloud Shell execution drift
All conditions:
- T1 YES → continue
- T2 YES → continue
- T3 first agreed NO → switch task/layer immediately

No persistence at shift. E correctly detected OWNER_MANUAL_REPEAT.

### S02 — deterministic dialogue-rule drift
All conditions:
- T1 YES → continue
- T2 YES → continue
- T3 first agreed NO → switch task/layer immediately

No persistence at shift. E correctly detected LOCAL_GLOBAL_DIVERGENCE.

### S03 — validator repair drift
All conditions:
- T1 → continue
- T2 annotation disagreement, model continues
- T3 first agreed NO → task_scope=SAME_LOCAL_TASK / action=REPLAN_LOCAL
- T4 → DIFFERENT_TASK_OR_LAYER / switch

Mechanically this is one turn of post-shift persistence in A/B/E.

But the T3 rationale in all conditions says the product source is correct and the validator expectation is stale, and proposes updating the validator rather than modifying product source.

The frozen CURRENT LOCAL TASK is:
> modify product source for each non-zero validator.

Therefore the T3 rationale semantically leaves the frozen local task even though task_scope/action say REPLAN_LOCAL.

This means the only positive persistence observation in v1.2 is not clean behavioral evidence of actual local-task continuation.

Per preregistration it is **not post-hoc recoded**. The mechanical result remains 1/3.

## 5. Cost

Per decision:
- A: 1364.8 tokens / 4.39 s
- B: 1424.9 tokens / 4.84 s
- E: 1601.7 tokens / 5.11 s

Relative to A:
- B: ~4.4% token overhead
- E: ~17.4% token overhead

Because primary behavior was unchanged, both interventions are overhead on this corpus.

## 6. Combined inference

v1.2 answers the key methodological question raised by v1.1:

**Adding sequential history and the model's own prior decisions is not sufficient, by itself, to produce a robust local-task momentum effect in these explicit decision prompts.**

Baseline correctly exits at the first agreed shift in 2/3 sequences.
The remaining 1/3 mechanical persistence is semantically ambiguous and likely reflects task-boundary labeling rather than genuine continued product-source repair.

Therefore:
- robust controlled evidence for generic momentum remains weak;
- robust controlled evidence for success-specific LSCB remains weaker;
- the naturalistic research-process infrastructure episode remains stronger evidence that global reassessment omission can occur in real human-AI workflows;
- explicit decision prompts themselves may act as a de facto reassessment intervention.

## 7. Research pivot

Do not continue making increasingly elaborate prompt scenarios to force the phenomenon.

The next evidence source should be **real autonomous development traces**, where the agent is executing work rather than being asked an explicit meta-decision question.

Primary observational unit:
- a real development/research episode with a sequence of commits/actions/tool attempts;
- identify the first point where later evidence shows the global bottleneck shifted;
- count local actions after that point before a global replan;
- record whether success, repeated repair, Owner intervention, evidence stall, or measurement conflict preceded the replan.

This preserves the phenomenon's natural ecology.

## 8. Publication boundary after v1.2

Defensible:
- report the real infrastructure-drift episode as a naturalistic case;
- report v0.7's single matched success-triggered flip as proof-of-possibility only;
- report that controlled prompt experiments repeatedly hit ceiling/ontology/measurement problems;
- report v1.2 trigger detection 100% / control false-trigger 0% as a small process-detection result;
- report that B/E did not change behavior in v1.2.

Not defensible:
- universal LSCB effect;
- claim that STGR or multi-trigger reassessment improves Gemini behavior generally;
- population effect sizes;
- claims based on post-hoc semantic recoding.

## 9. Next gate

`REAL AGENT TRACE CORPUS → BLIND SHIFT-POINT ANNOTATION → POST-SHIFT ACTION COUNT → TRIGGER/OUTCOME ASSOCIATION → PROSPECTIVE FIELD GATE`

No further synthetic prompt pilot until that trace analysis is complete.
