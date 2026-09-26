# STGR / Global Reassessment v1.6 — Leakage-Corrected Shadow Baseline Analysis

Date: 2026-09-26
Status: **CALIBRATION COMPLETE / TREATMENT-LEAKAGE REPAIRED**

## Validity correction

v1.5 is excluded from inference because the visible shadow packets contained normative reassessment language.

v1.6 rebuilt the same three natural Cohort 001 decision points with sanitized observable history only:
- action type
- action result
- evidence delta
- local success
- neutral factual event summary

No trigger names, gate rules, mandatory-reassessment instructions, or future gated decisions were visible.

GitHub Actions run:
- 36240754694
- result: SUCCESS

## Shadow baseline result

| Decision point | Ungated shadow baseline | Actual gated next decision |
|---|---|---|
| V16S01 — repeated repair state | **MUTATE_LOCAL** | REPLAN_LOCAL |
| V16S02 — runner offline | WAIT | WAIT |
| V16S03 — validator timing conflict | **MUTATE_LOCAL** | REPLAN_LOCAL |

Primary calibration metric:

**SHADOW_IMMEDIATE_MUTATION_RATE = 2/3 = 66.7%**

## Interpretation

At two of the three naturally occurring trigger states, the leakage-corrected ungated baseline would have immediately changed code again.

The real prospective gate did not allow that immediate mutation. It inserted an explicit global reassessment first.

After reassessment:
- S01: the architecture was judged sound and one bounded local repair was allowed.
- S02: both shadow and gated workflow chose WAIT because the blocker was external runner availability.
- S03: the measurement layer was identified as the problem and one bounded validator repair was allowed.

Thus the observed mechanism is not “gate forces stop”.

It is:

> **trigger → pause local mutation → global reassessment → continue only if the same task remains globally justified**

## What this adds beyond v1.4

v1.4 established prospective compliance:
- 3/3 mandatory trigger episodes reassessed before another mutating continuation.
- 0 mutating continuations occurred while reassessment was pending.

v1.6 adds a leakage-corrected counterfactual calibration:
- 2/3 trigger states would have produced immediate local mutation under an ungated shadow baseline.
- 1/3 already produced the same WAIT decision without the gate.

This is direct evidence that the gate plausibly changes near-term behavior specifically where local repair momentum exists, while not changing an already-correct availability decision.

## Limits

This remains calibration evidence:
- n=3.
- all three trigger points came from the same instrumentation task family.
- the shadow model is not the exact same stochastic execution under a withheld gate.
- no population effect size is claimed.

## Current research model

The strongest supported formulation is now:

**LOCAL TASK MOMENTUM / GLOBAL REASSESSMENT OMISSION**
+
context-dependent success or repair momentum
→ immediate local mutation

A prospective reassessment gate can interrupt that mutation before the next write/run/deploy action.

The original success-specific LSCB remains a possible submechanism, not the central mechanism.

## Next evidence gate

Do not add more instrumentation features.

Continue ordinary real Development OS / Orchestrator work.

At the next mandatory-trigger episode from a **different real task family**:
1. freeze the exact observable state;
2. run the same leakage-free shadow baseline;
3. let the actual gate operate normally;
4. compare shadow vs actual;
5. accumulate until at least 6 trigger episodes across at least 3 independent task families.

No synthetic filler and no deliberate failure injection.
