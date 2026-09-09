# Counterfactual Question Tests V1 — PHASE 11.13A

## Real adversarial tests (directive Section 12, implemented and run)

`tests/questionPrerequisiteBoundary.test.ts`, 6/6 passing.

| Case | Setup | Expected | Result |
|---|---|---|---|
| A | No observation (base state, before ACCEPT) | not eligible | `prerequisiteSatisfied: false, eligible: false` — PASS |
| B | Observation present (after ACCEPT), target unknown | eligible | `prerequisiteSatisfied: true, targetFactKnown: false, eligible: true` — PASS |
| C | Observation present, target KNOWN (after asking) | not justified as new discovery | `targetFactKnown: true`, `reason` matches `/not a new discovery/` — PASS |
| D | Target known only after the legitimate answer event | flips false→true exactly at the answer dispatch | verified both states directly — PASS |
| E | A bare/malformed material (empty `concreteContent`) without genuine reveal content | prerequisite alone (material presence) is not conflated with target-known; function reads actual content, not a flag | `prerequisiteSatisfied: true, targetFactKnown: false` (still correctly NOT claiming the target is known from an empty/malformed reveal) — PASS |
| F | Synthetic fact-tag mislabel — reveal content already contains "祭りの残り" | invariant FAILS (ineligible), not silently passes | `targetFactKnown: true, eligible: false`, reason matches `/QUESTION_TARGET_ALREADY_KNOWN/` — PASS |

## Counterfactual re-derivation (directive Section 8), all 4 states proven

| State | Enough evidence to ask? | Knows the answer? |
|---|---|---|
| WITHOUT ACCEPT / box reveal | **NO** (`prerequisiteSatisfied: false`) | NO |
| AFTER ACCEPT/reveal, BEFORE Yohei answers | **YES** (`prerequisiteSatisfied: true`) | **NO** (`targetFactKnown: false`) |
| AFTER Yohei confirms | YES | **YES** (`targetFactKnown: true`) |

Matches the directive's expected shape exactly; proven by `tests/questionPrerequisiteBoundary.test.ts`
cases A/B/D and by the real-browser regression (`semantic_boundary_regression_evidence.json`).

## Paper-tested generalization cases (directive Section 10 — NOT implemented, falsification only)

**CASE A — Physical clue.** "PLAYER notices something recognizable → 「これ、○○なの？」" The
invariant generalizes: `prerequisiteSatisfied` = the clue is observed (State Admission or
equivalent visible-fact source); `targetFactKnown` = whether an NPC (or other legitimate source)
has confirmed the identity yet. The same two-source model (evidence via world-state, target via
Actor-Experience-tracked confirmation) applies without modification to the general shape.

**CASE B — NPC memory.** "NPC reacts as if they know PLAYER → 「前に会ったことある？」" Evidence =
the NPC's observed reaction (narrated, player-visible); target = whether a prior meeting is
confirmed. Same shape: reaction-observed is not confirmation-received.

**CASE C — World change.** "PLAYER sees a shop unexpectedly closed → 「何かあったの？」" Evidence =
the closure itself (visible world state); target = the cause, unknown until told. Same shape.

**CASE D — Target already known.** If the player has already been explicitly told the answer
(through any legitimate channel), the SAME question, if offered again, must not be presented as a
newly unlocked discovery — exactly what `evaluateLeftoverQuestionPrerequisite`'s `targetFactKnown`
branch already does for the leftover question (case C/D above, implemented).

**Conclusion:** the two-source model (State-Admission-style evidence for PREREQUISITE, Actor-
Experience-style confirmation-tracking for TARGET) generalizes cleanly on paper to all four cases
without requiring a new engine, confirming directive Section 5's reuse-first instruction was the
right call, not merely convenient for this one scene.
