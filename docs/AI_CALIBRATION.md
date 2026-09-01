# AI_CALIBRATION — SPEC AMENDMENT

> **SEMANTICS FIX Run applied** (THINKING_GAME_FIRST_CASE_AND_CALIBRATION_SEMANTICS_V0_2). This
> document previously claimed the case set had one CORRECT, one UNCERTAIN, and one INCORRECT
> calibration-eligible case. That claim was **wrong** — audited and corrected below. This is not a
> "make Calibration more advanced" Run; it is a "the measuring instrument had a semantic bug, fix
> the bug" Run. No new calibration-eligible cases were added to paper over the correction.

## Two separate axes: UTTERANCE TYPE and AI QUALITY

This was the actual bug. `AiQuality` (`CORRECT` / `UNCERTAIN` / `INCORRECT`) answers "is the epistemic
content right?" — that question only makes sense for an utterance that *asserts* something.
`UtteranceType` (`CLAIM` / `QUESTION` / `RECOMMENDATION`, `src/types/case.ts`) answers "what kind of
utterance is this?" A `QUESTION` has no quality to accept, verify, hold, or reject — "rejecting" a
question is meaningless. The two axes were conflated in the validation build: `TRANSFER-001` was tagged
`aiResponseGroundTruth: "CORRECT"` even though its actual `aiIntervention` is a Socratic
fact-vs-interpretation question ("事実ですか？　それとも解釈ですか？"), structurally identical to
CASE-001's DETECTIVE line. The ACCEPT/VERIFY/HOLD/REJECT widget was therefore shown next to a question,
asking the player "このAIの提案を、あなたはどうしますか？" — semantically broken, since there was no
proposal on screen to accept or reject.

## Calibration eligibility (`isCalibrationEligible`, `src/engine/evaluationEngine.ts`)

```ts
function isCalibrationEligible(caseData: CaseData): boolean {
  return caseData.rubric.utteranceType !== "QUESTION" && caseData.rubric.aiResponseGroundTruth !== null;
}
```

Both conditions are checked so a data-authoring mistake on either field alone can't silently make a
Socratic case calibration-eligible again. `AiInterventionScreen` uses this helper (not
`caseType`, and not `aiResponseGroundTruth` alone) to decide whether to render the ACCEPT/VERIFY/HOLD/
REJECT control. `computeCalibrationLabel` also checks it and returns `not_applicable` for any
non-eligible case regardless of what `playerAction` happens to be.

The result is snapshotted onto every `TrajectoryLog.aiIntervention` as `calibrationEligible` +
`utteranceType`, and `computeAiActionDistribution` (`src/engine/growthAggregator.ts`) filters on
`calibrationEligible` explicitly — not on whether `playerAction` merely happens to be non-null — so a
future re-occurrence of this exact bug (an ineligible case somehow getting a non-null action) still
would not count.

## The 7-case audit (Section 4)

| Case | utteranceType | aiResponseGroundTruth | calibrationEligible | trapType |
|---|---|---|---|---|
| CASE-001 | QUESTION | null | false | NONE |
| CASE-002 | QUESTION | null | false | NONE |
| CASE-003 | QUESTION | null | false | NONE |
| CASE-004 | QUESTION | null | false | NONE |
| CASE-005 | CLAIM | INCORRECT | **true** | CAUSALITY_ERROR |
| TRANSFER-001 | QUESTION | null (was `"CORRECT"`, corrected) | false | NONE |
| TRANSFER-002 | CLAIM | UNCERTAIN | **true** | NONE |

CASE-001〜004's coach interventions are all Socratic questions from the 4 coach characters
(`src/data/aiCharacters.ts`) — nothing to accept/reject. TRANSFER-002's `initialSituation` explicitly
attributes a hedged causal claim to "分析ツール" ("確度：中程度"), making it a genuine, well-attributed
CLAIM. TRANSFER-001's notification is never attributed to an AI/analytics system at all, and its
`aiIntervention` is a plain fact-vs-interpretation question — after this audit, it is authored as
`QUESTION` / `null`, matching what it actually is.

