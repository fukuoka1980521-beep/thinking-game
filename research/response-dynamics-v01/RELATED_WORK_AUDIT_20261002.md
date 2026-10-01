# Related Work Audit — 2026-10-02

Purpose: post-analysis publication audit. The original `RELATED_WORK.md` is preserved as historical study material and is not rewritten.

## Verified references used in PREPRINT_V1_1

1. Raj, Gupta, Rosati & Majumdar (2023), *Semantic Consistency for Assuring Reliability of Large Language Models*, arXiv:2308.09138.
   - Verified topic: semantic consistency under meaning-equivalent prompts.
   - DOI: 10.48550/arXiv.2308.09138.

2. Farquhar, Kossen, Kuhn & Gal (2024), *Detecting hallucinations in large language models using semantic entropy*, Nature 630:625-630.
   - Verified topic: uncertainty over semantic meanings rather than lexical forms.
   - DOI: 10.1038/s41586-024-07421-0.

3. Laban, Murakhovs'ka, Xiong & Wu (2023), *Are You Sure? Challenging LLMs Leads to Performance Drops in The FlipFlop Experiment*, arXiv:2311.08596.
   - Verified topic: multi-turn answer flips after challenge prompts.
   - DOI: 10.48550/arXiv.2311.08596.

4. Tang, Gu, Wong & Qin (2025), *Flaw or Artifact? Rethinking Prompt Sensitivity in Evaluating LLMs*, arXiv:2509.01790.
   - Verified topic: evaluation artifacts can overstate prompt sensitivity.
   - DOI: 10.48550/arXiv.2509.01790.
5. He et al. (2025), *Modeling and Predicting Multi-Turn Answer Instability in Large Language Models*, arXiv:2511.10688.
   - Verified topic: repeated questioning, Markov accuracy dynamics, and hidden-state probes.
   - DOI: 10.48550/arXiv.2511.10688.

6. Arike, Donoway, Bartsch & Hobbhahn (2025), *Evaluating Goal Drift in Language Model Agents*, AIES 2025, 8(1):192-203.
   - Verified topic: long-horizon goal drift under competing contextual pressures.
   - DOI: 10.1609/aies.v8i1.36541.

7. Zhang et al. (2025), *A Survey on Multi-Turn Interaction Capabilities of Large Language Models*, arXiv:2501.09959.
   - Verified topic: survey of multi-turn capability, evaluation, and enhancement methods.
   - DOI: 10.48550/arXiv.2501.09959.

## Publication rule

Only references independently verified during this audit are cited in `PREPRINT_V1_1.md`. Provisional items from the historical related-work note are not used unless separately verified.

8. Zhuo, Zhang, Fang, Duan, Lin & Chen (2024), *ProSA: Assessing and Understanding the Prompt Sensitivity of LLMs*, arXiv:2410.12405.
   - Verified topic: instance-level prompt sensitivity, PromptSensiScore, and decoding confidence.
   - DOI: 10.48550/arXiv.2410.12405.

9. Rauba, Wei & van der Schaar (2024), *Quantifying perturbation impacts for large language models*, arXiv:2412.00868.
   - Verified topic: Distribution-Based Perturbation Analysis; empirical null/alternative output distributions to distinguish perturbation effects from intrinsic stochasticity.
   - DOI: 10.48550/arXiv.2412.00868.

## Novelty implication for Research 2

Do not claim novelty for generic prompt perturbation analysis or for separating perturbation effects from stochastic output variability. Candidate differentiation must be narrower: interpretable vector-valued behavioral-state sensitivity, perturbation-direction profiles including history/evidence/referent axes, and explicit component-level measurement calibration.
