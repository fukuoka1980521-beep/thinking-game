# NEW LIFE V26 — IMPLEMENTATION STAGE 2: RELATIONSHIP REDUCER + TIME ECONOMY

Date: 2026-09-24
Status: IMPLEMENTATION (V11 order, stage 2 of 8) / DESIGN-FIRST, NOT WIRED IN

## 0. What this covers

Continues directly from V25 (`READY_FOR_IMPLEMENTATION=YES`, stage 1 of 8 — semantic/state
types — committed at `078d18f`). This round implements stage 2, "deterministic theater
world/task/time reducer," to the extent it is actually derivable from the validated V13→V24
chain plus the one concretely-specified world/time document (the V3 blind review packet).

No product code, UI, runtime, Cloud Function, or legacy public NEW LIFE path is touched.
`chatgpt/newlife-phase34-human-playtest-repair` remains unmerged and untouched. Regex was not
used or proposed as the semantic engine anywhere in this round.

## 1. What was implemented

### 1.1 `src/newlife/refoundation/relationshipReducer.ts` + `.test.ts`

The per-NPC relationship-state reducer — the one part of the refoundation spec that has been
blind-validated across nine independent classifier rounds (V4-V9) and a design audit that
reached `PASS_FOR_IMPLEMENTATION` with zero blockers (V25). Two pure functions, matching V14/V22's
own two explicitly-separate pipelines:

- `applyRelationalTurn(record, {turnRef, events, boundaryMode})` — V14 §2-§7's per-turn
  transition: validates precedence (SEVERE_RUPTURE > STRAIN > REPAIR > RELIABILITY, with REPAIR's
  null immediate effect correctly excluded from the *transition* contest but still driving its own
  independent `repairWindow`-opening side effect per V16 §6.5's general "cascade to the next
  non-null class" rule), the V14 §2 SEVERE_RUPTURE combo (`PUBLIC_SHAMING`+`PERSONAL_INSULT` → one
  SEVERE_RUPTURE move, not two stacked STRAINs), and the two context-dependent event promotions
  V14 §3 leaves outside the static per-event class table (`THREAT` promotes to SEVERE_RUPTURE only
  when paired with `boundaryMode=CROSS_WITHOUT_PERMISSION` in the same turn — confirmed against V9
  matrix's own Z19 regression case; `BREAKS_PROMISE` promotes on its third confirmed occurrence
  while an earlier one remains unresolved, and the reducer itself now owns incrementing
  `promiseBreakCount` — this was missing from the stage-1 types-only pass, since a plain type
  definition has nowhere to put behavior, and is fixed here).
- `completeCorrectiveAction(record, {turnRef, branch, relationalEvidenceEntryId?})` — the V16
  §6.2/§6.3 + V22 §1.2 + V24 §1-§3 six-step completion pipeline: consumes `repairWindow`
  unconditionally, tests V24 §1's single "ever had a SEVERE_RUPTURE-class event this case"
  eligibility rule, emits the GUARDED→NEUTRAL/NEUTRAL→OPEN transition only if eligible, and marks
  the targeted entry resolved with V22 §2's typed `resolvingReference` (`RELATIONAL_EVENT` layer
  for the BREAKS_PROMISE/FALSE_ATTRIBUTION branches, `CORRECTIVE_ACTION_COMPLETION` layer — logged
  to the new `correctiveActionLog` — for the other two), independent of whether a transition
  actually occurred.

One correction beyond a literal transcription of the docs: `lastStrainEventId` is computed by
scanning `causalEventHistory` fresh each time a window opens (most recent entry with
`eventClass="STRAIN"` and `resolved=false`), rather than carried forward as an incrementally-updated
pointer. A running pointer would go stale the moment its target gets resolved by a completed
corrective action while a *newer* STRAIN has since been logged, and would violate `types.ts`'s own
documented invariant that the field is `null` exactly when `repairWindow.status === "CLOSED"`. Both
functions now maintain that invariant exactly (`completeCorrectiveAction` nulls it out when it
closes the window; V16 §6.3's "if multiple STRAINs are unresolved, only the most recent is
targeted, clearing an older one requires its own cycle" is satisfied for free, since the next
REPAIR's fresh scan will correctly find that older still-unresolved STRAIN once the newer one is
resolved).

