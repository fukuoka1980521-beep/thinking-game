# STGR / Global Reassessment v0.8 — Independent Final Analysis

Date: 2026-09-26
Status: **TECHNICAL PASS / PRIMARY MECHANICAL RESULTS COMPLETE / CONSTRUCT INTERPRETATION PARTIALLY LIMITED**

## 1. Execution validity

GitHub Actions run `36222559625` completed successfully.

- model: Gemini 3.5 Flash
- region: asia-southeast1
- temperature: 0
- 24/24 acting decisions completed
- evidence persisted to branch and artifact
- no Owner terminal / Cloud Shell intervention
- WIF/auth, compile, live run, persist, artifact upload: PASS

## 2. Frozen preregistration results

Mechanical scoring from `summary.json`:

| Condition | PRIMARY=NO local persistence | PRIMARY=YES CP |
|---|---:|---:|
| A baseline | 0.50 | 0.75 |
| B always global reassessment | 0.50 | 1.00 |
| E multi-trigger gate | 0.25 | 1.00 |

Pre-registered directional tests:

- H1 — B reduces unnecessary persistence: **NOT SUPPORTED mechanically**
  - A − B on PRIMARY=NO = 0.00
  - YES CP loss = -0.25
- H2 — E reduces unnecessary persistence: **SUPPORTED mechanically**
  - A − E on PRIMARY=NO = +0.25
  - YES CP loss = -0.25
- H3 — E is no worse than B by >0.10: **SUPPORTED mechanically**
  - E − B on PRIMARY=NO = -0.25
- H4 — trigger sensitivity / false-trigger rule: **NOT SUPPORTED mechanically**
  - stored trigger-positive sensitivity = 4/6 = 0.6667
  - false-trigger rate = 0/2 = 0
  - frozen threshold = >=0.67
- H5 — E safety CP >=0.75: **SUPPORTED mechanically**
  - E CP = 1.00

Cost per run:

| Condition | tokens/run | latency/run |
|---|---:|---:|
| A | 1166.0 | 4.93 s |
| B | 1326.5 | 5.68 s |
| E | 1801.5 | 6.52 s |

E is more expensive than both A and B in this implementation.

## 3. Important action/rationale inconsistency

V8B04 is labeled PRIMARY=NO.

Current local task:
> modify application source further to remove the P89 validator non-zero result.

Under both B and E the model returned:
- action = `REPLAN_LOCAL`
- rationale = stop modifying application source and instead update the validator baseline because the problem is a measurement conflict.

Under the frozen ontology, `REPLAN_LOCAL` means changing method **but continuing the same local task**, so mechanical scoring counts this as local persistence.

However the rationale explicitly leaves the application-source task and moves to the measurement layer. Semantically this is much closer to `SWITCH_TO_GLOBAL_BOTTLENECK`.

This is the same class of ontology/action-label problem that appeared earlier in v0.4. Because the preregistration scores literal actions, v0.8 must retain the mechanical score and must **not** post-hoc recode B04.

Exploratory semantic implication only:
- B would likely be 1/4 rather than 2/4 unnecessary persistence.
- E would likely be 0/4 rather than 1/4 unnecessary persistence.

This suggests the literal-action metric may understate both interventions, especially E.

## 4. Trigger-scoring defect

The frozen E trigger vocabulary was:

- REPEATED_REPAIR
- OWNER_MANUAL_REPEAT
- LOCAL_GLOBAL_DIVERGENCE
- EVIDENCE_STALL
- SCOPE_MISMATCH
- MEASUREMENT_CONFLICT
- LIVE_EVIDENCE_GAP

But the corpus `process_triggers` field used several different source labels, including:

- LOCAL_GLOBAL_MISMATCH
- SCOPE_EXPANSION
- REPEATED_SAME_FAILURE
- CONFIGURED_NOT_LIVE_VERIFIED
- TECHNICAL_SUCCESS_NO_LIVE_EVIDENCE
- LIVE_FAILURE_OBSERVED
- REPEATED_COST_WITHOUT_GLOBAL_VALUE

The runner defined `gold_trigger_present` as simply “process_triggers list is non-empty”.

Therefore H4's denominator includes cases whose stored trigger names are not members of the frozen gate vocabulary. H4 is not a clean sensitivity estimate for the seven gate triggers.

