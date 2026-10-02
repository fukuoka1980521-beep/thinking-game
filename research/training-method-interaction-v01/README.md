# Training Stage × Methodological Framing v0.1

Status: DESIGN / ZERO-PAID-API
Date: 2026-10-03

## Core question

Does post-training change which methodological problem-solving styles an LLM can express, how strongly a natural-language method cue selects them, and whether the same method signature persists across training stages?

## Candidate causal decomposition

Pretraining -> repertoire
SFT -> instruction routing
DPO -> preference-weighted selection
RLVR -> search / verification persistence
Method cue -> runtime selection / amplification

This decomposition is a hypothesis, not an assumed mechanism.

## Model lineage

Primary open lineage: OLMo 2 1B April 2025.

- BASE: allenai/OLMo-2-0425-1B
- SFT: allenai/OLMo-2-0425-1B-SFT
- DPO: allenai/OLMo-2-0425-1B-DPO
- RLVR: allenai/OLMo-2-0425-1B-Instruct

The four checkpoints are intended to represent successive post-training stages of one lineage. The release is Apache-2.0 and exposes training details/checkpoints.

## Cost rule

No paid model API is allowed for this study without explicit user approval.
Local CPU inference and public model downloads are allowed.

## Relationship to prior paper

The completed 714-plan study established:
Methodological framing -> observable lexical/strategic research-plan signature.

This new study asks:
Training stage × methodological framing -> strength, stability, and transfer of that signature.

The first paper remains frozen and separate.
