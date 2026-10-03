# Cost and Feasibility Gate

Status: ACTIVE

## Current HUKUOKA hardware

Observed 2026-10-03:
- GPU: Intel Iris Xe Graphics only
- system RAM: approximately 16.8 GB
- C: free space: approximately 39.9 GB

## Consequence

The official Tülu 3 8B BF16 checkpoints are approximately 16 GB each before runtime overhead. Four full checkpoints plus generation overhead are not suitable for straightforward local execution on this machine.

Therefore:
- do not download all four full 8B checkpoints to HUKUOKA;
- do not start paid cloud/API generation automatically;
- do not convert a feasibility problem into repeated paid retries.

## Allowed zero-cost work

- literature review;
- prompt/task-bank design;
- deterministic measurement design;
- analysis code using synthetic fixtures;
- checkpoint metadata inspection;
- quantized-model feasibility research;
- preregistration drafting;
- power/sensitivity simulation using existing Study A/R1 outputs.

## Execution options ranked

1. Zero-cost design + simulations first — ACTIVE.
2. One quantized checkpoint feasibility test only if storage/RAM requirements are verified and license/access permits.
3. Borrowed/existing GPU compute if already available at zero marginal cost.
4. Paid compute only after explicit user authorization and a fixed maximum budget.

No paid execution is authorized by this file.

## Quantized feasibility finding

Public third-party GGUF quantizations exist for the Tülu 3 8B SFT, DPO and final RLVR checkpoints. Q4_K_M variants are approximately 4.92 GB each. This makes one-checkpoint-at-a-time CPU inference technically plausible on HUKUOKA, but it introduces an additional experimental factor: quantization.

Therefore the preferred confirmatory design must not mix BF16 and different quantization schemes across stages. If local quantized execution is used, all compared stages should use the same quantization family and llama.cpp version, and a small quantization-sensitivity check should precede interpretation.

Current local runtime check:
- llama.cpp CLI: not installed
- LM Studio: not detected

Decision: do not install or download models yet. Freeze prompts, measurement and pilot gate first.

## Quantization scientific control

Recent studies report that low-bit quantization can degrade reasoning and instruction-following non-uniformly, with planning/numerical reasoning particularly vulnerable in some settings. Therefore Q4 inference is not assumed behaviorally equivalent to BF16.

Required if Q4_K_M is used:
1. every compared training stage must use the same Q4_K_M conversion convention and runtime;
2. no stage may use BF16 while another uses Q4;
3. before interpreting TrainingStage effects, run a small precision-sensitivity bridge on at least two representative stages using a higher-precision quantization or BF16 reference where feasible;
4. if quantization changes method recoverability materially, the local Q4 study is exploratory and cannot support a clean training-stage causal claim.

A third-party BASE quantization from a different conversion pipeline must not be silently mixed with Tülu quantizations. Prefer one conversion source/pipeline for all stages, or locally quantize each canonical checkpoint with one frozen llama.cpp revision.
