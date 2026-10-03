# BASE → SFT → DPO Partial Interpretation

Status: PARTIAL DESCRIPTIVE ONLY
Data available: 54/72 outputs
RLVR not yet included.
Not used to alter the frozen pilot.

## Observed stage metrics

| Metric | BASE | SFT | DPO |
|---|---:|---:|---:|
| Method lexical accuracy | 0.389 | 0.389 | 0.500 |
| Macro recall | 0.389 | 0.389 | 0.500 |
| Structure-only accuracy | 0.278 | 0.278 | 0.167 |
| Length-only accuracy | 0.222 | 0.389 | 0.222 |
| Lexical advantage over gross controls | +0.111 | +0.000 | +0.278 |
| Within-cell residual diversity | 0.399 | 0.375 | 0.261 |
| Mean neutral headings present | 3.22 | 7.00 | 6.94 |
| Mean output words | 352.2 | 282.4 | 336.8 |

Nominal three-class chance = 0.333.

## Family recall

### BASE
- GENERIC: 0.000
- BAYESIAN: 0.667
- SOFTWARE_TESTING: 0.500

### SFT
- GENERIC: 0.333
- BAYESIAN: 0.667
- SOFTWARE_TESTING: 0.167

### DPO
- GENERIC: 0.667
- BAYESIAN: 0.667
- SOFTWARE_TESTING: 0.167

## Cross-stage transfer

- BASE → SFT: 0.389
- BASE → DPO: 0.333
- SFT → BASE: 0.278
- SFT → DPO: 0.556
- DPO → BASE: 0.333
- DPO → SFT: 0.556

## Current interpretation

### 1. SFT strongly improves generic instruction compliance
BASE → SFT increases neutral heading adherence substantially.

### 2. SFT does not increase three-class methodological recoverability
Lexical method accuracy remains 0.389 at both BASE and SFT.

This supports separating:
- generic instruction compliance/routing;
- methodological-strategy recoverability.

### 3. DPO changes the behavioral distribution
DPO method accuracy rises to 0.500 while structure-only and length-only controls fall to 0.167/0.222.

The resulting lexical advantage (+0.278) is larger than at BASE or SFT.

### 4. DPO also compresses within-cell diversity
Residual lexical diversity falls:
0.399 → 0.375 → 0.261.

This is directionally consistent with preference optimization narrowing or stabilizing the subset of response policies expressed under a given task/method condition.

### 5. DPO is behaviorally closer to SFT than BASE under cross-stage transfer
SFT ↔ DPO transfer is 0.556 in both directions, above nominal 0.333 chance.
BASE↔DPO transfer is only 0.333.

This is compatible with SFT establishing a post-training instruction-conditioned regime that DPO reshapes rather than replacing completely.

## What is not supported yet

- No claim that DPO creates a new internal reasoning faculty.
- No claim that DPO specifically strengthens SOFTWARE_TESTING; its recall remains 0.167 in this partial analysis.
- No claim that DPO is scientifically superior.
- No final TrainingStage × MethodFraming claim before RLVR completes.

## Immediate question for RLVR

Does RLVR:
1. further increase lexical method recoverability;
2. selectively increase SOFTWARE_TESTING recall;
3. further compress diversity;
4. preserve SFT/DPO cross-stage transfer;
5. increase stage-style confounding instead of method-specific signal?

The final 18 RLVR outputs decide these points.
