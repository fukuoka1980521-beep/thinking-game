# Pending Request — Minimal State V2

PHASE 11.7R. Paper falsification only, no runtime. Grok's external prototype (`PendingCommitment`,
5-state enum) is treated as **non-canonical evidence** — useful as a starting comparison point,
never imported wholesale, never assumed correct.

## 1. Terminology — what actually exists the instant Yohei asks and PLAYER hasn't answered

Immediately after 「少し手伝ってくれる？」, with no PLAYER reply yet, there is **not** a promise
(PLAYER hasn't agreed to anything) and **not** an obligation (a question is not owed compliance —
moralizing "Yohei asked" into "PLAYER now owes a debt" is explicitly rejected). What actually
exists is narrower: **a conversational reply-slot Yohei opened, still empty.**

**Candidates compared**:
- `PendingCommitment` (Grok's term) — rejected outright: presupposes PLAYER has committed to
  something before PLAYER has done anything at all. Wrong at the moment it would first be created.
- `PendingRequest` — closer, but only accurate for *this specific example* (a favor-request). A
  plain question ("昨日の祭りどうだった？") is not a "request" in any ordinary sense, yet it opens
  the identical structural gap (an expected reply, not yet given). Using "Request" for both would
  overclaim for the plain-question case.
- `PendingExchange` — too broad in the other direction. An ordinary greeting-and-reply is also "an
  exchange," including ones where nothing is outstanding once both sides have spoken. This term
  doesn't name what's actually missing.
- **`PendingReply` (justified alternative, adopted)** — names exactly the gap: a structural
  reply-slot the NPC opened that has not yet been filled. Accurate for both a favor-request and a
  plain question, without presupposing commitment, obligation, or the shape of what's being asked.
  **Selected as the canonical term for the remainder of this phase's documents.**

## 2. Minimal status enum (full falsification in the companion doc)

Starting from Grok's 5 (`OPEN, ACKNOWLEDGED_UNRESOLVED, DEFERRED, DISCHARGED, WITHDRAWN`), tested
individually in `PENDING_STATUS_ENUM_FALSIFICATION_V1.md`. Result, stated here and justified there:
**`OPEN`, `DEFERRED`, `RESOLVED`, `WITHDRAWN`** — 4 states. `ACKNOWLEDGED_UNRESOLVED` does not
survive (Section 16 of the directive's own test: it changes no future legality or NPC resurfacing
behavior beyond what a non-authoritative conversation-event log entry already expresses). `RESOLVED`
replaces Grok's `DISCHARGED` — same concept, renamed for continuity with NEW LIFE's own existing
`SUCCESS_POSTCONDITION`/postcondition vocabulary, not a new idea.

## 3. Leave — split into two events (Section 8's mandatory distinction)

```
EVENT 1: PLAYER_LEAVES         -- interaction ends. PendingReply status is UNCHANGED by this
                                   event alone (still OPEN or DEFERRED, whichever it was).
EVENT 2 (separate, optional, authored independently):
  YOHEI_SELF_RESOLVES          -- transitions PendingReply -> RESOLVED (Yohei found another way)
  YOHEI_WITHDRAWS_REQUEST      -- transitions PendingReply -> WITHDRAWN (no longer needed)
```

**Only Event 2 closes a PendingReply.** Leaving, by itself, never does. This directly forbids the
`LEAVE_AUTO_DISCHARGES` failure mode (Section 18) by construction — there is no code path in this
model where `PLAYER_LEAVES` alone can reach `RESOLVED`/`WITHDRAWN`, because those transitions are
only reachable from Event 2's own, separately-authored triggers.

**No single global persistence duration is forced.** A trivial PendingReply (see Section 5 below)
may simply lapse, unremembered, once the interaction ends — not because "leaving discharges it,"
but because it was never substantial enough to be admitted as anything beyond interaction-local
state in the first place (Section 4). A substantive one (the bag-favor request) may legitimately
still be `OPEN` the next time PLAYER visits Yohei's shop, days later.

## 4. Interaction-local vs. persistent — the actual admission threshold

| Layer | What lives here | Examples |
|---|---|---|
| `INTERACTION_LOCAL` | facts that only matter for the duration of the current conversational encounter | current unanswered question, current topic, a temporary interruption |
| `PERSISTENT_WORLD` (via State Admission, unchanged mechanism) | facts that must survive past this encounter | a cross-day promise once accepted; a genuinely substantive unanswered request Yohei would plausibly still remember next time |

**The admission test, stated plainly**: would Yohei plausibly still care or remember by the next
encounter? "今ちょっと持つ？" (hold this a second) — no; it resolves or lapses entirely within one
interaction, never needs promotion. "少し手伝ってくれる？" for something that matters to his
festival-stall commitment — yes; **even the unanswered `OPEN` PendingReply itself**, not only its
eventual accepted outcome, is substantive enough to be worth admitting as a real fact Yohei holds,
so that PLAYER leaving without answering doesn't silently erase something Yohei genuinely asked.
**Not every utterance is persisted** (Section 17's `EVERY_UTTERANCE_PERSISTED` failure mode is
avoided by this same threshold test) — only PendingReplys that pass it.

## 5. Promise / Life Material promotion (worked example)

- Yohei: 「明日これ持ってきてくれる？」 → `PendingReply { status: OPEN }` — interaction-local (or
  promoted, per Section 4's threshold, if substantive enough) at this point; nothing PLAYER-facing
  has been admitted as a commitment yet.
- PLAYER: 「分かった、持ってくる」 → `ANSWER_ACCEPT` resolves. Two separate things happen, not one:
  1. The `PendingReply` itself transitions `OPEN -> RESOLVED` (interaction-local bookkeeping,
     PLAYER answered).
  2. A **new**, separate `PROMISE`/`PENDING_TASK` Life Material is created — "PLAYER promised to
     bring [thing] tomorrow" — admitted through the unchanged State Admission pipeline
     (`classifyProvenance`/`decideAdmission`, PHASE 10.18), exactly the same mechanism already
     proven for Miyoko's bean-promise and Yohei's stall-commitment materials.
- Contrast: "今ちょっと持つ？" + accept → `ANSWER_ACCEPT` resolves the `PendingReply` to `RESOLVED`
  and the physical action completes **within the same interaction** — no cross-day material is
  ever created, because nothing survives past this encounter.

**These are conceptually different kinds of "acceptance"** — one closes a reply-slot only; the
other closes the reply-slot *and* opens a new, separately-admitted, persistent commitment. Nothing
in this model collapses them automatically (Section 15's own explicit instruction).
