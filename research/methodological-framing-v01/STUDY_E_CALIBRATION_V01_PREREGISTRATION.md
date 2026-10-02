# Study E Calibration v0.1 — Plan-to-Action Transfer

Status: NON-COUNTED INSTRUMENT CALIBRATION ONLY — FROZEN BEFORE DATA

## Motivation

Study A / R1 established a replicated methodological-framing signature in free-form research plans.

Study B, C and D calibration did not justify counted studies of fixed-evidence interpretation, direct constrained evidence selection, or structured attention allocation.

Study E tests the missing mediation step directly:

M -> Z_plan -> A_action

## Core question

Can a method-framed free-form plan carry enough policy information to change a later neutral executor's evidence-acquisition choices, even when:

- the executor receives no methodological frame;
- direct method names and canonical method-specific vocabulary are deterministically masked from the plan;
- the action space is fixed and structured?

## Two-stage pipeline

### Stage 1 — Planner

Planner model:
- gpt-5.6-sol

Input:
- research question;
- one exact Study A LABEL_ONLY frame.

Output:
- free-form research plan using the same neutral headings as Study A.

### Deterministic sanitation

Before executor input:
- exact/canonical method-specific vocabulary from `FROZEN_STUDY_A_MEASUREMENT_V1_0.py::MASK_PHRASES` is replaced by `[MASKED]`;
- no LLM performs the masking;
- task-specific substantive content is preserved.

### Stage 2 — Neutral executor

Executor model:
- gpt-6-luna

Input:
- research question;
- sanitized planner output;
- 8 opaque evidence-module IDs with neutral descriptors.

The executor does NOT receive:
- method family;
- methodological instruction;
- original unmasked plan;
- evidence results.

Output:
- exactly 4 distinct module IDs in priority order.

## Controlled worlds

Two fresh worlds are frozen in `STUDY_E_EVIDENCE_UNIVERSE_V01.json`.

E1:
battery-cell capacity-fade variation.

E2:
customer-support resolution-time variation.

Each world contains 8 opaque modules mapped only during analysis to abstract roles R1-R8:
- R1 repeated baseline
- R2 perturbation sensitivity
- R3 history/context
- R4 simple-mechanism null
- R5 targeted intervention
- R6 boundary-specific analysis
- R7 measurement reliability
- R8 robustness

Catalog order differs across worlds.

## Conditions and denominator

Exact seven Study A LABEL_ONLY frames.

- 2 worlds
- 7 frames
- 3 fresh replicates per world x frame
- 42 planner-executor groups
- 84 API outputs total

All outputs are non-counted calibration.

## Two calibration signals

### Signal P — sanitized plan recoverability

Use frozen Study A deterministic text measurement on sanitized planner plans.

Cross-world:
- train on E1 plans, predict E2;
- train on E2 plans, predict E1;
- 10,000 label permutations.

This confirms that the mediator plan still carries method-linked structure after canonical method vocabulary is removed.

### Signal A — downstream action recoverability

Action vector:
- selected-set binary R1-R8: 8
- ordered position one-hot for positions 1-4: 32
Total = 40 dimensions.

L2 normalize.

Cross-world:
- train method prototypes on E1 action vectors, predict E2;
- train E2, predict E1;
- 10,000 label permutations.

## Calibration GO gate

Counted Study E may be designed only if all are true:

1. 42/42 groups complete with 84 unique API response IDs.
2. All executor paths contain exactly 4 distinct valid module IDs.
3. Sanitized plan signal P:
   - combined accuracy >= 0.35;
   - both directions >= 0.25;
   - p <= 0.01;
   - at least 3/6 non-generic families pooled recall >= 1/3.
4. Downstream action signal A:
   - combined accuracy >= 0.35;
   - both directions >= 0.25;
   - p <= 0.01;
   - at least 3/6 non-generic families pooled recall >= 1/3.
5. At least 4 distinct abstract roles occur as first executor choices across all groups.
6. Each world has at least 3 distinct abstract roles as first choices.

The gate requires both plan and action signals. It does not allow a strong plan signal to rescue a weak action signal.

## If GO

Freeze counted Study E before counted data.

The counted target will be plan-mediated behavioral transfer:
methodological framing -> sanitized plan -> downstream evidence-choice path.

## If NO_GO

Counted Study E remains zero.

Interpret calibration only as engineering evidence about instrument feasibility.
Do not increase N or relax thresholds after results.

## Claim ceiling

Even a successful Study E would support observable plan-to-action transfer only.

It would not reveal hidden chain-of-thought, identify neural mechanisms, or show that any methodology is superior.