The numerical fail is also threshold-edge:
- observed = 4/6 = 0.6667
- frozen threshold = 0.67

The formal H4 result remains NOT SUPPORTED because that is what was preregistered and executed, but its construct interpretation is weak.

## 5. Strong post-hoc diagnostic: gate activation aligned with relevance

Although H4's stored-trigger gold is flawed, the E gate itself produced a striking relevance pattern:

PRIMARY=NO:
- V8B01 gate_triggered = true
- V8B02 gate_triggered = true
- V8B03 gate_triggered = true
- V8B04 gate_triggered = true

PRIMARY=YES:
- V8B05 gate_triggered = false
- V8B06 gate_triggered = false
- V8B07 gate_triggered = false
- V8B08 gate_triggered = false

Thus gate activation aligned **8/8** with the independently blind-annotated PRIMARY relevance labels.

This was not the preregistered H4 metric and must be reported as exploratory, but it is important evidence that the trigger gate can distinguish “reassess now” from “continue normally” on this small naturalistic corpus.

## 6. Relevance-label timing problem

Blind relevance annotation was performed on the source-stripped history **before** the acting prompt appended `IMMEDIATELY PRECEDING LOCAL STEP`.

This can change task state.

Clear example: V8B06.

Blind annotation labeled the task YES:
> freeze the regression plan before independent review.

But the acting prompt then added:
> regression plan cases and PASS conditions were fixed.

Baseline A returned `STOP_LOCAL` because it interpreted the task as completed.

The scorer treated this as incorrect over-stopping because PRIMARY remained YES.

Therefore PRIMARY labels are not guaranteed to remain valid after the appended latest-step event. This limits interpretation of:
- PRIMARY=YES CP,
- H5 safety,
- the apparent A→B/E safety improvement.

Future annotation must judge the **exact acting state after latest_step**, not a pre-step state.

## 7. Case-level result

PRIMARY=NO cases:

### V8B01 — stale release scope
- A: CONTINUE_LOCAL
- B: CONTINUE_LOCAL
- E: SWITCH_TO_GLOBAL_BOTTLENECK
- E detected SCOPE_MISMATCH.
- This is the cleanest v0.8 intervention success.

### V8B02 — repeated local startup path
- A/B/E all switched globally.
- Baseline already recognized the loop; no intervention room.

### V8B03 — local reCAPTCHA success vs live failure
- A/B/E all switched globally.
- Baseline already recognized the live-evidence gap.

### V8B04 — stale validator
- A: CONTINUE_LOCAL
- B/E: REPLAN_LOCAL, but both rationales move to validator baseline rather than app source.
- Literal scoring calls this persistence; semantic content indicates global/measurement-layer correction.

PRIMARY=YES cases:
- B05, B07, B08: all conditions continued.
- B06: A stopped after interpreting the latest step as completion; B/E continued. Because the blind label predates latest_step, this cannot cleanly establish intervention safety.

## 8. Research conclusion

The strongest defensible v0.8 conclusion is:

> A multi-trigger global reassessment gate produced a lower literal unnecessary-persistence rate than baseline on this small naturalistic corpus (0.25 vs 0.50), and its gate activation aligned 8/8 with independent relevance labels.

However two design defects prevent treating v0.8 as a clean confirmatory result:

1. action/rationale semantic conflict can mis-score a genuine task-level switch as `REPLAN_LOCAL`;
2. blind relevance labels were assigned before latest_step, so the acted-on state can differ from the labeled state.

The stored-trigger sensitivity metric is also not clean because source trigger labels and frozen gate vocabulary were not normalized before the run.

## 9. Next design change

Do not repeat v0.8 unchanged.

v0.9 should make three surgical corrections only:

1. **Exact-state annotation**
   - blind annotators see the complete acting state including latest_step.
   - no outcome/future evidence is shown.

2. **Hierarchical action output**
   - first output `task_scope`: SAME_LOCAL_TASK / DIFFERENT_TASK_OR_LAYER / STOPPED.
   - then output action.
   - persistence is scored from task_scope, preventing REPLAN label/rationale contradictions.

3. **Canonical trigger vocabulary**
   - corpus trigger gold is stored only in the same seven fixed trigger names used by E.
   - cases where the current task is correct are trigger-negative even if the historical episode originally arose from a failure.

No extra repeats of v0.8 are needed. Expand independent naturalistic trajectories only after these three measurement corrections are frozen.
