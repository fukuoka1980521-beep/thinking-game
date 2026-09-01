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

**Status:** Now measurable via `NEXT_CASE_CLICK` / `CASE_COMPLETE` metric events (validation build Section
9; see `docs/USER_TEST_GUIDE.md` for the exact query) and User Test Q1/Q2/Q5. Still requires real users —
no session has been run outside of this build's own automated tests.

**Rule-understanding confound (addressed by THINKING_GAME_FIRST_PLAY_COMPREHENSION_AND_RESULT_FEEDBACK
Run, not yet validated):** Two real playtesters reported (a) not knowing what the first question was asking
them to judge, and (b) the RESULT screen reading like a graded scorecard rather than a game outcome. Either
could suppress `NEXT_CASE_CLICK` for reasons that have nothing to do with whether the underlying judgment
loop is engaging, confounding any reading of H1's current numbers. This Run added a rule-only ONBOARDING
screen (no thinking-strategy content) and rebuilt RESULT around a decision-trajectory display instead of a
rubric list, specifically to remove this confound before H1 is read again. **This change has not been
validated as an improvement** — see the IMPORTANT note in `docs/DECISIONS.md`. The next real step is
observing new, first-time players, not shipping further features.

## H5 — Does concretely referencing the player's own choice/selections/words increase perceived AI engagement? (added by THINKING_GAME_PERSONALIZED_DIALOGUE_AND_VISUAL_EXPERIENCE Run)

**Claim to test (as stated by the Owner):** If the AI concretely picks up on what the player actually wrote
and responds with a specific counterpoint/question, players feel like they are "thinking together with the
AI" rather than taking a fixed quiz.

**What shipped this Run:** CASE-001's AI_INTERVENTION message is now composed from the player's real
`FirstDecisionInput` — their choice (referenced by label), their selected info options (referenced by
label), and their written reason (quoted back verbatim) — plus one of 20 pre-authored, choice×character
challenge fragments. This is real, tested, deterministic personalization with zero external network calls
(see `docs/DECISIONS.md`).

**What this Run's own manual test disproved:** A side-by-side comparison (Section 18 of that Run; see
`docs/TEST_PLAN.md`) with three semantically different reason texts on the *same* choice showed the quoted
preamble differs correctly, but the substantive challenge/question is identical across all three, because it
is keyed to the choice, not to the content of what was written. **This means H5, as literally stated by the
Owner ("the AI picks up on what I actually wrote"), is not genuinely exercised by what shipped** — only a
narrower claim ("the AI references what I clicked, and echoes my own words back") is.

**Status:** `PARTIALLY_TESTABLE`. The narrow claim (structured-signal personalization feels less generic
than a flat static message) can be observed with real users now. The literal, Owner-stated claim (semantic
reading of free text) is `BLOCKED_BY_SAFE_SERVER_ARCHITECTURE` — it requires a server-side LLM call, which
requires provisioning new secret-handling infrastructure and sending player-written text off-device, both
of which are product/privacy decisions for the Owner to make explicitly, not something this Run built
unilaterally. **Do not read a positive H5 signal from user testing as validating the literal Owner
hypothesis** — re-run the Section 18 comparison test on any future dialogue change to check whether that
gap has actually closed.

## H2 — Does the AI trap increase calibration, or just blanket AI rejection?

**Claim to test:** Encountering a flawed AI claim (CASE-005) increases *appropriate* calibration behavior
on later AI-claim cases (more VERIFY/REJECT specifically when warranted), not an indiscriminate rise in
REJECT regardless of `aiResponseGroundTruth`.

**Why it matters:** Section F explicitly forbids treating "reject the AI" as inherently high-scoring; if
players learn "always distrust AI" instead of "check the AI," the trap has backfired.

**What to measure:** `aiCalibration` label distribution (`docs/AI_CALIBRATION.md`) across the
calibration-eligible cases — specifically whether a player who just rejected CASE-005's claim (INCORRECT)
also rejects a subsequent *correct* claim (that would be `under_reliance`, the bad-direction failure this
hypothesis is watching for).

**Status corrected by the SEMANTICS FIX Run:** the previous Run claimed this was "now testable with the
current 3-quality case set." That was wrong — TRANSFER-001, audited against its actual content, turned out
to be a Socratic question, not a CORRECT-quality claim (`docs/AI_CALIBRATION.md`). There is currently **no
CORRECT-quality calibration-eligible case**, so **H2 in its strict form is `NOT_MEASURABLE_YET`**. TRANSFER-001
was deliberately *not* rewritten into a claim just to make H2 measurable (Section 15 of that Run explicitly
forbade this).

A weaker, partial version is measurable now: whether exposure to CASE-005 (INCORRECT) pushes REJECT/HOLD on
TRANSFER-002 (UNCERTAIN) beyond what's calibration-appropriate for a hedged claim (UNCERTAIN × REJECT is
itself only `premature_rejection`, not automatically bad the way `under_reliance` on a truly correct claim
would be — so this partial version is a weaker test of the same underlying concern). The strict version
needs a genuine, well-attributed CORRECT-quality case authored fresh (`docs/FUTURE_IDEAS.md`), still
requires real user sessions with enough repeat play to see order effects, and this build's own tests only
verify the mechanism (`tests/evaluationEngine.test.ts`, `tests/data.test.ts`), not the human behavioral
question.

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

**Status:** TRANSFER-001/002 are now implemented and playable (`docs/TRANSFER_TEST_DESIGN.md`). The
comparison itself (recent TRAINING-case average vs. TRANSFER-case result for the same `targetSkill`) is
not yet computed or surfaced anywhere — the underlying data exists in `TrajectoryLog` for a next Run or a
manual analysis pass (`docs/USER_TEST_GUIDE.md`) to do it. This remains the top scope item for the next
Run once real users have generated enough play data across all 7 cases.

## Confounds and open limitations (SEMANTICS FIX Run, Sections 6/17)

- **Fixed case order.** `CASES` (`src/data/cases/index.ts`) is a fixed sequence; "今日の1問" and
  NEXT_CASE both walk it in the same order for every player. Case content and drop-off position are
  therefore confounded — if engagement drops after case N, that could be about case N's content, or
  simply about being the Nth case played. No randomization or A/B framework is implemented this Run
  (explicitly out of scope, Section 17/18).
- **The calibration matrix cannot detect an always-VERIFY/always-HOLD strategy** — see the KNOWN
  LIMITATION in `docs/AI_CALIBRATION.md`. Any calibration-related finding from this build should be read
  with this in mind: a flat, non-discriminating strategy currently scores identically to genuine
  calibration.
- **No ability-improvement claim is licensed by this build.** Between the order confound above, the
  VERIFY/HOLD limitation, and the small number of calibration-eligible cases (2), this product cannot
  currently support a claim like "AI calibration improved" or "thinking ability improved" from its own
  data — only "here is what was observed in this specific run of specific cases in this specific order."

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
