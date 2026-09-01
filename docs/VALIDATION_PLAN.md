# VALIDATION_PLAN — SPEC AMENDMENT (Section S)

These are the first four validation hypotheses this product line needs to test with real users. None of
them can be answered from this Run's code alone — they require user sessions. This document exists so the
next Run (or a user-testing effort) starts from a specific question, not a vague "see if people like it."

## H1 — Does scoring judgment revision cost engagement?

**Claim to test:** Evaluating "did the player revise their judgment appropriately" (rather than "did they
get the first answer right") does not meaningfully reduce the desire to play another case, compared to a
more traditional first-answer-correctness game.

**Why it matters:** This product's whole framing (Section A) depends on revision being experienced as
progress, not as being told you were wrong twice.

**What to measure:** Post-session continuation rate ("もう1問"), qualitative reaction to the RESULT screen
copy for `under_update` / `misaligned_change` outcomes specifically (do these read as punitive?).

**Status:** Not tested. Requires real users.

## H2 — Does the AI trap increase calibration, or just blanket AI rejection?

**Claim to test:** Encountering a flawed AI claim (CASE-005) increases *appropriate* calibration behavior
on later AI-claim cases (more VERIFY/REJECT specifically when warranted), not an indiscriminate rise in
REJECT regardless of `aiResponseGroundTruth`.

**Why it matters:** Section F explicitly forbids treating "reject the AI" as inherently high-scoring; if
players learn "always distrust AI" instead of "check the AI," the trap has backfired.

**What to measure:** `aiCalibration` label distribution (`docs/AI_CALIBRATION.md`) across repeated
CASE-005 plays and, once available, across a second `AI_CALIBRATION` case with `aiResponseGroundTruth:
"CORRECT"` — the current build only has one AI_CALIBRATION case, so this can't yet be measured for a
correct-AI scenario. **Next-run recommendation:** author a second AI_CALIBRATION case where the AI's claim
is correct, specifically to test whether players who just saw CASE-005 wrongly reject it.

**Status:** Not testable yet with current case set (needs a CORRECT-ground-truth AI_CALIBRATION case).

## H3 — Does free character choice cause weak-viewpoint avoidance?

**Claim to test:** If players could freely choose their AI coach character, would they consistently pick
the one whose questioning style is easiest for them, and so under-practice the ability the other
characters would have pushed on?

**Why it matters:** This is the stated reason (Section H) for keeping character assignment system-only at
launch. `characterOffered` / `characterUsed` / `characterChoiceAvailable` are already logged on every
trajectory (`docs/TRAJECTORY_SCHEMA.md`) so this is measurable the moment free choice ships.

**What to measure:** Once a future Run enables choice at some level, compare ability-signal rates on the
character(s) a player avoids vs. the one(s) they over-select.

**Status:** Not testable in this MVP — `characterChoiceAvailable` is `false` for every shipped case by
design.

## H4 — Does in-game improvement transfer to a different surface topic?

**Claim to test:** A behavior that improves across repeated TRAINING cases (e.g. checking multiple info
options, or correctly flagging a critical error) also shows up on a TRANSFER case with a different surface
topic but the same underlying reasoning structure.

**Why it matters:** Without this, "improvement" could just be the player learning the specific 5 stories,
not the underlying skill (Section L).

**What to measure:** Compare `abilityObservations` / `rubricResult` signals on a TRANSFER case against the
player's recent TRAINING-case average for the same `targetSkill`, kept as a **separate** metric from the
regular Growth stats (already enforced in code — `growthAggregator.ts` excludes `caseType: "TRANSFER"`
from `computeGrowthStats`).

**Status:** Not testable — no TRANSFER case is implemented yet this Run (see `docs/TRANSFER_TEST_DESIGN.md`
and `docs/MVP_SCOPE.md`). This is the top scope item for the next Run once CASE-001 has real play data.

## Stop rule (Section X)

If, during user testing, any of the following holds, treat it as `CORE_HYPOTHESIS_REVIEW`, not a cue to add
more features:

- After 5 cases, "want to play one more" is weak.
- AI-trap exposure increases blanket AI rejection (H2 failing in the bad direction).
- Growth-screen numbers can't be explained by pointing at a specific rubric field.
- A TRANSFER case shows no visible improvement carry-over.
- The game doesn't hold together without free-text-based scoring (a sign the structured-action design
  isn't actually capturing what matters).
- Nothing about this is fun without a much more elaborate AI implementation.
