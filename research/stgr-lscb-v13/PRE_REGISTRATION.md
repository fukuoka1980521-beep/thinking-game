# STGR / Global Reassessment v1.3 — Real Agent Trace Observational Preregistration

Date: 2026-09-26
Status: **FROZEN BEFORE SHIFT-POINT ANNOTATION**

## Objective
Move from synthetic/meta-decision prompts to source-backed real development/research traces.

Primary question:
After the global bottleneck has shifted in a real workflow, how many same-local-task actions occur before the workflow globally replans or exits?

## Corpus
Six source-backed traces in REAL_AGENT_TRACE_CORPUS_V1_3.json.
Four candidate drift/shift episodes and two candidate controls.

Annotators see:
- global_goal
- local_task
- events cumulatively, one event boundary at a time

Annotators do NOT see:
- outcome
- hidden_trigger_candidates
- source repository names/commit hashes as cues

## Blind shift-point annotation
GPT-5.6 Sol and Gemini 3.5 Flash independently answer for each event boundary:

SHIFT_STATUS:
- STAY = same local task remains a defensible highest-value next move
- SHIFT = attention should move to another task/layer/architecture/evidence objective
- UNCERTAIN = insufficient evidence

The first event boundary with exact SHIFT agreement, after at least one prior STAY agreement, is the blind shift point.

A control trace has no agreed SHIFT before trace completion.

## Observational scoring
Using the actual source-backed events after annotation:

POST_SHIFT_LOCAL_ACTIONS =
number of subsequent actual actions that remain on the originally defined local_task before the trace first globally replans/exits.

REPLAN_LATENCY_EVENTS =
event index of actual global replan minus blind shift event index.

No model-generated acting decisions are added.

## Trigger association
For each shift episode, record whether source evidence before/at actual replan contains:
- REPEATED_REPAIR
- OWNER_MANUAL_REPEAT
- LOCAL_GLOBAL_DIVERGENCE
- EVIDENCE_STALL
- SCOPE_MISMATCH
- MEASUREMENT_CONFLICT
- LIVE_EVIDENCE_GAP

These are descriptive associations, not causal estimates.

## Primary descriptive outputs
- number of eligible real shift episodes
- distribution of POST_SHIFT_LOCAL_ACTIONS
- proportion with >=1 post-shift local action
- proportion with >=2 post-shift local actions
- median REPLAN_LATENCY_EVENTS
- trigger frequencies
- control false-shift rate

## Interpretation
This phase is observational.
It can establish that delayed global reassessment occurs in real traces and characterize its ecology.
It cannot isolate success-specific causality or estimate a population effect.

## Stop rule
If fewer than 3 eligible shift episodes survive blind agreement, expand the independent trace corpus before computing aggregate claims.
