# Structured Reveal Semantics V1 — PHASE 11.13E

## The two facts, preserved structurally now

- **OBSERVED CLUE:** the player sees festival-patterned towels once `leftover_stock_moved` exists
  (State Admission — material presence, unchanged mechanism since PHASE 11.12R).
- **TARGET FACT:** these are specifically the festival's leftover/unsold stock. Its status is now
  derived ENTIRELY from structural material ids (`LEFTOVER_RESPONSE_MATERIAL_IDS` for the
  response, `REVEAL_MATERIAL_ASSERTED_FACTS` for the reveal) — never from any narration string.

## State sequence

| State | clue | target |
|---|---|---|
| After reveal | known (material exists) | UNRESOLVED |
| After CONFIRM | known | KNOWN_TRUE |
| After DENY | known | KNOWN_FALSE |
| After UNKNOWN | known | UNRESOLVED |

All four rows verified by `tests/zeroProseAuthorityAudit.test.ts`'s "real truth table, re-verified
with zero prose dependency" — 6/6 passing, none of the assertions reference any narration text.

## Reuse, not a new system

No new engine. `REVEAL_MATERIAL_ASSERTED_FACTS` is the exact same shape and pattern as
`LEFTOVER_RESPONSE_MATERIAL_IDS` (PHASE 11.13D) applied to one more material — a `Record<materialId,
...>` registry, authored once by a human, read structurally. Both live in `playableSceneContracts.ts`,
the natural shared home the evaluator already imports from.

## Nothing inferred from Japanese wording

Confirmed by `tests/zeroProseAuthorityAudit.test.ts`'s "reveal prose-mutation invariant": 4
distinct `concreteContent` variants for the SAME reveal material — the real text, a variant
containing the historically-dangerous exact substring "祭りの残り", unrelated text, and empty
string — all produce byte-identical `targetFactKnown`/`novelFacts` results (8/8 tests, 2 evaluators
× 4 variants). The structured registry, not the prose, drives every result.
