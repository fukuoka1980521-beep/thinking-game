# NEW LIFE V27 — ENDING VECTOR CONTRACT V1

Date: 2026-09-24
Status: DESIGN CONTRACT / SELF-AUDITED THIS ROUND / NO PRODUCT CODE ABOVE THIS PATCH SET

## 0. Why V27

V26 (stage 2 report) stopped stage 3 ("ending/failure/recovery") because three of the five
`EndingVector` fields (`SHOW`, `PERSONAL_TRACK`, ending-facing `BOUNDARY`) had no deterministic
trigger in any document through V26. `TRUST` (a documented, reversible mapping from
`relationshipState`) and `TIME_LEFT` (already available from `timeEconomy.ts`) were already
derivable and are not re-litigated here.

This patch defines the smallest coherent rule for the three open fields, derived from documents
already accepted into this PR (V4 consequence/purpose architecture, V13 BoundaryMode definitions,
V21's already-settled PROPOSE_REWRITE-vs-COMMIT_PLAN precedent), without reopening the
blind-validated four-layer contract (`ActionType`/`BoundaryMode`/`RelationalEvent`/
`TurnClassification` — V13 as patched through V24, `READY_FOR_IMPLEMENTATION=YES` since V25).

No product rule invented here changes ACTION, BOUNDARY_MODE, or RELATIONAL_EVENT semantics, and
none of those three closed sets gains or loses a member.

---

## 1. EndingVector

```
EndingVector = {
  show: "PROCEEDS" | "BREAKDOWN",
  boundary: "UNKNOWN" | "STATED" | "RESPECTED" | "OVERRIDDEN",
  trust: RelationshipState,     // identity mapping — the trigger's own "documented, reversible
                                 // mapping from relationship state" is the plainest possible one
  timeLeft: number,             // minutes, from timeEconomy.remainingMinutes
  personalTrack: "OPENED" | "NOT_OPENED",
}
```

Non-ranked (V17/V19/V21's own repeated finding, restated as a hard rule here): no field is
weighted, summed, or combined into a single score. No ending is "better" than another by
construction. No field's value ever depends on another field's value (structural independence,
verified in §4).

---

## 2. SHOW: PROCEEDS / BREAKDOWN

### 2.1 Task ledger, not a score

A case tracks one piece of persistent world state for this axis: whether an "operative plan" for
the case's central practical problem has been committed, and by which action.

```
TaskCommitment = { action: ActionType, boundaryMode: BoundaryMode, turnRef: string }
TaskLedger = { commitment: TaskCommitment | null }
```

### 2.2 Which ACTION values count as a commitment

Only actions that produce a concrete, executable resolution to the central task count:

`COMMIT_PLAN`, `CUT_SCENE`, `USE_UNDERSTUDY`, `CHANGE_STAGING`, `ACCEPT_SHORTER_SCENE`,
`FORCE_UNCONFIRMED_PLAN`.

`PROPOSE_REWRITE` and `ASSIGN_REWRITE` are explicitly excluded: V21's review comment already
settled that "an unconfirmed/hedged rewrite proposal remains `PROPOSE_REWRITE` until
commitment/assignment is explicit" — i.e. these are proposal/setup actions, not commitments, by a
rule this PR already adopted. `REASSIGN_WORK` is the same category (reassigns who does the
proposal work, not itself a resolution). All other ACTION values (`ASK_*`, `MOVE_PRIVATE`,
`DELAY_DECISION`, `REQUEST_RECONSIDERATION`, `APOLOGIZE_AND_REPAIR`, `SUMMARIZE`, `OBSERVE`,
`CLARIFY`, `OTHER`) are informational/social/recovery actions with no direct resolution content.

A later commitment **replaces** an earlier one (last-write-wins). This is the "final operative
plan" the trigger asks for, and it is what makes mid-case recovery (§5) possible: a player who
committed via `FORCE_UNCONFIRMED_PLAN` and then, after `APOLOGIZE_AND_REPAIR`, re-commits via a
boundary-respecting `COMMIT_PLAN`, has their final commitment govern the ending, not the first one.

### 2.3 Viability: task completion + viable fallback + deadline state

At case end:

```
viable(ledger, requiredRelationshipStates) =
  ledger.commitment !== null
  AND NOT (
    ledger.commitment.action IN { COMMIT_PLAN, FORCE_UNCONFIRMED_PLAN }
    AND ANY state IN requiredRelationshipStates : state == WITHDRAWN
  )

SHOW = viable(...) ? PROCEEDS : BREAKDOWN
```

`requiredRelationshipStates` is the relationship state of every NPC this specific commitment's
cooperation depends on — supplied by the caller, not hardcoded here. `NpcRelationshipRecord` is
already explicitly per-NPC (V16 §6.6's own doc comment), and the vertical-slice case has two named
NPCs (Mika, Ryo per `VERTICAL_SLICE_CASE_001_V1.md`), so a single-`RelationshipState` parameter
would silently assume only one NPC's cooperation ever matters — wrong in general, and a real gap
this contract's first draft had before this round's self-audit caught it (see V28 §1, B1). This
module stays generic (works for one NPC or several) precisely by not knowing which named characters
exist; the game-loop caller, which does know a given commitment's real-world dependencies, passes
the relevant subset.

- **Task completion** = `ledger.commitment !== null` (an operative plan exists).
- **Viable fallback** = the action-dependence split. `COMMIT_PLAN`/`FORCE_UNCONFIRMED_PLAN`
  resolve the task *through* an NPC (a rewrite/plan that needs her to still be performing) and are
  voided if any NPC whose cooperation it depends on has reached `WITHDRAWN` — the one
  `RelationshipState` value V14 §1 defines as "stops cooperating," matching V4 §10's Branch-E "no
  understudy exists... director refuses" and §5's `BREAKDOWN` example (every commitment attempt
  failed or never happened). `CUT_SCENE`, `USE_UNDERSTUDY`, `CHANGE_STAGING`, `ACCEPT_SHORTER_SCENE`
  are operational workarounds that do not require any particular NPC's continued participation and
  remain valid regardless of relationship state — this is the actual mechanical meaning of "viable
  fallback." (`requiredRelationshipStates` may be empty for these; the `ANY` test is vacuously
  false over an empty set, so they are never voided.)
- **Deadline state**: `SHOW` is only meaningful once the case has actually ended (deadline reached
  via `!hasTimeRemaining(clock, 0)`, i.e. `remainingMinutes(clock) <= 0`, or the case is otherwise
  explicitly finalized by the game loop). Calling the derivation early, mid-case, is a caller error,
  not a new state this contract defines — this module does not gate on the clock internally beyond
  documenting the precondition, matching how `timeEconomy.ts` itself never auto-fires anything.
  With no commitment at all, reaching the deadline is definitionally `BREAKDOWN` (V4 §5's STALEMATE
  example — "rehearsal time runs out; no final script" — is a `BREAKDOWN` value under this
  two-value field; distinguishing STALEMATE from an actively-caused breakdown is a V4 §5
  four-family classification this patch does not implement — see §6).

### 2.4 Ambiguity default

If `ledger.commitment.boundaryMode` is `UNKNOWN` at commit time, that does not by itself change
`SHOW` — only `boundary` (§3) reads `boundaryMode`, and only to test for
`CROSS_WITHOUT_PERMISSION` specifically (an explicit value), so `UNKNOWN` never causes a false
`OVERRIDDEN` read. This mirrors V13 §3's conservative-ambiguity-default principle (no state moves
on an ambiguous read) without needing to restate a CLARIFY-style rule here, since `SHOW` never
reads `boundaryMode` directly at all.

