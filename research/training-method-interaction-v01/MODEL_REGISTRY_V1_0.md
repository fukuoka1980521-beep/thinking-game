# SUPERSEDED — historical Llama/Tülu candidate; use MODEL_REGISTRY_V1_1.md

# Model Registry v1.0

Status: CANDIDATE LINEAGE LOCKED / CHECKPOINT REVISIONS NOT YET FROZEN
Date: 2026-10-03

## Primary lineage

The primary comparison uses the same Llama 3.1 8B lineage wherever possible:

| Stage | Repository | Parent interpretation |
|---|---|---|
| BASE | `meta-llama/Llama-3.1-8B` | pretrained base |
| SFT | `allenai/Llama-3.1-Tulu-3-8B-SFT` | SFT from Llama 3.1 8B |
| DPO | `allenai/Llama-3.1-Tulu-3-8B-DPO` | DPO from Tülu 3 SFT |
| RLVR | `allenai/Llama-3.1-Tulu-3.1-8B` | GRPO/RLVR from Tülu 3 DPO |

Rationale: the Tülu 3.1 model card states that the 3.1 change is confined to the final RL stage: PPO was replaced with GRPO and hyperparameters were tuned. It remains finetuned from the same Tülu 3 8B DPO checkpoint.

## Interpretation

The stage labels are behavioral treatment labels, not claims that only one training operation differs in every implementation detail.

Primary contrasts:
- BASE → SFT: introduction of instruction tuning;
- SFT → DPO: preference optimization;
- DPO → RLVR: reasoning/verifiable-reward RL with GRPO.
## License and access

All four checkpoints inherit or use the Llama 3.1 Community License family. Base access may be gated on Hugging Face and must be resolved before any execution freeze.

No model weights may be redistributed inside the research public package unless the license and source terms explicitly permit the intended redistribution. Public research release should instead record repository identifiers, revisions, hashes and exact runtime instructions.

## Quantized local candidate

If HUKUOKA local inference is selected, use the same quantization family for every stage.

Candidate: Q4_K_M GGUF.
Known third-party Q4_K_M packages are approximately 4.92 GB for Tülu 3 SFT, DPO and Tülu 3.1 RLVR. A matching Llama 3.1 BASE quantization must be identified before local execution.

Third-party quantization is an additional experimental layer. It must be disclosed and cannot be treated as identical to BF16 inference.

## Freeze requirements before generation

For each stage record:
- canonical repository;
- exact git/repository revision;
- weight or GGUF SHA256;
- tokenizer/config revision;
- quantization type;
- runtime version/commit;
- exact prompt rendering;
- decoding parameters;
- CPU/GPU offload settings;
- context length and max-new-token limit.

No checkpoint is yet frozen for counted generation.
