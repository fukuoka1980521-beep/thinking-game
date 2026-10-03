# Template Feasibility Gate v1.0

Status: DESIGNED / NOT YET EXECUTED

## Observed tokenizer fact

At the locked canonical revisions:
- BASE: no chat template in `tokenizer_config.json`.
- SFT: chat template present.
- DPO: chat template present.
- RLVR/Instruct: chat template present.

The SFT, DPO and RLVR templates share the same user/assistant envelope pattern.

This means prompt rendering is part of the training-stage treatment and also a potential confound.

## Two estimands

### A. COMMON_RAW
All four stages receive exactly the same raw completion string.

Purpose: strongest control of literal input bytes. Measures whether post-trained weights retain method responsiveness even without their native chat envelope.

### B. STAGE_NATIVE
BASE receives the raw completion prompt because it has no native chat template. SFT/DPO/RLVR receive the same user-visible text through their frozen native chat template.

Purpose: ecological estimate of each checkpoint used through its intended interface. This includes routing effects associated with instruction tuning and its template.
## Pre-pilot smoke

Use only GENERIC × T1, not counted toward the 72-run calibration pilot.

Unique generations:
- COMMON_RAW: BASE, SFT, DPO, RLVR = 4
- STAGE_NATIVE: SFT, DPO, RLVR = 3
- BASE native is identical to BASE raw and is not regenerated
- total unique smoke outputs = 7

Smoke generation may use the same decoding family as the pilot but its outputs are never included in method classification.

## Decision rule fixed before smoke

Choose COMMON_RAW as the primary 72-run pilot rendering if all four stages:
1. produce non-empty research plans;
2. address the supplied objective;
3. produce at least 6/8 requested neutral sections or clearly equivalent content;
4. do not show template-token corruption.

If any post-trained stage fails COMMON_RAW but succeeds STAGE_NATIVE, use STAGE_NATIVE for the primary pilot and retain COMMON_RAW as a sensitivity condition on a smaller subset.

If BASE fails COMMON_RAW to produce a valid research plan, STOP and redesign the base-completion prompt before any 72-run pilot. Do not repair prompts after seeing method-condition results.

## Interpretation

A difference seen only under STAGE_NATIVE is evidence about the operational post-trained model interface, not clean evidence that weight updates alone caused the difference.

A difference that appears under COMMON_RAW is stronger evidence that stage weights themselves changed method-conditioned behavior under identical input bytes.
