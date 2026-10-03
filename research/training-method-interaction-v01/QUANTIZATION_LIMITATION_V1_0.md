# Quantization Limitation v1.0

Status: ACTIVE INTERPRETATION BOUNDARY
Date: 2026-10-03

## Current pilot condition
All local calibration stages use Q4_K_M GGUF inference under the same llama.cpp runtime family.

## External evidence
Published studies report mixed but important findings:
- 4-bit quantization can retain much of general model performance in many settings;
- degradation is not uniform across tasks;
- instruction following can be more sensitive than some knowledge/QA tasks;
- mathematical reasoning and reasoning-planning steps can degrade substantially under aggressive low-bit quantization in some model/quantizer settings.

## Impact on this study
Q4 does **not** invalidate the calibration pilot because the pilot asks whether a measurable TrainingStage × MethodFraming signal exists under one fixed practical deployment condition.

However, Q4 limits stronger interpretation:
- a stage difference may be amplified or attenuated by quantization;
- absence of a method effect at Q4 does not prove absence at higher precision;
- confirmatory claims about the original canonical checkpoints require a precision-sensitivity bridge.

Impact category:
- calibration validity: retained;
- numerical precision: potentially affected;
- generalizability to BF16/full precision: limited;
- internal mechanism claims: not supported regardless of precision.

## Resolution path
If pilot GO:
1. repeat a small representative subset at Q6_K/Q8_0 or BF16 where feasible;
2. compare direction and family pattern, not only aggregate accuracy;
3. if material reversals occur, treat Q4 pilot as deployment-specific exploratory evidence and redesign confirmatory execution.
