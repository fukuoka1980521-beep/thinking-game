# Invalid-output impact on method classification

**Post-hoc descriptive sensitivity. Official pilot accuracies and NO_GO decision are unchanged.**

| stage | official acc | invalid test n | invalid correct | valid-only test acc* |
|---|---:|---:|---:|---:|
| BASE | 0.389 | 3 | 0 | 0.467 |
| SFT | 0.389 | 1 | 0 | 0.412 |
| DPO | 0.500 | 0 | 0 | 0.500 |
| RLVR | 0.722 | 0 | 0 | 0.722 |

*This only removes invalid items from scoring after the original classifiers/predictions were produced. It is not a refit and cannot replace the official analysis.
