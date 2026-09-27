# Literature Positioning — Operational Latent State Reliability
**Date:** 2026-09-27  
**Status:** POSITIONING / NON-CLAIM  
**Scope:** Answer variance, hallucination, metacognitive control, and latent-state terminology

## 1. Terminology decision

This project uses **Operational Latent State Reliability (OLSR)** for the research track previously called Latent State Reliability.

Here, *latent state* means:

> a lower-dimensional operational factor inferred from observable workflow evidence, case features, answer differences, source state, and action trajectories.

It does **not** mean transformer hidden states, residual-stream activations, attention states, or other model-internal neural representations.

The repository path remains `research/latent-state-v01/` for continuity, but publication-facing language should use **Operational Latent State Reliability** unless referring specifically to model-internal hidden-state work.

## 2. Answer inconsistency is already an established research problem

Our research must not claim novelty for the observation that LLM answers can vary under equivalent or near-equivalent prompts.

Relevant work includes:

- Takayama et al. (LREC 2026), *Evaluating the Effect of Question Wording Variations on Answer Consistency in Large Language Models*. DOI: 10.63317/4k8j56pzchi7.
  - Shows that semantically equivalent wording changes can alter answers, including systematic sensitivity to agreement-seeking and antonym substitutions.
- Faghih et al. (2026), *Same Question, Different Answers: Evaluating LLM Reliability Beyond Accuracy*. arXiv:2607.22554.
  - Studies instance-level answer flips under meaning-preserving paraphrases across factual QA and reasoning.
- Pinhanez et al. (AAAI 2026), *Small Models Exhibit Limited Answer Consistency in Repetition Trials of the Multiple-Choice MMLU-Redux and MedQA Benchmarks*. DOI: 10.1609/aaai.v40i39.40550.
  - Studies repeated answering of the same questions and consistency under repeated trials.
- Nalbandyan et al. (NAACL Industry 2025), *SCORE: Systematic COnsistency and Robustness Evaluation for Large Language Models*. DOI: 10.18653/v1/2025.naacl-industry.39.
  - Frames robustness as a separate reliability dimension beyond a single benchmark score.
- Dong et al. (ACL 2026), *Revisiting the Reliability of Language Models in Instruction-Following*. DOI: 10.18653/v1/2026.acl-long.354.
  - Studies reliability across cousin prompts and shows strong aggregate benchmark scores can hide prompt-level instability.

### Our narrower question

The distinct target here is not merely paraphrase robustness.

We ask whether, in **natural longitudinal work**, materially same questions with materially same evidence/context can produce different:
- core claims,
- decision boundaries,
- next actions,

and whether such variance co-occurs with the same operational factors seen in hallucination and Local Task Momentum cases.

That is a field/operational reliability question rather than a benchmark-paraphrase claim.

## 3. Hallucination is multifaceted; a single-factor theory is not justified

Recent surveys already treat hallucination as heterogeneous rather than a single mechanism.

Relevant work:

- Zhang et al. (Computational Linguistics 2025), *Siren's Song in the AI Ocean: A Survey on Hallucination in Large Language Models*. DOI: 10.1162/coli.a.16.
- Huang et al. (ACM TOIS 2025), *A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions*. DOI: 10.1145/3703155.
- Bang et al. (ACL 2025), *HalluLens: LLM Hallucination Benchmark*. DOI: 10.18653/v1/2025.acl-long.1176.
  - Explicitly distinguishes hallucination categories and separates hallucination from factuality as a single undifferentiated construct.

This supports maintaining a **multi-lens hypothesis registry** rather than promoting the earlier value/cost-scoring idea into a general theory.

## 4. Hidden-state factuality work creates an important distinction

There is active research on whether neural hidden states encode factuality or hallucination signals.

Relevant work:

- Orgad et al. (ICLR 2025), *LLMs Know More Than They Show: On the Intrinsic Representation of LLM Hallucinations*.
  - Reports truthfulness-related information in internal representations, but also poor generalization of detectors across datasets and multifaceted error representations.
- Servedio et al. (ACL 2025), *Are the Hidden States Hiding Something? Testing the Limits of Factuality-Encoding Capabilities in LLMs*. DOI: 10.18653/v1/2025.acl-long.304.
  - Challenges broad generalization from synthetic factuality probes to more realistic generated data.
- Han et al. (Findings of EMNLP 2025), *Simple Factuality Probes Detect Hallucinations in Long-Form Natural Language Generation*. DOI: 10.18653/v1/2025.findings-emnlp.880.
  - Shows hidden-state probes can predict factuality in tested open-weight models.

### Consequence for OLSR

Our observed operational factors must not be described as if they were model-internal neural states.

A future study could compare OLSR factors with hidden-state probes in open-weight models, but that would be a separate experiment requiring model-internal access.

## 5. Metacognition and reassessment are also not unique concepts

MetaCogAgent (Wang & Shu, 2026; arXiv:2605.17292) studies metacognitive self-assessment and adaptive delegation in multi-agent systems.

Therefore STGR / OLSR should not claim novelty for generic “AI should reassess itself” or “agents need metacognition.”

The narrower STGR contribution remains:
- observable trigger conditions in natural software-development states;
- a decision boundary before consequential mutation / scope switch / closure;
- prospective state freeze;
- bounded evidence gathering;
- leakage-free shadow comparison;
- explicit separation of ordinary trigger-negative work.

## 6. Current research gap we are actually pursuing

The strongest defensible gap is the intersection:

> Can naturally occurring agent-development failures that look different on the surface — answer variance, unsupported factualization, and Local Task Momentum — be represented by a smaller set of **operational latent factors**, and can those factors predict when a bounded reassessment or evidence intervention is useful?

This is narrower than:
- discovering answer inconsistency;
- discovering hallucination;
- discovering hidden-state factuality;
- inventing metacognition.

## 7. Falsification / narrowing conditions

The OLSR hypothesis should be weakened or split if:

- answer-variance cases cluster independently from hallucination/LTM cases;
- latent components are unstable under leave-one-out checks;
- structure disappears across projects or model routes;
- components mainly reflect missingness or logging artifacts;
- interventions effective for one track fail on the others;
- better explanatory variables emerge from source identity, task type, model family, or prompt structure alone.

A null result is acceptable: the three tracks may simply be different phenomena requiring separate controls.
