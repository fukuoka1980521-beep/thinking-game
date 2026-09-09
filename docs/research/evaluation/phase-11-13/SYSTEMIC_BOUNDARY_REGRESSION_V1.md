# Systemic Boundary Regression V1 — PHASE 11.13

Confirms the PHASE 11.12/11.12R systemic gates were not bypassed or weakened by the product
repair — re-run after all repair edits, not merely assumed carried-over.

## Freeze compliance (directive Section 1)

- **ProductSurface composition gate:** unchanged (`productSurface.ts`'s `evaluateProductSurface`/
  `composeProductSurface` logic untouched this phase; only a doc-string on `ASK_SALES_SCENE`'s
  registry entry was updated for accuracy).
- **TestProbe separation:** unchanged (`testProbes.ts` untouched).
- **debug/build boundary:** unchanged (`devOnlyDisclosure.ts`'s core logic untouched; one additive,
  optional `provenanceDetail` parameter was added in PHASE 11.12R, still unused by default).
- **dependency direction:** unchanged (`dependencyDirection.ts` untouched).
- **counterfactual causal invariant:** unchanged (`causalUnlockInvariant.ts`'s comparison logic —
  `validateCausalUnlockClaim`, `evaluateRealLeftoverStockCausalClaim` — untouched; only the
  narrative content it evaluates changed, in `playableSceneContracts.ts`).
- **authoring sufficiency gate:** unchanged (`yoheiSourceEvents.ts` untouched).
- **No manual special-casing:** `NewlifePlayable11App.tsx` contains no `actionId ===` branch
  (re-verified: `grep -n 'actionId ===='` returns nothing, same as PHASE 11.12R).

## Re-verified test results

| Test | Result |
|---|---|
| `tests/productSurfaceGate.test.ts` (5 tests) | PASS — real weather probe still rejected by ownership |
| `tests/testProbeSeparation.test.ts` (2 tests) | PASS — QA weather probe still callable via `invokeTestProbe`, zero product-surface exposure |
| `tests/dependencyDirection.test.ts` (4 tests) | PASS — real tree still clean; synthetic violation still detected |
| `tests/devOnlyDisclosureBoundary.test.ts` (2 tests) | PASS |
| `tests/causalUnlockInvariant.test.ts` (4 tests) | PASS — static PHASE 11.12 claim data (`REAL_LEFTOVER_STOCK_UNLOCK_CLAIM`) still correctly evaluates INVALID (it documents the *historical* defect, not the repaired scene — deliberately left as historical evidence, not updated; the *live* evaluator, `evaluateRealLeftoverStockCausalClaim`, now correctly returns VALID against the *repaired* content, a distinct, separately-tested function) |
| `tests/newlifePlayable11RealPathIntegration.test.ts` (13 tests, updated where product semantics changed) | PASS |
| `tests/newlifePlayable11RenderedUI.test.tsx` (9 tests, updated where product semantics changed) | PASS |

## QA probe regression (directive Section 15)

`ASK_WEATHER_SCENE` remains scene-eligible (`ALWAYS`) but is excluded from every real rendered
button list in every state this phase tested — confirmed again post-repair (initial, after
ASK_WHAT/FESTIVAL/SALES, after ACCEPT, after DECLINE). `WEATHER_EPISTEMIC_PROBE`/`invokeTestProbe`
(`testProbes.ts`, untouched) remains the correct, working alternative for exercising the same
regression coverage.

## Debug boundary regression (directive Section 16)

Re-confirmed: `npm run build` → `dist/` grepped → `PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a`
NOT FOUND. Debug panel content (including the dev-only disclosure and the new Product Surface
gate/causal-verdict evidence block) remains toggle-gated and, for the disclosure specifically,
also build-gated — unaffected by this phase's content changes.

## Ownership metadata risk re-confirmed

`OWNERSHIP_METADATA_NOT_SELF_AUTHENTICATING` finding from PHASE 11.12R still holds — re-run this
phase (`tests/newlifePlayable11RealPathIntegration.test.ts`'s "Section 16" describe block) against
the current codebase, same result. Not a regression; an already-known, documented, non-blocking gap.

## Conclusion

No systemic boundary was bypassed, weakened, or special-cased to accommodate the product repair.
Every behavioral change in the rendered scene traces to a change in authoritative content
(`playableSceneContracts.ts`) or a generalization of eligibility composition
(`buildAskCandidates`), evaluated by the same, unmodified gates.
