# Methodological Framing v0.1

## Purpose

Study whether holding a research objective constant while changing only methodological framing changes the observable structure of LLM research behavior.

Core causal program:

M -> Z_plan -> E_selected -> Y_conclusion

where:
- M = methodological framing;
- Z_plan = observable research-plan structure;
- E_selected = evidence-selection policy;
- Y_conclusion = resulting interpretation/conclusion.

The program separates:
- Study A: planning effect;
- Study B: fixed-evidence interpretation effect;
- Study C: active evidence-selection and conclusion effect.

## Current state — 2026-10-02

- HUKUOKA / common NAS index: confirmed.
- T2 ecological plausibility: confirmed from read-only operational materials; no personal data copied into the research dataset.
- Early pilot and v0.3: invalid as calibration evidence because of output truncation.
- v0.4: NO_GO.
- v0.5: NO_GO.
- v0.6: NO_GO.
- deterministic v0.7 measurement: frozen before analysis and passed its calibration gate.
- Study A preregistration/manifest: frozen before counted collection.
- counted runs at freeze: 0.
- Study A raw collection: 336/336.
- Study A validation: PASS.
- Study A confirmatory analysis: COMPLETE.
- Primary confirmatory success: TRUE.

## Study A primary result

LABEL_ONLY plans:

- T1 -> T2: 61/126 = 0.4841
- T2 -> T1: 58/126 = 0.4603
- combined: 119/252 = 0.4722
- chance: 1/7 = 0.1429
- 10,000-permutation p = 0.000100
- between-minus-within cross-task distance = +0.004710

The preregistered success rule was satisfied.

## Important heterogeneity

Primary pooled recall by family:

- GENERIC: 0.0000
- DIFFERENTIAL: 0.0000
- BAYESIAN: 0.8889
- FALSIFICATION: 0.1944
- CAUSAL: 0.6111
- STATE_SPACE: 1.0000
- SOFTWARE_TESTING: 0.6111

Therefore the planning effect is not uniform across methodologies.

## Secondary OPERATIONAL result

- combined accuracy: 66/84 = 0.7857
- permutation p = 0.000100
- OPERATIONAL - LABEL_ONLY accuracy = +0.313492

This is secondary evidence only.

## Main conclusion

Within the tested model, tasks, prompts, and frozen measurement procedure, changing methodological framing while holding the research objective fixed produced reproducible task-general differences in observable research-plan structure.

Claim ceiling:
- black-box behavioral result only;
- no hidden chain-of-thought claim;
- no claim that one methodology is better;
- no claim that every methodology is equally distinct;
- no unrestricted generalization across models/domains/tasks.

## Files to read first

- `STUDY_A_PREREGISTRATION_V1_0.md`
- `STUDY_A_FREEZE_V1_0.json`
- `study_a/analysis/STUDY_A_RESULTS.md`
- `STUDY_A_FINAL_REPORT_V1_0.md`
- `STATUS.json`

## Next step

Highest-value next step:
1. external replication on at least one new task domain;
2. replication on a second acting model;
3. keep the frozen deterministic measurement unchanged;
4. then proceed to stronger Study B / Study C claims if replication holds.

## Important boundary

This project measures observable black-box research behavior. It does not claim direct observation of internal neural variables or hidden chain-of-thought.
