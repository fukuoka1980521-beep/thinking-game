# TRANSFER_TEST_DESIGN — SPEC AMENDMENT (Section L) → IMPLEMENTED (validation build Section 1/10)

## Status: implemented and playable

Originally designed but deferred (Section T of the rubric amendment explicitly allowed this). The
PLAYABLE_VALIDATION_BUILD Run implemented both as real `CaseData` (`src/data/cases/transfer-001.ts`,
`src/data/cases/transfer-002.ts`), mixed naturally into `CASES` (`src/data/cases/index.ts`) — **not**
flagged to the player as a "transfer test" (Section 10). Only `caseType: "TRANSFER"` and `level: 0` mark
them internally.

`src/engine/growthAggregator.ts` excludes `caseType: "TRANSFER"` logs from the regular Growth stats
(`excludeTransfer`), so these two cases don't pollute the 4-ability percentages; they do still count
toward the AI-action distribution when they carry an evaluable claim (see `docs/AI_CALIBRATION.md`).

## Why transfer, not just repeated training

Section L's concern: improving at 5 fixed stories could just mean "learned these 5 stories," not "learned
observation / hypothesis generation / falsification / updating as transferable skills." A TRANSFER case
tests the same underlying rubric structure on a **different surface topic**, so genuine skill transfer can
be told apart from memorizing the training set (H4, `docs/VALIDATION_PLAN.md`).

## TRANSFER-001 — implemented (`src/data/cases/transfer-001.ts`)

- **Target skill / mirrors:** OBSERVATION, FALSIFICATION — mirrors CASE-001 and CASE-003.
- **Surface topic:** A news app's push notification claims "利用者の8割がこの新機能を高く評価しています"
  for a new feature.
- **Underlying structure:** A number is presented as a settled fact; whether it was measured fairly
  (sample size, wording, random selection) is not stated up front.
- **Also serves:** this build's CORRECT-ground-truth AI_CALIBRATION content (Section 2) — the survey
  turns out to have been done well, testing whether players over-verify or reflexively reject a claim that
  actually holds up.
- **Design note:** `criticalErrorChoiceId` and `evidenceSupportsChoiceId` are both `"a"` ("その数字は信頼
  できると思う") — deliberately the *same* choice. Picking it at FIRST_DECISION (before checking the
  methodology) is the critical error; picking it at SECOND_DECISION (after the methodology is confirmed
  solid) is the evidence-supported answer. This lets `criticalErrorMade: true` and
  `updateAppropriateness: "appropriate_keep"` (if the player picked it both times) coexist without being a
  logic bug — they describe two different moments ("right for the wrong reason at first" vs. "correctly
  reads the confirming evidence"), which is exactly the kind of signal calibration measurement should be
  able to distinguish. See `docs/RUBRIC_DESIGN.md`.

## TRANSFER-002 — implemented (`src/data/cases/transfer-002.ts`)

- **Target skill / mirrors:** HYPOTHESIS, UPDATING — mirrors CASE-002 and CASE-004.
- **Surface topic:** A review-analysis tool flags "配送中の破損が原因である可能性が高い（確度：中程度）"
  after a sudden wave of low-rated reviews.
- **Underlying structure:** The tool itself hedges ("確度：中程度") rather than asserting certainty —
  unlike CASE-005's overconfident claim. Multiple causes are plausible before evidence narrows it down.
- **Also serves:** this build's UNCERTAIN-ground-truth AI_CALIBRATION content (Section 2) — tests whether
  players can tell an appropriately-hedged claim apart from an overconfident one, and whether they treat
  "確度：中程度" as license to accept it outright (the critical error) or as a cue to verify.
- **Design note:** same same-choice pattern as TRANSFER-001 (`criticalErrorChoiceId` = `evidenceSupportsChoiceId`
  = `"a"`), for the same reason.

## What's still not tested

- H4 itself (does in-game improvement actually transfer) requires comparing a player's TRAINING-case
  performance against their TRANSFER-case performance across multiple sessions — that comparison isn't
  computed or surfaced anywhere yet; the data (`TrajectoryLog.caseType`, `.transferTarget`) is there for a
  future Run or manual analysis (`docs/USER_TEST_GUIDE.md`) to do it.
- Only one TRANSFER case exists per mirrored skill pair, so this can't yet distinguish "transfers to this
  specific new topic" from "transfers to any new topic."
