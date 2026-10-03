# Training Stage × Methodological Framing
## Technical Report v1.0

Date: 2026-10-03
Status: COMPLETE BEHAVIORAL CALIBRATION REPORT

## 1. Research question

The parent methodological-framing study established that named methodological frames can change observable LLM research-plan signatures across tasks and models.

This follow-up asks a deeper question:

> Are those method-conditioned behaviors affected by where the model sits in the training pipeline?

Operationally:

TrainingStage × MethodFraming → Observable Research-Plan Signature

The tested OLMo 2 7B lineage was:

BASE → SFT → DPO → RLVR

Method framings in the calibration pilot:

GENERIC / BAYESIAN / SOFTWARE_TESTING

Tasks:

T1 / T2

All primary pilot generations used the same COMMON_RAW user-visible prompt format.

## 2. Parent evidence

The parent study already established, with 714 counted plans:

- Study A: methodological framing changed research-plan signatures above chance.
- R1a: the effect transferred to a new task.
- R1b: the effect replicated in a second model.
- text-based signal survived masking of explicit method terminology.
- crude structure-only controls fell near chance.

Therefore the present study does not re-ask whether framing can matter.

It asks whether post-training stage changes the expression of the framing effect.

## 3. Calibration design

72 total outputs:

4 training stages × 3 method framings × 2 tasks × 3 replicates

Quantization:
Q4_K_M for all four stages.

Runtime:
llama.cpp commit 4e7481175cbd4759df8bee2f1c1a0073effbebd7

Sampling:
- temperature 1.0
- top_p 1.0
- top_k 0
- min_p 0
- no repetition penalty
- fixed run-specific seed
- max 512 generated tokens
- COMMON_RAW prompt

Pilot role:
calibration only, not confirmatory.

## 4. Main result

Method recoverability by training stage:

| Stage | Lexical method accuracy | Structure-only | Length-only | Residual lexical advantage |
|---|---:|---:|---:|---:|
| BASE | 0.389 | 0.278 | 0.222 | +0.111 |
| SFT | 0.389 | 0.278 | 0.389 | +0.000 |
| DPO | 0.500 | 0.167 | 0.222 | +0.278 |
| RLVR | 0.722 | 0.333 | 0.222 | +0.389 |

Three-class nominal chance = 0.333.

The striking feature is not BASE→SFT.

It is the later progression:

BASE/SFT ≈ weak signal
DPO = stronger signal
RLVR = substantially stronger signal

## 5. Instruction compliance versus method-specific routing

BASE and SFT had identical method-recoverability accuracy:

0.389 vs 0.389.

Yet neutral structural compliance differed strongly:

BASE mean headings present ≈ 3.22/8
SFT mean headings present ≈ 7.00/8

This gives an important empirical distinction:

**instruction-following compliance and method-specific strategy recoverability are not the same phenomenon.**

SFT can make the model much better at obeying output instructions without making named methodological framing more separable.

This argues against treating "routing" as one scalar capability.

At minimum, distinguish:

- generic instruction/format routing;
- method-specific strategy selection.

## 6. DPO result

DPO method accuracy rose to 0.500.

Its residual lexical advantage over structure/length controls rose to +0.278.

Within-cell residual lexical diversity dropped:

SFT: 0.375
DPO: 0.261

This is consistent with the idea that preference optimization narrows or reshapes the response distribution.

The evidence does not isolate DPO algorithmically, because the DPO stage differs from SFT in both objective and training data.

Safe claim:

> The DPO stage of this published post-training pipeline is associated with lower within-cell lexical diversity and stronger method recoverability than SFT in this calibration.

## 7. RLVR result

RLVR method accuracy reached 0.722.

Family recall:

GENERIC: 0.833
BAYESIAN: 1.000
SOFTWARE_TESTING: 0.333

This falsifies the simple preregistered directional idea that RLVR would primarily amplify SOFTWARE_TESTING-like framing.

Instead, BAYESIAN showed the strongest recoverability.

Therefore:

**verifiable-reward training does not map trivially onto software-testing style.**

The stronger interpretation is that RLVR alters the probability geometry of method-conditioned responses more generally.

## 8. Cross-stage transfer

Notable transfers:

