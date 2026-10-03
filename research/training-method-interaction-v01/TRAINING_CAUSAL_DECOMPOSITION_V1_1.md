# Training Causal Decomposition v1.1

Status: THEORY REFINEMENT BEFORE METHOD-FAMILY PILOT RESULTS
Date: 2026-10-03

## Core correction

"Reasoning style comes from the training method" is still too coarse.

A post-training stage is better decomposed as:

TrainingStage =
DataDistribution
× Target/PreferenceSignal
× Teacher/Judge/Verifier
× OptimizationObjective
× ModelPolicyAtDataGeneration
× Interface/Template
× RuntimeDecoding.

Observed behavior then becomes:

Behavior =
PretrainedRepertoire
× TrainingStage
× RuntimeMethodInstruction
× Task.

## 1. Pretraining / midtraining

Key causal ingredients:
- what documents and domains were present;
- token frequencies and curriculum order;
- late-stage specialized mixtures;
- architecture and capacity;
- next-token prediction objective.

Likely effect:
- creates the broad repertoire of concepts, procedures, styles, code patterns, scientific vocabulary and problem decompositions that later stages can select from.

Research question:
- does named methodology already select distinguishable behavior before explicit instruction tuning?

## 2. SFT

Not simply "supervised learning".

Causal ingredients include:
- prompt distribution;
- completion distribution;
- teacher/source of completions;
- task balance;
- formatting conventions;
- chat template.

Tülu 3's synthetic SFT responses were produced using strong teacher models including GPT-4o and Claude 3.5 Sonnet for some data categories.

Therefore an SFT-stage "reasoning style" can partly reflect:
- improved routing from natural-language instruction;
- imitation of teacher response organization;
- overrepresentation of particular problem-solving conventions in the SFT mixture.

Current local smoke is consistent with the first component:
BASE produces plan-like content, while SFT sharply increases structural instruction adherence under the same raw input.

## 3. DPO / preference training

Not simply "alignment".

Causal ingredients include:
- which prompts receive preference pairs;
- which candidate models generate alternatives;
- on-policy versus off-policy sampling;
- judge model;
- rating dimensions;
- chosen/rejected construction;
- DPO loss/hyperparameters.

Tülu 3 preference construction used both on-policy and off-policy responses and an LLM judge, with evaluation dimensions including:
- helpfulness;
- instruction-following;
- honesty;
- truthfulness.

Therefore DPO should be modeled as a **selection-pressure transformation** over a policy already shaped by SFT.

Prediction:
- DPO may preserve the available methodological repertoire but alter which forms are expressed most readily, coherently or consistently.

Current GENERIC smoke:
SFT_RAW ↔ DPO_RAW lexical similarity is high (~0.84) and both show 7/8 explicit neutral headings. This is more consistent with continuity plus selection reshaping than with wholesale creation of a new planning mode. Method-conditioned pilot data are still required.

## 4. RLVR

Not simply "more reasoning".

Causal ingredients:
- which tasks are verifiable;
- verifier/reward definition;
- reward sparsity;
- success/failure threshold;
- policy sampling/exploration;
- RL algorithm.

Tülu 3/OLMo 2 RLVR targets tasks such as:
- grade-school/math problems;
- MATH;
- precise instruction constraints / IFEval-type tasks.

This trains the policy against **externally checkable success criteria**.

Directional prediction:
methodologies that naturally encode explicit checks/failure conditions may be selectively affected:
- SOFTWARE_TESTING strongest candidate;
- FALSIFICATION secondary candidate.

This does not imply that RLVR "learns software testing". It predicts an overlap between the reward geometry and behaviors favored by verification-oriented methodologies.

## 5. Runtime methodological instruction

The prompt does not need to create a reasoning method from scratch.

Possible mechanisms:
1. **Selection** — choose one existing policy region.
2. **Amplification** — increase probability of a weak/preexisting strategy.
3. **Composition** — combine several learned routines into a new task-specific plan.
4. **Surface imitation** — merely copy vocabulary/format.

The parent 714-plan study already weakens the pure surface-imitation explanation because method labels/canonical terminology were masked and transfer survived task/model changes.

The new stage study distinguishes selection/amplification from later post-training effects.

## Revised research model

Instead of:

Training method → reasoning style

use:

Pretraining corpus/curriculum
→ repertoire

SFT prompt/completion/teacher distribution
→ routing + imitation priors

DPO candidate/judge/preference signal
→ selection probabilities

RLVR verifier/reward landscape
→ success-oriented policy pressure

Runtime method prompt
→ conditional selection/amplification/composition

Task/environment
→ realized behavior.

## Consequence for interpretation

Even if the 72-run pilot finds a strong TrainingStage × MethodFraming interaction, the result must be described as:

"the post-training package changes responsiveness to methodological framing"

not:

"SFT/DPO/RLVR algorithm X causes cognitive faculty Y."

To isolate algorithm from data/judge/reward structure would require additional controlled training experiments, not only checkpoint comparison.

## Future mechanistic extension

If behavioral results support stable cross-stage method signatures:

1. obtain higher-precision checkpoints;
2. probe activations for method-conditioned representations;
3. test whether representation similarity persists BASE→SFT→DPO→RLVR;
4. intervene on candidate representations;
5. determine whether the same latent direction changes behavior causally.

Only that later layer could support claims about internal reasoning representations.
