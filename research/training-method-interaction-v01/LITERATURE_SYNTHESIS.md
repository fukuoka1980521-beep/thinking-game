# Literature Synthesis v0.1

## Why this study is scientifically justified

### Instruction tuning

Instruction-tuning work such as InstructGPT shows that a base pretrained model and an instruction-following model are not behaviorally interchangeable. SFT is trained on demonstrations of intended responses; preference optimization then further shifts the response distribution.

Implication here:
A BASE checkpoint failing to execute a named methodology may reflect routing/compliance failure rather than absence of the underlying methodological repertoire.

### Tulu 3 / OLMo 2

Ai2 releases a staged post-training lineage:
BASE -> SFT -> DPO -> RLVR.

This is unusually useful because the architecture and pretraining lineage can be held much more constant than in comparisons among unrelated closed models.

### RL and reasoning

DeepSeek-R1-Zero demonstrates that large-scale reinforcement learning can strongly change observable reasoning behavior without preliminary SFT.

However, critical analyses of R1-Zero-like training report that base-model properties and pretraining biases materially shape what emerges under RL.

This creates the central unresolved question for this project:
Does post-training construct a new methodological strategy, or mainly reveal/reweight strategies already latent after pretraining?

### Task/function vectors

Work on function vectors and task vectors reports compact internal representations associated with task execution and causal effects under activation intervention.

This does not prove that "Bayesian", "causal", or "falsification" methods are represented as simple vectors.
It does justify a later exploratory question:
Does a method-conditioned representation become more decodable or causally effective across post-training stages?

## Key sources

- Ouyang et al. 2022. Training language models to follow instructions with human feedback. arXiv:2203.02155.
- Lambert et al. 2024. Tulu 3: Pushing Frontiers in Open Language Model Post-Training. arXiv:2411.15124.
- OLMo 2 technical report. arXiv:2501.00656.
- Guo et al. / DeepSeek-AI. 2025. DeepSeek-R1. arXiv:2501.12948.
- Liu et al. 2025. Understanding R1-Zero-Like Training: A Critical Perspective. arXiv:2503.20783.
- Todd et al. 2023. Function Vectors in Large Language Models. arXiv:2310.15213.
- Hendel et al. 2023. In-Context Learning Creates Task Vectors. arXiv:2310.15916.

## Research gap

Existing literature extensively studies benchmark performance, instruction following, and reasoning optimization.

The narrower gap tested here is:
holding model lineage, task objective, and method cues controlled, how does the *same methodological framing intervention* change across successive post-training stages?

The object of interest is not benchmark accuracy but the emergence, routing, stability, and transfer of methodological research-plan signatures.
