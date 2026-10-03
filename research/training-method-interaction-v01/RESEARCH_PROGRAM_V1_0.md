# Training Stage × Methodological Framing v1.0

Status: DESIGN / ZERO-PAID-COLLECTION
Date: 2026-10-03

## Core question

When an LLM is instructed to use a named methodology, is the observed reasoning style mainly created by the prompt, or does the prompt select and amplify capabilities already shaped by training?

## Working model

Observed behavior is treated as a conditional interaction, not as a fixed trait:

Training history × task × methodological framing → observable research behavior.

The proposed decomposition is:

1. Pretraining builds a repertoire of language, concepts, procedures, and latent problem-solving regularities.
2. Instruction tuning increases responsiveness to natural-language task instructions and routing from instructions to behaviors.
3. Preference optimization (for example DPO/RLHF-style post-training) reshapes which candidate behaviors are selected or preferred.
4. Reasoning-oriented RL/RLVR may alter search depth, persistence, verification, or policy around solution trajectories.
5. Runtime methodological framing selects or amplifies a region of the learned repertoire.

This is a behavioral model. Internal mechanism claims require separate mechanistic evidence.
## Primary causal contrast

Use one model lineage with staged checkpoints while holding architecture and pretraining origin as constant as practicable.

Preferred lineage: Llama 3.1 8B → Tülu 3 SFT → Tülu 3 DPO → Tülu 3 final RLVR.

Stages:
- BASE: meta-llama/Llama-3.1-8B
- SFT: allenai/Llama-3.1-Tulu-3-8B-SFT
- DPO: allenai/Llama-3.1-Tulu-3-8B-DPO
- RLVR: allenai/Llama-3.1-Tulu-3-8B

Tülu 3 is suitable because its post-training recipe is open and explicitly includes SFT, DPO and RLVR.

## Factorial design

Factors:
- TrainingStage: BASE / SFT / DPO / RLVR
- MethodFraming: GENERIC / DIFFERENTIAL / BAYESIAN / FALSIFICATION / CAUSAL / STATE_SPACE / SOFTWARE_TESTING
- Task: reuse T1/T2/T3 concepts plus at least one new held-out task only after pilot success

Primary estimand:
- TrainingStage × MethodFraming interaction on cross-task recoverability of methodological signatures.

Secondary estimands:
- instruction responsiveness;
- within-method diversity;
- cross-stage method transfer;
- family-specific amplification/suppression;
- stage-dependent collapse or homogenization.
## Competing hypotheses

H1 — Repertoire-first / routing model:
Method signatures are already partly present at BASE, then become more recoverable after SFT. DPO/RLVR mainly reshape strength and stability.

H2 — Instruction-tuning emergence:
BASE shows weak method-specific separation; SFT creates a large discontinuity in framing responsiveness.

H3 — Preference homogenization:
DPO increases instruction compliance but reduces within-method diversity and compresses some method-family distinctions.

H4 — Reasoning-RL amplification:
RLVR selectively strengthens methods aligned with verification/search behavior, rather than uniformly strengthening all method families.

H5 — Prompt-created surface effect:
Method signatures do not survive stronger lexical ablation or cross-stage transfer, implying that prior effects were mainly surface realization rather than reusable strategy selection.

## Strongest falsifier

If method-framing classification remains near chance at BASE, SFT, DPO and RLVR after explicit terminology masking, then the claim that training stage exposes a reusable methodological repertoire is unsupported.

If all apparent stage differences disappear when output length and instruction-following quality are controlled, the effect should be interpreted as generic compliance rather than reasoning-style specialization.
## Claim ceiling

Allowed if supported:
- post-training stage changes the behavioral responsiveness of an LLM to methodological framing;
- specific training stages amplify or attenuate recoverable method-conditioned planning signatures.

Not allowed without further evidence:
- a given training algorithm creates a human-like reasoning faculty;
- a specific internal neural representation causes the effect;
- one methodology is superior;
- RL invents capabilities de novo rather than reweighting or expanding existing policy space.

## Cost rule

No paid model API generation is authorized by this design document.
No large checkpoint download is authorized until the zero-cost design and minimal feasibility gate are complete.
