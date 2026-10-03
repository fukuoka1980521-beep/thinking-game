# Preregistration Draft v1.0

Status: DRAFT — NOT FROZEN

## Research question

Does post-training stage causally moderate the observable effect of methodological framing on free-form research planning within a single model lineage?

## Independent variables

1. TrainingStage ∈ {BASE, SFT, DPO, RLVR}
2. MethodFraming ∈ {GENERIC, DIFFERENTIAL, BAYESIAN, FALSIFICATION, CAUSAL, STATE_SPACE, SOFTWARE_TESTING}
3. Task ∈ initially {T1, T2, T3}

## Primary outcome

Cross-task method-label recoverability under deterministic text measurement with explicit method labels and canonical method terminology masked.

## Primary interaction test

For each stage, estimate cross-task recoverability. Then test whether recoverability differs by TrainingStage beyond permutation expectations while preserving balanced method-family sampling.

Primary statistic candidate:
- stage-wise combined balanced accuracy, plus
- interaction contrast Δ_stage = accuracy(stage B) − accuracy(stage A), evaluated by stratified bootstrap/permutation over balanced cells.
## Secondary outcomes

- per-family recall by stage;
- cross-stage transfer matrix (train on one stage, test on another);
- within-method lexical/semantic diversity;
- output length and structural controls;
- stronger residual lexical ablation;
- instruction compliance score independent of methodology identity;
- method-family confusion stability.

## Critical confounds to control

- chat template differences between BASE and instruction-tuned checkpoints;
- special tokens/system prompt availability;
- sampling temperature/top-p;
- maximum output length;
- tokenizer equivalence;
- task wording;
- model quantization differences;
- decoding backend;
- refusal/safety style;
- generic instruction-following failure at BASE.

BASE must not be penalized merely for lacking chat-template conventions. A neutral completion-format prompt and a chat-format sensitivity analysis should be specified before freezing.
## Minimal pilot gate

Do not start a large run.

Pilot only after model-access feasibility is established.
Proposed pilot:
- 4 stages
- 3 method families initially: GENERIC / BAYESIAN / SOFTWARE_TESTING
- 2 tasks
- 3 replicates per cell
- total = 72 outputs

Purpose:
- verify that every stage can produce valid plans;
- quantify truncation/refusal/template failure;
- verify measurement is not trivially dominated by stage identity;
- estimate whether method × stage interaction is measurable at all.

GO only if:
1. >=95% valid non-empty outputs;
2. no stage has >20% template/refusal failures;
3. method classification is above chance in at least one stage without direct terminology leakage;
4. stage classification does not trivially dominate all method classification after masking;
5. cost/computation is explicitly authorized before any paid execution.

Pilot outputs are calibration only and cannot be promoted into a preregistered confirmatory denominator.
