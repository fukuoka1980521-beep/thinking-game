# Measurement Protocol Draft v1.0

Status: DRAFT — ZERO MODEL CALLS

## Measurement problem

The study must distinguish three things that can otherwise be confounded:

1. generic instruction-following ability;
2. training-stage stylistic identity;
3. method-specific planning behavior.

A stage difference is scientifically interesting only if method-specific effects remain after controlling for the first two.

## Measurement layers

### Layer A — Valid-plan gate
Deterministic checks only:
- non-empty output;
- required neutral section headings present or recoverable;
- no obvious template echo/refusal;
- output not truncated;
- task objective addressed.

This layer is not a method score.

### Layer B — Generic instruction responsiveness
Use method-neutral constraints unrelated to methodology identity, such as:
- required section count;
- fixed output range;
- explicit request to state assumptions;
- explicit request for stopping criteria.

Purpose: estimate whether BASE/SFT/DPO/RLVR differ simply because later stages follow instructions better.
### Layer C — Method recoverability
Reuse the prior frozen philosophy where possible:
- mask explicit method labels;
- mask canonical method-specific terminology;
- remove fixed headings;
- classify method family cross-task;
- report family-balanced recall and confusion.

Do not reuse the old classifier unchanged as a confirmatory measurement unless frozen pilot evidence shows domain compatibility. Reuse the principles, not an untested instrument.

### Layer D — Stage recoverability negative control
Train a classifier to predict TrainingStage after method labels are balanced.

If stage identity is trivially recoverable but method identity is not, the experiment has measured post-training style rather than methodological routing.

### Layer E — Cross-stage transfer
Train method classifier on one training stage and test on another.

Interpretation:
- high BASE→SFT transfer suggests a pretrained repertoire that survives instruction tuning;
- low BASE→SFT but high SFT→DPO/RLVR suggests instruction tuning creates/stabilizes the routable signature;
- selective deterioration after DPO/RLVR suggests preference/reward training reshapes specific families.
## Interaction statistic

Primary candidate:

MethodRecoverability(stage, task-transfer) with balanced cells.

Stage interaction is evaluated by differences between stage-specific recoverability, with resampling/permutation constrained within task × method cells.

The confirmatory analysis must report:
- absolute accuracy;
- macro recall;
- each directional transfer;
- family-wise recall;
- chance/null distribution;
- stage × family heterogeneity.

## Required negative controls

1. Structure-only classifier.
2. Output-length-only classifier.
3. Generic instruction-compliance covariate/control.
4. Stage-only classifier.
5. Strong lexical ablation beyond canonical terminology.
6. Prompt-template sensitivity analysis.

## Failure interpretation

If later stages merely produce more complete, longer, more compliant plans and method classification disappears after controlling those variables, conclude generic instruction-following amplification — not reasoning-style specialization.
