# Study C Counted Preregistration v1.0

Status: FROZEN BEFORE COUNTED COLLECTION

## Scientific question

When the available evidence universe and evidence-acquisition budget are held fixed, does methodological framing change which evidence an LLM chooses to inspect first?

Primary causal object:

M -> E_selected

This is an observable black-box research-policy effect.

## Separation from calibration

Study C calibration v0.2 was completed before this preregistration and passed its frozen GO gate.

The counted study uses:
- new evidence worlds not used in calibration;
- the same seven LABEL_ONLY methodological framings;
- the same 2-of-8 scarcity structure;
- the same deterministic 24-dimensional path representation;
- the same cross-world nearest-centroid logic.

Calibration worlds C3/C4 are not reused.

## Acting model

gpt-5.6-sol

## Conditions

Exact seven frozen Study A LABEL_ONLY methodological frames:
- GENERIC
- DIFFERENTIAL
- BAYESIAN
- FALSIFICATION
- CAUSAL
- STATE_SPACE
- SOFTWARE_TESTING

No OPERATIONAL prompts are used.

## Counted worlds

Frozen in `FROZEN_STUDY_C_EVIDENCE_UNIVERSE_V1_0.json`:
- C5: battery-pack degradation investigation;
- C6: logistics damage-rate investigation.

Each world contains eight opaque evidence-acquisition operations mapped only during analysis to:

- R1 repeated baseline
- R2 perturbation sensitivity
- R3 history/context
- R4 simple-mechanism null
- R5 targeted intervention
- R6 boundary-specific
- R7 measurement reliability
- R8 robustness

## Trajectory

Each run makes exactly two selections.

Step 1:
- research question;
- eight available operations in manifest-frozen shuffled order;
- methodological framing;
- choose one operation.

Step 2:
- first selected evidence content;
- seven remaining operations;
- same methodological framing;
- choose one new operation.

No STOP action.
No repeated operation.
No external tools.
No retrieval.

## Denominator

- 2 worlds
- 7 method families
- 18 independent trajectories per world x family cell
- 252 counted trajectories
- 504 counted model selection calls

No denominator increase after results.

## Generation settings

- model: gpt-5.6-sol
- fresh Responses API request per selection
- store=false
- max_output_tokens=200
- temperature=1.0
- top_p=1.0
- reasoning effort=none

## Frozen primary measurement

For each trajectory, map selected opaque module IDs to abstract roles R1-R8.

24-dimensional path vector:
- first-role one-hot: 8
- second-role one-hot: 8
- selected-set binary roles: 8

L2 normalize.

No free-text feature is used.

## Confirmatory cross-world analysis

1. Train cosine nearest-centroid method prototypes on C5 and predict C6.
2. Train on C6 and predict C5.
3. Combine the two directional correct counts.
4. Use 10,000 training-label permutations preserving method-cell sizes.

Chance reference = 1/7.

## Confirmatory success rule

Study C confirmatory success requires all:

1. 252/252 counted trajectories pass validation.
2. every trajectory contains exactly two distinct selections.
3. combined cross-world accuracy >= 0.30.
4. C5 -> C6 accuracy > 1/7.
5. C6 -> C5 accuracy > 1/7.
6. 10,000-permutation one-sided p <= 0.01.
7. at least 3 of the 6 non-generic families have pooled recall >= 1/3.

No threshold will be changed after outcomes are observed.

## Secondary outcomes

Report descriptively:
- first-role-only cross-world accuracy;
- selected-set-only cross-world accuracy;
- first-role distribution by method;
- selected-pair distribution;
- R4/R5/R7/R8 opening rates by method;
- same-method vs different-method cross-world selected-set Jaccard;
- pooled recall by method family.

These are secondary unless explicitly identified above as part of the success rule.

## Integrity

- counted runs at freeze must equal 0;
- manifest fixes run IDs, world, method family, replicate, and catalog order;
- first valid write per run ID is authoritative;
- all response IDs must be unique;
- all response IDs must be disjoint from Study C calibration data;
- response status must be completed with incomplete_details=null;
- exact generation settings above are validated;
- raw API responses are preserved;
- freeze hashes preregistration, evidence universe, method bank, manifest, runner, and analyzer.

## Interpretation boundary

A confirmatory success supports:

> Under controlled scarcity, methodological framing changes reproducible observable evidence-acquisition behavior across two distinct research worlds.

It does not establish:
- hidden chain-of-thought;
- internal neural mechanisms;
- superiority of any methodology;
- universal generalization to all models or research domains.
