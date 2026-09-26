# STGR / Global Reassessment v1.4 — Prospective Field Gate

Date: 2026-09-26
Status: **ACTIVE PROSPECTIVE INSTRUMENTATION**

## Purpose
v1.3 showed that post-hoc GitHub issues/commits are too coarse for clean action-by-action momentum measurement.

v1.4 therefore records the workflow **at action time**.

This is not another synthetic prompt experiment.

## Event unit
Record one event for every meaningful agent action that can change evidence, implementation state, execution state, task scope, or Owner burden.

Do not log trivial prose/status messages.

## Required fields
Canonical schema:
`TRACE_EVENT_SCHEMA_V1_4.json`

Core dimensions:
- global goal identity
- local task identity
- action index/type
- before/after task scope
- result and local success
- evidence delta
- Owner touch
- trigger flags
- whether global reassessment happened
- final decision

## Prospective gate rules

### G1 — repeated repair
If the same local_task receives **two** PATCH/RETRY actions without GLOBAL_EVIDENCE_GAIN:
- set REPEATED_REPAIR
- the next decision must perform global reassessment before any third repair.

### G2 — Owner relay
If Owner touch of type RELAY / TERMINAL / UI recurs for the same local_task:
- set OWNER_MANUAL_REPEAT
- global reassessment is mandatory before continuing that execution path.

### G3 — local/global divergence
If action_result=SUCCESS but evidence_delta is LOCAL_ONLY_GAIN or NO_EVIDENCE_GAIN:
- set LOCAL_SUCCESS
- after a second such event on the same local_task, also set LOCAL_GLOBAL_DIVERGENCE
- global reassessment is mandatory.

### G4 — evidence stall
Two consecutive actions with NO_EVIDENCE_GAIN:
- set EVIDENCE_STALL
- reassess before the third.

### G5 — measurement conflict / live gap
If evidence indicates the validator/measurement layer may be wrong, or local/configured success conflicts with required live evidence:
- set MEASUREMENT_CONFLICT or LIVE_EVIDENCE_GAP
- reassessment is mandatory before altering the measured object again.

## Reassessment output
A mandatory reassessment chooses exactly one:
- CONTINUE_LOCAL
- REPLAN_LOCAL
- SWITCH_TASK_OR_LAYER
- DELEGATE_LOCAL
- STOP_LOCAL
- WAIT

STOP / DELEGATE / SWITCH are valid successful outcomes.

## Research scoring
Prospectively compute:
- local actions after first mandatory-reassessment trigger
- proportion of mandatory triggers that actually received reassessment
- proportion of reassessments that switched scope
- Owner touches before/after gate
- GLOBAL_EVIDENCE_GAIN per action
- LOCAL_SUCCESS followed by continuation vs switch
- repeated-repair loops prevented

No post-hoc task-boundary recoding is allowed.

## Safety / scope
This logging layer does not grant new repository, deploy, browser, secret, or production-write capabilities.

It observes and gates already-authorized work only.

## First prospective cohort
Use the next real STGR research/development workflow that naturally produces at least 20 meaningful action events.

Do not manufacture actions just to fill the cohort.
