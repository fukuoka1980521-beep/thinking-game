# Future Adversarial Case: Yohei Pending Request V1 (paper-map only)

PHASE 11.6R Section 19. **Not implemented, not a new subsystem.** A harder case identified for a
future test of Action Contract V2, mapped conceptually against the vocabulary that already exists.

## The case

Yohei has previously asked PLAYER something (an open request — e.g., "let me know if you decide
you want the bigger pack size instead"). On a later visit, PLAYER's own intent may be unrelated
small talk, while Yohei's own `NPC_CURRENT_ACTIVITY` still holds an open expectation from the
earlier exchange. This tests **whose turn it is to speak next** and whether a **new greeting** is
even legal while an old exchange is still conversationally "owed."

## Mapping onto existing vocabulary (no new concept proposed)

- The open request itself is a `FOLLOW_UP` per this phase's own `CONDITIONAL_FOLLOW_UP_AFFORDANCE`
  concept — Yohei's *own* pending question is structurally the same shape as PLAYER's optional
  follow-up, just NPC-originated instead of PLAYER-originated.
- "Whose turn it is" maps to a `turnOwner`-equivalent flag already implicit in this prototype's
  `pending` state shape (`ContractV2State.pending` currently only ever represents a PLAYER-facing
  affordance; a symmetric NPC-facing pending expectation is the missing half, not a new mechanism).
- "Small-talk suppression" and "new greeting legality" would both be expressed as `ELIGIBILITY`
  predicates on the ordinary greeting/small-talk contract — e.g., an ordinary `VISIT_YOHEI_SMALL_
  TALK` contract's eligibility would need to reference the SAME canonical precondition object
  governing whether Yohei's open request is still outstanding, exactly per Section 5/6's single-
  authority rule already implemented for the trash-bag case.

## Why this is a genuinely harder case

Every case actually tested this phase (A-E) has PLAYER originating the follow-up. This future case
has the **NPC** originating an outstanding expectation that then constrains what PLAYER can
legitimately do next — testing whether the same `Precondition`/`FollowUpAffordance` machinery
generalizes symmetrically, or whether an NPC-originated pending expectation needs its own field.
**Not resolved here.** Recorded as a future test target only.
