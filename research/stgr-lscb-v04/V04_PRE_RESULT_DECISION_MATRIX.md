# STGR / LSCB — Pre-result Decision Matrix for v0.4

Date: 2026-09-26  
Status: **FROZEN BEFORE LIVE v0.4 RESULT REVIEW**

This matrix prevents post-result goalpost movement. It determines what research path follows each broad v0.4 pattern.

## Branch A — success-specific continuation appears

Trigger:
- Baseline SUCCESS×LOW has higher ECS / local persistence than FAILURE×LOW;
- direction is visible in at least 2 of 3 domains;
- pattern is not explained by one unstable replicate pair.

Interpretation:
- evidence is **consistent with** LSCB / success-cue sensitivity;
- do not yet claim local success alone is causal because v0.4 SUCCESS/FAILURE scenario texts are not exact counterfactuals.

Next study:
- matched-counterfactual confirmatory design;
- same context, same global relevance, same informational value;
- only local-outcome SUCCESS vs FAILURE changes;
- prospectively classify local REPLAN as persistence or non-persistence;
- use genuinely distinct scenario families rather than duplicated deterministic prompts;
- independent human or cross-model blind outcome judging.

## Branch B — generic persistence appears, but success increment is weak

Trigger:
- SUCCESS×LOW and FAILURE×LOW both show substantial ECS / local continuation;
- within-domain success-minus-failure differences are near zero or inconsistent.

Interpretation:
- evidence favors SRN / task-set persistence / context persistence over a success-specific mechanism;
- LSCB is not supported as the main explanation.

Next study:
- manipulate GLOBAL RELEVANCE and task-switch cost directly;
- test whether mandatory goal-state refresh reduces persistence regardless of local outcome;
- treat STGR as a potentially useful control architecture only if its benefit generalizes beyond SUCCESS turns.

## Branch C — STGR helps even though LSCB is weak

Trigger:
- C improves LOW-relevance ECS or GDA over A/B;
- H1 success-specific contrast is weak/inconsistent.

Interpretation:
- the intervention may be useful as a general relevance-reassessment mechanism, not evidence for success-triggered bias.

Next study:
- rename mechanism claim conservatively;
- compare event-triggered reassessment rules (success-triggered vs periodic vs bottleneck-change-triggered).

## Branch D — Independent evaluator helps, with meaningful cost

Trigger:
- D improves GDA/ECS or repairs executor errors;
- per-run calls/tokens/latency materially exceed C.

Interpretation:
- independent global oversight may work, but architecture cost is part of the result.

Next study:
- estimate marginal gain per extra evaluator call;
- test selective escalation: invoke evaluator only when global contribution is uncertain.

## Branch E — interventions cause over-stopping

Trigger:
- PS rises or CP falls materially in HIGH-relevance cells, especially FAILURE×HIGH.

Interpretation:
- intervention suppresses persistence indiscriminately;
- reduced ECS is not sufficient evidence of improvement.

Next study:
- separate “global value is low” detection from “last local outcome was success”;
- add explicit safeguard for unresolved high-value goals.

## Branch F — no coherent behavioral effect

Trigger:
- H1 direction inconsistent;
- B/C/D do not improve GDA/ECS without side effects;
- effects are scenario-specific or replicate-unstable.

Interpretation:
- current LSCB/STGR formulation is not supported by this pilot;
- do not expand implementation or publish a positive claim.

Next study:
- retain v0.3 measurement-budget finding as separate result;
- reconsider construct definition and task ecology before further large runs.

## Publication boundary

Regardless of branch:
- v0.4 remains an exploratory pilot;
- no causal claim from nominal n=96;
- no positive publication claim based only on same-model blind Final Goal Quality;
- exact matched counterfactuals and independent judgment are required for a confirmatory claim.
