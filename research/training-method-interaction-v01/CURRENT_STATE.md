# Current State — Training × Methodological Framing

Date: 2026-10-03

## Research state

Second study created on independent branch:
research/training-method-interaction-v01

Initial design commit:
e220704

## Central estimand

TrainingStage × MethodFrame -> observable research-plan behavior

Primary scientific discriminator:
ordered cross-stage transfer of method signatures.

## Why OLMo 2 1B

It provides public checkpoints for:
BASE -> SFT -> DPO -> RLVR

Observed endpoint probes:
- same Olmo2 architecture signature across all four
- hidden size: 2048
- hidden layers: 16
- identical tokenizer.json ETag across all four
- official model weights total approximately 13.83 GiB

## Working interpretation model

Pretraining may create a repertoire.
SFT may improve routing from natural-language instructions.
DPO may reshape response-selection preferences.
RLVR may change verification/search persistence.
The experiment is designed to test this decomposition rather than assume it.

## Immediate blocker

Local CPU inference environment is still being prepared.
No paid API is being used.

## Next autonomous steps

1. Finish CPU inference environment.
2. Run one BASE/GENERIC/T1 smoke.
3. If successful, run SFT/DPO/RLVR matching smoke cells.
4. Record runtime and memory.
5. Run 12-cell method contrast smoke if practical.
6. Decide GO/REDESIGN for the 56-cell non-counted balanced pilot.
