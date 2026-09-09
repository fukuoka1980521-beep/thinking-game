# Code Self-Audit V1 — PHASE 11.13E

## Scope discipline

Modified (2 files):
- `src/research/action-contract-v2/playableSceneContracts.ts` — added
  `REVEAL_MATERIAL_ASSERTED_FACTS` (structural fact registry for the reveal material). No action
  contract's eligibility/narration changed.
- `src/research/action-contract-v2/causalUnlockInvariant.ts` — both remaining prose-authority call
  sites replaced with `structuredFactsAssertedByRevealMaterial` (structural, exported for direct
  testability); added `"CONFLICTING"` to `TargetFactStatus`; added conflict detection (count of
  simultaneously-present outcome ids) to `evaluateLeftoverQuestionPrerequisite`; deprecated (not
  deleted) `factsAssertedByMaterialConcreteContent`, now called from nowhere in `src/`
  (regression-tested).

Updated (1 file, corrected a flawed test caught during this phase's own work):
- `tests/questionPrerequisiteBoundary.test.ts` — case F (PHASE 11.13A) asserted a text-mislabel
  attack that is now structurally impossible; rewritten to state this precisely, plus a new case
  F' documenting exactly why an "unregistered reveal id" test doesn't reach the code path it
  initially claimed to (the lookup is by a single fixed id, so an unregistered id means "no reveal
  found" not "leaked reveal") — corrected rather than left misleading.

Added (1 new test file):
- `tests/zeroProseAuthorityAudit.test.ts` — 24 tests: reveal prose-mutation invariant (8),
  response-outcome lifetime/conflict detection (7), full truth table re-verification (6), and a
  grep-based regression guard proving zero remaining call sites for the deprecated substring
  function (2), plus a direct fail-closed test for the registry default (1).

NOT modified: `npcResponseCommit.ts`, `NewlifePlayable11App.tsx` (debug panel already
`JSON.stringify`s the whole evaluation object; `targetStatus`'s new `"CONFLICTING"` value appears
automatically), `productSurface.ts`, `productFixtureLines.ts`, `playable11.css`, `testProbes.ts`,
`dependencyDirection.ts`, `devOnlyDisclosure.ts`, `engine.ts`, `types.ts`, `contracts.ts`,
`pendingReplyContracts.ts`, `capturedYoheiLines.ts`, `languageAdapter.ts`, `src/App.tsx`.

No new LLM/model calls.

## A real design flaw found and fixed during this phase's own work

My first draft of the "unregistered reveal id fails closed" test asserted the WRONG outcome
(`targetFactKnown: true, eligible: false`) — it failed on first run. Root cause: changing the
reveal material's `id` also breaks the EARLIER `prerequisiteSatisfied` lookup (which searches for
that exact same fixed id), so the state becomes "no reveal found" rather than "reveal found but
registered as leaking." Caught by the test suite itself, not asserted as correct without
verification. Fixed by (a) correcting the test to document this precisely, and (b) exporting
`structuredFactsAssertedByRevealMaterial` so the fail-closed default could be tested directly and
honestly, in isolation from the (structurally unreachable through this path) evaluator-level
scenario. Recorded here rather than smoothed over.

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests (13 files): 127/127 passing.
- Full suite: **104/104 test files, 1537/1537 tests passing** (1512 carried over from PHASE
  11.13D + 25 net new this phase, exact: +24 in `zeroProseAuthorityAudit.test.ts`, +1 in
  `questionPrerequisiteBoundary.test.ts`).
- `npm run build`: clean; production `dist/` re-grepped, dev-only marker still absent.
- Real-browser Playwright regression (`zero_prose_authority_regression_script.mjs`, port 5206,
  cleanly terminated): **6/6 checks PASS** — rendering unchanged; debug evidence correctly shows
  `targetStatus` transitioning `UNRESOLVED -> KNOWN_TRUE`; no `CONFLICTING` on the real
  single-outcome path; no state-label leakage onto the primary player surface.

## PRODUCT_AUTHORITATIVE prose-parser count

**0.** Full grep across `NewlifePlayable11App.tsx` and `src/research/action-contract-v2/*.ts` for
`.includes(`/`.match(`/`.test(`/`startsWith`/`endsWith`: the only remaining hits are (1) the
deprecated, unused function's own definition (2 lines, confirmed zero call sites), (2) one
`.includes()` call operating on a STRUCTURED fact-tag ARRAY (not prose) returned by
`structuredFactsAssertedByRevealMaterial`, (3) `dependencyDirection.ts`'s regex over file
paths/source code (unrelated static-analysis tooling, not NPC/game content), (4)
`languageAdapter.ts`'s `startsWith` over a self-generated control string (classified
`SAFE_DISPLAY_ONLY` in PHASE 11.13D, unchanged).

## Systemic boundary re-confirmation

`tests/productSurfaceGate.test.ts` (5/5), `tests/testProbeSeparation.test.ts` (2/2),
`tests/dependencyDirection.test.ts` (4/4), `tests/devOnlyDisclosureBoundary.test.ts` (2/2),
`tests/newlifePlayableScene11.test.ts` (25/25), `tests/newlifePlayable11RealPathIntegration.test.ts`
(13/13), `tests/newlifePlayable11RenderedUI.test.tsx` (9/9), `tests/causalUnlockInvariant.test.ts`
(4/4), `tests/npcResponseCommitPoint.test.ts` (3/3), `tests/structuredResponseSemantics.test.ts`
(18/18), `tests/questionAnswerKnowledgeBoundary.test.ts` (11/11) — all re-run this phase, all still
passing.

## Unresolved, stated honestly

- `ASK_SALES`/`ASK_FESTIVAL` content redundancy — still not fixed, out of every phase's mandate so
  far.
- The fail-closed default in `structuredFactsAssertedByRevealMaterial` is defensive code, not
  reachable through either real evaluator's current call site (both fix the lookup id before
  reaching the registry) — directly unit-tested in isolation, not exercised by the live scene.
- `CONFLICTING` is proven through the real commit function but not reachable through the live
  scene's one-fixed-outcome dialogue (documented, not a gap to close now).
- No Product content, dialogue wording, button layout, or fun/content design was touched, per
  directive's explicit scope limit.
