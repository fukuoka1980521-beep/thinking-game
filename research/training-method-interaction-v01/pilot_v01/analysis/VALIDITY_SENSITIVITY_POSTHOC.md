# Validity Sensitivity — Post-hoc Boundary Analysis

Status: POST-HOC SENSITIVITY ONLY
Frozen gate remains NO_GO.

## Frozen gate

The preregistered/frozen validity rule required:
- >=100 English words;
- >=2 task-specific keyword hits;
- no refusal;
- no chat-template corruption.

Result:
- 68/72 valid = 0.9444
- threshold = 0.95
- therefore G1 failed by one output.

## Four frozen-invalid outputs

1. BASE / T1 / BAYESIAN / R02
   - 433 words
   - 1 task-keyword hit
   - substantive text but drifts to risk/probability judgments rather than the supplied repeated-response objective.

2. BASE / T2 / GENERIC / R01
   - 24 words
   - clearly too short/incomplete.

3. BASE / T2 / GENERIC / R03
   - 100 words
   - 1 task-keyword hit
   - mostly a generic research-plan template; limited engagement with the actual site completion-time problem.

4. SFT / T2 / GENERIC / R03
   - 97 words
   - 6 task-keyword hits
   - clearly addresses the supplied objective and includes design/data/measurement/analysis/stopping/limitations.
   - fails only because it is 3 words below the frozen 100-word threshold.

## Sensitivity

A minimally relaxed post-hoc rule:
- >=90 words;
- >=1 task-specific keyword hit;
- same refusal/corruption exclusions

would classify 71/72 as valid = 0.9861.

This is **not** used to overturn the frozen NO_GO.

## Interpretation

The pilot NO_GO is not driven by failure of MethodFraming signal:
- G3 method signal: PASS
- G4 stage interaction measurable: PASS
- G5 lexical signal beyond structure/length: PASS

It is driven by a conservative validity threshold that missed the 95% criterion by one case.

At least one of the four failures is clearly a threshold-edge case (97 words with strong task relevance), while one is clearly invalid (24 words). Two others are substantively ambiguous/off-target.

Therefore the correct interpretation is:

**strict calibration NO_GO, but scientifically informative boundary evidence rather than a failed phenomenon.**

The result justifies reporting and hypothesis refinement, but under the frozen protocol it does not authorize promotion to the planned 336-run confirmatory collection.
