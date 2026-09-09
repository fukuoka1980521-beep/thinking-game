# Target Status Caller Audit V1 — PHASE 11.13E

Directive Section 6: audit every REAL Product caller of `targetFactKnown`, since both `KNOWN_FALSE`
and `UNRESOLVED` (and now `CONFLICTING`) produce `false`.

## Grep result

```
$ grep -rn "targetFactKnown" src/
causalUnlockInvariant.ts:214  (interface field declaration)
causalUnlockInvariant.ts:236  (written, prerequisite-not-met branch)
causalUnlockInvariant.ts:253  (written, reveal-leak branch)
causalUnlockInvariant.ts:275  (written, main branch)
```

**Zero real callers outside `causalUnlockInvariant.ts` itself.** `targetFactKnown` is written by
the module that defines it and read nowhere else in `src/`. Specifically:

- `NewlifePlayable11App.tsx` never branches on `.targetFactKnown` — it only ever
  `JSON.stringify`s the entire `leftoverQuestionPrerequisite` object into the dev/debug evidence
  block (display only, not a decision).
- `applyCausalityGate` (the function that actually decides whether `ASK_ABOUT_LEFTOVER_STOCK`
  renders) reads `causalVerdict.verdict` from the SEPARATE `evaluateRealLeftoverStockCausalClaim`
  function, never `targetFactKnown`.

## Classification

**SAFE_TRUE_ONLY_CHECK is the right classification, but by vacuous truth — there is no real
decision-making caller to classify as ambiguous or at-risk.** No renaming was required (directive:
"Do not broadly rename things unless required by demonstrated risk") — since nothing consumes the
field for a real decision, there is no demonstrated risk to fix. The field is retained, correctly
scoped in its own doc comment ("Kept for backward compatibility... Prefer `targetStatus` for
anything that needs to distinguish KNOWN_FALSE from UNRESOLVED"), for any FUTURE caller that might
only care about the CONFIRM case specifically.

## Where Product logic needs the actual resolved state

Nowhere yet, in the real running scene. If a future phase adds real logic that needs to
distinguish `KNOWN_FALSE`/`UNRESOLVED`/`CONFLICTING`, `targetStatus` is the field to use — already
implemented, already tested (`tests/structuredResponseSemantics.test.ts`,
`tests/zeroProseAuthorityAudit.test.ts`).
