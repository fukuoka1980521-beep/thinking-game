# Template Smoke Amendment — 2026-10-03

Status: PRE-PILOT CALIBRATION AMENDMENT

## Trigger

The first BASE / GENERIC / T1 COMMON_RAW smoke used the original completion-neutral prompt ending with:

`Do not discuss this instruction. Return only the research plan.`

Observed:
- output characters: 0
- prompt tokens evaluated: 109
- predicted tokens: 1
- stop: true
- elapsed generation request: 7.19 s
- model file SHA256: `3e706ed3e2cba388e8eba78d90cebd023cddc1be796e000cbc6ea6c5b97eeab0`

The model therefore terminated immediately at EOS. No method-family comparison, stage comparison, or pilot outcome had been observed.

The failed output is preserved at:
`template_smoke/failed_attempts/SMOKE-BASE-RAW-v1-empty-eos.json`

## Interpretation

This is a template/interface failure, not evidence that BASE lacks a methodological repertoire.

A pretrained completion model can treat an instruction-like document ending in a complete sentence as a finished text and emit EOS. The original gate explicitly required redesigning the base-completion prompt before the 72-run pilot if BASE failed COMMON_RAW.

## Amendment

The user-visible instruction text is unchanged.

For COMMON_RAW only, append the same neutral completion scaffold to every stage:

```
Research plan:

Objective and scope
```

This supplies a document-continuation context without adding any methodology-specific operation or substantive answer content.

STAGE_NATIVE continues to use the unchanged user-visible instruction through each post-trained checkpoint's native chat template.

## Integrity boundary

- 72-run pilot outputs generated before amendment: **0/72**
- methods observed before amendment: GENERIC only
- tasks observed before amendment: T1 only
- training stages observed before amendment: BASE only
- confirmatory data: none
- paid API/model calls: 0

The amendment therefore remains part of interface calibration and is not a post-hoc response to the TrainingStage × MethodFraming result.

## New manifest

- rows: 72
- new manifest SHA256:
  `e5ad1cfd3bd07de2cb6832075acb851261fedb811b6d422d55f40f630fd2bf0b`
- raw rendering version:
  `COMMON_RAW_V2_NEUTRAL_SCAFFOLD`

No further raw-prompt redesign is allowed after method-condition pilot outputs begin. If BASE v2 still fails, stop and reconsider whether BASE can participate in the same behavioral estimand.
