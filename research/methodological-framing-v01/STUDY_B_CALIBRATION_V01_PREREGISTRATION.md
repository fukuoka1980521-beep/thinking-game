# Study B Calibration v0.1 — Frozen Before Non-Counted Calibration

Status: NON-COUNTED INSTRUMENT CALIBRATION ONLY

## Scientific question

When every condition receives exactly the same evidence packet, does methodological framing change the observable interpretation state?

Target causal object:

M -> Y_interpretation | E = E*

This removes active evidence selection from the experiment.

## Conditions

Use the exact seven LABEL_ONLY framing instructions already frozen for Study A:
- GENERIC
- DIFFERENTIAL
- BAYESIAN
- FALSIFICATION
- CAUSAL
- STATE_SPACE
- SOFTWARE_TESTING

Acting model for calibration:
- gpt-5.6-sol

## Evidence packets

Use two fixed synthetic evidence packets, B1 and B2, from `STUDY_B_EVIDENCE_BANK_V01.json`.

The evidence IDs E1-E8 have matched structural roles across the two domains.

No external tools or retrieval are allowed.

## Output state

Every response must return the same structured fields:

- conclusion: SUPPORTS_MOST / DOES_NOT_SUPPORT_MOST / INCONCLUSIVE
- confidence: integer 0-100
- decisive_evidence_ids: 1-3 unique evidence IDs
- strongest_counterevidence_id: one evidence ID
- next_action: ACCEPT_TARGET_FOR_NOW / REJECT_TARGET_FOR_NOW / COLLECT_MORE_EVIDENCE
- rationale: <=180 words, secondary only

The primary state vector is 23-dimensional and contains no free-text features.

## Calibration design

- 2 evidence packets
- 7 LABEL_ONLY method families
- 3 fresh independent responses per packet x family cell
- total non-counted calibration n = 42
- fresh API request per response
- store=false
- temperature=1.0
- top_p=1.0
- reasoning effort=none
- max_output_tokens=1600
- no conversation history
- no tools

## Primary calibration measurement

Encode each structured response into the frozen 23-dimensional state vector:

- conclusion one-hot: 3
- next_action one-hot: 3
- confidence / 100: 1
- decisive evidence binary E1-E8: 8
- strongest counterevidence one-hot E1-E8: 8

L2-normalize each vector.

Train cosine nearest-centroid method prototypes on B1 and predict B2.
Then train on B2 and predict B1.

Use 10,000 label permutations, independently shuffling training labels within each packet while preserving class counts.

## GO gate

Study B counted design may be frozen only if all are true:

1. 42/42 complete and schema-valid.
2. unique response IDs = 42.
3. combined cross-packet accuracy >= 0.35.
4. B1 -> B2 accuracy >= 0.25.
5. B2 -> B1 accuracy >= 0.25.
6. 10,000-permutation one-sided p <= 0.01.
7. at least 3 of the 6 non-generic method families have pooled recall >= 1/3.
8. at least two conclusion categories are observed in the 42 responses OR at least two next_action categories are observed.

## NO-GO rule

If the gate fails:
- do not increase counted N to rescue the result;
- do not alter the gate after seeing calibration outcomes;
- redesign the measurement or evidence packets;
- counted Study B runs remain zero.

## Interpretation boundary

A GO means only that fixed-evidence interpretation state contains a reproducible method-linked signal suitable for a counted Study B.

Calibration outcomes are engineering evidence, not scientific evidence for the Study B hypothesis.
