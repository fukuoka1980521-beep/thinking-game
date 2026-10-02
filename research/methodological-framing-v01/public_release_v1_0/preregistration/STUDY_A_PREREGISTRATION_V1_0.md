# Study A Preregistration v1.0

Status: FROZEN BEFORE COUNTED COLLECTION

## Research question

Holding the research objective, acting model, generation settings, and neutral output headings fixed, does changing the methodological framing produce a task-general change in the observable structure of an LLM-generated research plan?

## Claim ceiling

This is a black-box behavioral study. It measures observable plan text and does not reveal hidden chain-of-thought, internal neural variables, or prove that any methodology is better.

## Acting model and generation

- model: gpt-5.6-sol
- fresh independent API request for every counted plan
- no prior conversation
- no tools or external evidence
- store=false
- max_output_tokens=8000
- temperature=1.0
- top_p=1.0
- reasoning effort: none
- maximum concurrent requests: 8
- only status=completed responses with incomplete_details=null may become counted first-writer records

## Experimental factors

Tasks:
- T1: LLM response-variation research problem
- T2: cross-site workplace completion-time research problem

Method families:
- GENERIC
- DIFFERENTIAL
- BAYESIAN
- FALSIFICATION
- CAUSAL
- STATE_SPACE
- SOFTWARE_TESTING

Instruction depth:
- LABEL_ONLY
- OPERATIONAL

The research objective is identical within task. Only methodological framing differs across treatment cells.

## Denominator and stopping rule

- LABEL_ONLY: 18 plans per method x task cell = 252 plans
- OPERATIONAL: 6 plans per method x task cell = 84 plans
- total counted denominator: 336 plans
- randomized manifest order, seed 20261002
- stop at the frozen 336 valid first-writer records
- do not increase N after observing outcomes
- failed/incomplete technical attempts are not counted and are logged

## Instrument-development history

Earlier semantic LLM-judge instruments v0.4-v0.6 were rejected by frozen calibration gates because scorer reliability was inadequate.

A judge-free deterministic instrument was then frozen before analyzing the v0.6 calibration text:
- broad explicit method labels and canonical method-specific lexicon are removed;
- remaining text is represented by word unigram+bigram TF-IDF;
- the vectorizer is fitted on the training task only;
- each method is represented by its training-task centroid;
- plans from the opposite task are classified by cosine similarity to those centroids.

Calibration v0.7 passed its predeclared gate:
- T1 -> T2: 8/21
- T2 -> T1: 14/21
- combined: 22/42
- permutation p: 9.999000099990002e-05
- between-minus-within cross-task distance: 0.006940709953470958

Calibration results are engineering evidence only and are not counted Study A findings.

## Primary hypothesis and outcome

Primary subset: 252 LABEL_ONLY plans.

H1:
After removing explicit method labels and the frozen broad method-specific lexicon, research plans retain a task-general signature of methodological framing.

Primary statistic:
combined number of correct held-out cross-task predictions from:
1. train on all T1 LABEL_ONLY plans and predict T2;
2. train on all T2 LABEL_ONLY plans and predict T1.

Chance reference: 1/7.

Primary inference:
10,000-permutation one-sided randomization test, seed 20261002.
For each direction, shuffle only the training-task method labels while preserving the 18-per-class label multiset, refit centroids, and predict the untouched opposite-task plans.

Confirmatory success rule:
- combined permutation p <= 0.01; AND
- T1 -> T2 accuracy > 1/7; AND
- T2 -> T1 accuracy > 1/7.

Report combined and directional accuracies, correct counts, confusion matrix, and per-family recall.

## Convergent secondary measure

For LABEL_ONLY plans, fit the same masked TF-IDF representation on all 252 plans without using labels in feature fitting.

Compute cross-task cosine distance for:
- same-method pairs;
- different-method pairs.

Report mean between-method distance minus mean within-method distance.
A positive value is convergent evidence of task-general method structure but is not required for primary confirmatory success.

## Secondary OPERATIONAL analysis

Apply the same frozen classification algorithm to the 84 OPERATIONAL plans:
- 6 plans per method x task cell;
- T1 -> T2 and T2 -> T1 classification;
- 10,000-permutation one-sided p-value;
- cross-task distance;
- OPERATIONAL minus LABEL_ONLY combined-accuracy difference.

These are secondary and do not alter the primary success rule.

## Falsification / weakening

The planning-effect claim is weakened if the primary permutation result is not significant at the frozen 0.01 level, or if either cross-task direction fails to exceed chance.

A result driven only by OPERATIONAL prompts, while LABEL_ONLY fails, does not satisfy the primary claim.

## Raw-data integrity

For every counted run preserve:
- exact prompt text and SHA-256;
- request body and generation settings;
- request/response timestamps;
- provider response ID;
- returned model ID;
- token usage;
- raw response JSON;
- extracted raw plan text.

First valid write for a run_id is authoritative.
