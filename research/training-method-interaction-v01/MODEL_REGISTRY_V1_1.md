# Model Registry v1.1 — OLMo 2 Primary Lineage

Status: PRIMARY LINEAGE SELECTED / PILOT QUANT CHECKPOINTS BEING PREPARED
Date: 2026-10-03

## Why OLMo 2 replaced the Llama/Tülu candidate

OLMo 2 7B provides a cleaner experimental lineage for this study:
- BASE, SFT, DPO and final RLVR checkpoints are explicitly documented as one lineage;
- BASE is not gated behind a separate access workflow;
- model cards disclose the post-training sequence;
- the lineage is Apache 2.0;
- 7B is lighter than the earlier 8B candidate;
- OLMo is explicitly released to support model-science reproducibility.

## Canonical checkpoints and observed repository revisions

| Stage | Repository | observed revision 2026-10-03 |
|---|---|---|
| BASE | `allenai/OLMo-2-1124-7B` | `7df9a82518afdecae4e8c026b27adccc8c1f0032` |
| SFT | `allenai/OLMo-2-1124-7B-SFT` | `1de02c0175118a9de5854aec80a1f970e701e928` |
| DPO | `allenai/OLMo-2-1124-7B-DPO` | `e34ea60adff2e575f4fe7569eaffd1b28509b6fd` |
| RLVR | `allenai/OLMo-2-1124-7B-Instruct` | `470b1fba1ae01581f270116362ee4aa1b97f4c84` |

The post-trained model cards note that corrected non-preview SFT/DPO/Instruct checkpoints replaced earlier preview checkpoints after a pre-tokenization mismatch was identified. Only the corrected non-preview checkpoints are eligible.
## Training interpretation

- BASE: pretrained OLMo 2 7B.
- SFT: OLMo-specific Tülu 3 supervised fine-tuning mixture.
- DPO: further direct preference optimization from SFT.
- RLVR: further reinforcement learning with verifiable rewards from DPO; released as `Instruct`.

The experiment must describe these as stage treatments, not as pure isolated causal interventions on one scalar variable. Dataset, optimizer and training procedure differ by stage as intended components of the post-training pipeline.

## Pilot quantization lineage

For calibration pilot only, candidate Q4_K_M GGUFs from one distributor:
- `mradermacher/OLMo-2-1124-7B-GGUF` revision `052f3248d0878a61a6ffa8f8903e513b215e6f0e`
- `mradermacher/OLMo-2-1124-7B-SFT-GGUF` revision `8fbeaff0abdd5cca10ee696462f2d3a17c8fdc82`
- `mradermacher/OLMo-2-1124-7B-DPO-GGUF` revision `32ce3d935205a7301f5bde270abffb4331f22525`
- `mradermacher/OLMo-2-1124-7B-Instruct-GGUF` revision `d618cdd4d18a8463dbb919e30ee9863b16b4173f`

Each selected Q4_K_M file is approximately 4.472 GB.

These pilot quants are not automatically eligible for confirmatory claims. Their purpose is to test runtime feasibility and measurement discriminability at zero API cost.
## Confirmatory precision preference

Preferred confirmatory pipeline:
1. canonical AllenAI checkpoint revision locked;
2. canonical or locally converted F16 GGUF;
3. one frozen llama.cpp revision;
4. identical Q4_K_M local quantization procedure across all four stages;
5. precision-sensitivity bridge using Q6_K/Q8_0 or full precision on a subset.

AllenAI provides official GGUF repositories for BASE and Instruct, including F16 and Q4_K_M files. SFT and DPO can be locally converted from their canonical repositories if needed.

## Excluded variants

- `*-Preview` post-trained checkpoints: excluded due documented pre-tokenization mismatch.
- arbitrary fine-tunes named OLMo/Tülu: excluded.
- different quantization formats across stages: excluded from primary comparison.
- model merges: excluded.
