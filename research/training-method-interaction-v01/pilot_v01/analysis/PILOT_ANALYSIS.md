# Pilot Analysis

**Calibration only; not confirmatory.**

## Method recoverability and negative controls

| stage | lexical method acc | structure-only acc | length-only acc | macro recall |
|---|---:|---:|---:|---:|
| BASE | 0.389 | 0.278 | 0.222 | 0.389 |
| SFT | 0.389 | 0.278 | 0.389 | 0.389 |
| DPO | 0.500 | 0.167 | 0.222 | 0.500 |
| RLVR | 0.722 | 0.333 | 0.222 | 0.722 |

## Stage-identity negative control

- stage cross-task accuracy: **0.528**
- stage macro recall: 0.528

## Cross-stage method transfer

| train stage | test stage | accuracy | macro recall |
|---|---|---:|---:|
| BASE | SFT | 0.389 | 0.389 |
| BASE | DPO | 0.333 | 0.333 |
| BASE | RLVR | 0.389 | 0.389 |
| SFT | BASE | 0.278 | 0.278 |
| SFT | DPO | 0.556 | 0.556 |
| SFT | RLVR | 0.611 | 0.611 |
| DPO | BASE | 0.333 | 0.333 |
| DPO | SFT | 0.556 | 0.556 |
| DPO | RLVR | 1.000 | 1.000 |
| RLVR | BASE | 0.222 | 0.222 |
| RLVR | SFT | 0.611 | 0.611 |
| RLVR | DPO | 0.667 | 0.667 |

## Within-cell residual lexical diversity

- BASE: diversity=0.399 (mean pairwise similarity=0.601, pairs=18)
- SFT: diversity=0.375 (mean pairwise similarity=0.625, pairs=18)
- DPO: diversity=0.261 (mean pairwise similarity=0.739, pairs=18)
- RLVR: diversity=0.268 (mean pairwise similarity=0.732, pairs=18)

## Compliance

- BASE: headings=0.00, refusal=0.00, words=352.2
- SFT: headings=0.00, refusal=0.00, words=282.4
- DPO: headings=0.06, refusal=0.00, words=336.8
- RLVR: headings=0.00, refusal=0.00, words=325.5

## Interpretation rule

A lexical method signal is not interpreted as methodological specialization if structure-only or length-only recoverability provides a comparable explanation.
A training-stage effect is not interpreted as methodological specialization if it is explainable by generic compliance or stage identity alone.
Cross-stage transfer is behavioral evidence only and does not establish persistence of the same internal representation.