**Why TRANSFER-001 was set to `null` rather than rewritten into a claim:** its real, unforced purpose —
an OBSERVATION/FALSIFICATION transfer case mirroring CASE-001/003 — does not require calibration
eligibility at all. Rewriting the flavor text to inject an AI attribution just to preserve the `CORRECT`
label would have been exactly the "force a QUESTION into a CLAIM to balance the quality set" anti-pattern
this Run explicitly forbids (Section 4/5). See `docs/DECISIONS.md` and `docs/TRANSFER_TEST_DESIGN.md` for
the full reasoning.

## PLAYER_AI_ACTION

Captured as a structured choice, not inferred from free text (Section D), only asked when
`isCalibrationEligible` is true:

- **ACCEPT** — 採用する
- **VERIFY** — 検証する
- **HOLD** — 保留する
- **REJECT** — 拒否する

## The calibration matrix (`computeCalibrationLabel`, `src/engine/evaluationEngine.ts`) — unchanged, preserved as-is

| AI_QUALITY \ ACTION | ACCEPT | VERIFY | HOLD | REJECT |
|---|---|---|---|---|
| **CORRECT** | appropriate_reliance | appropriate_verification | appropriate_caution | under_reliance |
| **UNCERTAIN** | premature_acceptance | appropriate_verification | appropriate_caution | premature_rejection |
| **INCORRECT** | over_reliance | appropriate_verification | appropriate_caution | appropriate_rejection |

Explicit design commitments, preserved from the previous Run:

- **No single trust score.** `CalibrationLabel` is a categorical outcome, never averaged into one number.
- **"Doubt the AI" is not automatically correct.** `CORRECT × REJECT` is `under_reliance`, not a good
  outcome. `INCORRECT × ACCEPT` is `over_reliance`. Both directions of miscalibration are named.
- **VERIFY is always at least neutral-to-good** (`appropriate_verification`) regardless of AI_QUALITY.

### KNOWN LIMITATION: this matrix cannot detect an always-VERIFY / always-HOLD strategy

This is now formally documented, not just implied. Because VERIFY and HOLD map to a positive label
(`appropriate_verification` / `appropriate_caution`) under **every** AI_QUALITY, a player who mechanically
picks VERIFY (or HOLD) on every single AI-claim case, without ever actually reading or judging the claim,
receives the same positive labels as a player who is genuinely calibrating their trust case-by-case. The
matrix as implemented is a **safety-oriented MVP measure**, not a validated calibration instrument — it
cannot currently distinguish "well-calibrated behavior" from "a cheap, always-safe strategy." No
implementation change is made this Run to penalize or rate-limit VERIFY/HOLD (Section 6 explicitly forbids
adding time costs, point penalties, or usage limits this Run). **Consequence: this MVP must not claim
"AI calibration ability improved" or "the player's relationship with AI got better" from this data alone.**

Two mitigations are recorded as **Calibration V2, `NOW_NOT_IMPLEMENT`**:

1. **AI_QUALITY × PLAYER_ACTION × EPISTEMIC_CONTEXT** — e.g. whether the player has already verified
   several similar claims this session, whether stakes/time-pressure are signaled in the case. Would let
   "VERIFY because genuinely uncertain" be told apart from "VERIFY reflexively."
2. **A two-stage VERIFY structure** — VERIFY → a recorded verification result → a final ACCEPT/HOLD/REJECT
   — so a VERIFY that never actually resolves into a considered final action can be told apart from one
   that does.

Neither is implemented. Both remain future-Run candidates.

## AI trap detection is a separate axis from calibration

Whether the player *correctly identifies the type of flaw* (via the taxonomy selector, see
`docs/AI_TRAP_TAXONOMY.md`) is tracked independently as `RubricResult.trapDetection`, and is only
`applicable` when `caseData.aiTrap.present` (CASE-005 only, among the 7 shipped cases). A player can
reject a bad AI claim (good calibration, `rubricResult.aiCalibration`) without correctly naming *why* it's
wrong (`rubricResult.trapDetection`, a separate field) — the two are never conflated into one score. This
design was already correct in the previous Run and is unchanged.

