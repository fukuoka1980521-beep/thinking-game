# Zero-Cost Robustness Analysis v1

**Post-hoc robustness analysis using existing counted data only. New model calls: 0.**

Complete counted plans available: Study A 336 + R1 378 = 714.
This robustness analysis uses the 630 LABEL_ONLY plans: Study A 252 + R1 378.

## Frozen text measurement: simultaneous model + task shift

- SOL_T1_to_LUNA_T2: 63/126 = 0.5000
- SOL_T2_to_LUNA_T1: 50/126 = 0.3968
- LUNA_T1_to_SOL_T2: 69/126 = 0.5476
- LUNA_T2_to_SOL_T1: 58/126 = 0.4603
- combined: 240/504 = **0.4762**
- 10,000-permutation p: **0.000100**
- permutation null mean accuracy: 0.1429

## Frozen text measurement: T3 / second-model bridge

- SOL_T3_to_LUNA_T1: 71/126 = 0.5635
- SOL_T3_to_LUNA_T2: 71/126 = 0.5635
- LUNA_T1_to_SOL_T3: 43/126 = 0.3413
- LUNA_T2_to_SOL_T3: 82/126 = 0.6508
- combined: 267/504 = **0.5298**
- 10,000-permutation p: **0.000100**
- permutation null mean accuracy: 0.1425

## Frozen text measurement: same-task cross-model

- SOL_T1_to_LUNA_T1: 106/126 = 0.8413
- LUNA_T1_to_SOL_T1: 109/126 = 0.8651
- SOL_T2_to_LUNA_T2: 80/126 = 0.6349
- LUNA_T2_to_SOL_T2: 78/126 = 0.6190
- combined: 373/504 = **0.7401**
- 10,000-permutation p: **0.000100**
- permutation null mean accuracy: 0.1432

## Structure-only: simultaneous model + task shift

- SOL_T1_to_LUNA_T2: 22/126 = 0.1746
- SOL_T2_to_LUNA_T1: 18/126 = 0.1429
- LUNA_T1_to_SOL_T2: 16/126 = 0.1270
- LUNA_T2_to_SOL_T1: 18/126 = 0.1429
- combined: 74/504 = **0.1468**
- 10,000-permutation p: **0.320068**
- permutation null mean accuracy: 0.1428

## Structure-only: T3 / second-model bridge

- SOL_T3_to_LUNA_T1: 18/126 = 0.1429
- SOL_T3_to_LUNA_T2: 18/126 = 0.1429
- LUNA_T1_to_SOL_T3: 16/126 = 0.1270
- LUNA_T2_to_SOL_T3: 18/126 = 0.1429
- combined: 70/504 = **0.1389**
- 10,000-permutation p: **0.785921**
- permutation null mean accuracy: 0.1431

## Boundary

This is exploratory robustness work performed after the confirmatory Study A/R1 results.
It uses no new model generation and cannot upgrade the preregistered claim ceiling.
The structure-only analysis intentionally discards lexical content and uses only plan-length / section / line / bullet / numbering features.
