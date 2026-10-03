# Theory Decomposition v1.2 — Data, Selection, Compression

Status: PRE-PILOT THEORY SYNTHESIS
Date: 2026-10-03

## Revised causal object

The experiment does not treat "training algorithm" as the only cause.

A post-training stage packages together:
- data distribution;
- teacher/completion source;
- preference judge and evaluation dimensions;
- objective/loss;
- on-policy/off-policy sampling;
- verifier/reward definition;
- chat/interface conventions.

Therefore the behavioral estimand is:

**effect of the post-training stage package on responsiveness to methodological framing.**

## Working decomposition

Pretraining/midtraining
→ broad repertoire

SFT
→ instruction routing + teacher-style imitation priors

DPO
→ preference-based selection pressure + possible response-space contraction

RLVR
→ verifier/reward-driven policy pressure + possible compression around checkable success behaviors

Runtime MethodFraming
→ selects/amplifies/composes learned routines

Task
→ determines which routines are useful/expressed.

## Two competing post-training hypotheses

### H-A: Method amplification
Post-training improves the model's ability to preserve a requested methodology.
Prediction:
- method recoverability rises with stage;
- cross-stage transfer remains strong;
- family-specific signatures become clearer.

### H-B: Policy convergence / diversity compression
Preference/RL training narrows the set of output strategies.
Prediction:
- generic compliance rises;
- within-cell diversity falls;
- some distinct methodology signatures may weaken or collapse despite better formatting/instruction following.

These are not mutually exclusive:
a stage can improve compliance while compressing behavioral diversity.

## External evidence motivating H-B

Recent OLMo/OLMo 2 fine-tuning studies report reduced output diversity after instruction/post-training, with DPO showing particularly strong diversity effects in some evaluations.

Recent representation-geometry work across OLMo/Pythia reports different geometric dynamics across SFT/DPO versus RLVR and associates RLVR with compression-like changes and reduced generation diversity.

These external results motivate the hypothesis only. The current project tests its own behavioral outputs independently.

## Key discriminating measurements in the 72-run pilot

1. method cross-task classification by stage;
2. structure-only and length-only controls;
3. stage-identity classifier;
4. cross-stage method transfer;
5. within-cell residual lexical diversity;
6. generic instruction compliance.

### Interpretation examples

**Compliance ↑, method signal ↑, diversity stable**
→ routing/amplification favored.

**Compliance ↑, method signal ↓, diversity ↓**
→ policy convergence favored.

**Compliance ↑, method signal stable, family recalls change**
→ selection reshaping favored.

**RLVR specifically increases SOFTWARE_TESTING while global diversity drops**
→ verifier-selective pressure plus global compression is plausible.

**Lexical method signal ≈ structure-only signal**
→ surface/format explanation remains sufficient; no methodological specialization claim.

## Internal-mechanism boundary

Even if behavioral findings align with external representation-geometry work, they do not establish the same internal mechanism in these exact checkpoints.

A mechanistic follow-up would require:
- higher-precision checkpoint analysis;
- activation/representation similarity;
- causal intervention;
- controlled comparisons separating data from algorithm.

Until then the vocabulary is:
- behavioral repertoire;
- routing;
- selection pressure;
- compression/diversity;
- method-conditioned output signature.

Not:
- human-like reasoning faculty;
- fixed "Bayesian neuron/vector";
- chain-of-thought access.
