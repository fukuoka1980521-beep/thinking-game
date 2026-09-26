# STGR / LSCB — Research Goal Integrity Gate

Date: 2026-09-26
Status: **ACTIVE FOR ALL NEXT STGR/LSCB WORK**

## Purpose

Prevent the research process from reproducing the same failure mode it is trying to study: locally successful work continuing after its marginal value to the global research objective has fallen.

## Global objective

Obtain defensible evidence about:
1. generic global-relevance neglect / local task persistence;
2. any additional success-specific continuation effect (LSCB);
3. whether STGR improves global decisions without harmful over-stopping.

Infrastructure, prompt wording, runner code, and UI are supporting means, not ends.

## Mandatory trigger

Run this gate after **every**:
- live experiment;
- technical failure;
- scoring/protocol defect;
- repeated execution friction;
- Owner relevance objection;
- second repair in the same subsystem.

Two consecutive local repairs automatically force a global review before another repair.

## Gate questions

### G1 — Evidence delta
What new evidence about the global research question will the proposed next action produce?

If the answer is only “make the current mechanism work,” mark it SUPPORTING, not GOAL-DIRECT.

### G2 — Bottleneck shift
Has the primary bottleneck moved from experiment content to measurement, execution architecture, sampling, or construct validity?

If yes, stop optimizing the old bottleneck.

### G3 — Recurrence
Has substantially the same failure or manual intervention occurred before?

If yes, do not issue another local workaround. Replace the architecture or stop the route.

### G4 — Owner removal
Can the next architecture remove the Owner from repeated relay/terminal/UI work?

If yes, prefer it over another reversible local patch unless there is a strong evidence reason not to.

### G5 — Construct validity
Would a successful run actually distinguish the competing hypotheses?

If baseline is at a ceiling/floor or the prompt leaks the gold answer, stop before the full run.

### G6 — Stop/delegate success
Treat STOP, DELEGATE, RETURN_TO_GOAL, and architecture replacement as valid successes when they improve global evidence efficiency.

## Decision classes

- **GOAL-DIRECT** — directly increases discriminating evidence.
- **SUPPORTING** — necessary infrastructure/measurement work.
- **LOCAL-OPTIMIZATION** — improves a subcomponent without resolving the current global bottleneck.
- **GOAL-BLOCKER** — prevents valid inference or execution.

Priority order:
1. GOAL-BLOCKER removal
2. GOAL-DIRECT evidence
3. SUPPORTING work
4. LOCAL-OPTIMIZATION only when explicitly justified

## Loop breaker

If the same path receives two LOCAL-OPTIMIZATION or SUPPORTING fixes without a measurable evidence delta:

`PATCH LOOP DETECTED → GLOBAL GOAL REVIEW`

No third patch is allowed before reassessment.

## Current application

The repeated Cloud Shell workaround triggered this gate.

Global review found:
- the recurring problem was execution architecture, not individual shell commands;
- Owner relay was unnecessary;
- GitHub Actions + repository-scoped Google WIF dominated another Cloud Shell patch.

Action taken:
- manual Cloud Shell removed from the critical path;
- permanent GitHub→GCP route implemented and validated;
- v0.6 calibration then correctly stopped at 0/8 local persistence rather than consuming the full experiment budget.

## Next research gate

No v0.7 live experiment is allowed until:

`REAL TRAJECTORY CORPUS → BLIND BOTTLENECK ANNOTATION → COUNTERFACTUAL PAIRS → STATIC AUDIT → PREREGISTRATION`

This gate is part of the research method, not merely project management.
