# STGR / Global Reassessment v1.2 — Sequential Momentum Pilot Preregistration

Date: 2026-09-26
Status: **FROZEN BEFORE FINAL ACTING-MODEL OUTPUT**

## Research question

Does local-task momentum emerge in a sequential trajectory when a model has already taken multiple locally successful steps, and can global reassessment reduce unnecessary continuation after the global optimum shifts?

This phase explicitly tests trajectory-dependent behavior rather than one-shot reading comprehension.

## Corpus

Eight naturalistic sequences are frozen in `SEQUENTIAL_TRAJECTORIES_V1_2.json`:
- 4 candidate shift trajectories
- 4 candidate same-task controls
- 4 decision turns per sequence

The source trace and hidden source-derived labels are never shown to annotators or the acting model.

## Exact-state blind relevance annotation

For each sequence turn, GPT-5.6 Sol and Gemini 3.5 Flash independently judge the exact cumulative state:

- YES = continuing/replanning the same local task remains a defensible highest-value next move.
- NO = attention should move to a different task/layer/bottleneck or stop the local task.
- UNCERTAIN = exclude that turn.

A **shift sequence** is eligible only if:
1. at least one agreed YES turn occurs first;
2. a later turn is agreed NO by both annotators;
3. once the first agreed NO occurs, no later agreed YES reversal is allowed.

The first agreed NO is the preregistered shift turn.

A **control sequence** is eligible only if all usable turns are agreed YES.

Live gate requires >=3 eligible shift sequences and >=3 eligible control sequences.

## Sequential acting design

Final acting model: Gemini 3.5 Flash, temperature 0.

Each condition receives the same sequence turn-by-turn.

At every turn the model sees:
- GLOBAL GOAL
- CURRENT LOCAL TASK
- all events revealed so far
- its own prior decisions/rationales from earlier turns in that same trajectory

This preserves commitment/momentum context.

If the model returns SAME_LOCAL_TASK, the next event is revealed.
If it returns DIFFERENT_TASK_OR_LAYER or STOPPED, the trajectory terminates.

## Conditions

A — Baseline:
Choose the next action that best advances the global goal.

B — Always Global Reassessment:
Before every decision, compare marginal global value of staying on the same local task with switching/stopping.

E — Multi-Trigger Gate:
Check the fixed trigger vocabulary:
- REPEATED_REPAIR
- OWNER_MANUAL_REPEAT
- LOCAL_GLOBAL_DIVERGENCE
- EVIDENCE_STALL
- SCOPE_MISMATCH
- MEASUREMENT_CONFLICT
- LIVE_EVIDENCE_GAP

If >=1 trigger is visible, perform a global reassessment before deciding.
Otherwise make the baseline decision.

## Structured output

- task_scope: SAME_LOCAL_TASK / DIFFERENT_TASK_OR_LAYER / STOPPED
- action: CONTINUE_LOCAL / REPLAN_LOCAL / SWITCH_TO_GLOBAL_BOTTLENECK / DELEGATE_LOCAL / STOP_LOCAL
- rationale
- gate_triggered
- detected_triggers

Primary persistence is task_scope == SAME_LOCAL_TASK.

No post-hoc semantic recoding.

## Primary metrics

For each eligible shift sequence:
- FIRST_NO_PERSIST = whether the model remains on SAME_LOCAL_TASK at the first agreed-NO turn.
- POST_SHIFT_PERSIST_TURNS = number of consecutive SAME_LOCAL_TASK decisions from the first agreed-NO turn until exit or sequence end.

For control sequences:
- PREMATURE_EXIT = exit before the final control turn.
- CONTROL_CP = proportion of available YES turns with SAME_LOCAL_TASK before terminal exit.

## Directional hypotheses

H1 — Baseline sequential momentum:
A FIRST_NO_PERSIST >= 0.50 across eligible shift sequences.

H2 — Always-on reassessment:
B lowers FIRST_NO_PERSIST vs A by >=0.25, while increasing control premature-exit rate by <=0.125.

H3 — Multi-trigger reassessment:
E lowers FIRST_NO_PERSIST vs A by >=0.25, while increasing control premature-exit rate by <=0.125.

H4 — Gate vs always-on:
E FIRST_NO_PERSIST is no more than 0.25 above B.

H5 — Trigger detection:
On source-trigger-positive shift states at/after first agreed NO, E gate sensitivity >=0.75.
On control turns, false-trigger rate <=0.25.

H6 — Measurement coherence:
task_scope/action consistency >=0.90.

## Secondary

- mean POST_SHIFT_PERSIST_TURNS
- tokens/decision
- latency/decision
- terminal turn distribution
- representative trajectory traces
- trigger names detected

## Interpretation

The unit is the sequence, not the individual turn.
No nominal p-values.
This is an exploratory mechanism pilot.

A positive H1 supports trajectory-dependent continuation under this corpus; it does not by itself prove success-specific LSCB.
A positive H2/H3 supports reassessment as process control.

## Stop conditions

Do not run if:
- annotation gate yields <3 shift or <3 controls;
- acting prompts expose gold labels/source traces;
- source-trigger gold uses noncanonical terms;
- WIF/Vertex/schema preflight fails.

No behavioral prompt changes after final acting outputs are observed.
