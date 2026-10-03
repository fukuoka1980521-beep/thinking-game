# Runtime and Quantization Lock v1.0

Status: RUNTIME LOCKED / OLMo 2 PILOT PREPARATION
Date: 2026-10-03

## Local runtime

- package: `ggml.llamacpp`
- llama.cpp: `0.5.0-dev`
- build: `11193`
- full commit: `4e7481175cbd4759df8bee2f1c1a0073effbebd7`
- compiler: Clang 20.1.8 for Windows x86_64
- CPU: Intel Core i5-1335U, 10 cores / 12 logical processors
- GPU: Intel Iris Xe; primary pilot uses `gpu_layers=0`
- RAM: approximately 16.8 GB

The matching llama.cpp source revision is preserved at:
`C:\Users\user\ClaudeWork\_research_runtime\llama.cpp-4e7481175`

The same revision contains `convert_hf_to_gguf.py`. Installed binaries include `llama-server.exe`, `llama-cli.exe`, `llama-quantize.exe`, `llama-imatrix.exe` and benchmarking tools.

## Primary model lineage

- BASE: `allenai/OLMo-2-1124-7B`
- SFT: `allenai/OLMo-2-1124-7B-SFT`
- DPO: `allenai/OLMo-2-1124-7B-DPO`
- RLVR: `allenai/OLMo-2-1124-7B-Instruct`

Only corrected non-preview post-training checkpoints are eligible.

## Calibration-pilot quantization

The 72-run pilot may use one-distributor Q4_K_M files for all four stages:
- BASE, SFT, DPO, RLVR: approximately 4.472 GB each
- retained total after all four: approximately 17.9 GB

These are calibration artifacts only. They are not automatically eligible for a confirmatory training-stage claim.

## Confirmatory precision preference

For a later confirmatory run:
1. lock canonical AllenAI revisions;
2. use the same llama.cpp conversion/quantization commit;
3. use a common quantization target across stages;
4. run a higher-precision bridge on representative stages.

AllenAI already publishes official F16/Q4/Q8 GGUF for BASE and final Instruct. SFT and DPO can be converted from canonical checkpoints using the frozen llama.cpp conversion revision.

## Disk policy

C: has roughly 39 GB free before pilot model preparation.
G: and H: are Google Drive virtual drives and are explicitly excluded from model/temp storage.

Do not retain multiple full-precision source checkpoints on C: simultaneously.
Pilot Q4 files are stored under:
`C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot`

## Sampling lock

Pilot manifest explicitly disables llama.cpp defaults that would otherwise differ from the parent Study A generation settings:
- temperature 1.0
- top_p 1.0
- top_k 0
- min_p 0
- typical_p 1.0
- repeat_penalty 1.0
- presence/frequency penalties 0
- DRY/XTC/dynamic temperature disabled
- cache_prompt false
- ctx 4096
- max_new_tokens 1200
- threads 10
- gpu_layers 0
- deterministic run-specific seed

The server is loaded once per stage and reused across that stage's requests to avoid repeated 4.5 GB model loading.

## Precision boundary

Low-bit quantization can affect reasoning/instruction behavior non-uniformly. If precision-sensitivity results materially change TrainingStage × MethodFraming conclusions, Q4 results remain exploratory.

No paid model API or paid compute is authorized.
