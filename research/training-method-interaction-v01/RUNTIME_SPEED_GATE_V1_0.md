# Runtime Speed Gate v1.0

Status: FROZEN BEFORE BACKEND BENCHMARK
Date: 2026-10-03

## Problem

CPU-only local inference is scientifically usable but may be slow enough to make the 72-output calibration pilot operationally inefficient.

The installed llama.cpp build detects:
- Vulkan0: Intel Iris Xe Graphics
- reported Vulkan memory: approximately 8008 MiB
- free at inspection: approximately 7351 MiB

The pilot Q4_K_M model is approximately 4.47 GB, so full layer offload is technically plausible.

## Benchmark model

Use BASE Q4_K_M only:
- OLMo-2-1124-7B.Q4_K_M.gguf
- SHA256: 3e706ed3e2cba388e8eba78d90cebd023cddc1be796e000cbc6ea6c5b97eeab0

No method-family or training-stage comparison is used for backend selection.

## Benchmark settings

llama.cpp commit:
4e7481175cbd4759df8bee2f1c1a0073effbebd7

Compare:
1. CPU: 10 threads, gpu layers 0
2. Vulkan: device Vulkan0, gpu layers 99

Benchmark:
- prompt processing: 128 tokens
- token generation: 128 tokens
- repetitions: 2

## Frozen selection rule

From llama-bench throughput, estimate the wall time for a representative research-plan request:

estimated_seconds = 275 / prompt_tokens_per_second + 600 / generation_tokens_per_second

Select Vulkan only if:
1. benchmark completes without memory/backend error; AND
2. estimated Vulkan time <= 0.80 × estimated CPU time.

Otherwise select CPU.

This is an operational speed rule, not a scientific outcome rule.

## Consequence

The selected backend is used for every stage and every counted calibration-pilot output.

If Vulkan is selected after a CPU BASE template smoke, archive that CPU smoke as backend calibration and rerun BASE template smoke under the selected Vulkan backend before proceeding to SFT/DPO/RLVR.

The backend must not be changed after method-condition pilot generation begins.
