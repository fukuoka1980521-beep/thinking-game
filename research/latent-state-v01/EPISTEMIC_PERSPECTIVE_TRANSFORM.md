# Epistemic Perspective Transform — v0.1

When a material answer variance or hallucination/near-miss appears, do **not** ask only:

> Why did the model make this mistake?

Reframe the same event through independent lenses.

## Lenses

1. **Acquisition lens** — Was the necessary evidence ever retrieved?
2. **Identity lens** — Was the correct source/entity/version/environment used?
3. **Time lens** — Were facts from the correct time window used?
4. **Context lens** — Did unrelated chat/memory/project state contaminate the answer?
5. **Inference lens** — Did a plausible inference become a factual claim?
6. **Measurement lens** — Did a test/tool/validator result mean what the answer assumed it meant?
7. **Action-pressure lens** — Did completion, helpfulness, repair momentum, or closure pressure push the system past the evidence boundary?
8. **Representation lens** — Did ambiguity, tokenization, semantic compression, or entity resolution distort the state?
9. **Calibration lens** — Was confidence stronger than the evidence justified?
10. **Control lens** — Would a different gate, source check, or UNKNOWN state have interrupted the failure?

## Use

A case may support several lenses at once.

The purpose is not to maximize the number of explanations. The purpose is to avoid locking onto the first attractive explanation.

For each material case:
- mark supported lenses;
- mark contradicted lenses;
- leave unsupported lenses UNKNOWN;
- identify one lowest-cost discriminating observation or test.

This keeps the research cycle:

**Observation → multiple explanations → discriminating evidence → update**

rather than:

**Observation → attractive story → implementation**.
