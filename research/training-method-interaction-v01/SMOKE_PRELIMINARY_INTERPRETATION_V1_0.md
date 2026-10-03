# Smoke Preliminary Interpretation v1.0

Status: CALIBRATION ONLY — NOT PILOT EVIDENCE
Date: 2026-10-03

## Common RAW result

Under identical raw completion text (GENERIC × T1):

| Stage | Valid plan | Exact neutral headings | Words | Elapsed sec |
|---|---:|---:|---:|---:|
| BASE | yes | 2/8 | 428 | 117.5 |
| SFT | yes | 7/8 | 324 | 98.0 |
| DPO | yes | 7/8 | 420 | 119.2 |
| RLVR | yes | 7/8 | 376 | 81.1 |

Template gate decision: **GO_COMMON_RAW**.

## What this does support

- All four training stages can produce usable research-plan behavior under the same literal raw input.
- BASE need not be excluded for lacking chat-template conventions.
- The primary 72-run calibration pilot can use COMMON_RAW, reducing interface-template confounding.
- Generic instruction compliance appears stronger after SFT than at BASE in this single calibration example.

## What this does not support

- no MethodFraming effect has yet been measured;
- no TrainingStage × MethodFraming interaction has yet been measured;
- one GENERIC/T1 smoke cannot establish a stable stage ordering;
- heading compliance is not reasoning quality.

## Provisional theoretical implication

The smoke result is compatible with the decomposition:
- BASE: repertoire available but weaker explicit routing/compliance;
- SFT+: stronger instruction routing.

This is a calibration observation only. The 72-run pilot must determine whether methodological signatures themselves change by stage.
