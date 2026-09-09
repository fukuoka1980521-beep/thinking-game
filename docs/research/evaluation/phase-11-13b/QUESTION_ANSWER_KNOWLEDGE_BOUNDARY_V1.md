# Question/Answer/Knowledge Boundary V1 — PHASE 11.13B

## Exact prior defect

PHASE 11.13A's `evaluateLeftoverQuestionPrerequisite` computed `targetFactKnown` by checking
`experienceLog` for `ASK_ABOUT_LEFTOVER_STOCK`'s own `actorExperienceWrite` string
("運んだ箱が祭りの残りかどうか、洋平に尋ねた"). Traced precisely (not inferred from the name): this
entry is written by `engine.ts`'s `resolveAction`, unconditionally, the moment the action
dispatches — **before** the language adapter is ever called, and regardless of what it
subsequently returns. It proves only that the player asked. Using it to decide `targetFactKnown`
silently assumed `QUESTION_ASKED == TARGET_FACT_KNOWN`, which happened to be true in this one
scene only because its single captured reply always confirms — not because the code verified it.

## Four states, frozen (directive Section 2)

- **A. QUESTION_PREREQUISITE_MET** — player has evidence/context to ask (State Admission:
  `leftover_stock_moved` exists, does not itself leak the target).
- **B. QUESTION_ASKED** — player actually dispatched the question (Actor Experience: the
  ask-only `experienceLog` entry — correctly scoped now, no longer overloaded).
- **C. ANSWER_RECEIVED** — a legitimate authoritative NPC/world response record exists (State
  Admission: the new `leftover_question_answered` material).
- **D. TARGET_FACT_KNOWN** — the received answer's own content actually establishes the
  proposition (checked against the SAME material's `concreteContent`, reusing the existing
  substring fact-tag reader).

## Reuse decision (directive Section 6)

No AnswerEngine. The fix reuses the exact mechanism `PLAYER_ACCEPTS_HELP_MOVE_STOCK`'s physical
reveal already established: an `ActionContractV2`'s `stateDelta`, admitted through the unmodified
State Admission pipeline, as the authoritative record of what actually happened. `ASK_ABOUT_
LEFTOVER_STOCK` (`playableSceneContracts.ts`) now has a real `stateDelta` (previously `() => []`)
that creates `leftover_question_answered` — deterministic, authored directly by the contract,
never derived from `languageAdapter`'s return value. `questionAsked` still reads `experienceLog`
(Actor Experience), now correctly scoped to mean ONLY "asked." No new field was added beyond what
this single new function (`evaluateLeftoverQuestionPrerequisite`, already added in PHASE 11.13A,
now with two more fields) needed.

## LLM string vs authoritative state (directive Section 5)

The language adapter's return value (the string shown to the player) is never read by
`evaluateLeftoverQuestionPrerequisite` — its signature accepts only `ContractV2State`, and
`askQuestion`/dispatch order in `NewlifePlayable11App.tsx` calls `resolveAction` (which produces
the authoritative state, including the new material) strictly BEFORE calling the language adapter
for display text. There is no code path by which the displayed string could influence
`targetFactKnown`.

## What did NOT change

`applyCausalityGate`, `buildAskCandidates`, and every player-facing render branch in
`NewlifePlayable11App.tsx` are untouched — the corrected model feeds only dev/debug evidence
(directive Section 15: no visible status indicators added). Real-browser regression confirms
identical rendering before and after this phase's edits.

## Other contextual questions

See `CONTEXTUAL_ANSWER_AUTHORITY_AUDIT_V1.md` — `ASK_FESTIVAL`/`ASK_SALES` do not infer any state
from "player asked"; their eligibility gates model conversational sequencing only, never a
hidden-target claim. No change needed there.
