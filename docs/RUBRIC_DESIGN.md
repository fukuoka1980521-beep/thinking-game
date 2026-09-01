# RUBRIC_DESIGN — SPEC AMENDMENT

This document defines how CASE RUBRICs are authored and used. It amends `docs/DATA_MODEL.md` and
`docs/GAME_DESIGN.md`: rubric fields are now mandatory case-authoring inputs, not something derived
after the fact from play logs.

## Core principle

> raw log ≠ thinking ability

A completed session is a **decision trajectory** (see `docs/TRAJECTORY_SCHEMA.md`), not a skill score.
Ability estimates are only produced where a rubric exists and only in the terms that rubric defines.
Cases without a rubric (`OPEN_ENDED`) are never scored.

## RubricDefinition (`src/types/case.ts`)

Every case carries one `RubricDefinition`, authored before the case is ever played:

| Field | Purpose |
|---|---|
| `rubricVersion` | Lets a future re-authoring of the rubric be told apart from old trajectory logs that scored against an earlier version. |
| `targetSkill` | Which of the 4 MVP abilities this case primarily targets. |
| `observableBehavior` | The plain factual claim the situation actually supports — shown to the player at the OBSERVED FACT screen. |
| `acceptableReasoning` / `weakReasoning` / `criticalError` | Author-facing description of reasoning quality tiers, used to write case copy and to pick `criticalErrorChoiceId`. |
| `criticalErrorChoiceId` | The `availableChoices` id that embodies `criticalError`, or `null` when no single choice does (e.g. CASE-002, where the error is failing to diversify hypotheses, not picking a specific wrong one). |
| `updateCondition` / `doNotUpdateCondition` | What kind of new evidence should, or should not, move a rational player's judgment. |
| `uncertaintyCondition` | Why the case cannot be resolved before new evidence arrives — keeps FIRST_DECISION honestly uncertain. |
| `aiResponseGroundTruth` | `CORRECT` / `UNCERTAIN` / `INCORRECT` when the AI intervention is an evaluable claim, or `null` when it is a Socratic question with nothing to accept or reject (see `docs/AI_CALIBRATION.md`). **Drives the ACCEPT/VERIFY/HOLD/REJECT UI directly — independent of `caseType`** (validation-build change; a TRANSFER case can carry this too). |
| `transferTarget` | Which TRANSFER case this skill is expected to generalize to (`docs/TRANSFER_TEST_DESIGN.md`); for a TRANSFER case itself, a comma-separated list of the TRAINING cases it mirrors (a documented, deliberate reuse of the field rather than a second field). |
| `evidenceStrength` | `diagnostic` (the new fact should resolve the ambiguity) or `ambiguous` (it should not, by itself, justify changing). All 7 shipped cases are `diagnostic`; `ambiguous` is defined for future cases. |
| `evidenceSupportsChoiceId` | Which `availableChoices` id the new evidence actually supports — the ground truth `computeUpdateAppropriateness` compares against. |
| `correctInfoIds` | Which `infoOptions` are genuinely diagnostic, vs. distractors. |
| `uncertaintyChoiceId` | The `availableChoices` id representing genuine epistemic humility ("I can't tell yet"), or `null` if the case's choice set doesn't have one. Used by `computeSessionSummary` for the "「まだ判断できない」を選んだ" tally (validation build Section 7). |

## Case-type-dependent rigor (Section B / M)

- `TRAINING` (CASE-001〜004): rubric exists, but the case is meant to teach, not certify. `criticalErrorChoiceId`
  may be `null` when no single choice constitutes an unfounded judgment. `aiResponseGroundTruth` is always
  `null` — these cases' AI interventions are Socratic questions, not claims.
- `AI_CALIBRATION` (CASE-005) / `TRANSFER` (TRANSFER-001/002): rubric may set `aiResponseGroundTruth`
  when the case's AI intervention is an evaluable claim rather than a question — this is what makes the
  ACCEPT/VERIFY/HOLD/REJECT control meaningful (see `docs/AI_CALIBRATION.md`). Both TRANSFER cases use
  this to provide the CORRECT/UNCERTAIN AI-quality content the case set needs (Section 2).
- `MEASUREMENT`, `OPEN_ENDED`: reserved case types, not shipped yet (see `docs/MVP_SCOPE.md`).

## Where the rubric is used

All rubric-driven evaluation lives in `src/engine/evaluationEngine.ts`:

- `computeRubricResult` — pure function, structured inputs only (`ObservedFactInput`, `FirstDecisionInput`,
  `AiActionInput`, `SecondDecisionInput`), never reads free text.
- `computeUpdateAppropriateness` — compares `first`/`second` choice against `evidenceSupportsChoiceId`.
- `computeCalibrationLabel` — looks up the AI_QUALITY × PLAYER_ACTION matrix (`docs/AI_CALIBRATION.md`).

The rubric itself is never shown to the player verbatim; player-facing copy is the separate
`ReflectionPoints` bank plus a small set of generic, rubric-outcome-driven strings in
`evaluationEngine.ts` (`UPDATE_APPROPRIATENESS_COPY`, `CALIBRATION_COPY`).

## Authored rubric, CASE-001 (fully worked example)

See `src/data/cases/case-001.ts`. Worth calling out: `criticalErrorChoiceId: "a"` ("ミナさんはあなたを
無視している") and `evidenceSupportsChoiceId: "d"` ("まだ内容をきちんと読んでいない可能性がある") are two
different choices — a player can avoid the critical error at FIRST_DECISION and still not land on the
evidence-supported answer at SECOND_DECISION; both are scored independently.
