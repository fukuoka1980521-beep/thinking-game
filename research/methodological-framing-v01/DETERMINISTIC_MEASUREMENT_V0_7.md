# Deterministic Measurement v0.7 — Cross-Task Method Signature

Status: instrument-development freeze BEFORE deterministic analysis of v0.6 plan text.

## Motivation

v0.4-v0.6 show that LLM-judge ontologies are the measurement bottleneck. The primary Study A instrument is therefore moved away from semantic judge labels.

Question:
After removing explicit method names and a broad method-specific lexicon, does the remaining research-plan text still carry a task-general signature of the methodological framing?

## Data used for this instrument validation

Calibration v0.6 only:
- 2 tasks;
- 7 framing conditions;
- 3 fresh LABEL_ONLY plans per task x condition;
- 42 plans total;
- all acting-model responses completed.

This remains non-counted calibration evidence.

## Fixed preprocessing

1. Lowercase.
2. Normalize Unicode punctuation to spaces where tokenization would otherwise split inconsistently.
3. Remove the fixed output-requirement heading phrases shared by every plan.
4. Remove a frozen broad lexicon that directly names the treatment families or their canonical signature vocabulary.
5. Tokenize ASCII alphabetic words of length >=2.
6. Do not inspect condition labels when building the vocabulary for a train direction.

## Frozen broad method lexicon

DIFFERENTIAL family:
differential, derivative, gradient, local sensitivity, sensitivity analysis, finite difference, perturbation, noise floor

BAYESIAN family:
bayesian, bayes, prior, posterior, likelihood, bayes factor, credible interval

FALSIFICATION family:
falsification, falsify, falsifiable, disconfirmation, counterexample, severe test, refutation, refute

CAUSAL family:
causal, causality, counterfactual, treatment effect, average treatment effect, intervention effect, identification strategy, propensity score, instrumental variable, difference in differences, directed acyclic graph

STATE_SPACE family:
state space, state-space, state vector, latent state, state transition, transition equation, observation equation, markov

SOFTWARE_TESTING family:
software testing, software-testing, unit test, integration test, regression test, metamorphic test, test oracle, test case, test harness, fuzz test, boundary test

Masking removes these phrases/tokens rather than replacing them with a visible placeholder, so mask frequency cannot itself identify the condition.

## Representation

- word unigrams and bigrams;
- TF = 1 + log(count);
- IDF = log((1 + N_train)/(1 + document_frequency)) + 1;
- vocabulary and IDF fitted on the training task only;
- L2 normalize each document vector;
- class representation = mean normalized vector of the 3 training plans for that condition, followed by L2 normalization.

## Prediction

For each held-out plan, predict the condition whose opposite-task centroid has the highest cosine similarity.

Two fully held-out directions:
- train T1 -> test T2;
- train T2 -> test T1.

No plan is used to train its own direction.

## Primary validation statistic

Cross-task multiclass accuracy, separately by direction and combined across 42 held-out predictions.

Chance reference = 1/7.

## Fixed permutation test

10,000 permutations with seed 20261002.

For each permutation and each direction:
- shuffle the 21 training labels while preserving the observed 3-per-class label multiset;
- refit class centroids;
- predict the untouched opposite-task plans;
- combine correct predictions over both directions.

One-sided p-value = (1 + permutations with correct_count >= observed_correct_count)/(10001).

## Secondary deterministic statistic

For this secondary statistic only, fit the same masked unigram+bigram TF-IDF representation once on all 42 calibration plans; condition labels are not used in feature fitting. Compare mean cosine distance:
- within the same method family across tasks;
- between different method families across tasks.

Report between-minus-within distance; positive means same-method plans remain closer across tasks.

## Boundary

This instrument measures observable plan-text signatures. It does not identify hidden reasoning states and does not rank any methodology as better.
