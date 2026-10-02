# Methodological Framing v0.1

## Purpose

Study whether holding a research objective constant while changing methodological framing changes observable LLM research behavior.

Core program:

M -> Z_plan -> E_selected -> Y_conclusion

where:
- M = methodological framing;
- Z_plan = observable research-plan content / structure;
- E_selected = selected evidence;
- Y_conclusion = interpretation / conclusion.

## Current state — 2026-10-03

### Paid API policy

**Paid API generation is disabled.**

Authoritative controls:
- `NO_PAID_API_POLICY_20261003.md`
- `PAID_EXTERNAL_CALL_GATE_V1_0.md`

Research GitHub Actions capable of paid model calls are manually disabled.

HUKUOKA task:
- `StudyC_AutoResume_HUKUOKA` = DISABLED

A generic request such as "進めて" does not authorize a paid API batch.

## Complete counted evidence

### Study A — complete confirmatory success

Total n = 336.

LABEL_ONLY primary:
- T1 -> T2 = 61/126 = 0.4841
- T2 -> T1 = 58/126 = 0.4603
- combined = 119/252 = 0.4722
- chance = 0.1429
- 10,000-permutation p = 0.000100

Secondary OPERATIONAL:
- combined accuracy = 0.7857
- permutation p = 0.000100

### External Replication R1 — complete success

New counted n = 378.

R1a — new task, original model:
- combined four-direction accuracy = 0.7321
- permutation p = 0.000100
- preregistered replication success = TRUE

R1b — second model, original tasks:
- model = gpt-6-luna
- combined accuracy = 0.4762
- permutation p = 0.000100
- preregistered replication success = TRUE

Joint external replication support = **TRUE**.

Complete counted plans available for publication:
- Study A 336
- R1 378
- total = **714**

## Zero-cost robustness

Post-hoc robustness uses the 630 LABEL_ONLY plans from Study A + R1 and makes **zero new model calls**.

### Simultaneous model + task shift

Frozen Study A text measurement:
- combined accuracy = **0.4762**
- 10,000-permutation p = **0.000100**

### T3 / second-model bridge

- combined accuracy = **0.5298**
- 10,000-permutation p = **0.000100**

### Same-task cross-model

- combined accuracy = **0.7401**
- 10,000-permutation p = **0.000100**

### Structure-only negative control

Using only document length, section allocation, line/bullet/numbering and related formatting quantities:

Simultaneous model + task shift:
- combined = 0.1468
- p = 0.320068

T3 / second-model bridge:
- combined = 0.1389
- p = 0.785921

Therefore the replicated signal is not explained by gross formatting / section-length structure alone.

The stronger interpretation is a **lexical / strategic research-plan signature** that remains after explicit method names and a broad canonical method lexicon are masked.

## Important heterogeneity

Under simultaneous model + task shift pooled recall:

- GENERIC = 0.028
- DIFFERENTIAL = 0.000
- BAYESIAN = 0.806
- FALSIFICATION = 0.375
- CAUSAL = 0.569
- STATE_SPACE = 0.875
- SOFTWARE_TESTING = 0.681

GENERIC and DIFFERENTIAL are much more task-dependent than the other five framing families.

## Downstream boundary evidence

### Study B — fixed evidence

Two preregistered calibration instruments failed GO.

Counted Study B = 0.

### Study C — adaptive evidence selection

Calibration v0.2 passed its GO gate.

Counted Study C was frozen at n=252 but paid collection stopped after 93 valid trajectories.

Current rule:
- preserve 93;
- do not interpret partial counted data;
- do not resume paid collection.

### Study D — structured evidence assimilation

Calibration failed GO.

Counted Study D = 0.

## Strongest supported claim

Within the tested prompts, tasks, models and frozen deterministic measurement:

> Methodological framing produces preregistered, externally replicated, task-general and model-replicable differences in the lexical / strategic content of free-form LLM research plans, beyond explicit method labels and gross document-format structure.

## Claim ceiling

Not established:
- hidden chain-of-thought;
- neural mechanism;
- methodological superiority;
- equal stability across all framing families;
- guaranteed downstream decision changes;
- universal generalization to arbitrary models/domains/languages.

## Files to read first

- `STUDY_A_PREREGISTRATION_V1_0.md`
- `STUDY_A_FINAL_REPORT_V1_0.md`
- `REPLICATION_R1_PREREGISTRATION_V1_0.md`
- `EXTERNAL_REPLICATION_R1_FINAL_REPORT_V1_0.md`
- `zero_cost_analysis/ZERO_COST_ROBUSTNESS_V1.md`
- `PROGRAM_BOUNDARY_SYNTHESIS_V1_1_ZERO_COST.md`
- `NO_PAID_API_POLICY_20261003.md`
- `STATUS.json`

## Next step

**Publication, not more paid data.**

Use the existing 714 complete counted plans and completed calibration evidence to:
1. finalize the paper;
2. present the preregistered Study A + R1 results;
3. include the zero-cost cross-model/task robustness;
4. present B/C/D as boundary/instrument evidence;
5. keep incomplete Study C outside confirmatory claims.

If a genuinely new model sample is ever necessary, evaluate a local open-weight model first. HUKUOKA currently has no NVIDIA GPU and about 15.6 GB RAM, so that route is exploratory rather than the main evidence base.

## Boundary

This project measures observable black-box research behavior only.
