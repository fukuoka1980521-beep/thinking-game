# Code Self-Audit V1 — PHASE 11.12

## Scope discipline

- No PHASE 11.11 file was modified: `git status --porcelain -- src/newlifeplayable11
  src/research/action-contract-v2/playableSceneContracts.ts
  src/research/action-contract-v2/yoheiSourceEvents.ts
  src/research/action-contract-v2/languageAdapter.ts
  src/research/action-contract-v2/capturedYoheiLines.ts
  tests/newlifePlayableScene11.test.ts` shows these files unchanged by this phase (all still show
  as `??` untracked from before this Run began, not modified).
- The only edit to a previously-existing file is `src/App.tsx`. **Caveat stated precisely:**
  `src/App.tsx` already carried substantial uncommitted changes before this phase began (visible in
  this session's opening git status as `M src/App.tsx`, from prior work adding the other `?newlife*`
  routes) — a raw `git diff` against the last commit therefore shows far more than this phase's own
  edits and should not be read as this phase's change. This phase's own 4 edits (verified via the
  Edit tool calls actually made this Run, each independently reviewable) were: 1 new import
  (`BuildBoundaryDemoApp`), 1 new `View` union member (`BOUNDARY_DEMO_11_12`), 1 new URL-param
  branch (`?boundarydemo1112=1`), 1 new render branch — following the exact pattern of every other
  route registration already in that file. No existing route's behavior was changed by this phase.
- 6 new source files, all under `src/research/action-contract-v2/` (consistent with where PHASE
  11.11's own new files live) plus 1 new component + 1 route wire: `productSurface.ts`,
  `testProbes.ts`, `causalUnlockInvariant.ts`, `dependencyDirection.ts`, `devOnlyDisclosure.ts`,
  `BuildBoundaryDemoApp.tsx`.
- 6 new test files: `productSurfaceGate.test.ts`, `testProbeSeparation.test.ts`,
  `causalUnlockInvariant.test.ts`, `dependencyDirection.test.ts`, `devOnlyDisclosureBoundary.test.ts`
  — 17 new tests total.
- No RAG/embeddings/dynamicState reference introduced (grep-checked, matching the existing
  `Q: scope discipline` convention).

## What was NOT done, deliberately

- The PHASE 11.11 scene itself was not rebuilt (button count, decline wording, leftover reveal,
  question ordering all unchanged) — directive Section 22 explicitly defers this.
- `ActionContractV2`/`ContractV2State`/`engine.ts` (the tracked, PHASE-11.6R-committed core) were
  not modified — ownership metadata lives in a separate side-table (`ACTION_OWNERSHIP_REGISTRY`),
  not on the shared type, specifically to avoid touching stable, already-tested core files for a
  concern (product-surface classification) that only this one scene currently needs.
- No general cross-repository dependency-direction enforcement was built — only the one rule the
  evidence supports (`src/newlifeplayable11` must not import `testProbes`).
- No player-knowledge-provenance ledger was built (see
  `PRODUCT_TEST_BOUNDARY_ARCHITECTURE_V1.md`'s reasoning).
- No route-lifecycle tagging was added to `App.tsx`'s ~28 existing routes (proposed, not
  implemented — see the same doc's "Route Classification" section).
- FIXTURE_TO_CANON_LEAK and AUTHORING_GAP_MASKED_BY_GENERATOR got no new code — evidence showed
  existing mechanisms already handle them.

## Mistake made and corrected, recorded rather than hidden

The first version of `getDevOnlyDisclosureText` used a default parameter
(`isDev: boolean = import.meta.env.DEV`) rather than a call-site literal `if
(import.meta.env.DEV)`. A real production build (`vite build`) proved this insufficient — the
marker string survived minification/tree-shaking. Caught by actually grepping the build output
(not assumed), fixed, and re-verified against a second real build. Full account in
`SYSTEMIC_GATES_IMPLEMENTATION_V1.md`.

## Verification totals

- `npx tsc --noEmit`: clean.
- `npx vitest run`: 97/97 files, 1452/1452 tests passing (25 pre-existing PHASE 11.11 tests
  unmodified and still green; 17 new tests, all passing).
- `npm run build`: clean; production `dist/` grepped and confirmed free of the dev-only marker.
- A real `NODE_ENV=development` build was also produced and grepped, confirming the marker's
  presence there (proving the absence in production is caused by the compile-time branch, not by
  the string never having existed in the source).
- No temporary build directories left in the working tree.

## Limitations stated honestly

- `composeProductSurface` is not yet called anywhere in the live rendering path — it is proven
  correct against the real exported contracts in test context, but PHASE 11.11's actual button
  composition does not yet route through it. This is intentional (directive Section 22/29), not an
  oversight, but it means the live scene remains contaminated until that wiring happens in a future,
  Strategist-gated phase.
- The causal-unlock invariant's fact tags are human-authored, not derived automatically from
  captured-line text — stated as a scaling limitation in
  `CAUSALITY_COUNTERFACTUAL_INVARIANT_V1.md`, not glossed over.
- The dependency-direction scanner encodes one rule; it is not a general "research must never
  import product" or vice versa enforcement across this repository.
