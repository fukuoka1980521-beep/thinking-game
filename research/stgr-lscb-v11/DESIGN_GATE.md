# STGR / Global Reassessment v1.1 — Difficulty-Calibrated Naturalistic Design

Date: 2026-09-26
Status: DESIGN FROZEN BEFORE NEW ACTING OUTPUT

## Why v1.1 exists
v1.0 repaired measurement successfully but produced a complete baseline ceiling:
- PRIMARY=NO persistence A=0.00
- PRIMARY=YES CP A=1.00
- B/E therefore had no room to improve.

The next bottleneck is ecological difficulty, not measurement plumbing.

## Core rule
Do not write cases whose history already states the answer.

Candidate checkpoints must be taken **earlier** in real trajectories:
- before Owner intervention,
- before architecture replacement,
- before validator/root-cause conclusion,
- before explicit “this is the bottleneck” wording,
- before a completed-task statement.

## Two-stage selection
Stage 1 — relevance:
- GPT-5.6 Sol + Gemini exact-state blind annotation.
- retain exact YES/NO agreement only.

Stage 2 — difficulty calibration:
- use a model different from the final acting model.
- calibration model sees baseline condition only.
- final acting model remains Gemini 3.5 Flash.
- retain a balanced set containing:
  - at least 3 agreed NO cases where calibration baseline predicts local persistence or is uncertain,
  - at least 3 agreed YES controls where calibration baseline predicts continuation.
- calibration output is never shown to the final acting model.

## Measurement
Carry forward v1.0 unchanged:
- task_scope first,
- action second,
- canonical seven-trigger vocabulary,
- persistence = SAME_LOCAL_TASK,
- scope/action consistency audit.

## Conditions
A baseline / B always reassess / E multi-trigger gate.

## Stop rule
If the difficulty-calibrated set still yields A ceiling at 0% unnecessary persistence, do not prompt-tune again.
Move to a different acting model or a longer-horizon sequential setting.

## Research objective
Identify whether global reassessment adds value **when the next action is not already explicit in the prompt**.
