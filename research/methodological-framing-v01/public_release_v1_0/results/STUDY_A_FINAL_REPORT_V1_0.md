# Study A Final Report v1.0 窶・Methodological Framing

Status: COUNTED CONFIRMATORY STUDY COMPLETE
Date: 2026-10-02

## Research question

Holding research objective, acting model, generation settings, and neutral output headings fixed, does changing methodological framing alter the task-general observable structure of an LLM-generated research plan?

## Design

- Acting model: gpt-5.6-sol
- Fresh independent API request per plan
- No prior conversation
- No tools or external evidence
- store=false
- max_output_tokens=8000
- temperature=1.0
- top_p=1.0
- reasoning effort: none
- Frozen denominator: 336
  - LABEL_ONLY: 252
  - OPERATIONAL: 84
- 7 framing families x 2 tasks
- Manifest seed: 20261002
- Freeze occurred before counted collection
- Counted runs at freeze: 0

## Integrity

Study A validation passed:

- raw records: 336/336
- unique response IDs: 336/336
- LABEL_ONLY: 252
- OPERATIONAL: 84
- counted runs at freeze: 0

## Confirmatory primary result 窶・LABEL_ONLY

Frozen success rule:
- combined permutation p <= 0.01; AND
- T1 -> T2 accuracy > 1/7; AND
- T2 -> T1 accuracy > 1/7.

Observed:

- T1 -> T2: 61/126 = 0.4841
- T2 -> T1: 58/126 = 0.4603
- combined: 119/252 = 0.4722
- chance reference: 1/7 = 0.1429
- 10,000-permutation p = 0.000100
- between-minus-within cross-task distance = +0.004710

Confirmatory success: **YES** under the preregistered rule.

## Heterogeneity by framing family

LABEL_ONLY pooled recall:

- GENERIC: 0/36 = 0.0000
- DIFFERENTIAL: 0/36 = 0.0000
- BAYESIAN: 32/36 = 0.8889
- FALSIFICATION: 7/36 = 0.1944
- CAUSAL: 22/36 = 0.6111
- STATE_SPACE: 36/36 = 1.0000
- SOFTWARE_TESTING: 22/36 = 0.6111

Therefore the confirmed planning effect is **heterogeneous**.

The result does not support the stronger statement that every methodological frame produces an equally distinct or recoverable plan signature. In particular, GENERIC and DIFFERENTIAL were not recoverable as their own classes under the frozen primary classifier.

## Secondary result 窶・OPERATIONAL framing

- T1 -> T2: 36/42 = 0.8571
- T2 -> T1: 30/42 = 0.7143
- combined: 66/84 = 0.7857
- 10,000-permutation p = 0.000100
- between-minus-within distance = +0.009679
- OPERATIONAL minus LABEL_ONLY accuracy = +0.313492

This is secondary evidence that specifying the operational form of a methodology produces a substantially stronger observable signature than naming the methodology alone.

It is not part of the primary confirmatory success criterion.

## Main conclusion

Within the tested model, tasks, prompts, and frozen measurement procedure:

> Changing methodological framing while holding the research objective fixed can produce reproducible, task-general changes in the observable structure of generated research plans.

The strongest supported form is behavioral and black-box:

Methodological framing
-> observable plan-structure / lexical-strategic signature
-> cross-task recoverability above chance.

## What is not established

This study does not establish:

- direct access to hidden chain-of-thought;
- which internal neural variables changed;
- that one methodology is objectively better;
- that every framing family is equally distinct;
- that the measured effect generalizes to every model, domain, or task;
- that the stronger OPERATIONAL effect is causal beyond the randomized prompt manipulation used here without replication across additional tasks/models.

## Relation to the broader research program

Response Dynamics v0.1 asked how small input/context perturbations change observable response state.

Study A extends that idea to a higher-level perturbation:

Delta MethodologicalFraming -> Delta ObservableResearchPlan.

This provides empirical support for continuing to Study B and Study C:

- Study B: fixed evidence, framing-dependent interpretation;
- Study C: framing-dependent evidence selection and downstream conclusion.

## Next recommended scientific step

Do not immediately scale Study A sample size.

The highest-value next step is external replication:
1. add at least one new task domain not used in calibration or Study A;
2. repeat with a second acting model;
3. keep the frozen deterministic measurement unchanged;
4. test whether the same cross-task signal and framing heterogeneity replicate.

Only after replication should stronger general claims be considered.
