# Adversarial Reintroduction Test V1 — PHASE 11.12

Directive Section 20: after building the systemic gates, deliberately attempt to reintroduce each
contamination class and record the exact result. All five attempts below were actually executed
(as real Vitest tests, run against real code — not asserted from description). No real violating
file was left in the repository; where a "reintroduction" required a violating artifact, it was
constructed as an in-memory synthetic fixture inside the test itself.

## 1. TEST PROBE: 「雨降ってた？」 (`ASK_WEATHER_SCENE`)

**Attempt:** compose the REAL, unmodified `ASK_WEATHER_SCENE` export into a product surface via
`composeProductSurface([ASK_WHAT_HELP_NEEDED, ASK_WEATHER_SCENE])`.

**Result: BLOCKED.** Throws `ProductSurfaceViolation: "ASK_WEATHER_SCENE" is owned by "QA", not
"PRODUCT"...`. Test: `tests/productSurfaceGate.test.ts` → "throws when the real ASK_WEATHER_SCENE
(the actual historical leak) is included, citing its QA ownership" — **PASSING**.

## 2. DEBUG TEXT: "Vertex replay..." disclosure

**Attempt:** include the dev-only disclosure module's real call site (`BuildBoundaryDemoApp.tsx`,
gated by a literal `if (import.meta.env.DEV)`) in the actual module graph reachable from
`src/App.tsx`, then run the real production build (`npm run build`) and grep the real output.

**Result: COMPILED OUT.** `grep -rl "PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a" dist/` →
`NOT FOUND`. Confirmed present instead in a real `NODE_ENV=development` build of the same source —
proving the absence in production is due to the compile-time branch, not the string never having
existed. See `SYSTEMIC_GATES_IMPLEMENTATION_V1.md` for the full commands and both results.

## 3. TEST-ONLY ACTION: synthetic epistemic probe imported into product UI

**Attempt:** construct a synthetic file, `src/newlifeplayable11/HypotheticalFutureComponent.tsx`,
that imports `WEATHER_EPISTEMIC_PROBE` from `testProbes.ts` — **as an in-memory fixture only; this
file was never written to disk** — and scan it with `scanForProductSurfaceViolations`.

**Result: CONFINED (detected).** 1 violation reported: `{ file:
"src/newlifeplayable11/HypotheticalFutureComponent.tsx", rule:
"PRODUCT_UI_MUST_NOT_IMPORT_TEST_PROBES", ... }`. Test: `tests/dependencyDirection.test.ts` →
"adversarial: a synthetic file importing testProbes into product UI IS detected" — **PASSING**.
Independently, `TestProbe`'s own shape (no `eligibility`/`playerVisiblePromise`/
`authoritativeEvent`) means even if such an import existed, nothing in `NewlifePlayable11App.tsx`'s
current button-rendering code (which expects `ActionContractV2`) could render it without a type
error — confirmed by `npx tsc --noEmit` passing cleanly with `testProbes.ts` in the tree.

## 4. TEST-ONLY FIXTURE FACT: relabeling a QA action as PRODUCT without justification

**Attempt:** construct an adversarial registry where `ASK_WEATHER_SCENE` is relabeled
`{ owner: "PRODUCT", sceneJustification: "" }` and attempt composition through it.

**Result: BLOCKED.** Throws `ProductSurfaceViolation: "ASK_WEATHER_SCENE"... is classified
"PRODUCT" but has no sceneJustification -- "a test needs to exercise this branch" is not an
acceptable justification`. Test: `tests/productSurfaceGate.test.ts` → "rejects a PRODUCT-owned entry
with an empty sceneJustification" — **PASSING**. Separately, an entirely unclassified/unregistered
action id is also blocked (fail-closed default, not defaulted to PRODUCT) — same test file, "fails
closed for an unclassified action id" — **PASSING**.

## 5. A fake postcondition-only "new possibility"

**Attempt:** validate a synthetic causal-unlock claim that asserts no facts at all (a pure
postcondition flip with no accompanying content claim) — the shape a "test needs eligibility to
flip true/false" defect would produce if reintroduced.

**Result: BLOCKED.** `validateCausalUnlockClaim({ factsAssertedByGatedActionAnswer: [], ... })` →
`{ valid: false, reason: "NEW_POSSIBILITY_CAUSALITY_NOT_ESTABLISHED: gated action asserts no facts
at all" }`. Test: `tests/causalUnlockInvariant.test.ts` → "a synthetic FAKE postcondition-only
unlock... fails validation" — **PASSING**. The REAL historical defect (restating already-reachable
facts, not zero facts) is separately and correctly caught by the same function — "the REAL PHASE
11.11 leftover-stock unlock claim fails counterfactual validation" — **PASSING**.

## Summary

| # | Class | Mechanism that caught it | Result |
|---|---|---|---|
| 1 | Test probe as product button | Ownership registry + composition gate | BLOCKED |
| 2 | Debug text on primary scene | Compile-time build/mode boundary | COMPILED OUT |
| 3 | Test-only action imported into product UI | Dependency-direction scanner + type shape mismatch | CONFINED |
| 4 | Mislabeled/unjustified fixture fact | Ownership registry justification check | BLOCKED |
| 5 | Fake postcondition-only unlock | Counterfactual causal-unlock invariant | BLOCKED |

All 5 adversarial attempts were run as real, executing tests (part of the 17 new tests reported in
`SYSTEMIC_GATES_IMPLEMENTATION_V1.md`'s totals), not asserted from description. Full suite remained
green throughout (97/97 files, 1452/1452 tests) — the gates block the specific contamination classes
without breaking any existing passing behavior.
