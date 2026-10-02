# External Replication R1 Final Report v1.0

Status: COUNTED EXTERNAL REPLICATION COMPLETE  
Date: 2026-10-02

## Purpose

Test whether the Study A methodological-framing effect generalizes beyond:
1. the original two tasks; and
2. the original acting model.

The frozen Study A deterministic measurement was reused unchanged.

## Integrity

- R1 preregistration frozen before counted replication collection.
- R1a denominator: 126.
- R1b denominator: 252.
- total new counted replication plans: 378.
- Study A counted plans were not regenerated.
- first valid response per frozen run_id remained authoritative.
- validation completed successfully before analysis.
- secret scan passed.
- final results were committed to the research branch.

## R1a — New task, original model

Acting model: gpt-5.6-sol  
New task: T3, 3D-printed polymer tensile-strength variation  
New counted plans: 126

Cross-task transfer using the frozen Study A classifier:

- T1 -> T3: 88/126 = 0.6984
- T3 -> T1: 80/126 = 0.6349
- T2 -> T3: 108/126 = 0.8571
- T3 -> T2: 93/126 = 0.7381
- combined: 369/504 = 0.7321
- chance reference: 1/7 = 0.1429
- 10,000-permutation p = 0.000100

Preregistered R1a replication success: **TRUE**

All four directional accuracies exceeded chance and the permutation criterion was satisfied.

## R1b — Second model, original tasks

Acting model: gpt-6-luna  
Tasks: frozen T1 and T2  
New counted plans: 252

- T1 -> T2: 72/126 = 0.5714
- T2 -> T1: 48/126 = 0.3810
- combined: 120/252 = 0.4762
- chance reference: 1/7 = 0.1429
- 10,000-permutation p = 0.000100
- between-minus-within cross-task distance = +0.003056

Preregistered R1b replication success: **TRUE**

## R1b heterogeneity

Pooled class recall under the frozen classifier:

- GENERIC: 4/36 = 0.1111
- DIFFERENTIAL: 0/36 = 0.0000
- BAYESIAN: 33/36 = 0.9167
- FALSIFICATION: 16/36 = 0.4444
- CAUSAL: 9/36 = 0.2500
- STATE_SPACE: 26/36 = 0.7222
- SOFTWARE_TESTING: 32/36 = 0.8889

The replication therefore preserves the main Study A pattern: the effect is real at the aggregate level but strongly heterogeneous across framing families.

## Joint result

R1a success: TRUE  
R1b success: TRUE

Joint external replication support: **TRUE**

The observed effect therefore generalized:
- from T1/T2 to a new manufacturing/materials task; and
- from gpt-5.6-sol to gpt-6-luna.

## Strongest supported claim

Within the tested prompts, tasks, models, and frozen deterministic measurement:

> Methodological framing can induce reproducible, task-general and model-replicable differences in the observable structure of LLM-generated research plans.

This is stronger than the original Study A result because both a new task and a second model reproduced the effect under preregistered success rules.

## What remains unproven

R1 does not establish:
- hidden chain-of-thought states;
- internal neural mechanisms;
- superiority of one methodology;
- equal distinctiveness of all method families;
- universal generalization to arbitrary models, languages, domains, or prompt formats;
- that plan-structure differences necessarily improve downstream scientific quality.

## Next scientific step

The highest-value next study is Study B:

Hold the evidence packet fixed across conditions and vary only methodological framing.

This tests whether framing changes interpretation or conclusion even when evidence selection is experimentally removed from the system.

Target causal object:

M -> Y_conclusion | E = E*

This separates plan-generation effects from interpretation effects.
