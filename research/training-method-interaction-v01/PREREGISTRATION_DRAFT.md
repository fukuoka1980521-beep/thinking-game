# Preregistration Draft v0.1

Status: DRAFT — NOT FROZEN

## Primary experimental factors

Training stage:
1. BASE
2. SFT
3. DPO
4. RLVR

Method frame:
1. GENERIC
2. DIFFERENTIAL
3. BAYESIAN
4. FALSIFICATION
5. CAUSAL
6. STATE_SPACE
7. SOFTWARE_TESTING

Primary tasks:
- T1: repeated-LLM-response variation
- T2: persistent workplace process-time variation

Held-out replication task:
- T3: 3D-printed polymer tensile-strength variation

## Primary prompt interface

SHARED_RAW:
The exact same literal prompt template is encoded for all four checkpoints.
No stage-specific chat wrapper is used.

Purpose:
Estimate training-stage differences without confounding them with chat-template differences.

## Secondary interface

NATIVE_CHAT:
Use each checkpoint's documented recommended interaction format.
BASE has no instruction-tuned native-chat interpretation and is treated separately.

Purpose:
Measure ecological instruction-following after post-training.

## Primary counted design

4 stages × 7 method frames × 2 tasks × 6 replicates = 336 plans.

Generation settings and seeds are matched across stages.
Fresh local generation per cell.
No external tools/evidence.
Method treatment is LABEL_ONLY; operational method instructions are not used in the primary test.

## Primary outcomes

1. Within-stage cross-task method recoverability.
2. Cross-stage same-task method transfer.
3. Cross-stage cross-task method transfer.
4. Training-stage change in method recoverability.
5. Per-family heterogeneity.
6. Gross-structure negative control.
7. Lexical masking robustness.

## Primary hypotheses

H1:
Method recoverability is above 1/7 chance in at least one post-training stage under SHARED_RAW.

H2:
SFT increases method-cue responsiveness relative to BASE.

H3:
Method signatures show non-zero cross-stage transfer if post-training mainly selects/amplifies a repertoire already available after pretraining.

H4:
If later-stage signatures are newly constructed by post-training, later-stage within-stage recoverability can be high while BASE -> later cross-stage transfer remains near chance.

DPO and RLVR directional effects are treated as preregistered contrasts but not assumed to be monotonic.

## Important non-claims

- Classification is not methodology quality.
- Instruction compliance is not proof of internal reasoning.
- Cross-stage transfer is not proof of identical neural representation.
- Hidden-state probes, if added, are exploratory unless separately frozen.
- RLVR effects cannot automatically be generalized beyond the released RLVR objective mixture.

## Stop rule before counted collection

Do not freeze or start counted generation until:
- all four model IDs resolve;
- tokenizer compatibility is recorded;
- all four checkpoints run locally;
- deterministic prompt construction is verified;
- a non-counted feasibility pilot completes;
- runtime/storage estimates fit HUKUOKA;
- no paid API is invoked.
