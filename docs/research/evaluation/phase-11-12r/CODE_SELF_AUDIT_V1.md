# Code Self-Audit V1 — PHASE 11.12R

## Scope discipline

- Modified: `src/newlifeplayable11/NewlifePlayable11App.tsx` (the real composition/render path --
  this phase's entire point), `src/research/action-contract-v2/productSurface.ts` (additive:
  `evaluateProductSurface`/`ProductSurfaceEvaluation`/`ProductSurfaceRejection` added;
  `composeProductSurface`'s existing throwing behavior and all PHASE 11.12 tests against it
  unchanged), `src/research/action-contract-v2/causalUnlockInvariant.ts` (additive:
  `evaluateRealLeftoverStockCausalClaim` + supporting types added; existing
  `validateCausalUnlockClaim`/`REAL_LEFTOVER_STOCK_UNLOCK_CLAIM`/`SYNTHETIC_LEGITIMATE_UNLOCK_CLAIM`
  unchanged), `src/research/action-contract-v2/devOnlyDisclosure.ts` (additive: optional
  `provenanceDetail` second parameter, default `undefined` — does not reintroduce a default for
  `isDev`).
- NOT modified: `playableSceneContracts.ts`, `yoheiSourceEvents.ts`, `capturedYoheiLines.ts`,
  `languageAdapter.ts`, `pendingReplyContracts.ts`, `engine.ts`, `types.ts`, `contracts.ts`,
  `BuildBoundaryDemoApp.tsx`, `dependencyDirection.ts`, `testProbes.ts`, `src/App.tsx`.
- No NLU, RAG, embeddings, new memory system, new conversation engine, or 30-day default
  integration was introduced (grep-checked: no new match for `RAG|embedding|vector database` in
  any file touched this phase; `src/newlife/**`, the default NEW LIFE tree, untouched).
- No product-flow content was rewritten: decline dialogue, accept narration, world-continuity
  text, and the leftover-stock captured line are all byte-identical to PHASE 11.11 — verified by
  `tests/newlifePlayable11RenderedUI.test.tsx`'s explicit byte-identity assertion on the decline
  line, and by not having opened `playableSceneContracts.ts`/`capturedYoheiLines.ts` with a
  write/edit tool this phase.

## Real dependency-direction check (directive Section 15)

`dependencyDirection.ts`'s existing rule (`src/newlifeplayable11/**` must not import `testProbes.ts`)
re-run against the REAL, current tree after this phase's edits:
`tests/dependencyDirection.test.ts`'s "the REAL src/newlifeplayable11 tree currently imports no
test probe" — still PASSING (0 violations) after this phase's edits to `NewlifePlayable11App.tsx`.
`NewlifePlayable11App.tsx`'s new imports this phase are all from `productSurface.ts` and
`causalUnlockInvariant.ts` (the ownership/causality gates themselves, not `testProbes.ts` or any
evaluation/Playwright/fixture module) — confirmed by reading the file's import block.

