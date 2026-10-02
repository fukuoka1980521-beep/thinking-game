# Study A — Counted Results

## Primary: LABEL_ONLY cross-task method signature

- Confirmatory success: **True**
- T1 -> T2: 61/126 = 0.4841
- T2 -> T1: 58/126 = 0.4603
- Combined: 119/252 = 0.4722
- Chance: 0.1429
- 10,000-permutation p: 0.000100
- Cross-task within-method distance: 0.948858
- Cross-task between-method distance: 0.953568
- Between-minus-within: 0.004710

### Per-family recall

| family | correct | n | recall |
|---|---:|---:|---:|
| GENERIC | 0 | 36 | 0.0000 |
| DIFFERENTIAL | 0 | 36 | 0.0000 |
| BAYESIAN | 32 | 36 | 0.8889 |
| FALSIFICATION | 7 | 36 | 0.1944 |
| CAUSAL | 22 | 36 | 0.6111 |
| STATE_SPACE | 36 | 36 | 1.0000 |
| SOFTWARE_TESTING | 22 | 36 | 0.6111 |

## Secondary: OPERATIONAL framing

- T1 -> T2: 36/42 = 0.8571
- T2 -> T1: 30/42 = 0.7143
- Combined: 66/84 = 0.7857
- 10,000-permutation p: 0.000100
- Between-minus-within distance: 0.009679
- Accuracy difference OPERATIONAL - LABEL_ONLY: 0.313492

## Interpretation boundary

The primary measurement masks explicit method labels and a broad frozen method-specific lexicon before feature extraction.
The result concerns observable plan-text signatures across tasks. It does not reveal hidden chain-of-thought or establish that one methodology is superior.