35 tests, each citing the exact spec passage it pins down, covering: the four transition tables
(including WITHDRAWN terminality), the SEVERE_RUPTURE combo and its STRAIN-only counter-example,
REPAIR alone / suppressed-by-STRAIN / combined-with-RELIABILITY (V14 §4's worked apology+insult
example and V16 §6.5's worked REPAIR+RELIABILITY example), THREAT/BREAKS_PROMISE promotion and
non-promotion, and — most load-bearing — the exact V23/V24 disputed scenario (one earlier
SEVERE_RUPTURE, later STRAIN, currently GUARDED, never WITHDRAWN) proving the completion pipeline
consumes the window and marks the entry resolved *without* transitioning, plus the symmetric
currently-WITHDRAWN case reaching the same outcome via the same uniform test.

### 1.2 `src/newlife/refoundation/timeEconomy.ts` + `.test.ts`

A pure `WorldClock` (`totalMinutes`/`elapsedMinutes`, clamped, non-mutating) plus the `TIME_COSTS`
table transcribed verbatim from the V3 blind review packet's "Time costs" section — the most
concrete, `PASS_FOR_PROTOTYPE`-reviewed statement of this mechanic in the whole document set (see
the Round 3 — Game Systems blind review's Q6: "concrete, itemized per-move costs... directly
codeable as a decrement table"). `CLARIFY` is priced at 0 minutes per V14 §7's explicit rule. 13
tests covering the table values, the `MOVE_CONVERSATION_PRIVATE` "+2 min" additive rule, clamping,
purity, and input validation.

**Deliberate scope limit:** this module costs a named *category* (`QUICK_FACTUAL_OR_BOUNDARY_QUESTION`,
`OPEN_EXPLORATORY_QUESTION`, etc.), not an `ActionType` from `types.ts` directly. The two do not
line up 1:1 — an `ASK_FACT` turn can be either a "quick factual... question" (2 min) or an "open
exploratory question" (4 min) depending on what is actually asked, which is case content no
document specifies a mapping for. Inventing that mapping here would be exactly the kind of
unauthorized product judgment call this series has spent nine rounds refusing to make without
a citation; it is left to the game-loop integration (stage 4+), which has the actual case content
in scope.

## 2. What was deliberately NOT implemented, and why

Stage 3 ("ending/failure/recovery") was scoped next but not started this round, because three of
its five fields are not derivable from any canonical document without inventing a product rule:

- `SHOW: PROCEEDS / BREAKDOWN` — no document states a numeric or structural trigger. V1's packet
  lists `BREAKDOWN` only as "the player's handling worsens the situation enough that the planned
  performance cannot proceed," which is a description, not a computable condition. Every blind
  review across all three rounds flagged this exact gap ("no worked example shows SHOW failing to
  proceed," V17/V19/V21/V23/V25's own audits) without it ever being closed by a successor patch —
  unlike the relationship-state contradictions, which received nine dedicated patch rounds, this
  gap was never scoped for one.
- `PERSONAL_TRACK: OPENED / NOT_OPENED` — belongs to the game-design review-packet lineage
  (V1-V3), not the formal, blind-validated classifier spec (V13-V24). The V9 matrix's `ActionType`
  enum has no value corresponding to "open the personal track" (the closest concept,
  `今の問題と、本人の悩みは同じ？`, is a thought-tool effect described narratively in V3 §"Thought
  tools," never folded into the ACTION taxonomy that reached `PASS_FOR_IMPLEMENTATION`). The two
  document lineages were never reconciled into one mechanism.
- `BOUNDARY: UNKNOWN/STATED/RESPECTED/OVERRIDDEN` as a *player-facing ending field* (distinct from
  the per-turn `BoundaryMode` already in `types.ts`) requires tracking whether the NPC herself has
  stated a boundary, which is NPC-side dialogue state no `TurnClassification` (a player-turn-only
  classification) carries.

`TRUST` (derivable by a documented, reversible mapping from `relationshipState`) and `TIME_LEFT`
(already available from `timeEconomy.ts`'s `remainingMinutes`) *are* cleanly derivable, but
shipping a two-fifths-complete `EndingVector` type this round, with the other three fields either
fabricated or stubbed, would misrepresent how much of stage 3 is actually settled — worse than
reporting the gap plainly and stopping here. This is exactly the shape of "Owner decision not
derivable from existing docs" the governing instruction names as a stop condition, scoped narrowly
to the three fields above — it does not block stage 2, which is now complete and committed.

## 3. Verification

`npm run typecheck` / `npm test` could not be executed in this environment — `node_modules/` is
not installed, and both `npm install` and direct `node`/`npx` invocations required interactive
tool-approval unavailable in this session (same limitation V25 disclosed for stage 1). All four new
files were hand-traced test-by-test against the implementation logic (each `it` block's expected
value was independently re-derived from the spec and cross-checked against a manual step-through
of the reducer, not merely asserted) and written to match this repository's existing TypeScript
conventions (strict mode, `noUnusedLocals`/`noUnusedParameters`, `type`-only imports where
applicable). CI's own typecheck/test steps on this PR are the first actual compiler/test-runner
verification; if either surfaces a mistake, that is a normal fix-and-retest cycle, not a design
blocker.

## 4. Next stage

Stage 3, narrowed to what's actually derivable: `TRUST`/`TIME_LEFT` ending fields plus a
documented, explicit `SHOW`/`PERSONAL_TRACK`/ending-`BOUNDARY` open-question marker, OR — likely
better sequencing — proceed to stage 4 (semantic interpreter contract: the `SemanticInterpreter`
adapter-boundary interface, following this repo's own established `src/newlife/semantic/contract.ts`
pattern) first, since stages 4-6 (interpreter, NPC generation, thought tools) do not depend on
stage 3's open questions, and closing those three fields properly likely wants an Owner-legible
worked example (a full case playthrough) rather than being derived from fragments across three
review-packet versions.

READY_FOR_IMPLEMENTATION = YES (stages 1-2 complete; stage 3 partially blocked on undocumented
product rules, as scoped above; stages 4-8 pending)