DPO → RLVR = 1.000
RLVR → DPO = 0.667
SFT → DPO = 0.556
SFT → RLVR = 0.611
BASE → SFT = 0.389

DPO→RLVR classified all 18 RLVR outputs correctly by the method centroids learned from DPO.

This suggests strong behavioral continuity between DPO and RLVR method signatures.

The asymmetry is informative:

DPO→RLVR = perfect
RLVR→DPO = imperfect

One plausible account is that RLVR preserves and sharpens method-conditioned regions already visible at DPO.

This is compatible with a selection/amplification account.

It is not proof of shared internal representations.

## 9. Diversity result

Within-cell residual lexical diversity:

BASE 0.399
SFT 0.375
DPO 0.261
RLVR 0.268

The largest contraction occurs at SFT→DPO.

RLVR remains similarly narrow rather than narrowing much further.

This pattern is compatible with:

- SFT: improved compliance but relatively broad response policy;
- DPO: strong policy narrowing;
- RLVR: method-conditioned sharpening within an already narrower policy.

## 10. Creation versus selection

The combined parent study + pilot evidence supports a model closer to:

Pretraining:
builds broad strategy repertoire

Post-training:
changes probability, accessibility, persistence and selection of strategies

Runtime method prompt:
selects from that learned policy

rather than:

Method prompt creates a new reasoning faculty at inference time.

A compact behavioral model is:

Observed Method Behavior
=
Sample(
  Policy shaped by Training History
  |
  Task,
  Method Prompt
)

## 11. Why the pilot is formally NO_GO

Frozen calibration required:

overall validity >=95%.

Observed:

68/72 = 94.44%.

Thus the gate failed by one output.

All other gates passed:

- each stage >=80% valid
- method signal above chance somewhere
- stage interaction measurable
- lexical signal exceeded structure/length controls

Post-hoc sensitivity:

A rule of >=100 words and >=1 task keyword hit gives 70/72 = 97.2%.

A rule of >=90 words and >=1 hit gives 71/72 = 98.6%.

The frozen NO_GO is not changed.

The correct description is:

**strict calibration NO_GO by one-case margin, not failure of the underlying phenomenon.**

## 12. Invalid-output impact

Invalid items were concentrated in BASE/SFT.

Removing invalid items from scoring after predictions were already made gives:

BASE: 0.389 → 0.467
SFT: 0.389 → 0.412
DPO: unchanged 0.500
RLVR: unchanged 0.722

Thus invalid outputs do not create the observed DPO/RLVR rise.

If anything, they suppress early-stage accuracy.

## 13. External literature consistency

The result is consistent with three broader findings in the literature:

1. instruction tuning can improve explicit instruction conditioning without necessarily creating underlying knowledge;
2. preference optimization can narrow output distributions;
3. RLVR can shift probability mass toward already-available high-reward trajectories rather than necessarily creating entirely new reasoning capacity.

These are consistency arguments, not causal proof.

## 14. What is established

Strong parent-study result:
methodological framing produces reproducible observable research-plan signatures.

New calibration result:
the expression/separability of those method-conditioned signatures differs substantially across post-training stages in OLMo 2.

Most notable observed ordering:

BASE ≈ SFT < DPO < RLVR

for three-class method recoverability.

## 15. What is not established

Not established:

- an algorithm-only causal effect of SFT, DPO or RLVR;
- a hidden "Bayesian circuit" or "testing circuit";
- human-like reasoning faculties;
- superiority of any method;
- universal generalization beyond this lineage;
- confirmatory statistical proof of the stage interaction.

## 16. Current strongest answer

The present evidence supports the following model:

> LLM "reasoning style" is better understood as a conditional behavioral policy than as a fixed internal faculty or a property created entirely by prompting.

The model's training history shapes:
- which strategies exist in usable form;
- how broadly responses vary;
- which strategies are easy to elicit;
- how strongly a named methodological instruction separates the resulting behavior.

Runtime methodological framing then acts as a selector over that learned policy.

The key empirical correction is:

**SFT mainly improved generic instruction compliance in this pilot, while stronger method-specific separability emerged later, especially at DPO and RLVR.**

This makes "training stage × runtime framing" a more useful explanatory unit than either "training method" or "prompting method" alone.

Because the frozen validity gate missed by one case, this remains strong calibration evidence rather than a confirmatory second study.
