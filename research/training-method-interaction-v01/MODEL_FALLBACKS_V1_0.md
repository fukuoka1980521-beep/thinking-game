# Model Fallbacks v1.0

Status: CONTINGENCY ONLY — DOES NOT ALTER FROZEN PILOT CONDITIONS

## RLVR/Instruct

Primary calibration artifact:
- mradermacher/OLMo-2-1124-7B-Instruct-GGUF
- Q4_K_M

Validated external fallback if the primary artifact becomes unavailable/corrupt:
- official AllenAI repository: allenai/OLMo-2-1124-7B-Instruct-GGUF
- file: olmo-2-1124-7B-instruct-Q4_K_M.gguf
- size: approximately 4.47 GB
- published SHA256: e08112e5f84aab7c05fa6e713c58e5214cd5d8e32ed773ff3354b006eed41b95
- license: Apache 2.0

Use policy:
- Do not switch artifacts merely for convenience after outputs exist.
- Use fallback only if the primary RLVR artifact cannot be obtained or verified.
- If fallback is used, record it as a pre-output operational amendment for RLVR and treat quantization-source difference as a calibration limitation.
- The confirmatory study should use one common canonical conversion/quantization pipeline across all stages.

## External execution fallback

Official model documentation also supports local llama.cpp execution directly from the AllenAI Hugging Face GGUF repository. This is a zero-API-cost alternative if the current download path fails.

No paid inference service is authorized as a fallback.
