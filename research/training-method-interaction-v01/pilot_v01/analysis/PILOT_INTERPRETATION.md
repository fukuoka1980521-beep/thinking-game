# Training Stage × Method Framing — Pilot Interpretation

**Calibration only. This report does not upgrade the 72-run pilot into confirmatory evidence.**

Pilot gate: **NO_GO**

## Method recoverability and gross controls

| stage | lexical acc | structure-only | length-only | lexical advantage | macro recall |
|---|---:|---:|---:|---:|---:|
| BASE | 0.389 | 0.278 | 0.222 | +0.111 | 0.389 |
| SFT | 0.389 | 0.278 | 0.389 | +0.000 | 0.389 |
| DPO | 0.500 | 0.167 | 0.222 | +0.278 | 0.500 |
| RLVR | 0.722 | 0.333 | 0.222 | +0.389 | 0.722 |

## Within-cell residual lexical diversity

- BASE: 0.399
- SFT: 0.375
- DPO: 0.261
- RLVR: 0.268

## Pattern interpretation

### Repertoire-first behavioral support
BASE lexical method accuracy=0.389 exceeds chance and its structure/length controls by +0.111. This is consistent with some method-linked behavior being routable before instruction tuning.

### No SFT method-recoverability gain
SFT does not exceed BASE in lexical method recoverability (Δ=+0.000).

### SFT→DPO selection shift
Lexical method recoverability changes by +0.111; DPO residual over structure/length is +0.278. Interpret family recalls and compliance before attributing this to preference selection.

### DPO diversity compression candidate
Within-cell residual lexical diversity changes SFT→DPO by -0.115, directionally consistent with preference optimization narrowing response variation.

### No clear verifier-selective amplification
SOFTWARE_TESTING DPO→RLVR change=+0.167; BAYESIAN change=+0.333; RLVR residual lexical advantage=+0.389. The preregistered directional pattern is not clearly present.

### BASE→SFT behavioral continuity
Cross-stage method transfer BASE→SFT=0.389 (> nominal chance), consistent with some observable signature persisting across the instruction-tuning boundary.

## Stage-identity control

- stage cross-task accuracy: 0.528
- strongest lexical method accuracy: 0.722
- Method identity is at least as recoverable as stage identity in this calibration, reducing (not eliminating) stage-style concern.

## Compliance

- BASE: all-headings=0.00, refusal=0.00, mean words=352.2
- SFT: all-headings=0.00, refusal=0.00, mean words=282.4
- DPO: all-headings=0.06, refusal=0.00, mean words=336.8
- RLVR: all-headings=0.00, refusal=0.00, mean words=325.5

## Claim ceiling

Allowed: describe calibration-stage behavioral differences and decide whether a larger confirmatory design is justified.
Not allowed: infer hidden chain-of-thought, claim a one-to-one mapping from training algorithm to cognitive faculty, or rank methodologies by scientific quality.

## Decision handling

If NO_GO: do not enlarge the dataset. Report which gate failed and answer from the parent 714-plan study plus this pilot.
If GO: proceed only to confirmatory-design sizing/freeze; pilot outputs remain excluded from the confirmatory denominator.
