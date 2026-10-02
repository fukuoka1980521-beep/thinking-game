# Competing Prediction Matrix v0.1

## Hypothesis families

### H-R: Repertoire / Selection

Pretraining already contains much of the usable methodological repertoire.
Post-training mainly makes natural-language cues better at selecting and sustaining it.

Expected pattern:
- BASE may have poor instruction compliance.
- When BASE does express a method signature, it transfers to later stages.
- BASE -> SFT/DPO/RLVR cross-stage classification is above chance.
- SFT strongly increases compliance and/or separability without wholly replacing the signature geometry.

### H-C: Construction

Post-training materially constructs method-specific strategy patterns that were not behaviorally present after pretraining.

Expected pattern:
- BASE method recoverability is near chance.
- Later stages show strong within-stage recoverability.
- BASE -> later transfer is weak.
- Later -> BASE transfer is weak.
- New stage-specific confusion patterns appear.

### H-RC: Reconfiguration

Pretraining provides partial strategy primitives; post-training reorganizes and reweights them enough to create both continuity and novelty.

Expected pattern:
- some method families transfer BASE -> later;
- others appear only after SFT/DPO/RLVR;
- asymmetric cross-stage transfer;
- family-specific changes rather than one global monotonic trend.

This is the most flexible hypothesis and therefore must be supported by specific preregistered interaction patterns, not used as an unfalsifiable fallback.

## Stage-specific predictions

### SFT

Most defensible directional prediction:
instruction compliance and cue responsiveness increase relative to BASE.

### DPO

No directional primary prediction.
Preference optimization may sharpen preferred answer forms or homogenize stylistic diversity.
Both are empirically possible.

### RLVR

No global monotonic prediction.
Exploratory prediction:
verification-compatible frames such as SOFTWARE_TESTING and FALSIFICATION may be selectively strengthened, but OLMo RLVR training objectives are not identical to these research methodologies.

## Discriminating statistic

The most informative object is the ordered cross-stage transfer matrix, not a single accuracy score.

If signatures are inherited:
classifier(stage A, method) should generalize to stage B.

If signatures are reconstructed:
within-stage decoding may be strong while cross-stage decoding is weak.

If only formatting changes:
structure-only classifiers will explain the effect and lexical/strategic masking robustness will collapse.
