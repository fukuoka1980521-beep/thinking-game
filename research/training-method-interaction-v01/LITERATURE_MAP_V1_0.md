# Literature Map v1.0

## Training-stage evidence

### Instruction tuning
- Wei et al., 2021, *Finetuned Language Models Are Zero-Shot Learners*, arXiv:2109.01652.
  - Instruction tuning substantially improves zero-shot performance on unseen tasks.
- Chung et al., 2022, *Scaling Instruction-Finetuned Language Models*, arXiv:2210.11416.
  - Scaling tasks, model size and chain-of-thought instruction data improves broad instruction-following performance.
- Wu et al., 2023, *From Language Modeling to Instruction Following*, arXiv:2310.00492.
  - Reports that instruction tuning increases attention to instruction parts, instruction verbs and task-oriented reuse of pretrained knowledge.

### Preference optimization / alignment
- Ouyang et al., 2022, *Training language models to follow instructions with human feedback*, arXiv:2203.02155.
  - SFT + reward modeling + PPO changes instruction following and human-preferred behavior relative to the pretrained model.
- Rafailov et al., 2023, *Direct Preference Optimization*, arXiv:2305.18290.
  - DPO directly optimizes preference behavior without a separately trained reward model plus PPO loop.
### Reasoning-oriented RL
- DeepSeek-AI, 2025, *DeepSeek-R1*, arXiv:2501.12948.
  - R1-Zero reports reasoning behaviors emerging under large-scale RL without preliminary SFT; R1 then adds multi-stage training and cold-start data.
- Lambert et al., 2024, *Tülu 3: Pushing Frontiers in Open Language Model Post-Training*, arXiv:2411.15124.
  - Provides a fully open lineage and recipe spanning SFT, DPO and RLVR on Llama 3.1 bases.

### Internal task/function representations
- Todd et al., 2023, *Function Vectors in Large Language Models*, arXiv:2310.15213.
  - Finds compact internal vectors that causally mediate task functions in in-context learning settings.

## Important boundary

These papers do not jointly prove that named scientific methodologies map onto fixed internal vectors. They justify a narrower research question: training alters instruction responsiveness and behavioral policy, while task-like abstractions can have reusable internal representations. The proposed experiment tests whether methodological framing behaves as such a reusable behavioral abstraction across post-training stages.
