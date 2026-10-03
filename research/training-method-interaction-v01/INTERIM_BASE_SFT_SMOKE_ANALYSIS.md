# Interim BASE vs SFT Smoke Analysis

**Calibration evidence only — not the 72-run pilot and not confirmatory.**

| condition | words | headings/8 | hit 512 cap | gen tok/s | elapsed s | refusal | template corruption |
|---|---:|---:|---:|---:|---:|---:|---:|
| BASE_RAW | 426 | 2 | 1 | 4.69 | 117.5 | 0 | 0 |
| SFT_RAW | 323 | 7 | 0 | 4.65 | 98.0 | 0 | 0 |
| SFT_NATIVE | 400 | 8 | 0 | 5.25 | 101.2 | 0 | 0 |

## Lexical similarity

- BASE_RAW_vs_SFT_RAW: 0.556
- SFT_RAW_vs_SFT_NATIVE: 0.748
- BASE_RAW_vs_SFT_NATIVE: 0.728

## What can already be said

1. BASE can generate a substantive research-plan continuation under the common raw scaffold; instruction tuning is not required for plan-like behavior to exist at all.
2. SFT sharply improves structural instruction adherence under the same raw prompt. SFT RAW is already much more organized than BASE RAW.
3. The native SFT chat interface improves adherence further, so interface/template effects are real and must be separated from weight-stage effects.
4. This pattern is consistent with a repertoire-plus-routing account: pretraining provides some research-planning repertoire, while SFT makes the user instruction easier to route into a coherent requested format.

## What cannot yet be said

- No conclusion yet about Bayesian vs software-testing method responsiveness; only GENERIC smoke has been observed.
- No conclusion yet about DPO preference reshaping or RLVR verifier-selective amplification.
- No stage-by-method interaction estimate exists until the 72-run pilot is complete.
- No internal mechanism claim follows from these black-box outputs.

## If later stages become unavailable

The strongest defensible result would remain: BASE already exhibits plan-like problem decomposition, and SFT materially changes instruction routing/structural compliance. The missing DPO/RLVR stages would limit the study to the pretraining→instruction-tuning transition and prevent claims about preference optimization or RLVR.
