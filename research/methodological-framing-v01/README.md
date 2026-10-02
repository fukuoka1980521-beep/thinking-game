# Methodological Framing v0.1

## Purpose

Study whether holding a research objective constant while changing only methodological framing changes observable LLM research behavior.

Core causal program:

M -> Z_plan -> E_selected -> Y_conclusion

where:
- M = methodological framing;
- Z_plan = observable research-plan structure;
- E_selected = selected evidence;
- Y_conclusion = interpretation / conclusion.

The program separates:
- Study A: planning effect;
- Study B: fixed-evidence interpretation effect;
- Study C: active evidence-selection and conclusion effect.

## Current state — 2026-10-02

### Study A

Study A is complete and confirmatory-successful.

LABEL_ONLY primary:
- T1 -> T2: 61/126 = 0.4841
- T2 -> T1: 58/126 = 0.4603
- combined: 119/252 = 0.4722
- chance = 0.1429
- 10,000-permutation p = 0.000100

Secondary OPERATIONAL:
- combined accuracy = 0.7857
- permutation p = 0.000100

The effect is heterogeneous across framing families.

### External Replication R1

R1 is complete.

R1a — new task, original model:
- model: gpt-5.6-sol
- new n = 126
- T1 -> T3 = 0.6984
- T3 -> T1 = 0.6349
- T2 -> T3 = 0.8571
- T3 -> T2 = 0.7381
- combined = 0.7321
- permutation p = 0.000100
- preregistered replication success = TRUE

R1b — second model, original tasks:
- model: gpt-6-luna
- new n = 252
- T1 -> T2 = 0.5714
- T2 -> T1 = 0.3810
- combined = 0.4762
- permutation p = 0.000100
- preregistered replication success = TRUE

Joint external replication support: **TRUE**

## Main conclusion

Within the tested tasks, prompt format, models, and frozen deterministic measurement:

> Methodological framing can induce reproducible, task-general and model-replicable differences in the observable structure of LLM-generated research plans.

The result has now replicated:
- across a new substantive task domain; and
- across a second acting model.

## Important heterogeneity

The aggregate effect is not uniform across framing families.

In R1b pooled recall:
- GENERIC: 0.1111
- DIFFERENTIAL: 0.0000
- BAYESIAN: 0.9167
- FALSIFICATION: 0.4444
- CAUSAL: 0.2500
- STATE_SPACE: 0.7222
- SOFTWARE_TESTING: 0.8889

This heterogeneity is part of the finding, not noise to be hidden.

## Claim ceiling

Allowed:
- randomized framing changed observable plan structure;
- the signature generalized across tasks;
- the aggregate effect replicated on a second model;
- method families differ in recoverability.

Not allowed:
- hidden chain-of-thought was observed;
- internal neural variables were identified;
- one methodology is objectively superior;
- the effect is universal across all models/domains/languages;
- plan-structure differences necessarily improve scientific quality.

## Files to read first

- `STUDY_A_PREREGISTRATION_V1_0.md`
- `STUDY_A_FINAL_REPORT_V1_0.md`
- `REPLICATION_R1_PREREGISTRATION_V1_0.md`
- `REPLICATION_R1_FREEZE_V1_0.json`
- `replication_r1/analysis/REPLICATION_R1_RESULTS.md`
- `EXTERNAL_REPLICATION_R1_FINAL_REPORT_V1_0.md`
- `STATUS.json`

## Next step

Proceed to Study B.

Study B fixes the evidence packet across framing conditions and asks whether methodological framing changes interpretation / conclusion when evidence selection is removed:

M -> Y_conclusion | E = E*

This is the cleanest next step for distinguishing planning-style effects from interpretation effects.

## Boundary

This project measures observable black-box research behavior only.
