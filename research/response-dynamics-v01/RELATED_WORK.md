# Related Work and Positioning

## Established prior art
- Raj et al. (2023), *Semantic Consistency for Assuring Reliability of Large Language Models*: meaning-level consistency under equivalent prompts.
- Farquhar et al. (Nature, 2024), *Detecting hallucinations in large language models using semantic entropy*: uncertainty over semantic meanings rather than surface strings.
- Faghih et al. (2026), *Same Question, Different Answers*: instance-level flips under meaning-preserving paraphrases.
- He et al. (2025), *Modeling and Predicting Multi-Turn Answer Instability in Large Language Models*: repeated questioning, Markov-chain accuracy dynamics, and hidden-state probes.
- MathBode (2025): Bode-style gain/phase diagnostics for parameterized LLM reasoning.
- Arike et al. (2025) and Menon et al. (2026): long-horizon goal drift and contextual trajectory effects.
- Provenance-aware agent-memory work: origin, timestamp, and evidence pointers as first-class memory properties.

## Not claimed as novel
This project does not claim novelty for answer inconsistency, semantic clustering, entropy uncertainty, Markov modeling, dynamical-systems framing, hierarchical goals, or provenance.

## Candidate differentiated contribution
A unified **black-box response-state protocol** measuring:
1. exact-prompt fresh-context variability;
2. meaning-preserving perturbation sensitivity;
3. context/prior-answer path dependence;
4. hypothesis-to-premise hardening;
5. error propagation/amplification;
6. verification and referent/provenance correction.

The empirical test is whether this structured state representation explains or predicts transitions beyond simple answer-match/accuracy metrics. Novelty remains provisional.
