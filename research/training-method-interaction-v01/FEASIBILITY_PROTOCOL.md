# Feasibility Protocol v0.1

Status: NON-COUNTED ONLY

## Purpose

Determine whether the OLMo 2 1B lineage can be run locally on HUKUOKA without paid APIs and with sufficient stability to justify a counted preregistered study.

## Hardware boundary observed

- Windows 11
- physical RAM: ~16.8 GB
- free disk before setup: ~44.5 GB
- no paid inference service is used

## Pilot cells

Do not use all 336 counted cells.

First run one short plan from each training stage under:
- GENERIC
- BAYESIAN
- SOFTWARE_TESTING

on T1 only.

Total initial smoke outputs: 12.

If that passes, run a small non-counted balanced pilot:
4 stages × 7 methods × 2 tasks × 1 replicate = 56 outputs.

## Record

For every generation:
- model ID and revision if available
- tokenizer identity
- prompt-interface mode
- seed
- generation settings
- wall-clock seconds
- peak process memory if available
- input tokens
- output tokens
- completion status
- raw text
- obvious degeneration/repetition flag

## Feasibility GO gate

Proceed toward preregistration freeze only if:
1. all four checkpoints load on HUKUOKA;
2. no paid endpoint/API is invoked;
3. outputs can be produced without OS-level memory failure;
4. generation time is operationally tolerable;
5. SHARED_RAW prompt construction is byte-identical across stages;
6. all raw pilot records are traceable;
7. at least SFT/DPO/RLVR produce non-degenerate research-plan responses in most pilot cells.

BASE compliance is recorded but is not a GO requirement because instruction following is itself an experimental variable.

## STOP conditions

Stop local generation and redesign if:
- model loading repeatedly exhausts memory;
- projected counted runtime becomes impractical;
- model/tokenizer lineage is not actually comparable;
- required storage materially threatens other HUKUOKA workloads;
- any workflow attempts to use a paid model API.

## Scientific boundary

Pilot outputs are never counted evidence and cannot be used to tune a success threshold after seeing the future counted results.
