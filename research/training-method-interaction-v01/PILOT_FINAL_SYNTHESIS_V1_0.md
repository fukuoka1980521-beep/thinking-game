# Training Stage × Methodological Framing — Pilot Final Synthesis v1.0

Status: CALIBRATION COMPLETE / STRICT NO_GO / SCIENTIFICALLY INFORMATIVE
Date: 2026-10-03

## Executive result

The 72-output OLMo 2 calibration pilot completed across four training stages:

BASE → SFT → DPO → RLVR

with three methodological framings:

GENERIC / BAYESIAN / SOFTWARE_TESTING

and two tasks under identical COMMON_RAW prompts.

Frozen pilot gate decision: **NO_GO**.

The NO_GO was caused by a single failed validity gate:
- required overall valid rate >=95%;
- observed 68/72 = 94.44%.

All other gates passed.

## Core method recoverability result

| Stage | Method accuracy | Structure-only | Length-only | Residual lexical advantage |
|---|---:|---:|---:|---:|
| BASE | 0.389 | 0.278 | 0.222 | +0.111 |
| SFT | 0.389 | 0.278 | 0.389 | +0.000 |
| DPO | 0.500 | 0.167 | 0.222 | +0.278 |
| RLVR | 0.722 | 0.333 | 0.222 | +0.389 |

Nominal three-class chance = 0.333.

The strongest observed method recoverability is at RLVR, not SFT.

## Family recall

| Stage | GENERIC | BAYESIAN | SOFTWARE_TESTING |
|---|---:|---:|---:|
| BASE | 0.000 | 0.667 | 0.500 |
| SFT | 0.333 | 0.667 | 0.167 |
| DPO | 0.667 | 0.667 | 0.167 |
| RLVR | 0.833 | 1.000 | 0.333 |

The preregistered directional expectation that RLVR would selectively amplify SOFTWARE_TESTING is **not supported**.

Instead, the largest RLVR family gain is BAYESIAN.

## Cross-stage transfer

Most notable:
- DPO → RLVR = **1.000**
- RLVR → DPO = 0.667
- SFT → DPO = 0.556
- SFT → RLVR = 0.611
- BASE → SFT = 0.389

The perfect DPO→RLVR transfer is asymmetric.

A cautious behavioral interpretation is:
DPO-stage method signatures remain highly recognizable in RLVR outputs, while RLVR prototypes are sharper/narrower than the corresponding DPO distribution.

This is consistent with preservation plus amplification/reweighting, not with complete creation of a new unrelated method representation.

## Diversity

Residual within-cell lexical diversity:

- BASE: 0.399
- SFT: 0.375
- DPO: 0.261
- RLVR: 0.268

The largest contraction is SFT → DPO (-0.114).

This is directionally consistent with preference optimization narrowing the response distribution.

RLVR does not further compress diversity materially; it remains at a similar low level.

## BASE → SFT finding

SFT dramatically improved generic structural compliance in calibration/smoke behavior, but method recoverability remained:

BASE = 0.389
SFT = 0.389

Therefore:

**generic instruction following and methodological-strategy recoverability are empirically separable in this pilot.**

This weakens a simple model in which instruction tuning uniformly strengthens all kinds of routing.

A better model distinguishes:
- generic instruction/format routing;
- method-specific strategy selection.

## Updated theoretical model

Current best behavioral account:

1. Pretraining/midtraining forms a broad repertoire of strategies.
2. SFT strongly improves generic instruction compliance/routing.
3. DPO reshapes/narrows response policy and begins stronger method separation.
4. RLVR further sharpens method-conditioned behavior in this lineage, but not specifically in the originally predicted SOFTWARE_TESTING direction.
5. Runtime MethodPrompt selects among strategies under the post-training policy.

This supports a **selection/amplification** account more strongly than a simple "each training stage creates a new reasoning faculty" account.

## Validity-gate boundary

Frozen-invalid outputs: 4.

- 1 clearly too short/incomplete (24 words).
- 1 clearly task-relevant but 3 words below the 100-word threshold (97 words).
- 2 are longer but weak/off-target under the task-keyword validity heuristic.

A post-hoc relaxed rule (>=90 words, >=1 task keyword hit, same refusal/corruption exclusions) would yield 71/72 = 98.61%.

This sensitivity does not overturn the frozen NO_GO.

Correct interpretation:
**strict protocol NO_GO by one-case margin, not phenomenon failure.**

## Chance-reference only

Under a simple independent 1/3 chance model (not a formal classifier permutation test):

- 7/18 or better: ~0.391
- 9/18 or better: ~0.108
- 13/18 or better: ~0.00085
- 18/18: ~2.6e-9

These values are descriptive reference points only.

The attempted full permutation robustness analysis was abandoned because repeated full text-vector reconstruction was computationally inefficient relative to the calibration purpose.

Impact:
- no confirmatory p-value is claimed from the pilot;
- the behavioral pattern remains descriptive/calibration evidence.

## What could not be established

1. A confirmatory TrainingStage × MethodFraming effect:
   blocked by frozen pilot NO_GO.

2. Algorithm-only causality:
   unavailable because training objective and data distribution both change across stages.

3. Internal neural mechanism:
   no activation-level or causal intervention study was performed.

4. Selective RLVR verifier-method amplification:
   the preregistered SOFTWARE_TESTING-specific pattern was not observed.

## Impact of these limits

The limits prevent claims such as:
- "RLVR creates methodological reasoning";
- "SFT causes Bayesian routing";
- "DPO alone causes diversity collapse";
- "the same internal method vector persists across stages."

They do **not** overturn:
- the parent 714-plan finding that methodological framing changes observable research-plan behavior;
- the pilot observation that post-training stage changes the expression/separability of those method-conditioned behaviors.

## Current answer

The best-supported current model is:

**LLM reasoning style is not simply created by the runtime prompt and is not reducible to instruction-following compliance.**

Instead, the evidence is most consistent with:
- broad strategy repertoire formed during pretraining;
- post-training progressively changing which strategies are easy to elicit, how narrowly they are expressed, and how sharply method-conditioned outputs separate;
- runtime methodological framing acting as a selector over that learned policy.

The strongest new empirical observation is not SFT, but the later transition:
DPO and especially RLVR show substantially stronger recoverability of method-conditioned research-plan signatures, with DPO→RLVR transfer reaching 18/18 in this calibration.

Because the pilot gate failed by one validity case, this conclusion remains **strong exploratory/calibration evidence, not confirmatory evidence**.
