# Causality Counterfactual Invariant V1 — PHASE 11.12

## The falsification question (directive Section 16)

"If the preceding consequence had NOT happened, would the PLAYER still legitimately possess the
information/motivation needed for this possibility? If YES: the claimed causal unlock is invalid
unless another actual consequence exists."

## Reusable invariant

Implemented in `src/research/action-contract-v2/causalUnlockInvariant.ts` as
`validateCausalUnlockClaim(claim: CausalUnlockClaim)`. A claim states, as data:

- `factsAssertedByGatedActionAnswer` — fact tags the newly-eligible action's answer asserts, read
  directly off its actual (captured or authored) text.
- `factsReachableBeforeConsequence` — the union of fact tags every action reachable BEFORE the
  gating consequence could assert, read the same way.

**Valid** iff at least one fact in the first set is absent from the second. **Invalid**
(`NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED`) iff the first set is empty, or every element of it is
already in the second.

This is deliberately a **mechanical set comparison**, not natural-language understanding — the
directive's own instruction ("do not simply add another boolean") is satisfied by requiring the
comparison to be against *explicit, human-authored fact tags*, not a single pass/fail flag with no
supporting data. A reviewer can inspect exactly which facts were compared and why the verdict came
out the way it did.

## Applied to the real PHASE 11.11 defect

`REAL_LEFTOVER_STOCK_UNLOCK_CLAIM`:

```
gatedActionId: "ASK_ABOUT_LEFTOVER_STOCK"
consequenceActionId: "PLAYER_ACCEPTS_REQUEST"
factsAssertedByGatedActionAnswer: ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"]
factsReachableBeforeConsequence: ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"]
```

Fact tags read directly off the two real captured lines:
- ASK_WHAT's answer (reachable BEFORE accept, since ASK_WHAT never touches `pendingReply`):
  「ああ、悪いな。店先にある祭りの手ぬぐいの箱、値引き用の棚まで運んでくれるか。」 — asserts the box
  is festival-related (IS_FESTIVAL_LEFTOVER) and headed to the discount shelf
  (GOING_TO_DISCOUNT_SHELF).
- ASK_ABOUT_LEFTOVER_STOCK's answer (only reachable AFTER accept): 「ああ、そうだ。祭りの残りだよ。
  値引きで出すから、棚に並べるんだ。」 — restates the same two facts, asserts nothing else.

`validateCausalUnlockClaim(REAL_LEFTOVER_STOCK_UNLOCK_CLAIM)` → `{ valid: false, reason:
"NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED: every fact the gated action asserts was already
reachable before the consequence", novelFacts: [] }` — proven by `tests/causalUnlockInvariant.test.ts`.

**This exactly reproduces, mechanically, the same finding
`STRATEGIST_PRODUCT_REVIEW_BUNDLE_V1.md` Section 4 (PHASE 11.11A) already reached by close reading**
("the step-3 dialogue content does not add a fact absent from step 1's dialogue content") — the
invariant formalizes what was previously only a manual close-reading finding into a checkable,
reusable assertion.

## Contrast case — a legitimate unlock passes

`SYNTHETIC_LEGITIMATE_UNLOCK_CLAIM` (hypothetical, no real PHASE 11.11 action matches it):

```
factsAssertedByGatedActionAnswer: ["EXACT_REMAINING_UNIT_COUNT"]
factsReachableBeforeConsequence: ["IS_FESTIVAL_LEFTOVER", "GOING_TO_DISCOUNT_SHELF"]
```

→ `{ valid: true, novelFacts: ["EXACT_REMAINING_UNIT_COUNT"] }`. This proves the invariant is not
trivially always-false — it discriminates correctly given a genuinely novel fact.

## Reusability as an authoring/evaluation invariant (directive Section 16's own question)

**Yes, reusable, with a stated precondition:** the claim's two fact-tag lists must be authored by a
human reading the actual dialogue text, not generated automatically — this repo's finite,
fully-enumerated captured-line sets (5 lines per scene so far) make that tractable. It does not
scale, as-is, to free-generated dialogue where fact extraction would itself require either a second
LLM pass (a new, unverified dependency) or continued manual tagging at increasing cost as scene
count grows. This limitation is stated plainly rather than hidden — see
`PRODUCT_TEST_BOUNDARY_ARCHITECTURE_V1.md`'s "Player Knowledge Provenance" section for the related,
deliberately-not-built, larger system this would need to become at scale.
