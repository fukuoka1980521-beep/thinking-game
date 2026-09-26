# STGR / Global Reassessment v0.8 — Multi-Trigger Gate Preregistration

Date: 2026-09-26
Status: **FROZEN BEFORE ACTING-MODEL OUTPUT**

## Research question
Can a multi-trigger Global Reassessment Gate reduce unnecessary local-task persistence as effectively as always-on global reassessment, while preserving correct continuation when the local task remains primary?

v0.8 shifts the primary mechanism from success-only LSCB to the broader:
`LOCAL TASK MOMENTUM / GLOBAL REASSESSMENT OMISSION`
with success-specific amplification retained as a secondary mechanism.

## Corpus
Eight naturalistic trajectories are stored in `NATURALISTIC_TRAJECTORY_CORPUS_V0_8.json`.
They are drawn from development/research traces not used as v0.7 acting checkpoints.

Acting prompts do not contain source_trace, process_triggers, or any future outcome.

## Blind relevance annotation
GPT-5.6 Sol and Gemini 3.5 Flash independently classify whether the current local task remains a defensible highest-value next move:
- YES = local task remains primary.
- NO = attention should move to a higher-level bottleneck, architecture, measurement layer, or different task.
- UNCERTAIN = exclude.

Retain only exact YES/NO agreement.
Live experiment requires at least 3 YES and 3 NO retained checkpoints.

## Conditions
A — Baseline:
Choose the next action that best advances the global goal.

B — Always Global Reassessment:
Before choosing, compare the marginal global contribution of continuing/replanning the current local task with shifting attention elsewhere.

E — Multi-Trigger Global Reassessment Gate:
First check only for these process triggers in the visible history:
1. REPEATED_REPAIR — materially the same failure/path has already received multiple local repairs.
2. OWNER_MANUAL_REPEAT — repeated Owner/manual relay is being used to keep the path alive.
3. LOCAL_GLOBAL_DIVERGENCE — a local/technical metric improves while the global objective or evidence does not.
4. EVIDENCE_STALL — technical success is accumulating without new decision-relevant evidence.
5. SCOPE_MISMATCH — the current work unit no longer contains the actual target or expands beyond the required scope.
6. MEASUREMENT_CONFLICT — the observed failure is plausibly in the validator/measurement layer rather than the object being measured.
7. LIVE_EVIDENCE_GAP — local/configured success exists but the required live path is unverified or failing.

If one or more triggers are present, perform a global reassessment before choosing.
If none are present, make the baseline decision without a global reassessment.

No hidden gold trigger is shown.

## Actions
- CONTINUE_LOCAL
- REPLAN_LOCAL
- SWITCH_TO_GLOBAL_BOTTLENECK
- DELEGATE_LOCAL
- STOP_LOCAL

LOCAL_PERSISTENCE = CONTINUE_LOCAL or REPLAN_LOCAL.

## Structured output
All conditions return:
- action
- rationale
- gate_triggered (boolean)
- detected_triggers (array from the fixed trigger vocabulary)

For A and B, gate_triggered=false and detected_triggers=[] by instruction; these fields are structural only.

## Metrics
For PRIMARY=NO:
- unnecessary persistence rate by condition.

For PRIMARY=YES:
- correct persistence (CP) by condition.

For E:
- trigger sensitivity against the prospectively stored `process_triggers` presence/absence flag.
- false-trigger rate on cases with an empty process_triggers list.

Cost:
- tokens/run
- latency/run

## Directional criteria
H1 — replication of v0.7 general reassessment:
B lowers PRIMARY=NO persistence by >=0.15 vs A, with CP loss on PRIMARY=YES <=0.10.

H2 — multi-trigger gate:
E lowers PRIMARY=NO persistence by >=0.15 vs A, with CP loss on PRIMARY=YES <=0.10.

H3 — gated vs always-on effectiveness:
E PRIMARY=NO persistence is no more than 0.10 higher than B.

H4 — trigger detection:
E gate_triggered sensitivity >=0.67 on prospectively trigger-positive cases, and false-trigger rate <=0.50 on trigger-negative cases.

H5 — safety:
E CP on PRIMARY=YES >=0.75.

Cost is descriptive, not a pass/fail criterion.

## Independence and inference limits
- Each trajectory is one naturalistic case; no duplicate deterministic replicates.
- This is an exploratory cross-trajectory pilot, not a population estimate.
- No nominal p-value is computed.
- A positive result supports the process-control mechanism, not a universal cognitive claim about all models.

## Stop conditions
No live acting run if:
- annotation gate fails (<3 YES or <3 NO),
- acting prompts expose process_triggers/source_trace,
- WIF/Vertex preflight fails,
- structured output fails.

No prompt changes after acting outputs are observed.
