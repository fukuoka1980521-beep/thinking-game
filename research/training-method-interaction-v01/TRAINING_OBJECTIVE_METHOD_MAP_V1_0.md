# Training Objective × Methodological Framing Map v1.0

Status: PRIOR HYPOTHESES — FROZEN BEFORE TEMPLATE SMOKE
Date: 2026-10-03

## Why training stage is not just an optimizer label

The OLMo 2 lineage changes both objective and data distribution across stages.

### BASE
OLMo 2 7B is pretrained/midtrained on very large general corpora. This stage can contain scientific, mathematical, programming, causal, statistical and testing patterns without being explicitly trained to obey a user's named methodological instruction.

Behavioral role in this study:
- candidate source of the **repertoire**;
- weakest expected explicit instruction routing.

### SFT
The OLMo-specific Tülu 3 SFT mixture contains roughly 939k examples spanning general instruction data, math, GSM, algebra, Python/code, instruction-following constraints, scientific tasks (SciRIFF), chat and other categories.

Behavioral role:
- explicit mapping from user instructions to task-appropriate completions;
- expected broad increase in method-prompt responsiveness.

### DPO
The OLMo 2 7B preference mixture contains hundreds of thousands of preference pairs based on reused SFT prompts, instruction-following prompts, WildChat, cleaned UltraFeedback and DaringAnteater-style prompts.

Behavioral role:
- reshape which valid candidate responses are preferred;
- may increase organization/helpfulness/compliance;
- may also homogenize some method-specific variation.

### RLVR
The final Instruct stage applies RLVR to a mixture centered on GSM, MATH and verifiable instruction-following constraints.

Behavioral role:
- reward responses when outcomes/constraints are verifiably satisfied;
- expected to alter persistence, explicit checks, constraint satisfaction and stopping behavior more than unconstrained epistemic style.

## Preregistered directional secondary hypotheses

These are secondary. The primary test remains the omnibus TrainingStage × MethodFraming interaction.

### P1 — Generic instruction compliance
Expected ordering:
BASE < SFT <= DPO/RLVR

This should appear in the method-neutral compliance layer. If all method effects can be explained by this ordering, do not claim methodological specialization.

### P2 — Repertoire-first signal
If BASE method classification is above chance under COMMON_RAW, this supports the claim that pretraining/midtraining already contains routable method-linked behavioral regularities, even if later stages strengthen them.

### P3 — SFT routing jump
The largest broad increase in method recoverability is expected at BASE → SFT because SFT directly trains user-instruction → response mappings.

### P4 — DPO selection reshaping
SFT → DPO is expected to change method-family confusion and within-method diversity more than to create an entirely new method signature.

A strong uniform gain across all method families would instead suggest generic response-quality improvement.

### P5 — RLVR verifier affinity
Relative to DPO, RLVR is predicted to have its clearest selective effect on method families whose plans naturally emphasize:
- explicit tests;
- constraint checking;
- falsifying conditions;
- stopping/pass-fail criteria;
- verification loops.

Therefore SOFTWARE_TESTING is the strongest directional candidate and FALSIFICATION is a secondary candidate.

BAYESIAN is not predicted to receive the same selective RLVR amplification because posterior uncertainty management is not directly equivalent to binary/verifiable reward optimization.

This is a behavioral prediction, not a claim that RLVR internally implements software testing or falsification.

## Critical alternative explanations

1. **Compliance-only**:
   post-training simply makes models better at following any instruction.

2. **Formatting/style-only**:
   stages differ in length, headings, verbosity or conversational polish.

3. **Lexical imitation**:
   models repeat terminology associated with the named method.

4. **Template-only**:
   the method effect is visible only when post-trained models receive their chat template.

5. **Quantization interaction**:
   Q4 alters stages non-uniformly.

6. **Task-method affinity**:
   a task itself naturally favors one methodology and creates false method recoverability.

Each is assigned a negative control or sensitivity analysis in the measurement protocol.

## Strong evidence patterns

### Pattern A — repertoire + routing
- BASE above chance;
- SFT materially stronger;
- BASE-trained method signatures transfer into SFT;
- generic compliance improves but does not explain all method effects.

### Pattern B — post-training emergence
- BASE near chance;
- SFT sharply above chance;
- SFT→DPO/RLVR transfer high;
- BASE→later transfer weak.

### Pattern C — preference homogenization
- SFT high method diversity/recoverability;
- DPO generic compliance improves;
- method-family separability or within-method diversity contracts.

### Pattern D — verifier-selective RLVR
- DPO→RLVR gain concentrated in SOFTWARE_TESTING/FALSIFICATION;
- other families stable or weaker;
- effect persists after length/structure controls.

### Pattern E — surface-only failure
- method classification collapses after lexical ablation or stage control;
- structure/length classifiers explain most apparent differences.

Pattern E would substantially weaken the broader theory.

## Mechanistic boundary

Even Pattern A–D would remain black-box behavioral evidence.
To claim a shared internal methodological representation, a later study must add activation-level evidence and causal intervention (for example representation probing plus intervention), not merely output classification.
