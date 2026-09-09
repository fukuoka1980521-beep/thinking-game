# Systemic Gates Implementation V1 — PHASE 11.12

## Candidates considered (directive Section 19) and selection

| Candidate | Built? | Why |
|---|---|---|
| A. ProductSurface action registry separate from TestProbe registry | YES | Unique responsibility: catches TEST_AFFORDANCE_LEAK. `productSurface.ts` + `testProbes.ts`. |
| B. Dependency-direction assertion | YES | Unique responsibility: catches DEPENDENCY_DIRECTION_LEAK before it reaches A's runtime check. `dependencyDirection.ts`. |
| C. Debug/research build exclusion | YES | Unique responsibility: catches DEBUG_UI_LEAK, which A/B do not (they gate actions, not narration strings). `devOnlyDisclosure.ts` + `BuildBoundaryDemoApp.tsx`. |
| D. Product-visible action requires semantic-purpose metadata/source | Folded into A | Not independently useful without A's enforcement — implemented as A's `sceneJustification` field, not a separate mechanism. |
| E. Counterfactual causal-eligibility test | YES | Unique responsibility: catches EVAL_METRIC_LEAK, which A/B/C do not (ownership can be correct while content is stale). `causalUnlockInvariant.ts`. |
| F. Fixture/canon authority separation | NOT built (new) | Evidence shows the existing `ISOLATED_SCENE_FIXTURE:` convention already handles the one demonstrated instance correctly. See `CONTAMINATION_TAXONOMY_V1.md`. |
| G. Authoring sufficiency validation | NOT built (new) | Already exists (`authoringSufficiencyGate`) and already verified working (`AUTHORING_SOURCE_EVENT_AUDIT_V1.md`). Reused, not reimplemented. |

## A — Product Surface ownership gate

File: `src/research/action-contract-v2/productSurface.ts`. `ACTION_OWNERSHIP_REGISTRY` classifies
all 5 PHASE 11.11 `ActionContractV2` actions (4 PRODUCT, 1 QA). `composeProductSurface()` fails
closed for unclassified actions and rejects non-PRODUCT/unjustified ones.

**Proof it is not decorative:** `tests/productSurfaceGate.test.ts` calls it with the REAL
`ASK_WEATHER_SCENE` import (not a mock/stand-in) and confirms a thrown `ProductSurfaceViolation`
citing its actual `QA` ownership — 5/5 tests passing.

## B — Dependency-direction scanner

File: `src/research/action-contract-v2/dependencyDirection.ts`. Pure function over
`{path, content}[]`. One rule so far: `src/newlifeplayable11/**` (excluding `tests/**`) must not
import `testProbes.ts`.

**Proof:** `tests/dependencyDirection.test.ts`, 4/4 passing — (1) the real
`src/newlifeplayable11` tree is currently clean (0 violations), (2) a synthetic in-memory fixture
importing `testProbes` IS detected (no real violating file was ever written to the repository to
prove this), (3) a test file doing the same import is exempt, (4) a file outside the scoped
directory is not checked at all.

## C — Build/mode boundary

Files: `src/research/action-contract-v2/devOnlyDisclosure.ts`,
`src/research/action-contract-v2/BuildBoundaryDemoApp.tsx`, plus one additive route registration in
`src/App.tsx` (`?boundarydemo1112=1`, following the exact existing route-registration convention;
`NewlifePlayable11App.tsx` was NOT touched).

**A real mistake was made and corrected here, recorded rather than hidden:** the first version of
`getDevOnlyDisclosureText` took `isDev: boolean = import.meta.env.DEV` as a *default parameter*. A
real `vite build` proved this wrong — Vite correctly replaced the `import.meta.env.DEV` literal with
`false`, but Rollup's dead-code elimination did not fold the call through a parameter default, and
`grep -rl "PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a" dist-prod-check/` found the marker string
present in the production bundle. Fixed by requiring `isDev` as a mandatory argument and gating the
call site itself with a literal `if (import.meta.env.DEV) { ... }` in `BuildBoundaryDemoApp.tsx` —
the exact idiom Vite's own documentation uses.

**Build verification (directive Section 27), both builds actually run, output actually grepped:**

```
$ npm run build                              # standard production build (dist/)
$ grep -rl "PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a" dist/
NOT FOUND                                    # confirmed: marker absent from the real shipping bundle

$ NODE_ENV=development npx vite build --outDir dist-dev-check2 --mode development
$ grep -rl "PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a" dist-dev-check2/
dist-dev-check2/assets/index-CQiDuyFC.js     # confirmed: marker present in a real dev-mode build
```

**Second finding, recorded honestly:** `vite build --mode development` **alone** (without also
setting `NODE_ENV=development` in the shell) did NOT flip `import.meta.env.DEV` to `true` in this
Vite version (5.4.21) for the `build` command — the resulting bundle was byte-identical to the
default production build. `import.meta.env.DEV`/`PROD` for `vite build` in this setup follow
`process.env.NODE_ENV`, not the `--mode` flag alone. This is a genuine, mechanically-verified nuance
of this repository's actual build behavior, not something assumed from Vite's general
documentation — recorded here so a future phase relying on `--mode` alone does not repeat the same
false assumption this phase initially made with the default-parameter mistake.

All temporary verification build directories (`dist-prod-check/`, `dist-dev-check/`,
`dist-dev-check2/`, and the real `dist/` from `npm run build`) were deleted after grepping; none
were committed.

## E — Counterfactual causal-unlock invariant

File: `src/research/action-contract-v2/causalUnlockInvariant.ts`. See
`CAUSALITY_COUNTERFACTUAL_INVARIANT_V1.md` for the full mechanism and the real-defect reproduction.
`tests/causalUnlockInvariant.test.ts`, 4/4 passing.

## Full verification totals (this phase's changes, against the full existing suite)

- `npx tsc --noEmit`: clean, 0 errors.
- `npx vitest run`: **97/97 test files passing, 1452/1452 tests passing** (including all 25
  pre-existing PHASE 11.11 tests, unmodified, and 5 new test files / 17 new tests this phase).
- `npm run build`: clean, succeeds, `dist/` produced normally.
- No existing file's behavior was changed — the only edits to a previously-existing file are the
  additive route registration in `src/App.tsx` (4 small additions: 1 import, 1 `View` union member,
  1 URL-param check, 1 render branch — same pattern as every other route in that file, verified by
  reading the diff).