---

## 3. Ending BOUNDARY: UNKNOWN / STATED / RESPECTED / OVERRIDDEN

Distinct from the per-turn `BoundaryMode` already in `types.ts` (a single turn's classification).
This is a case-level, persistent projection derived by folding the boundary-relevant subset of the
turn history, plus the same `TaskLedger.commitment` from §2.

### 3.1 Establishment

```
BOUNDARY_ESTABLISHING_MODES = { DISCOVER, AVOID, SEEK_PERMISSION, RECONSIDER, CROSS_WITHOUT_PERMISSION }
```

A case's boundary becomes "established" (a concrete boundary exists and is known in the fiction)
the first time any turn's `boundaryMode` is one of the five values above; the turn that did so is
recorded (`establishedAtTurn`) for the same append-only auditability every other ledger in this PR
already keeps (`causalEventHistory`, `correctiveActionLog`). `NOT_RELEVANT` (the
action does not depend on the boundary, V13 §1B) and `UNKNOWN` (cannot be reliably determined, V13
§1B) never establish it — this is the same conservative-ambiguity principle as §2.4: an
undetermined read must not be treated as a fact.

Each of the five establishing modes already presupposes (V13 §1B's own definitions: "stays outside
the *known* boundary," "the plan is boundary-safe *so far*," "the *same previously stated*
refusal," "crosses a *known* refusal") that the boundary exists as a fact in the fiction at the
moment that mode is validly emitted — this contract does not invent a new fact-tracking channel; it
reads the one V13 already requires the classifier to have confirmed before emitting these values.

### 3.2 Disposition

```
boundary =
  NOT established                                            -> UNKNOWN
  established AND ledger.commitment == null                  -> STATED
  established AND ledger.commitment.boundaryMode
                    == CROSS_WITHOUT_PERMISSION               -> OVERRIDDEN
  established AND ledger.commitment.boundaryMode
                    != CROSS_WITHOUT_PERMISSION               -> RESPECTED
```

Only the **final** commitment's `boundaryMode` governs `RESPECTED` vs `OVERRIDDEN` — not the full
turn history. A `CROSS_WITHOUT_PERMISSION` turn earlier in the case that never became the final
commitment (because the player recovered — apologized, asked again, and committed to something
else instead) does not leave the case permanently `OVERRIDDEN`. This is the direct boundary-axis
counterpart of V4 §7 ("Recovery is part of the game") and mirrors how `relationshipReducer.ts`
already lets `TRUST` partially recover after a rupture without erasing that the rupture happened
(the rupture stays logged in `causalEventHistory`; only the *ending* field, not the history, is
allowed to reflect the recovered state). If the final commitment's `boundaryMode` is `NOT_RELEVANT`
or `UNKNOWN` (the committed plan does not touch the established boundary, or its relation could not
be determined), it is `RESPECTED` by the same conservative-ambiguity default as §2.4 — a plan that
does not cross a boundary, or cannot be shown to, must not be scored as if it did.

### 3.3 What this deliberately does not track

This contract does not add a "did the NPC actually grant permission" fact channel distinct from the
player's own `boundaryMode` history. `SEEK_PERMISSION`/`RECONSIDER` already mean, by their V13 §1B
definitions, that the player asked rather than declared/executed — and `CROSS_WITHOUT_PERMISSION`
is defined the same way this whole framework has used it since V13/V14 (blind-validated at 100%
agreement across V17/V21/V23/V25/V27's own predecessor rounds): a request-plus-declarative-
execution in one utterance, entirely observable from player-turn semantics, no NPC-side consent
ledger required. Introducing a second, NPC-fact-based consent channel here would (a) require
inventing a mechanism no document specifies, which is exactly what V26 stopped stage 3 to avoid,
and (b) risk producing two disagreeing sources of truth for the same question. `boundaryMode` stays
the single source of truth for this axis, as it already is for every other blind-validated
guarantee in this PR.

---

## 4. PERSONAL_TRACK: OPENED / NOT_OPENED

### 4.1 Not an ACTION, BOUNDARY_MODE, or RELATIONAL_EVENT

`PERSONAL_TRACK` is not derived from the closed, blind-validated four-layer contract. No value is
added to `ActionType`, `BoundaryMode`, or `RelationalEvent` — none of those sets is touched by this
patch (V25's `PASS_FOR_IMPLEMENTATION` and every gate through V27's predecessor rounds stand
unmodified). Instead this defines one small, independent, optional signal type:

```
PersonalTrackSignal = "OPENED"
```

A future semantic interpreter (V11 stage 4, not built yet) MAY attach this signal alongside a
`TurnClassification` for a given turn, if and only if that turn explicitly and voluntarily raises
the NPC's deeper personal pattern beyond the immediate operational problem (the V3 review packet's
`今の問題と、本人の悩みは同じ？` framing — "separates operational issue from deeper personal
issue"). It is never inferred from warmth, politeness, verbosity, or any ACTION/BOUNDARY_MODE/
RELATIONAL_EVENT value — those three layers stay exactly as blind-validated. Absent an explicit
signal, the default is `NOT_OPENED`, every turn, for the whole case.

### 4.2 Monotonic accumulation

```
CaseEndingState.personalTrackOpened: boolean   // starts false
```

Once a turn supplies `PersonalTrackSignal = "OPENED"`, `personalTrackOpened` becomes `true` for the
rest of the case and never reverts (matching the "consequences persist" principle already applied
to `causalEventHistory` — an opened track cannot be un-opened by a later turn, only ever-opened or
never-opened).

```
personalTrack = state.personalTrackOpened ? "OPENED" : "NOT_OPENED"
```

### 4.3 Structural non-requirement

`deriveShowOutcome` (§2) and `deriveEndingBoundary` (§3) do not take `personalTrackOpened` (or any
`PersonalTrackSignal`) as an input at all — not "ignore it," but the parameter does not exist in
either function's signature. This is stronger than a stated rule; it is a type-level guarantee that
`PERSONAL_TRACK` cannot leak into `SHOW` or `BOUNDARY` even by a future implementation mistake
within this file, without an explicit, visible signature change.

---

## 5. Non-ranked, no score (restated as a testable property)

For any fixed `(TaskLedger, boundary-establishment state, RelationshipState, WorldClock)`, changing
only `personalTrackOpened` between `true` and `false` must produce an identical `show`, `boundary`,
`trust`, and `timeLeft` — only `personalTrack` differs. §4.3 makes this a structural guarantee
(tested in §7), not merely a documented intention.

No numeric combination of `show`/`boundary`/`trust`/`timeLeft`/`personalTrack` is computed anywhere
in this contract. There is no "ending score," "ending tier," or ranking function. A future minimal
UI (V11 stage 7) may present the five fields as independent facts (matching the V17 review's own
worked-example format: `SHOW:PROCEEDS / BOUNDARY:RESPECTED / TRUST:NEUTRAL / TIME_LEFT:19 /
PERSONAL_TRACK:NOT_OPENED`) but must not synthesize a single "you scored X" value from them.

---

## 6. Explicitly out of scope for this patch

- **V4 §5's four outcome families** (RESOLVED / SURFACE FIX / STALEMATE / BREAKDOWN) are a
  different, coarser classification from the review-packet lineage (V1-V4), layered *on top of* an
  `EndingVector`-shaped state, not a replacement for it. The trigger for this round asks only for
  the `EndingVector`'s three open fields (`SHOW`, `BOUNDARY`, `PERSONAL_TRACK`) plus preserving
  `TRUST`/`TIME_LEFT`; it does not ask for the four-family mapping. Inventing that mapping now,
  beyond what's asked, would be exactly the kind of unrequested scope expansion this project's
  governing standard asks Claude Code to avoid ("Run の目的に直接必要な変更だけを行う"). Deferred to
  a future round if requested.
- **Which `TIME_COSTS` category a given turn falls into** — already explicitly deferred to the
  game-loop integration by `timeEconomy.ts`'s own doc comment (stage 2); unchanged here.
- **NPC dialogue/expression content for any ending** — AI owns expression; this contract only
  defines the deterministic state the expression layer reads from.

READY_FOR_IMPLEMENTATION = PENDING §8 (design audit)
