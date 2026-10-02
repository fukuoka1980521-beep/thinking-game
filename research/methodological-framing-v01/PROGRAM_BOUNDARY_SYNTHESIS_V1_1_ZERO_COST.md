# Program Boundary Synthesis v1.1 — Zero-Cost Update

Status: EMPIRICAL SYNTHESIS USING EXISTING DATA ONLY
Date: 2026-10-03
New paid model calls for this update: 0

## Counted evidence

### Study A

Methodological framing changed free-form research plans under a frozen deterministic measurement.

LABEL_ONLY:
- combined cross-task accuracy = 0.4722
- chance = 0.1429
- permutation p = 0.000100

OPERATIONAL secondary condition:
- combined accuracy = 0.7857
- permutation p = 0.000100

### External Replication R1

The Study A effect replicated prospectively:

New task, original model:
- combined four-direction accuracy = 0.7321
- permutation p = 0.000100

Second model, original tasks:
- combined accuracy = 0.4762
- permutation p = 0.000100

Joint external replication support = TRUE.

## Zero-cost robustness on existing counted data

Complete counted plans available:
- Study A = 336
- R1 = 378
- total = 714

The robustness analysis uses the 630 LABEL_ONLY plans:
- Study A LABEL_ONLY = 252
- R1 = 378

No new model outputs were generated.

### Simultaneous model + task shift

Using the frozen Study A text measurement:

- SOL T1 -> LUNA T2 = 0.5000
- SOL T2 -> LUNA T1 = 0.3968
- LUNA T1 -> SOL T2 = 0.5476
- LUNA T2 -> SOL T1 = 0.4603
- combined = **0.4762**
- 10,000-permutation p = **0.000100**

Thus the method-linked plan signature survives when both the acting model and substantive task change simultaneously.

### New-task / second-model bridge

- SOL T3 -> LUNA T1 = 0.5635
- SOL T3 -> LUNA T2 = 0.5635
- LUNA T1 -> SOL T3 = 0.3413
- LUNA T2 -> SOL T3 = 0.6508
- combined = **0.5298**
- 10,000-permutation p = **0.000100**

### Same-task cross-model transfer

- combined = **0.7401**
- 10,000-permutation p = **0.000100**

Method-linked plan signatures are therefore particularly stable across models when the substantive task is held fixed.

## Critical negative robustness result — structure only

A separate classifier discarded lexical content and used only gross document structure:
- total length;
- section word allocation;
- line counts;
- bullet counts;
- numbering;
- headings;
- paragraph and sentence counts;
- related formatting quantities.

Simultaneous model + task shift:
- combined = 0.1468
- chance = 0.1429
- p = 0.320068

T3 / second-model bridge:
- combined = 0.1389
- p = 0.785921

Therefore the replicated Study A/R1 signal is **not explained by gross document length, section allocation, or formatting structure alone**.

The stronger interpretation is that framing changes the lexical / strategic content of the research plan after explicit method labels and a broad canonical method lexicon have already been masked.

## Method-family heterogeneity

Under simultaneous model + task shift, pooled recall was:

- GENERIC = 0.028
- DIFFERENTIAL = 0.000
- BAYESIAN = 0.806
- FALSIFICATION = 0.375
- CAUSAL = 0.569
- STATE_SPACE = 0.875
- SOFTWARE_TESTING = 0.681

Under the T3 / second-model bridge:

- GENERIC = 0.111
- DIFFERENTIAL = 0.097
- BAYESIAN = 0.681
- FALSIFICATION = 0.625
- CAUSAL = 0.847
- STATE_SPACE = 0.764
- SOFTWARE_TESTING = 0.583

But under same-task cross-model transfer:

- GENERIC = 0.736
- DIFFERENTIAL = 0.542
- BAYESIAN = 0.806
- FALSIFICATION = 0.611
- CAUSAL = 0.764
- STATE_SPACE = 0.861
- SOFTWARE_TESTING = 0.861

This suggests two distinct patterns:

1. BAYESIAN, FALSIFICATION, CAUSAL, STATE_SPACE, and SOFTWARE_TESTING often produce signatures that generalize across both task and model.
2. GENERIC and DIFFERENTIAL are model-replicable within a task but substantially more task-dependent.

This heterogeneity prevents any claim that all method framings form equally stable task-general classes.

## Existing downstream boundary evidence

### Study B — fixed evidence interpretation

Two preregistered calibration instruments failed their GO gates.

v0.1:
- combined = 0.1429
- p = 0.7631

v0.2:
- combined = 0.1905
- p = 0.1611

Counted Study B remained zero.

### Study C — adaptive evidence selection

Calibration v0.2 passed:
- combined = 0.4286
- p = 0.000300
- non-generic recall coverage = 4/6

Counted Study C was frozen at n=252 but interrupted after 93 valid trajectories.

Under the active no-paid-API policy:
- the 93 records are preserved;
- automatic resume is disabled;
- the partial data are not interpreted confirmatorily.

### Study D — structured evidence assimilation

Calibration failed:
- E0 combined = 0.0714
- E4 combined = 0.1905
- E8 combined = 0.2143
- all preregistered gates failed

Counted Study D remained zero.

## Strongest current scientific interpretation

The complete counted evidence plus zero-cost robustness supports:

1. Methodological framing robustly changes the **lexical / strategic content of free-form research planning**.
2. This signature generalizes across tasks and across two acting models.
3. It survives simultaneous model-and-task transfer under a measurement that masks explicit method names and broad canonical method terminology.
4. It is not recoverable from gross formatting / section-length structure alone.
5. The effect is heterogeneous by methodology family.
6. Existing structured calibration instruments do not yet justify a claim that the planning signature reliably transfers into fixed-evidence interpretation or structured evidence assimilation.
7. Adaptive evidence-selection calibration was promising, but its counted study remains incomplete and is not evidence for a confirmatory downstream effect.

## Claim ceiling

Allowed:

> Methodological framing produces preregistered, externally replicated, task-general and model-replicable differences in the lexical / strategic content of free-form LLM research plans, beyond explicit method labels and gross document-format structure.

Not established:
- hidden chain-of-thought;
- neural mechanism;
- methodological superiority;
- equal stability across all framing families;
- guaranteed downstream decision changes;
- universal generalization to arbitrary models or domains.

## Decision

Additional paid model generation is not required to support the current paper.

The highest-value next step is publication-quality synthesis and peer-facing robustness presentation using the existing 714 complete counted plans and completed calibration evidence.

Paid API collection is disabled under:
- NO_PAID_API_POLICY_20261003.md
- PAID_EXTERNAL_CALL_GATE_V1_0.md
