# External Literature Synthesis v1.3 — Creation vs Selection

Status: BACKGROUND EVIDENCE / PRIOR TO FULL 72-RUN PILOT RESULT
Date: 2026-10-03

## Central theoretical question

Does post-training create new reasoning styles, or does it mainly change the probability/routing of behaviors already latent in the base model?

The current research program calls this:

**Creation vs Selection / Amplification**

## Evidence favoring a selection/amplification account

### RLVR capability-boundary evidence

Yue et al. (2025), *Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?*, compare RL-trained reasoning models with their base models using large-pass@k evaluation.

Their reported pattern:
- RL models improve strongly at low k / ordinary sampling;
- base models can match or exceed RL models at sufficiently large k;
- reasoning paths favored after RL are often already found within the base model's broader sampling distribution;
- RL biases probability mass toward higher-reward paths and may narrow the sampled reasoning boundary.

Relevance here:

If OLMo RLVR changes methodological-plan signatures, one plausible interpretation is not "RLVR invented a new reasoning style" but:
**RLVR reweighted which already-available strategies are sampled efficiently and persistently.**

This is especially compatible with the proposed Repertoire → Selection/Search model.

### Instruction vectors across SFT/DPO

Bigoulaeva et al. (2026), *Patches of Nonlinearity: Instruction Vectors in Large Language Models*, study instruction-specific representations across SFT and DPO.

They report:
- localized instruction representations;
- linear separability combined with nonlinear causal interactions;
- task representations established earlier in the network can condition selection of different later information-processing pathways;
- their "instruction vectors" can act as circuit selectors.

Relevance here:

This provides a mechanistic precedent for treating instruction following as pathway selection/routing rather than merely surface text imitation.

It does **not** prove that BAYESIAN / SOFTWARE_TESTING / FALSIFICATION correspond to fixed instruction vectors in OLMo 2.

## Updated theoretical model

A stronger working model is:

1. **Pretraining / midtraining**
   creates a broad repertoire and probability distribution over strategies.

2. **SFT**
   improves mapping from explicit instructions to subsets of that repertoire and stabilizes instruction-conditioned trajectories.

3. **DPO / preference optimization**
   changes relative probability of response policies judged preferable, potentially narrowing or reshaping diversity.

4. **RLVR**
   increases probability/persistence of trajectories that produce verifiable reward and may narrow search toward high-reward patterns.

5. **Runtime MethodPrompt**
   acts as a context-dependent selector over the resulting post-training policy.

Thus:

ObservedMethodBehavior = Sample(Policy(TrainingHistory) | Task, MethodPrompt)

rather than:

MethodPrompt creates a reasoning faculty at inference time.

## Empirical consequence for this project

The strongest support for a repertoire-first/selection model would be a combination of:

- above-chance method recoverability at BASE;
- improved generic compliance after SFT without necessarily equal improvement in method recoverability;
- cross-stage transfer of some method signatures;
- DPO/RLVR changing family-specific probability/recall/diversity rather than creating wholly orthogonal classes.

The partial BASE/SFT pilot already shows one compatible pattern:
generic structural compliance increases sharply from BASE to SFT while three-class method recoverability remains equal at 0.389.

This is descriptive and incomplete until DPO/RLVR finish.

## Mechanistic next study if behavioral result is strong

Only after behavioral replication:
- activation capture across BASE/SFT/DPO/RLVR;
- representation similarity for identical task/method prompts;
- linear/nonlinear probes for MethodFraming;
- causal activation patching/steering;
- test whether a methodology representation acts as a circuit selector;
- compare whether stage transitions rotate/reweight the same representation versus create a new one.

This would move the program from black-box behavioral evidence toward a mechanistic account.

## Source identifiers verified 2026-10-03

- Yue et al. (2025), *Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?* — arXiv:2504.13837.
- Bigoulaeva et al. (2026), *Patches of Nonlinearity: Instruction Vectors in Large Language Models* — arXiv:2602.07930.
- Wu et al. (2023), *From Language Modeling to Instruction Following: Understanding the Behavior Shift in LLMs after Instruction Tuning* — arXiv:2310.00492.
- Lambert et al. (2024), *Tulu 3: Pushing Frontiers in Open Language Model Post-Training* — arXiv:2411.15124.

These sources are background/interpretive evidence only and are not used to alter the frozen pilot design.
