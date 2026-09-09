# Pending Status Enum — Falsification V1

PHASE 11.7R. Each of Grok's 5 candidate statuses tested individually against the mandatory rule
(directive Section 2/16): **a status survives only if it changes some future legality or NPC
resurfacing behavior that a plain conversation-event log entry cannot already express.** Retained
only because the prototype used it is explicitly forbidden as a justification.

## OPEN — survives

**Test**: does removing it lose anything? No — it's the base case (a PendingReply exists, unfilled).
**Verdict: survives**, trivially — this is the state that makes the whole model meaningful.

## ACKNOWLEDGED_UNRESOLVED — does NOT survive

**Candidate use case**: PLAYER responds with small talk ("暑いね") or a greeting-like utterance
("よう") instead of answering — does the PendingReply need to move from `OPEN` to a distinct
`ACKNOWLEDGED_UNRESOLVED` state to represent "PLAYER has now said *something*, just not the
answer"?

**Test applied**: does this transition change any future legality (which actions PLAYER can still
take) or NPC resurfacing behavior (whether/how Yohei re-raises the question), in a way `OPEN` alone
cannot already express?

- PLAYER's future legal actions (`ANSWER_ACCEPT`, `ANSWER_DECLINE`, more small talk, leave) are
  **identical** whether or not an intervening small-talk turn occurred — nothing becomes newly
  legal or illegal.
- Yohei's own resurfacing behavior (does he re-ask, stay quiet, continue working) is a function of
  his own personality/timing logic, not of whether PLAYER's *specific prior utterance* was small
  talk vs. silence — the same `OPEN` status drives it either way.
- The only thing `ACKNOWLEDGED_UNRESOLVED` would add is a **narrative fact** ("an exchange
  happened") — which is exactly what a non-authoritative conversation-event log entry (already
  part of this model's own narration/history, not a status field) already records, without needing
  its own enum value.

**Verdict: does NOT survive.** `pending.status` stays `OPEN`; "small talk happened" is represented
only as a logged conversational event, never as a status transition. This directly resolves
directive Section 16's own worked test (「祭りを聞く」/「よう」) as instructed.

## DEFERRED — survives

**Candidate use case**: PLAYER explicitly says 「その話は後で」.

**Test applied**: does this change future legality/resurfacing behavior beyond what `OPEN` alone
expresses?

- **Yes.** A plain `OPEN` PendingReply, left alone, gives Yohei's own personality logic no signal
  about whether PLAYER has already acknowledged the request and asked for patience, versus simply
  never having addressed it at all. `DEFERRED` specifically licenses a distinct NPC behavior
  (suppressing an immediate re-ask this same visit, out of ordinary social courtesy) that `OPEN`
  cannot cleanly express without an ad hoc side-channel flag standing in for exactly this status
  anyway.
- **Verdict: survives**, narrowly, for this one reason — it is retained *because* it changes
  concrete NPC resurfacing behavior, not for prose convenience (directive Section 11's own
  instruction honored directly).

## RESOLVED (renamed from Grok's DISCHARGED) — survives

**Test**: the terminal state for "PLAYER answered, matter closed." Trivially necessary — without
it there is no way to represent the request's own successful completion. **Verdict: survives.**
Renamed from `DISCHARGED` to `RESOLVED` only for continuity with NEW LIFE's own existing
`SUCCESS_POSTCONDITION` vocabulary (Action Contract V2) — the same concept, not a new one.

## WITHDRAWN — survives

**Test**: does this differ meaningfully from `RESOLVED`? **Yes** — the *source* of closure differs.
`RESOLVED` means PLAYER supplied an answer; `WITHDRAWN` means the NPC's own side independently
decided the reply-slot no longer needs filling (Yohei found another way, or the request became
moot) — directly matching Section 8's mandatory "Event 2" distinction (`YOHEI_SELF_RESOLVES` /
`YOHEI_WITHDRAWS_REQUEST`), which is itself required to keep `PLAYER_LEAVES` from silently closing
anything. **Verdict: survives** — collapsing it into `RESOLVED` would make it impossible to tell,
after the fact, whether PLAYER ever actually answered.

## Final minimal enum

```
PendingReplyStatus = OPEN | DEFERRED | RESOLVED | WITHDRAWN
```

4 states, down from Grok's 5 — one removed with a specific, evidenced reason (no behavioral
difference from `OPEN` + a log entry), the remaining 4 each individually justified by a concrete
behavior they alone make possible. **`STATUS_MODEL: MINIMAL_ENUM_FOUND`**, not `STILL_UNCLEAR`.
