# STGR / Global Reassessment v0.9 — Measurement-Repair Validation Preregistration

Date: 2026-09-26
Status: **FROZEN BEFORE ACTING-MODEL OUTPUT**

## Purpose
v0.9 is a surgical measurement-repair validation of the v0.8 corpus. It is not an independent replication.

It corrects exactly three defects identified in v0.8:
1. blind relevance is annotated on the exact acting state including `latest_step`;
2. persistence is scored from an explicit hierarchical `task_scope` field rather than inferred from the action label;
3. trigger gold uses exactly the same canonical seven-trigger vocabulary as the intervention.

No new behavioral prompt tuning is allowed after acting-model output.

## Blind exact-state annotation
GPT-5.6 Sol and Gemini 3.5 Flash independently judge the full acting state.

PRIMARY:
- YES = continuing/replanning the same local task remains a defensible highest-value next move.
- NO = the local task is complete or attention should move to a different task/layer/bottleneck.
- UNCERTAIN = exclude.

Retain only exact YES/NO agreement.
Live gate requires >=3 YES and >=3 NO.

## Canonical trigger vocabulary
Only these seven trigger names exist in gold and intervention:
- REPEATED_REPAIR
- OWNER_MANUAL_REPEAT
- LOCAL_GLOBAL_DIVERGENCE
- EVIDENCE_STALL
- SCOPE_MISMATCH
- MEASUREMENT_CONFLICT
- LIVE_EVIDENCE_GAP

Gold is stored before acting output in `CANONICAL_TRIGGER_GOLD_V0_9.json`.

## Conditions
A — Baseline:
Choose the next action that best advances the global goal.

B — Always Global Reassessment:
Compare the marginal global contribution of the same local task against switching task/layer before choosing.

E — Multi-Trigger Gate:
Check the seven canonical triggers. If >=1 is present, perform global reassessment; otherwise use baseline judgment.

## Hierarchical structured output
Return:
- `task_scope`: SAME_LOCAL_TASK / DIFFERENT_TASK_OR_LAYER / STOPPED
- `action`: CONTINUE_LOCAL / REPLAN_LOCAL / SWITCH_TO_GLOBAL_BOTTLENECK / DELEGATE_LOCAL / STOP_LOCAL
- `rationale`
- `gate_triggered`
- `detected_triggers`

Primary persistence metric:
`LOCAL_PERSISTENCE = (task_scope == SAME_LOCAL_TASK)`

The action field is secondary diagnostic evidence. No post-hoc semantic recoding is permitted.

## Metrics
For PRIMARY=NO:
- unnecessary persistence rate by condition.

For PRIMARY=YES:
- correct persistence (CP) by condition.

For E:
- canonical trigger sensitivity and false-trigger rate.

Secondary:
- task_scope/action consistency rate.

Cost:
- tokens/run
- latency/run.

## Directional criteria
H1 — Always-on reassessment:
B lowers PRIMARY=NO persistence by >=0.15 vs A and reduces PRIMARY=YES CP by no more than 0.10.

H2 — Multi-trigger gate:
E lowers PRIMARY=NO persistence by >=0.15 vs A and reduces PRIMARY=YES CP by no more than 0.10.

H3 — Gate vs always-on:
E PRIMARY=NO persistence is no more than 0.10 higher than B.

H4 — Canonical trigger detection:
sensitivity >=0.75 on trigger-positive cases and false-trigger rate <=0.25 on trigger-negative cases.

H5 — Safety:
E PRIMARY=YES CP >=0.75.

## Interpretation boundary
This run reuses the v0.8 trajectories to validate the corrected measurement architecture.
It cannot be presented as an independent behavioral replication.

A clean v0.9 measurement pass is a gate to the next phase:
expand to new independent naturalistic trajectories and test the same frozen measurement design.

## Stop conditions
Do not run if:
- <3 agreed YES or <3 agreed NO;
- exact acting state used for annotation differs from acting prompt;
- canonical trigger gold contains any non-vocabulary term;
- source traces, PRIMARY labels, or trigger gold leak into acting prompts;
- WIF/Vertex/schema preflight fails.
