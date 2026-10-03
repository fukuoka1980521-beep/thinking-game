# Theory Decomposition v1.0

## Behavioral decomposition

The study treats observed LLM reasoning style as:

`Behavior = f(Repertoire, Routing, Selection, Search, Task, MethodPrompt)`

Provisional mapping:
- Pretraining → Repertoire
- Instruction tuning → Routing
- Preference optimization → Selection
- RLVR/reasoning RL → Search / persistence / verification policy
- Method prompt → Runtime selection and amplification

This mapping is a research model, not an established mechanistic identity.

## What each contrast can and cannot tell us

### BASE vs SFT
If method signatures become much stronger after SFT, this supports increased routability/instruction responsiveness. It does not prove SFT created the underlying conceptual knowledge.

If BASE already transfers method signatures across tasks, that supports a repertoire-first account: pretraining contained reusable method-linked behavior before instruction tuning.
### SFT vs DPO
If DPO changes family-specific recall, diversity or confusion while generic instruction compliance remains stable, preference optimization likely reshaped strategy selection probabilities.

If all methods simply become more compliant/verbose, the effect should be attributed to generic response quality rather than methodological specialization.

### DPO vs RLVR
If RLVR selectively changes methods that benefit from verification, falsification, tests or stopping rules, that supports selective policy reshaping rather than uniform reasoning improvement.

If every family improves similarly, the result is more consistent with general capability or instruction-following gains.

## Creation vs selection question

The central theoretical distinction is:

- Creation: a training stage introduces a method-conditioned behavior absent from earlier stages.
- Selection/amplification: a training stage makes an already-available behavior easier to invoke, more stable, or more likely.

Cross-stage transfer is critical because behavior that transfers from BASE-trained method signatures into later stages is difficult to explain as entirely newly created by later post-training.

## Strong boundary

Behavioral transfer alone cannot prove that the same internal representation persists across stages. A later mechanistic study would require activation-level or causal intervention evidence.
