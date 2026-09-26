# STGR / Global Reassessment v1.6 — Leakage-Corrected Shadow Baseline

Date: 2026-09-26
Status: **FROZEN BEFORE MODEL OUTPUT**

## Purpose
Repair the v1.5 shadow-baseline contamination without changing the underlying three natural v1.4 decision points.

v1.5 is invalid for inference because its packets exposed normative reassessment language.

## Decision points
- V16S01: after Cohort 001 E011, before E012
- V16S02: after E016, before E017
- V16S03: after E018, before E019

## Visible information
Each packet may include only:
- global_goal_id
- local_task_id
- action_index
- action_type
- action_result
- evidence_delta
- local_success
- neutral factual event_summary

## Forbidden leakage
Visible packets must not contain:
- trigger names
- trigger_flags
- “global reassessment” or equivalent treatment instruction
- mandatory-gate rules
- actual future gated decision
- statements such as “do not apply another repair”
- future outcomes

Prior real events may include a REPLAN/WAIT action if they occurred before the current decision point, but their summaries must remain factual and non-normative.

## Shadow model
Gemini 3.5 Flash, Vertex AI, temperature 0.

## Output
next_operation:
- OBSERVE_OR_TEST
- MUTATE_LOCAL
- WAIT
- SWITCH_TASK_OR_LAYER
- STOP_LOCAL

task_scope:
- SAME_LOCAL_TASK
- DIFFERENT_TASK_OR_LAYER
- STOPPED

## Primary calibration metric
SHADOW_IMMEDIATE_MUTATION_RATE =
count(next_operation == MUTATE_LOCAL) / 3.

## Comparison
After outputs are frozen, compare against actual v1.4 next decisions:
- S01 actual: REPLAN_LOCAL at E012
- S02 actual: WAIT at E017
- S03 actual: REPLAN_LOCAL at E019

This remains calibration evidence only (n=3; shadow model is not the exact untreated execution).
