# Study B Calibration v0.2 — Frozen Before Non-Counted Calibration

Status: NON-COUNTED INSTRUMENT CALIBRATION ONLY

## Scientific target

Primary construct:
method-linked evidence-weighting under identical fixed evidence.

M -> W_evidence | E = E*

Secondary construct:
method-linked final interpretation/conclusion.

M -> Y_conclusion | E = E*

## Why v0.2 exists

v0.1 failed its frozen gate and is preserved as NO_GO.
Its evidence packets produced near-unanimous coarse conclusions.

v0.2 therefore changes the calibration instrument before counted Study B:
- new structurally matched packets B3/B4 near the attribution boundary;
- explicit quantitative attribution estimate and interval;
- signed impact score for each E1-E8;
- no free-text feature enters the primary measurement.

## Conditions

Exact seven Study A LABEL_ONLY framing instructions:
GENERIC, DIFFERENTIAL, BAYESIAN, FALSIFICATION, CAUSAL, STATE_SPACE, SOFTWARE_TESTING.

Acting model: gpt-5.6-sol.

## Calibration denominator

- B3 and B4
- 7 method families
- 3 fresh runs per packet x family
- non-counted n = 42

Generation:
- fresh request
- no history
- no tools/retrieval
- store=false
- temperature=1.0
- top_p=1.0
- reasoning effort=none
- max_output_tokens=1800
- structured output only

## Frozen 26-dimensional vector

- conclusion one-hot: 3
- next action one-hot: 3
- attribution point / low / high divided by 100: 3
- confidence /100: 1
- eight evidence impacts divided by 2: 8
- decisive evidence binary E1-E8: 8

L2 normalize.

## Cross-packet validation

Train cosine nearest-centroid method prototypes on B3 and predict B4.
Then train on B4 and predict B3.

Use 10,000 independent training-label permutations preserving class counts.

## GO gate

Counted Study B may be frozen only if all are true:

1. 42/42 complete, unique response IDs, schema-valid.
2. combined cross-packet accuracy >= 0.35.
3. B3 -> B4 accuracy >= 0.25.
4. B4 -> B3 accuracy >= 0.25.
5. 10,000-permutation one-sided p <= 0.01.
6. at least 3/6 non-generic method families have pooled recall >= 1/3.
7. evidence-impact-only subvector combined accuracy >= 0.25 OR attribution/decision subvector combined accuracy >= 0.25.
8. at least two distinct attribution-percent values occur in each packet.

## NO-GO

If any gate fails:
- counted Study B remains zero;
- do not increase N to rescue the gate;
- preserve v0.2 result and reassess whether fixed-evidence framing meaningfully changes structured interpretation at all.

## Claim ceiling

A GO means only that a reproducible method-linked structured interpretation signal exists under fixed evidence and is measurable enough for a counted study.

Calibration itself is not scientific evidence for the Study B hypothesis.
