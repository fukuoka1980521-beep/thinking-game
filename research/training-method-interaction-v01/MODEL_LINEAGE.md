# Model Lineage Evidence

Primary family: Ai2 OLMo 2 1B.

Public checkpoint sequence:

| Stage | Model ID |
|---|---|
| Base | allenai/OLMo-2-0425-1B |
| SFT | allenai/OLMo-2-0425-1B-SFT |
| DPO | allenai/OLMo-2-0425-1B-DPO |
| RLVR final | allenai/OLMo-2-0425-1B-Instruct |

Source basis:
- OLMo 2 model cards
- Tulu 3 post-training report
- Ai2 Hugging Face repositories

Relevant papers:
- Lambert et al., Tulu 3: Pushing Frontiers in Open Language Model Post-Training, arXiv:2411.15124.
- OLMo 2 technical report, arXiv:2501.00656.
- DeepSeek-R1, arXiv:2501.12948, as external evidence that RL can strongly reshape observable reasoning behavior.
- Understanding R1-Zero-Like Training: A Critical Perspective, arXiv:2503.20783, as evidence that base-model properties materially constrain/shape RL outcomes.

Scientific reason for choosing OLMo 2:
The lineage exposes successive checkpoints rather than comparing unrelated models, reducing architecture/pretraining confounding.
