# External Literature Synthesis v1.1

Status: VERIFIED BACKGROUND / NOT EMPIRICAL RESULT OF THIS STUDY
Date: 2026-10-03

## Verified OLMo 2 lineage facts

Primary sources:
- OLMo 2 paper: arXiv:2501.00656
- Tülu 3 paper: arXiv:2411.15124
- AllenAI OLMo 2 Hugging Face collection/model cards
- AllenAI RLVR-GSM-MATH-IF-Mixed-Constraints dataset card

### BASE
OLMo 2 7B is a fully open base model trained to approximately 4T tokens, with pretraining/midtraining occupying the large majority of total training compute.

### SFT
The OLMo 2 7B SFT stage uses an OLMo-specific Tülu 3 supervised fine-tuning mixture.
The public collection lists approximately 939k SFT examples for the 7B/13B OLMo 2 post-training mixture.

### DPO
The DPO checkpoint is explicitly downstream of SFT.
The public OLMo 2 7B preference mixture contains approximately 378k preference examples.

### RLVR
The final 7B Instruct checkpoint is explicitly downstream of SFT and DPO, followed by Reinforcement Learning with Verifiable Rewards (RLVR).

The public RLVR training mix contains 29,946 examples and combines:
- GSM8K: 7,473
- MATH: 7,500
- instruction-following prompts with verifiable constraints: 14,973

The RLVR dataset therefore concentrates on tasks where an answer or constraint can be programmatically/verifiably scored.

## What these facts justify

They justify using the same OLMo 2 7B lineage to test whether post-training stage moderates response to methodological framing.

They do **not** by themselves establish:
- that SFT is literally a neural "routing module";
- that DPO maps one-to-one onto "selection";
- that RLVR is equivalent to human verification/falsification;
- that training stages isolate one causal mechanism each.

## Research model: facts versus hypotheses

### Fact
BASE, SFT, DPO, RLVR are sequential behavioral treatment checkpoints in one documented lineage.

### Hypothesis H-Routing
SFT should increase sensitivity to natural-language methodological instructions relative to BASE.

Reason:
SFT explicitly trains instruction→response mappings across diverse tasks.

### Hypothesis H-Selection
DPO may alter which method-conditioned responses are preferentially expressed, potentially changing family separability or within-cell diversity.

Reason:
DPO optimizes relative preferences among candidate responses rather than simply continuing base next-token prediction.

### Hypothesis H-Verifier
RLVR may selectively strengthen behaviors naturally aligned with explicit checking, constraints, stopping conditions, test-like verification, or falsifying conditions.

Reason:
the OLMo/Tülu RLVR mixture uses GSM/MATH ground truth and instruction prompts with verifiable constraints.

This is a directional hypothesis only. The current pilot must determine whether SOFTWARE_TESTING/FALSIFICATION-like signatures actually increase relative to BAYESIAN or other styles.

## Important interpretive caution

Training stage and training data distribution change together.

Therefore a finding such as:

DPO → RLVR increases SOFTWARE_TESTING recoverability

would support:
"the RLVR stage of this published post-training pipeline changed observable method-conditioned behavior"

but not:
"the RL algorithm alone caused software-testing cognition."

A stronger algorithm-specific causal claim would require additional lineages or controlled retraining with matched data.

## Why this matters for the parent 714-plan study

The parent study showed:
MethodPrompt → reproducible observable plan signature.

The present study asks:
TrainingStage × MethodPrompt → strength/form of that signature.

If supported, this changes the explanatory model from:
"prompt wording changes outputs"

to:
"method prompts interact with capabilities and response policies produced by specific training stages."

That is a materially narrower and more mechanistic behavioral account, while still remaining black-box evidence.
