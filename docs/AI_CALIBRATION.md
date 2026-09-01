# AI_CALIBRATION — SPEC AMENDMENT

## Why the coach AI and the "AI claim" are different things

The 4 coach characters (探偵・悪魔・他者視点・参謀, `src/data/aiCharacters.ts`) mostly ask **Socratic
questions** ("それは確認された事実ですか？"). A question is not a claim — there is nothing to accept,
verify, or reject. Only a case where the in-fiction AI actually **asserts something that can be right or
wrong** can be evaluated for calibration.

**Validation-build update:** this is now decoupled from `caseType`. `AiInterventionScreen` renders the
ACCEPT/VERIFY/HOLD/REJECT control whenever `caseData.rubric.aiResponseGroundTruth !== null`, regardless of
`caseType`. This lets `TRANSFER-001`/`TRANSFER-002` carry an evaluable AI claim too (needed for the AI
quality balance below), while CASE-001〜004 (`caseType: "TRAINING"`) stay Socratic-question-only
(`aiResponseGroundTruth: null`, enforced by a `data.test.ts` invariant).

## PLAYER_AI_ACTION

Captured as a structured choice, not inferred from free text (Section D):

- **ACCEPT** — 採用する
- **VERIFY** — 検証する
- **HOLD** — 保留する
- **REJECT** — 拒否する

## The calibration matrix (`computeCalibrationLabel`, `src/engine/evaluationEngine.ts`)

| AI_QUALITY \ ACTION | ACCEPT | VERIFY | HOLD | REJECT |
|---|---|---|---|---|
| **CORRECT** | appropriate_reliance | appropriate_verification | appropriate_caution | under_reliance |
| **UNCERTAIN** | premature_acceptance | appropriate_verification | appropriate_caution | premature_rejection |
| **INCORRECT** | over_reliance | appropriate_verification | appropriate_caution | appropriate_rejection |

Explicit design commitments from Section F/G:

- **No single trust score.** `CalibrationLabel` is a categorical outcome, never averaged into one number.
  `GrowthScreen` shows a raw ACCEPT/VERIFY/HOLD/REJECT frequency table (最近10ケースでのAIとの付き合い方),
  not a score.
- **"Doubt the AI" is not automatically correct.** `CORRECT × REJECT` is `under_reliance`, not a good
  outcome. `INCORRECT × ACCEPT` is `over_reliance`. Both directions of miscalibration are named.
- **VERIFY is always at least neutral-to-good** (`appropriate_verification`) regardless of AI_QUALITY —
  checking is never penalized, matching "AIの意見を無条件採用しなかったか" from the original scoring
  principle.

## AI trap detection is a separate axis

Whether the player *correctly identifies the type of flaw* (via the taxonomy selector, see
`docs/AI_TRAP_TAXONOMY.md`) is tracked independently as `RubricResult.trapDetection`, and is only
`applicable` when `caseData.aiTrap.present`. A player can reject a bad AI claim (good calibration) without
correctly naming *why* it's wrong (separate, also useful, signal) — the two are not conflated into one
score.

## AI quality balance across the case set (validation-build Section 2)

CASE-005 alone would only teach "AI claims are usually wrong." The case set now has one case of each
quality, so blanket AI-rejection can be told apart from genuine calibration (H2, `docs/VALIDATION_PLAN.md`):

| Case | AI quality | Trap? |
|---|---|---|
| CASE-005 | INCORRECT | Yes (`CAUSALITY_ERROR`) |
| TRANSFER-001 | CORRECT | No — the claim holds up once verified |
| TRANSFER-002 | UNCERTAIN | No — the AI itself hedges ("確度：中程度") |

AI quality and trap presence are never shown to the player during play (enforced by a `data.test.ts`
check on all player-facing case text) — only the RESULT-screen feedback (via `CALIBRATION_COPY` /
`buildReflection`) references the outcome, and only in outcome-neutral phrasing, never as "this was a
trap" or "this AI was rated X."

## Character assignment and calibration (Section H)

`characterOffered`, `characterChoiceAvailable` are recorded on every trajectory log even though this build
always system-assigns the character (`characterChoiceAvailable: false` for all 7 cases, enforced by a
`data.test.ts` invariant). This is forward-compatible data collection for the future levels 4–5 partial
choice described in Section H — no behavior changes yet, but the field exists so a future Run doesn't need
a data migration to start measuring "does free character choice let players avoid their weak AI-response
pattern" (H3, `docs/VALIDATION_PLAN.md`).

## Calibration V2: deferred (validation-build Section 3)

A future refinement — AI_QUALITY × PLAYER_ACTION × EPISTEMIC_CONTEXT — is recorded here as
`NOW_NOT_IMPLEMENT`. The idea: VERIFY/HOLD on a CORRECT claim can be either reasonable caution or excessive
over-verification depending on context (time pressure, stakes, how many times the player has already
verified similar claims). The current 2-axis matrix cannot distinguish these. Not implemented this Run.

## Experiment group placeholder (Section F)

`TrajectoryLog.experimentGroup` is always `"CONTROL_NO_AB_TEST_V0"` in this MVP. No trap-rate variation is
actually served. The field exists purely so a future A/B rollout (`TRAP_RATE_10` / `TRAP_RATE_25` /
`TRAP_RATE_40`) doesn't require another schema migration — see `docs/VALIDATION_PLAN.md` (H2).

## What is measurable today vs. not

**Measurable now** (3 AI-claim cases across the 7-case rotation):
- Distribution of ACCEPT/VERIFY/HOLD/REJECT over recent sessions with an evaluable AI claim, regardless of
  `caseType` (`computeAiActionDistribution`, `src/engine/growthAggregator.ts`).
- Whether the trap type was correctly identified (CASE-005 only — the other two claims aren't traps).
- The calibration label for each session (stored in `rubricResult.aiCalibration`).
- Reaction to a CORRECT and an UNCERTAIN claim, not just an INCORRECT one — whether exposure to CASE-005
  produces blanket rejection of TRANSFER-001's (correct) claim (H2).

**Not measurable yet:**
- More than one case per AI-quality bucket (still only 1 CORRECT, 1 UNCERTAIN, 1 INCORRECT case).
- Whether calibration generalizes to a *third, unrelated* surface topic beyond TRANSFER-001/002.
- Any A/B effect of trap rate (H2's second half) — no variation is served, `experimentGroup` is a fixed
  placeholder.
- Calibration V2 (epistemic context) — see above, `NOW_NOT_IMPLEMENT`.
