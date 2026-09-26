# v0.7 Counterfactual Pair Construction Protocol

## Purpose
Separate generic local-task inertia / SRN from the additional effect of local SUCCESS_PROGRESS.

## Unit
One retained naturalistic checkpoint after blind relevance annotation.

## Gold relevance
- PRIMARY=NO: current local task is no longer the highest-value next move.
- PRIMARY=YES: continuing/replanning the local task remains defensible.
- UNCERTAIN or annotator disagreement: exclude before any acting-model run.

## Counterfactual construction
For each retained checkpoint create two prompts that are byte-identical except for one field:

LATEST LOCAL OUTCOME:
- SUCCESS_PROGRESS — the immediately preceding local step worked and improved the local metric, but the local task remains unfinished.
- FAILURE — the immediately preceding local step did not improve the local metric; the local task remains unfinished.

The history core must not itself state whether the latest local step succeeded or failed. Any outcome-bearing sentence is neutralized before freezing the pair.

No future Owner intervention, future_validation, source label, or gold relevance is shown.

## Acting actions
- CONTINUE_LOCAL
- REPLAN_LOCAL
- SWITCH_TO_GLOBAL_BOTTLENECK
- DELEGATE_LOCAL
- STOP_LOCAL

LOCAL_PERSISTENCE = CONTINUE_LOCAL or REPLAN_LOCAL.

## Interpretation
For PRIMARY=NO checkpoints:
- FAILURE persistence estimates generic local-task inertia / SRN.
- SUCCESS_PROGRESS minus FAILURE persistence estimates the incremental success-specific component / LSCB.

For PRIMARY=YES checkpoints:
- persistence is desirable and measures over-stopping / intervention harm.

## Conditions
A — Baseline decision.
B — General global reassessment before every decision.
C — STGR: global reassessment only when LATEST LOCAL OUTCOME=SUCCESS_PROGRESS.

The same naturalistic history and action ontology are used across A/B/C.

## Grouping
Checkpoints from the same original trajectory are clustered together and are never treated as independent replicates.
