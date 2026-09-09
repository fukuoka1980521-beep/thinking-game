# Turn Owner — Falsification V2

PHASE 11.7R. Central mandatory question: **can every useful behavior be expressed with
`PendingReply` + Action Eligibility + current world-interruption state, without a `turnOwner`
field?** Tested against every case the directive names, not assumed either way in advance.

## Case-by-case test

### 1. Direct answer (Section 4)
Yohei asks; `PendingReply.status = OPEN`. Legal actions: `ANSWER_ACCEPT`, `ANSWER_DECLINE`,
`DEFER`, small talk, ask-other-topic, leave. **Does any require `turnOwner = PLAYER`?** No —
`ANSWER_ACCEPT`/`ANSWER_DECLINE`'s own `ELIGIBILITY` is simply `[PendingReply.status === OPEN]`
(or `DEFERRED`, once re-raised). This is the same `Precondition`-object pattern already
implemented and tested in PHASE 11.6R (`TRASH_BAGS_NEEDED`, `JIN_HELPER_ABSENT`) — no new concept.

### 2. Small talk (Section 5)
「今日は暑いね」. Required invariant: `PendingReply` remains `OPEN`. Per the enum falsification,
this is trivially true — small talk is not one of the four transitions (`OPEN→DEFERRED→RESOLVED→
WITHDRAWN`), so it cannot touch `pending.status` at all unless a resolver is specifically authored
to do so (and none should be). **No `turnOwner` needed** — small talk's own `ELIGIBILITY` is simply
`[ALWAYS]`, identical in shape to any other always-available action.

### 3. Greeting-like utterance (Section 6)
「よう」. Critical distinction honored: **utterance legality != contract transition legality.**
The words themselves are always sayable; what matters is which `AUTHORITATIVE_EVENT` (if any) they
map to. A `GREET` contract dispatched while `PendingReply.status === OPEN` must simply **not**
include `pending → null` or any reset of the `PendingReply` in its own `stateDelta` — the fix is
purely in what `GREET`'s contract is authored to do (nothing to the pending state), not in adding
a gatekeeping `turnOwner` check before allowing `GREET` at all. **`OPEN` remains sufficient.**

### 4. Topic change (Section 7)
PLAYER asks about the festival instead. `PendingReply` remains untouched by the `ASK_FESTIVAL`
contract's own `stateDelta` (same reasoning as Case 3). Yohei's actual response (answer briefly
then return / ignore and re-present / answer and later self-resolve / let it lapse unresolved) is
entirely `NPC_CURRENT_ACTIVITY`/personality-driven narration — **none of these four legitimate
behaviors require knowing "whose turn it is,"** only whether `PendingReply.status` is still `OPEN`
when Yohei next has a reason to check it.

### 5. Leave (Section 8)
Already split into two independent events in the companion document. `PLAYER_LEAVES`'s own
`ELIGIBILITY` is `[ALWAYS]` — leaving is never gated on a "turn." **No `turnOwner` needed.**

### 6. Third-party interruption (Section 9)
A customer arrives. Tested explicitly against the directive's own preferred alternative: **a world
event changes current action eligibility**, not a `turnOwner = WORLD` value. Concretely: Yohei's
`NPC_CURRENT_ACTIVITY` temporarily becomes "serving a customer," and this is checked as an ordinary
`Precondition` on PLAYER's own conversation-continuing actions (e.g., `ASK_FESTIVAL`'s eligibility
could include `[YOHEI_AVAILABLE_FOR_CONVERSATION]`, the same kind of object already used for
`JIN_HELPER_ABSENT`) — while `ANSWER_ACCEPT`/`ANSWER_DECLINE` may remain eligible regardless (a
short answer doesn't need Yohei's full attention the way starting a new topic might). `PendingReply`
itself is completely unaffected by the interruption — it stays exactly whatever it was.
**No separate turn-ownership state is required**; this is ordinary eligibility gating, identical in
kind to everything else in this model.

