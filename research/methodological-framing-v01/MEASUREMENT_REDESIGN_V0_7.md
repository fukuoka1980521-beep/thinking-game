# Measurement Redesign v0.7 — Cross-Task Methodological Discriminability

Status: instrument development. Counted Study A remains 0.

## Motivation

v0.4/v0.5 showed positive structural separation but hand-coded plan-state fields were not reliable enough.
v0.6 made artifact coding stricter with exact evidence spans, but the resulting six-artifact vector lost separation.

The measurement bottleneck is therefore the hand-defined ontology, not necessarily absence of method-linked structure.

## v0.7 measurement

Measure whether methodological framing leaves a reproducible observable signature in research plans that generalizes across tasks.

Procedure:
1. redact direct method names / near-exact prompt labels from every plan;
2. tokenize remaining text into word unigrams and bigrams;
3. map features into a fixed 8192-dimensional stable hash space;
4. use log1p term counts and L2 normalization;
5. train cosine nearest-centroid class prototypes on T1 and predict T2;
6. train on T2 and predict T1;
7. report combined cross-task accuracy and macro-F1;
8. assess accuracy against 10,000 label permutations preserving class counts.

## Why cross-task

A classifier that works only within one research problem could be exploiting task-specific wording.
Cross-task transfer requires the method-linked signature to recur in a different substantive problem.

## Direct-label redaction

Redact only direct names / near-exact prompt labels:
- generic
- differential
- local-sensitivity
- Bayesian
- falsification / falsification-first
- causal-inference
- state-space
- software-testing

Do not redact operational vocabulary such as posterior, counterfactual, transition, replay, invariant, or regression harness. Those are observable plan choices, not prompt-label leakage.

## Interpretation boundary

This instrument measures observable method-linked plan-text / research-plan signatures.
It does not establish hidden chain-of-thought states, internal neural variables, or methodological superiority.

## Fresh validation

Use a fresh 42-plan validation sample:
- 2 tasks
- 7 LABEL_ONLY conditions
- 3 fresh runs per task x condition cell

The v0.7 gate is frozen before these 42 plans are generated.

