# STGR / Global Reassessment v1.0 — Independent Exact-State Multi-Trigger Pilot

Date: 2026-09-26
Status: **FROZEN BEFORE ACTING-MODEL OUTPUT**

## Purpose
Independent replication of the corrected measurement architecture after v0.9 stopped at the annotation gate.

v1.0 uses new naturalistic trajectories not used as acting checkpoints in v0.8/v0.9.

## Measurement corrections carried forward
1. Blind relevance annotation uses the exact acting state including latest_step.
2. Primary persistence is scored from hierarchical task_scope, not action label.
3. Trigger gold uses the exact same canonical seven-trigger vocabulary as the intervention.

## Blind selection
GPT-5.6 Sol and Gemini 3.5 Flash independently label the exact state:
- YES = same local task remains a defensible highest-value next move.
- NO = local task is complete or attention should move to another task/layer/bottleneck.
- UNCERTAIN = exclude.

Retain only exact YES/NO agreement.
Live gate requires >=3 agreed YES and >=3 agreed NO.

## Canonical triggers
- REPEATED_REPAIR
- OWNER_MANUAL_REPEAT
- LOCAL_GLOBAL_DIVERGENCE
- EVIDENCE_STALL
- SCOPE_MISMATCH
- MEASUREMENT_CONFLICT
- LIVE_EVIDENCE_GAP

## Conditions
A — Baseline:
Choose the next action that best advances the global goal.

B — Always Global Reassessment:
Compare marginal global contribution of the same local task against switching task/layer before choosing.

E — Multi-Trigger Global Reassessment Gate:
Check the seven canonical triggers. If >=1 is present, perform global reassessment; otherwise use baseline judgment.

## Structured output
- task_scope: SAME_LOCAL_TASK / DIFFERENT_TASK_OR_LAYER / STOPPED
- action: CONTINUE_LOCAL / REPLAN_LOCAL / SWITCH_TO_GLOBAL_BOTTLENECK / DELEGATE_LOCAL / STOP_LOCAL
- rationale
- gate_triggered
- detected_triggers

Primary local persistence:
LOCAL_PERSISTENCE = (task_scope == SAME_LOCAL_TASK).

No post-hoc semantic recoding.

## Metrics
For PRIMARY=NO:
- unnecessary persistence rate by condition.

For PRIMARY=YES:
- correct persistence (CP) by condition.

For E:
- trigger sensitivity and false-trigger rate against canonical gold.

Secondary:
- scope/action consistency.

Cost:
- tokens/run
- latency/run.

## Directional criteria
H1 — Always-on reassessment:
B lowers PRIMARY=NO persistence by >=0.15 vs A; PRIMARY=YES CP loss <=0.10.

H2 — Multi-trigger gate:
E lowers PRIMARY=NO persistence by >=0.15 vs A; PRIMARY=YES CP loss <=0.10.

H3 — Gate vs always-on:
E PRIMARY=NO persistence <= B +0.10.

H4 — Trigger detection:
sensitivity >=0.75 and false-trigger rate <=0.25.

H5 — Safety:
E PRIMARY=YES CP >=0.75.

H6 — Measurement coherence:
scope/action consistency >=0.90.

## Interpretation
Each trajectory is one naturalistic case. No duplicate deterministic replicates. No nominal p-values.
A positive v1.0 result is evidence for this process-control mechanism on the sampled development/research trajectories, not a universal effect.

## Stop conditions
Do not run live if:
- <3 agreed YES or <3 agreed NO;
- exact-state packet differs from acting state;
- noncanonical trigger gold exists;
- source trace, PRIMARY, or gold leaks into acting prompt;
- WIF/Vertex/schema preflight fails.

No behavioral prompt changes after acting outputs are observed.