### 7. NPC physical activity (Section 10)
`WAITING_FOR_REPLY != PHYSICALLY_FROZEN` — already an established, tested pattern (PHASE 11.6R's
Jin, who continues his own work regardless of PLAYER's choice). Directly reused, not reinvented:
Yohei may stock shelves/serve a customer/handle paperwork while `PendingReply.status === OPEN`,
exactly as Jin's own `NPC_CURRENT_ACTIVITY` narration is independent of PLAYER's pending decision.

### 8. NPC self-resolution / PLAYER later returns
Both already covered by the split-event model (Section 3 of the companion doc) — `WITHDRAWN`/
`RESOLVED` are reached only through their own named events, never through elapsed time or a
`turnOwner` reverting. On a later return, `PendingReply.status` is read exactly as it was left;
`ANSWER_ACCEPT`/`ANSWER_DECLINE` are eligible again purely because the status is still `OPEN`.

## Model A vs. Model B comparison table

| Criterion | A: with `turnOwner` | B: `PendingReply` + eligibility only |
|---|---|---|
| Correctness | Equal — every case above resolves identically either way | Equal |
| Naturalness | No improvement — `turnOwner = WORLD` for Case 6 is an awkward category error (the interruption isn't really anyone's "turn") | Matches directive's own preferred framing directly |
| State count | +1 field, +3-4 enum values (`PLAYER`/`NPC`/`WORLD`/possibly `NONE`) | 0 additional fields beyond `PendingReply.status` and ordinary `Precondition`s already in the model |
| Failure risk | New failure mode possible: `TURN_OWNER_BECOMES_DIALOGUE_TREE_ENGINE` (directive's own named risk) — a stateful "whose turn" tracker is exactly the seed of a scripted dialogue-tree engine, which this whole arc of phases has repeatedly rejected (Drama Manager, Storylets, full narrative planning) | No new failure surface — reuses the exact `Precondition`-object pattern already proven correct in PHASE 11.6R |
| Free-text compatibility | Would require the free-text parser to also resolve a `turnOwner` value before dispatch — one more thing that could be wrong | No additional parsing burden — the same `INTERPRETED_INTENT` → `ELIGIBILITY` check already handles it |

## Verdict

**`TURN_OWNER = NOT_NEEDED.`** Every case tested resolves correctly using only `PendingReply` +
ordinary `Precondition`-based eligibility (including world-interruption state expressed as an
eligibility gate, not a new "owner" concept). No case produced a requirement `turnOwner` alone
could satisfy and the existing model could not. Per the directive's own mandatory rule (Section 3:
"If YES: do NOT add TURN_OWNER"), it is not added.

## Failure modes, explicitly checked

| Failure mode | Avoided how |
|---|---|
| `QUESTION_BECOMES_OBLIGATION` | terminology choice (`PendingReply`, not `PendingCommitment`) — Section 1 of companion doc |
| `GREETING_RESETS_PENDING` | Case 3 above — `GREET`'s own `stateDelta` simply never touches `pending` |
| `SMALL_TALK_DISCHARGES_PENDING` | Case 2 above — small talk is not one of the 4 legal transitions |
| `LEAVE_AUTO_DISCHARGES` | the mandatory split-event model, Section 3 of companion doc |
| `WORLD_AS_FAKE_TURN_OWNER` | Case 6 above — modeled as ordinary eligibility, not a `turnOwner` value |
| `NPC_FREEZES` | Case 7 above — reuses the already-proven Jin pattern |
| `ACK_STATE_PROLIFERATION` | `ACKNOWLEDGED_UNRESOLVED` explicitly falsified out in the companion enum doc |
| `DEFER_STATE_PROLIFERATION` | `DEFERRED` was tested and kept for one specific, named reason, not by default |
| `EVERY_UTTERANCE_PERSISTED` | Section 4 of `PENDING_REQUEST_MINIMAL_STATE_V2.md`'s admission threshold |
| `FREE_TEXT_INTENT_BECOMES_AUTHORITY` | unchanged from PHASE 11.6R — `INTERPRETED_INTENT` never itself mutates state |