**Location/naming evaluated, not moved:** `productSurface.ts`/`causalUnlockInvariant.ts` live under
`src/research/action-contract-v2/`. Now that `NewlifePlayable11App.tsx` (a real, player-facing
component) imports them for real, is `research/` a conceptually-backwards location? **Judgment:
not backwards enough to justify moving them.** The entire `action-contract-v2` engine underneath
these gates (`engine.ts`, `types.ts`, `contracts.ts`) is itself still under `research/` and is
exactly what the real scene's entire logic already depends on (`resolveAction`,
`resolvePendingReplyEvent`, `ContractV2State`) — the gates are one more piece of the same
not-yet-promoted-to-canon engine this whole isolated scene is built on, not a mismatched research
artifact bolted onto stable product code. Moving only the two gate files out of `research/` while
leaving `engine.ts`/`types.ts` in place would create a more confusing split (some of the engine
"promoted," some not) without fixing any real dependency-direction problem. Per directive's own
instruction ("do NOT move it only for aesthetics... move only if dependency direction would
otherwise remain conceptually backwards") — not moved.

## QA coverage after separation (directive Section 13)

`tests/testProbeSeparation.test.ts` (PHASE 11.12, unmodified) still passes: "UNKNOWN weather
remains explicitly unknown... invoked purely through the test-probe adapter" — 2/2 tests, re-run
this phase alongside everything else, unaffected by `NewlifePlayable11App.tsx`'s composition
change (it never depended on the UI component). **QA COVERAGE: PRESERVED**, not merely asserted --
the same regression this scene's authors originally used `ASK_WEATHER_SCENE` to cover is exercised
via `invokeTestProbe`/`WEATHER_EPISTEMIC_PROBE`, with zero product-surface exposure, both before
and after this phase's UI changes.

## Route lifecycle classification (directive Section 8 — documentation only, no code enforcement added)

| Route | Classification | Basis |
|---|---|---|
| `?newlifeplayable11=1` | **ISOLATED_PRODUCT_EXPERIMENT** | Player-facing scene mechanics with real narrative/UI, but explicitly not integrated into default NEW LIFE (`src/newlife/**` untouched, per `PLAYABLE_SCENE_SPEC_V1.md`), and not yet Owner-play-validated (no `docs/research/evaluation/phase-11-*` Owner sign-off artifact exists for it). Neither a pure research harness (it has real player UX intent) nor default/shipped product. |
| `?boundarydemo1112=1` | **RESEARCH_DEBUG_HARNESS** | Exists solely to give one compile-time-boundary mechanism a real call site to grep against (`BuildBoundaryDemoApp.tsx`'s own comment states this explicitly). No player-facing narrative purpose; not a product candidate under any reading. |

No global route-lifecycle enum/registry was added to `src/App.tsx` (directive: "do NOT build a
giant lifecycle system... do NOT make a global route refactor"). This table is the minimum explicit
statement directive Section 8 requires, kept at documentation level. **Remaining risk, stated
plainly:** the other ~26 `?newlife*=1` routes in `src/App.tsx` still carry no such classification
anywhere; a future reviewer opening any of them still cannot mechanically tell "isolated route
exists" apart from "ready for player-facing validation" without reading this specific document.

## Semantic Gate Composition — defense in depth (directive Section 17)

No single gate below is described, anywhere in this phase's docs, as sufficient on its own:

```
OWNERSHIP (productSurface.ts: ACTION_OWNERSHIP_REGISTRY)
        |  catches: an action with no player-facing product reason (TEST_AFFORDANCE_LEAK)
        |  KNOWN GAP: a false PRODUCT relabeling with a plausible justification is NOT caught here
        |  (OWNERSHIP_METADATA_NOT_SELF_AUTHENTICATING -- see REAL_PRODUCT_SURFACE_ACTION_AUDIT_V1.md)
        v
SCENE ELIGIBILITY (ActionContractV2.eligibility / Precondition)
        |  catches: an action offered before its authoritative precondition is met
        |  KNOWN GAP: a precondition can be mechanically satisfied while asserting stale content
        |  (this is exactly what happened to ASK_ABOUT_LEFTOVER_STOCK, PHASE 11.11)
        v
PLAYER KNOWLEDGE / CONTEXT (State Admission evidence -- LifeMaterial.concreteContent, this phase's
        |  chosen source; see REAL_CAUSALITY_GATE_AUDIT_V1.md for why)
        |  catches: nothing on its own -- it is the evidence source the next gate reads, not a gate
        v
COUNTERFACTUAL CAUSALITY (causalUnlockInvariant.ts: evaluateRealLeftoverStockCausalClaim)
        |  catches: a claimed "new possibility" whose content was already assertable before its
        |  gating consequence (EVAL_METRIC_LEAK)
        |  KNOWN GAP: depends on human-authored fact tags; does not scale to free-generated
        |  dialogue without either more manual tagging or a new (unbuilt) extraction mechanism
        v
PRODUCT SURFACE (the final accepted/rejected partition actually rendered)
```

Removing any one layer would let a different contamination instance through unchallenged by the
others: OWNERSHIP alone would have let `ASK_ABOUT_LEFTOVER_STOCK` through (it IS legitimately
PRODUCT-owned); COUNTERFACTUAL CAUSALITY alone would not have caught `ASK_WEATHER_SCENE` (its
eligibility/causality properties are trivially fine — it has no "new possibility" claim at all,
it's just an unjustified permanent action). Each layer has a demonstrated, distinct job.

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted new tests this phase: `tests/newlifePlayable11RealPathIntegration.test.ts` (8 tests,
  including the Section-16 ownership-risk adversarial test appended after the initial 7),
  `tests/newlifePlayable11RenderedUI.test.tsx` (6 tests) — 14 new tests, all passing.
- Full suite, final confirmatory run: `npx vitest run` → **99/99 test files, 1466/1466 tests
  passing** (97 files/1452 tests from PHASE 11.12 + 2 new files/14 new tests this phase = 99/1466
  exactly — confirming nothing regressed and nothing was silently skipped).
- `npm run build`: clean. Production `dist/` grepped: `PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a`
  → NOT FOUND (confirms the real, wired-in call site, not only the standalone demo route, is
  compile-time excluded). `playable11-ask-weather` (the button testid string) → still found in the
  bundle as inert metadata (the `ASK_ACTION_UI_META` lookup table entry, never rendered) — recorded
  precisely rather than overclaimed: **absence of a rendered `<button>` in the DOM is proven** (by
  the RTL and Playwright tests); **absence of the bare string from the JS bundle is not**, and was
  never required by the directive (which asks for the button's absence from the "actual rendered
  button list," not for every source string mentioning it to disappear).
- Real-browser mechanical verification: `real_path_visual_verify.mjs` against a real `vite` dev
  server (port 5199, started and cleanly killed this phase) — 11/11 checks PASS, 5 screenshots
  captured under `screenshots/`, evidence recorded in `real_path_visual_evidence.json`.
- No temporary directories or processes left running: dev server process confirmed terminated
  (`netstat` shows no `LISTENING` entry on port 5199 after `taskkill`); no `dist-*` scratch
  directories left in the working tree.
