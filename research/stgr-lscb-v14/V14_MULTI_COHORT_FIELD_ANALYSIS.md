# STGR / Global Reassessment v1.4 — Multi-Cohort Field Analysis

Date: 2026-09-26
Status: **35 REAL PROSPECTIVE EVENTS / 3 INDEPENDENT TASK FAMILIES**

## Cohorts

### Cohort 001 — STGR instrumentation wiring
- events: 21
- mandatory trigger episodes: 3
- global reassessments before another mutating continuation: 3/3
- mutating actions after trigger and before reassessment: 0
- Owner touches: 0

Trigger episodes:
1. REPEATED_REPAIR + LOCAL_GLOBAL_DIVERGENCE → REPLAN_LOCAL
2. LIVE_EVIDENCE_GAP → WAIT
3. MEASUREMENT_CONFLICT → REPLAN_LOCAL

### Cohort 002 — CrowdWorks provider-policy hard stop
- events: 8
- mandatory trigger episodes: 0
- GLOBAL_EVIDENCE_GAIN: 8/8
- Owner touches: 0
- final decision: STOP_LOCAL after acceptance completion

The task stayed bounded. The workflow did not create a false reassessment trigger while implementing a legitimate provider-policy correction.

### Cohort 003 — Owner manual-action admission gate
- events: 6
- mandatory trigger episodes: 0
- GLOBAL_EVIDENCE_GAIN: 6/6
- Owner touches: 0
- final decision: STOP_LOCAL after acceptance completion

Again, the workflow stayed bounded without unnecessary trigger activation.

## Combined prospective result

Across 35 meaningful real events:
- task families: 3
- mandatory trigger episodes: 3
- trigger episodes followed by explicit reassessment before another mutating continuation: **3/3**
- mutating continuation while a mandatory reassessment was pending: **0**
- validated gate violations: **0**
- Owner touches: **0**

The two independent ordinary-development controls produced no mandatory triggers and completed normally.

## What this supports

The prospective gate is behaving as intended in the first field sample:

> it interrupts repeated or structurally suspicious continuation, but does not force reassessment during ordinary bounded work that continues to produce global evidence.

This is stronger than the earlier synthetic result because the events are from actual repository work and are recorded prospectively rather than reconstructed after the fact.

## What this does not yet prove

This is not a causal estimate of how many bad actions would have occurred without the gate.

The next missing quantity is the counterfactual:
**at a real mandatory trigger, what would the same state have produced under an ungated baseline decision?**

Disabling the safety/process gate in live work to obtain that counterfactual would be methodologically unnecessary and operationally undesirable.

## Next phase

Use a non-intervening **shadow baseline** at future real mandatory-trigger events:

1. freeze the exact prospective state at trigger time;
2. allow the real gate to operate normally;
3. independently ask a baseline decision model the same state with no gate instruction;
4. record whether the shadow baseline would CONTINUE_LOCAL / REPLAN_LOCAL / SWITCH / WAIT / STOP;
5. never let the shadow output control the real workflow.

This yields paired field counterfactual evidence without withholding the actual reassessment gate.