## AI quality balance: honest current state (Section 2/5)

The validation build's stated goal — "don't let CASE-005 alone teach that AI claims are usually wrong" —
is only **partially** met after the audit:

| AI quality (eligible cases only) | Count | Case(s) |
|---|---|---|
| CORRECT | **0** | — (none currently) |
| UNCERTAIN | 1 | TRANSFER-002 |
| INCORRECT | 1 | CASE-005 |

**KNOWN LIMITATION**: there is currently no genuine CORRECT-quality calibration-eligible case. This was
not "papered over" by adding a case count or forcing TRANSFER-001's content — Section 5 of this Run
explicitly required exactly this kind of honest reporting over a superficial 1-1-1 balance. Authoring a
real CORRECT-quality claim case (with an explicit AI/analytics attribution and a claim that genuinely
holds up under scrutiny) is recorded as a future-Run candidate in `docs/FUTURE_IDEAS.md`.

AI quality and trap presence are never shown to the player during play (enforced by a `data.test.ts`
check on all player-facing case text) — only the RESULT-screen feedback (via `CALIBRATION_COPY` /
`buildReflection`) references the outcome, and only in outcome-neutral phrasing, never as "this was a
trap" or "this AI was rated X."

## No always-on distrust priming (Section 9)

The AI_INTERVENTION screen previously showed "AIは常に正しいとは限りません。参考にしつつ、自分でも検証
してみましょう。" on **every** case, calibration-eligible or not, immediately next to the
ACCEPT/VERIFY/HOLD/REJECT widget on eligible cases. This is a demand-characteristic risk for calibration
measurement: telling a player "don't just trust it" right before asking them to judge an AI claim nudges
them toward VERIFY/REJECT regardless of the claim's actual quality, contaminating H2. This line is removed
from the per-case screen; the underlying safety principle is preserved on HOME
("このアプリはAIを信じ込むためのものではありません...", shown before any specific case is loaded, not
next to a specific decision) — see `docs/SAFETY_PRINCIPLES.md`.

## Character assignment and calibration (Section H) — unchanged

`characterOffered`, `characterChoiceAvailable` are recorded on every trajectory log even though this build
always system-assigns the character (`characterChoiceAvailable: false` for all 7 cases, enforced by a
`data.test.ts` invariant). Forward-compatible data collection for H3 (`docs/VALIDATION_PLAN.md`).

## Experiment group placeholder (Section F) — unchanged

`TrajectoryLog.experimentGroup` is always `"CONTROL_NO_AB_TEST_V0"`. No trap-rate variation is actually
served. Placeholder only.

## What is measurable today vs. not (corrected)

**Measurable now** (2 calibration-eligible cases across the 7-case rotation):
- Distribution of ACCEPT/VERIFY/HOLD/REJECT over recent sessions with a `calibrationEligible` claim,
  regardless of `caseType` (`computeAiActionDistribution`).
- Whether the trap type was correctly identified (CASE-005 only — TRANSFER-002's claim isn't a trap, just
  hedged).
- The calibration label for each session (`rubricResult.aiCalibration`).

**Not measurable yet:**
- **H2 in its strict form** ("does exposure to an INCORRECT claim cause over-rejection of a subsequent
  CORRECT claim") — there is no CORRECT-quality eligible case. See `docs/VALIDATION_PLAN.md` for the
  corrected H2 status.
- A weaker, partial signal is available: does exposure to CASE-005 (INCORRECT) increase REJECT/HOLD on
  TRANSFER-002 (UNCERTAIN) beyond what's calibration-appropriate for a hedged claim.
- Whether calibration generalizes to a third, unrelated surface topic.
- Any A/B effect of trap rate — no variation is served.
- Calibration V2 (epistemic context, two-stage VERIFY) — `NOW_NOT_IMPLEMENT`.
- Whether the game reduces always-VERIFY/always-HOLD "cheap safe" strategies — the matrix cannot detect
  this strategy in the first place (see KNOWN LIMITATION above).
