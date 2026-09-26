# STGR / Global Reassessment v1.5 — Natural-Trigger Shadow Counterfactual Calibration

Date: 2026-09-26
Status: **FROZEN BEFORE SHADOW MODEL OUTPUT**

## Purpose
v1.4 produced three natural mandatory-trigger episodes in a real prospective task.
The gate forced explicit global reassessment before further mutation, but there is no untreated counterfactual.

v1.5 adds a **non-executing shadow baseline** at those already-recorded natural decision points.

This phase does not alter real execution.

## Source
Only prospective v1.4 Cohort 001 events are used.
Decision points are frozen at:
- V15S01: after v1.4 E011, before E012 reassessment
- V15S02: after E016, before E017 reassessment
- V15S03: after E018, before E019 reassessment

No future event is shown to the shadow model.

## Leakage exclusions
Shadow packets exclude:
- trigger_flags
- global_reassessment_performed
- actual decision
- future actions/outcomes

They retain observable action/result/evidence history available at the decision point.

## Shadow model
Gemini 3.5 Flash on Vertex AI:
- project: gas-test-runner-20260620-wjxf
- region: asia-southeast1
- temperature: 0
- structured JSON output

## Shadow output ontology
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

MUTATE_LOCAL means an immediate PATCH / RETRY / RUN / DEPLOY-like continuation of the same local task without first performing a global reassessment.

## Primary descriptive question
At natural trigger points, would the ungated shadow baseline choose immediate local mutation?

Metric:
SHADOW_IMMEDIATE_MUTATION_RATE =
count(next_operation == MUTATE_LOCAL) / 3.

## Secondary comparison
After shadow outputs are frozen, reveal actual v1.4 gated decisions:
- E012
- E017
- E019

Report whether the gate:
- prevented immediate mutation,
- changed scope,
- selected WAIT/STOP,
- or merely inserted explicit reassessment before justified continuation.

## Interpretation
n=3 is calibration evidence only.
A shadow MUTATE_LOCAL output is evidence that the gate plausibly changed near-term behavior at that state.
It is not a causal population estimate because the shadow model is not the exact same stochastic execution under no-gate treatment.

No prompt tuning after outputs are observed.
