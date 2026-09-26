# STGR / Global Reassessment v1.4 — Cross-Cohort Analysis after Cohort 002

Date: 2026-09-26
Status: **TWO INDEPENDENT REAL TASK FAMILIES OBSERVED**

## Cohorts

### Cohort 001 — instrumentation wiring
- trace: V14-COHORT-001
- meaningful events: 21
- trigger-rich implementation/repair task
- mandatory trigger episodes: 3
- Owner touch: 0

### Cohort 002 — provider-policy evidence update
- trace: V14-COHORT-002
- meaningful events: 8
- independent ordinary Development OS task (Issue #19)
- mandatory trigger episodes: 0
- Owner touch: 0
- issue completed and closed

Combined events: **29**

## Contrast

| Metric | Cohort 001 | Cohort 002 |
|---|---:|---:|
| Events | 21 | 8 |
| GLOBAL_EVIDENCE_GAIN | 12 | 8 |
| LOCAL_ONLY_GAIN | 4 | 0 |
| NEGATIVE_EVIDENCE | 5 | 0 |
| Mandatory trigger families observed | 4 | 0 |
| Explicit reassessments | 4 | 2* |
| Owner touches | 0 | 0 |
| Final STOP | 0 | 1 |

* Cohort 002 reassessments are task-boundary start/closure decisions, not mandatory-trigger interventions.

## Prospective behavior

Cohort 001:
- trigger episodes = 3
- trigger episodes followed by reassessment before another mutating continuation = **3/3**
- mutating continuation between trigger and reassessment = **0**

Cohort 002:
- no mandatory trigger was generated
- no repair loop, evidence stall, owner-relay recurrence, live-evidence gap, or measurement conflict occurred
- gate therefore did not interrupt the ordinary bounded flow
- task reached CI PASS -> merge -> STOP

This is the first useful cross-task contrast in v1.4:

> The prospective gate intervened in the trigger-rich repair task and stayed out of the way in an independent evidence-rich bounded task.

## Research meaning

This is still not a causal effectiveness estimate. There is no randomized untreated counterfactual.

However it strengthens two narrower observations:

1. **Feasibility:** trigger detection and reassessment can operate during real work rather than only in synthetic prompts.
2. **Selectivity:** the gate did not fire merely because a task had multiple successful local actions. In Cohort 002, successive local successes also delivered GLOBAL_EVIDENCE_GAIN, so no LOCAL_GLOBAL_DIVERGENCE trigger appeared.

That distinction matters for the original mechanism:
- local success alone should not stop work;
- local success with weak/no global contribution is the relevant risk signal.

## Important example

Cohort 002 contained five local-success events, but every one contributed GLOBAL_EVIDENCE_GAIN.
The system continued through:
- source-backed reclassification
- matcher hard-stop implementation
- regression PASS
- merge
- closure

No unnecessary global reassessment was forced.

In Cohort 001, by contrast, repeated local-only repair generated LOCAL_GLOBAL_DIVERGENCE / REPEATED_REPAIR and forced review before another mutation.

This is the clearest real-work support so far for the design principle:

`Local Success × Global Contribution`

rather than:

`Local Success -> stop`

## Current boundary

Supported descriptively:
- gate compliance 3/3 in the trigger-rich cohort
- zero Owner touch across 29 events
- no mandatory false trigger in the independent trigger-free task
- successful local work with global evidence is allowed to continue
- local-only/repeated repair is interrupted for reassessment

Not yet supported:
- population-level reduction in wasted actions
- causal superiority versus no-gate execution
- success-specific LSCB prevalence
- generality across many projects/tasks

## Next evidence requirement

Do not add more instrumentation features.

Wait for or use a third ordinary real task family.
Priority should be a task where:
- the correct next action is not obvious in advance;
- evidence can either accumulate globally or stall locally;
- the gate may naturally fire, but actions are not manufactured to make it fire.

The self-hosted Orchestrator smoke (Development OS Issue #51) remains WAIT because the authorized runner is offline. Do not turn that availability state into another code-repair loop.
