# BASE → SFT Partial Interpretation

Status: PARTIAL DESCRIPTIVE ONLY
Data available: BASE 18 + SFT 18 = 36 outputs
Not used for pilot GO/NO-GO or design modification.

## Observed facts

Three method classes:
- GENERIC
- BAYESIAN
- SOFTWARE_TESTING

Nominal chance accuracy: 1/3 = 0.333.

### Method recoverability

| Metric | BASE | SFT |
|---|---:|---:|
| Cross-task lexical method accuracy | 0.389 | 0.389 |
| Macro recall | 0.389 | 0.389 |
| Structure-only accuracy | 0.278 | 0.278 |
| Length-only accuracy | 0.222 | 0.389 |
| Lexical advantage over best gross control | +0.111 | +0.000 |

### Family recall

| Method | BASE | SFT |
|---|---:|---:|
| GENERIC | 0.000 | 0.333 |
| BAYESIAN | 0.667 | 0.667 |
| SOFTWARE_TESTING | 0.500 | 0.167 |

### Cross-stage transfer

- BASE → SFT method transfer: 0.389
- SFT → BASE method transfer: 0.278

### Method-neutral instruction compliance

- BASE mean neutral headings present: 3.22 / 8
- SFT mean neutral headings present: 7.00 / 8
- BASE mean output words: 352.2
- SFT mean output words: 282.4

## Current interpretation

The first 36 outputs separate two phenomena that were initially easy to conflate:

1. **Instruction compliance changes strongly at BASE → SFT.**
   SFT follows the neutral requested structure much more closely.

2. **Method-specific recoverability does not show a corresponding increase.**
   BASE and SFT both produce 0.389 lexical cross-task method accuracy.

Therefore the current evidence does **not** support the simple hypothesis:

> SFT improves instruction following, therefore it necessarily amplifies methodological reasoning signatures.

Instead, the available data support a narrower distinction:

> Generic instruction routing/compliance can improve substantially while recoverability of a named methodological framing remains roughly unchanged.

This is directly relevant to the theoretical decomposition. "Routing" must not be treated as a single scalar property. At least two layers may need to be distinguished:

- formatting/task-instruction routing;
- methodological-strategy routing.

## Important caution

The stage-specific method estimates are based on only 18 predictions per stage.
A one-answer change moves accuracy by 0.056.

The current 0.389 value is only one correct prediction above 1/3 chance at this denominator.

No inferential claim is made from this partial analysis.

## What remains unresolved

DPO and RLVR determine whether later post-training:
- changes method separability;
- compresses diversity;
- selectively strengthens SOFTWARE_TESTING/verification-like behavior;
- increases stage-style confounding.

Until DPO/RLVR complete, the TrainingStage × MethodFraming interaction remains unresolved.
