# Zero-Cost Research Strategy v1.0 — 2026-10-03

Status: ACTIVE

## Constraint

No additional paid API generation.

## Existing scientific asset

Complete counted data already available:

- Study A: 336 plans
- External Replication R1: 378 plans
- total complete counted plans: **714**

Counted Study C remains incomplete at 93/252 and is parked without interpretation.

## Strategy

### Phase Z1 — Extract more information from the 714 counted plans

No model calls.

Run deterministic local robustness analyses:

1. simultaneous task + model transfer;
2. new-task / second-model bridge transfer;
3. family-level heterogeneity across tasks and models;
4. stronger lexical-ablation / masking sensitivity;
5. structure-only classification using plan length, section allocation, line/bullet/numbering features;
6. bootstrap / permutation uncertainty;
7. confusion-pattern stability.

Purpose:
distinguish a robust methodology-conditioned planning signature from simple method-name or jargon leakage.

### Phase Z2 — Integrate existing boundary calibrations

No model calls.

Use already completed non-counted calibrations:

- Study B v0.1/v0.2: fixed-evidence structured interpretation instrument NO_GO;
- Study C v0.2: adaptive evidence-selection instrument GO at calibration;
- Study D v0.1: structured evidence-assimilation instrument NO_GO.

Do not treat calibration results as counted hypothesis tests.

Use them only to define the empirical boundary of the confirmed Study A/R1 effect.

### Phase Z3 — Publication

No new empirical generation required.

Prepare a paper around the strongest supported result:

> Methodological framing produces a preregistered, externally replicated, task-general and model-replicable signature in free-form LLM research planning, while existing structured calibration instruments do not yet show reliable transfer into constrained interpretation or evidence-assimilation behavior.

The partial Study C counted study is excluded from confirmatory claims.

### Phase Z4 — Optional local-model extension

Only if genuinely necessary after publication draft review.

HUKUOKA currently has:
- no NVIDIA GPU detected;
- approximately 15.6 GB RAM;
- no Ollama installation.

A CPU-local 3B–4B quantized open-weight model could be installed later at zero API cost.
Such a study would be exploratory / external-model extension and would not replace the frontier-model R1 replication already completed.

## Stop rule

Do not collect more model outputs simply to increase N.

New generation is justified only if the 714-plan corpus cannot answer a clearly stated scientific question.
