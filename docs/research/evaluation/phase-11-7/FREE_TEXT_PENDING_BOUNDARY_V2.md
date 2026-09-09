# Free-Text Pending Boundary V2

PHASE 11.7R. Composite free text against an open `PendingReply`, selective confirmation, and the
confident-wrong-parse risk. No NLP, no multi-intent planner, no implementation.

## 1. Composite free text — does the vocabulary survive without a new parser architecture?

Input: 「まあその話は後でいいじゃん。それより昨日の祭りどうだった？」

**Candidate interpreted intents**: `DEFER_PENDING` + `ASK_FESTIVAL` — two intents in one
utterance. Per directive Section 12, these are never authoritative on their own, and no general
multi-intent planning engine is to be built.

**Test**: can the existing free-text pipeline (`PLAYER TEXT → INTERPRETED_INTENT candidate →
eligibility check → confirmable action → confirmation → resolution`, PHASE 11.6R) handle this
without new architecture?

**Yes — by treating the two candidates as sequentially resolvable, independent dispatches, not
one compound action.** The stub parser (already just a fixed lookup table, PHASE 11.6R) produces
an **ordered list** of candidates instead of one: `[DEFER_PENDING, ASK_FESTIVAL]`. Each is then
checked against the CURRENT eligible affordances **independently, in order**:

```
candidate 1: DEFER_PENDING  -> eligibility check against PendingReply.status === OPEN
                              -> if eligible, resolves (see Section 2 below re: confirmation)
                              -> PendingReply -> DEFERRED
candidate 2: ASK_FESTIVAL   -> eligibility check (ordinary conversation action, always available
                                 unless Yohei is currently unavailable, per the interruption case)
                              -> resolves independently
```

**No silent choice for PLAYER**: each candidate is validated and (where required) confirmed on its
own terms — the pipeline never collapses two intents into one guessed action, and never drops one
silently in favor of the other. This is the same eligibility-check machinery from PHASE 11.6R,
applied twice in sequence, not a new "multi-intent" concept.

## 2. Confirmation boundary — refined to apply per-contract-effect, not per-utterance

PHASE 11.6R's rule ("free-text-derived persistent action requires confirmation") is **refined**
here, not replaced: confirmation is required **per candidate**, based on **that candidate's own
persistence**, not blanket-applied to the whole utterance.

- `ASK_FESTIVAL`: ordinarily creates no persistent state (an information-only exchange) →
  **no confirmation required** — it can resolve immediately once eligible.
- `DEFER_PENDING`: changes `PendingReply.status` (a real, if interaction-local, state transition
  with behavioral consequences — Section on `DEFERRED`'s survival in the enum falsification doc)
  → **confirmation required**, per the existing rule, before it takes effect.

**Consequence for the composite example**: PLAYER's utterance could legitimately resolve as
"`ASK_FESTIVAL` proceeds immediately; `DEFER_PENDING` is offered back for confirmation" — two
different treatments for two different candidates extracted from one utterance, decided by each
candidate's own effect, never by the utterance as an undifferentiated whole.

## 3. Confident-wrong-parse risk (carried forward, still unsolved, now sharpened)

**The dangerous case named explicitly by the directive**: PLAYER says something that could be
**incorrectly** parsed as `ANSWER_ACCEPT`/`ANSWER_DECLINE` for Yohei's actual pending question —
not an unrelated small-talk misfire, but a **false positive on the exact transition that closes a
PendingReply**. This is more dangerous than the general confident-wrong-misparse gap already
recorded in PHASE 11.6R, because it could reach `RESOLVED` on a fabricated answer.

**Future boundary established (not solved)**: this is the strongest possible argument, within this
whole phase's evidence, for keeping the confirmation boundary **mandatory** on any free-text
candidate that resolves to `OPEN → RESOLVED` or `OPEN → WITHDRAWN` specifically — regardless of how
the general per-effect refinement above might otherwise be tuned for lower-stakes transitions. No
confidence model, no embeddings, no semantic verification system is proposed to detect the
misparse itself; the boundary is structural (confirm before the state-closing transition takes
effect), not probabilistic.

## 4. Verdict

**`FREE_TEXT: COMPATIBLE_WITH_INTERACTION_LOCAL_STATE.`** Neither `ARCHITECTURE_COMPATIBLE`
(unchanged, too weak — it undersells that a real refinement was needed) nor
`NEEDS_ARCHITECTURE_CHANGE` (too strong — no new parser, no new pipeline stage, no multi-intent
engine was required). The existing PHASE 11.6R free-text boundary already generalizes cleanly to
composite/pending-aware input once confirmation is scoped per-candidate-effect rather than
per-utterance — a refinement of an existing rule, not a new architecture.
