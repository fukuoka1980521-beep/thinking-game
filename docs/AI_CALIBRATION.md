# AI_CALIBRATION — SPEC AMENDMENT

## Why the coach AI and the "AI claim" are different things

The 4 coach characters (探偵・悪魔・他者視点・参謀, `src/data/aiCharacters.ts`) mostly ask **Socratic
questions** ("それは確認された事実ですか？"). A question is not a claim — there is nothing to accept,
verify, or reject. Only a case where the in-fiction AI actually **asserts something that can be right or
wrong** can be evaluated for calibration. In this MVP that is CASE-005 only, where the AI intervention is
"AIアシスタント" quoting a causal claim about the player's sales data.

This is why `RubricDefinition.aiResponseGroundTruth` is `null` for CASE-001〜004 (`caseType: "TRAINING"`)
and set to `"INCORRECT"` only for CASE-005 (`caseType: "AI_CALIBRATION"`) — enforced by a `data.test.ts`
invariant. `AiInterventionScreen` only renders the ACCEPT/VERIFY/HOLD/REJECT control when
`caseData.caseType === "AI_CALIBRATION"`.

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

## Character assignment and calibration (Section H)

`characterOffered`, `characterChoiceAvailable` are recorded on every trajectory log even though this MVP
always system-assigns the character (`characterChoiceAvailable: false` for all 5 cases, enforced by a
`data.test.ts` invariant). This is forward-compatible data collection for the future levels 4–5 partial
choice described in Section H — no behavior changes yet, but the field exists so a future Run doesn't need
a data migration to start measuring "does free character choice let players avoid their weak AI-response
pattern."

## Experiment group placeholder (Section F)

`TrajectoryLog.experimentGroup` is always `"CONTROL_NO_AB_TEST_V0"` in this MVP. No trap-rate variation is
actually served. The field exists purely so a future A/B rollout (`TRAP_RATE_10` / `TRAP_RATE_25` /
`TRAP_RATE_40`) doesn't require another schema migration — see `docs/VALIDATION_PLAN.md` (H2).

## What is measurable today vs. not

**Measurable now** (from CASE-005 alone, accumulated over repeat play via "今日の1問"):
- Distribution of ACCEPT/VERIFY/HOLD/REJECT over recent AI_CALIBRATION sessions.
- Whether the trap type was correctly identified.
- The calibration label for each session (stored in `rubricResult.aiCalibration`, not yet broken out into
  its own GrowthScreen chart — see `docs/TEST_PLAN.md` / next-run recommendation).

**Not measurable yet:**
- Calibration across *multiple different* AI-claim cases (only one exists).
- Whether calibration generalizes to a different surface topic (that is exactly what TRANSFER cases would
  test — `docs/TRANSFER_TEST_DESIGN.md` — and none are implemented yet).
- Any A/B effect of trap rate (H2 in `docs/VALIDATION_PLAN.md`) — no variation is served.
