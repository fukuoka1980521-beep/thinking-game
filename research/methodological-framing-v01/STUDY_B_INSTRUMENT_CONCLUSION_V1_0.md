# Study B Instrument Conclusion v1.0

Status: COUNTED STUDY B NOT STARTED — CALIBRATION NO_GO

## Question

Would methodological framing produce a reproducible structured interpretation difference when every condition receives the same evidence?

Target:

M -> Y_interpretation | E = E*

## Calibration v0.1

Non-counted n=42.

Frozen structured-state gate failed:
- combined cross-packet accuracy = 0.1429, exactly chance;
- permutation p = 0.7631;
- only 2/6 non-generic families reached pooled recall >= 1/3.

Outcome saturation:
- B1: 21/21 rejected the "explains most" claim;
- B2: 18/21 rejected, 3/21 inconclusive.

Post-hoc engineering diagnosis:
- structured decision subvector combined = 0.2381;
- structured evidence-ID subvector combined = 0.1429;
- masked rationale text combined = 0.4524, p=0.0001.

The rationale result is post-hoc and is not scientific evidence.

## Calibration v0.2

The instrument was redesigned before new data:
- evidence packets moved nearer the >50% attribution boundary;
- explicit attribution estimate and interval;
- signed impact score for every evidence item;
- no free-text feature in the primary metric.

Non-counted n=42.

Frozen gate again failed:
- B3 -> B4 = 4/21 = 0.1905;
- B4 -> B3 = 4/21 = 0.1905;
- combined = 8/42 = 0.1905;
- chance = 0.1429;
- permutation p = 0.1611;
- non-generic recall coverage = 2/6;
- evidence-impact-only combined = 0.2143;
- attribution/decision-only combined = 0.0952.

Conclusion distributions remained concentrated:
- B3: 21/21 inconclusive;
- B4: 18/21 inconclusive, 3/21 does-not-support-most.

## Decision

Counted Study B remains **zero**.

No sample-size increase or post-result threshold change is used to rescue the hypothesis.

## Interpretation

The current evidence supports a sharp contrast:

1. Study A / R1: methodological framing produces a strong, reproducible difference in how research is planned.
2. Study B calibration: when the evidence is already fixed and supplied in full, the same framing does not produce a sufficiently stable structured difference in final interpretation/evidence weighting for a confirmatory counted study.

This does not prove that fixed-evidence interpretation is invariant. Free-text rationale retained a method-linked signal in post-hoc analysis. But that signal did not transfer robustly into the preregistered structured interpretation variables.

## Consequence for the program

The next high-value object is Study C:

M -> E_selected -> Y

Instead of asking whether framing changes the conclusion after all evidence is supplied, Study C asks whether framing changes **which evidence is acquired, in what order, and when the search stops**.

This is both closer to the original mechanism hypothesis and better aligned with the strong planning effect already replicated in Study A/R1.

## Claim ceiling

Study B calibration is instrument-development evidence, not a counted null hypothesis test.

Allowed statement:
- two preregistered calibration instruments failed to justify a counted fixed-evidence Study B.

Not allowed:
- methodological framing can never affect interpretation under fixed evidence.
