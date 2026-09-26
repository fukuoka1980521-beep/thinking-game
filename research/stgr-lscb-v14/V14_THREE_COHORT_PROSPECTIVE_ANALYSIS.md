# STGR / Global Reassessment v1.4 — Three-Cohort Prospective Analysis

Date: 2026-09-26
Status: **THREE REAL TASK FAMILIES / PROSPECTIVE SELECTIVITY OBSERVED**

## Cohorts

| Cohort | Real task family | Events | Mandatory trigger family observed | Owner touch |
|---|---|---:|---|---:|
| 001 | STGR instrumentation wiring / repair | 21 | YES | 0 |
| 002 | Development OS Issue #19 provider-policy update | 8 | NO | 0 |
| 003 | Development OS Issue #14 Owner manual-action gate | 6 | NO | 0 |

Combined meaningful events: **35**

## Evidence profile

### Cohort 001
- GLOBAL_EVIDENCE_GAIN: 12
- LOCAL_ONLY_GAIN: 4
- NEGATIVE_EVIDENCE: 5
- local success: 13
- mandatory trigger families:
  - LOCAL_GLOBAL_DIVERGENCE
  - REPEATED_REPAIR
  - LIVE_EVIDENCE_GAP
  - MEASUREMENT_CONFLICT

Three trigger episodes required prospective global reassessment before another mutating continuation.
Compliance: **3/3**
Mutating continuation before required reassessment: **0**

### Cohort 002
- GLOBAL_EVIDENCE_GAIN: 8/8
- LOCAL_ONLY_GAIN: 0
- NEGATIVE_EVIDENCE: 0
- mandatory trigger: 0
- task completed normally: source evidence -> bounded implementation -> CI PASS -> merge -> STOP

### Cohort 003
- GLOBAL_EVIDENCE_GAIN: 6/6
- LOCAL_ONLY_GAIN: 0
- NEGATIVE_EVIDENCE: 0
- mandatory trigger: 0
- task completed normally: discover missing runtime gate -> bounded implementation -> CI PASS -> merge -> STOP

## Central prospective observation

Across the two independent bounded Development OS tasks (Cohorts 002/003):

- successful local actions repeatedly occurred;
- those actions also produced GLOBAL_EVIDENCE_GAIN;
- the v1.4 mandatory gate did **not** fire.

In the repair-heavy Cohort 001:

- some successful actions produced only LOCAL_ONLY_GAIN;
- repeated repair / live evidence / measurement conflicts appeared;
- the gate required reassessment before further mutation.

This supports the process distinction:

`LOCAL SUCCESS alone != reason to stop`

but

`LOCAL SUCCESS + weak global contribution / repeated repair = reason to reassess`

That is materially closer to the original research hypothesis than the earlier synthetic action-label experiments.

## Selectivity result

Observed descriptive selectivity:
- trigger-rich task families: **1/3**
- trigger-free bounded task families: **2/3**
- false mandatory triggers in Cohorts 002/003: **0**
- Owner discovery/recovery/execution touches during all 35 logged events: **0**

The gate therefore did not behave as a blanket interruption mechanism.

## Real-world side result

Two existing Development OS tasks were completed while collecting independent prospective evidence:

### Issue #19
CrowdWorks provider-policy evidence was corrected:
- rejected browser/auto-send strategy retained as DEPRECATED;
- AI_DRAFT + OWNER_MANUAL_SEND recorded as the provider-approved path;
- exact-provider policy rejection now overrides capability/browser strategies;
- merged commit: `2002816f62b749a383056a52b2ebb2c0d72aade2`.

### Issue #14
Owner manual-action evidence gate was implemented:
- TARGET_IDENTITY_PROVEN
- TOOL_VERSION_PROVEN
- SYNTAX_VERIFIED
- PRECONDITIONS_PROVEN
- OWNER_ONLY_PROVEN
- MISTAKE_RESISTANCE_PROVEN
- first-divergence discipline after failed manual action
- clasp v3 deprecated-command rejection
- Owner discovery/recovery touch blocking
- merged commit: `824b888676dce17a0976c0a010cd38e3bdb3a4bf`.

## What is supported now

Descriptively supported:
1. prospective action-time logging is feasible in real work;
2. the gate can interrupt a trigger-rich repair sequence before another mutation;
3. successful globally useful local work is allowed to proceed without mandatory gate firing;
4. zero Owner touch was maintained across the three observed task families;
5. STOP/WAIT/REPLAN are all usable successful outcomes of reassessment.

Not yet supported:
- causal reduction in wasted actions versus an untreated baseline;
- population-level prevalence of LSCB;
- a universal threshold of two repairs/successes;
- generality outside these real task families.

## Remaining identification problem

The next bottleneck is now causal, not plumbing or task-scope measurement.

When a mandatory trigger appears, we observe the gated action, but not what the same agent would have done **without** the gate.

The next phase should therefore add a non-executing shadow counterfactual at natural trigger points:
- exact state frozen before reassessment;
- baseline model receives the state without gate language;
- result frozen before actual reassessment outcome is exposed;
- shadow output never controls execution;
- compare shadow local continuation against actual gated decision.

This directly targets whether the gate changes behavior, without returning to synthetic hand-written cases.
