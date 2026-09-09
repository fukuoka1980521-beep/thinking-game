# Code Self-Audit V1 — PHASE 11.13B

## Scope discipline

Modified (2 files):
- `src/research/action-contract-v2/playableSceneContracts.ts` — `ASK_ABOUT_LEFTOVER_STOCK` gained
  a real `stateDelta` (previously `() => []`) creating the new `leftover_question_answered`
  material, exported as `LEFTOVER_QUESTION_ANSWER_MATERIAL_ID`. No other field, no other action,
  changed.
- `src/research/action-contract-v2/causalUnlockInvariant.ts` — `evaluateLeftoverQuestionPrerequisite`
  (added in PHASE 11.13A) gained `questionAsked`/`answerReceived` fields and now reads
  `targetFactKnown` from the new material instead of the ask-only experience entry. Stale comment
  block corrected. `evaluateRealLeftoverStockCausalClaim` (the actual button-rendering gate) is
  byte-unchanged.

Added (2 files):
- `tests/questionAnswerKnowledgeBoundary.test.ts` — 8 tests, including 2 synthetic-but-real-engine-
  dispatched falsification variants (directive Section 9/10).
- `docs/research/evaluation/phase-11-13b/` — this document set.

NOT modified: `NewlifePlayable11App.tsx`'s render logic (the debug panel already displayed the
whole `leftoverQuestionPrerequisite` object via `JSON.stringify` since PHASE 11.13A, so the new
fields appear automatically with zero JSX change), `productSurface.ts`, `productFixtureLines.ts`,
`playable11.css`, `testProbes.ts`, `dependencyDirection.ts`, `devOnlyDisclosure.ts`, `engine.ts`,
`types.ts`, `contracts.ts`, `pendingReplyContracts.ts`, `src/App.tsx`.

No new LLM/model calls (no new `capturedYoheiLines.ts` entries, no new fixture text, no network
code touched).

## Not a rename-only fix (re-verified per directive Section 9, same discipline as PHASE 11.13A)

- **State write:** genuinely new — `ASK_ABOUT_LEFTOVER_STOCK.stateDelta` previously returned `[]`;
  it now creates a real `LifeMaterial`, admitted through the unmodified `admitMaterials`/State
  Admission pipeline. This is a real, mechanical change, not a label change.
- **Eligibility predicate:** `applyCausalityGate`/`evaluateRealLeftoverStockCausalClaim`
  (button-rendering gate) unchanged; confirmed via real-browser regression that rendering is
  byte-identical before/after.
- **Counterfactual input:** the corrected function now reads from a genuinely different
  authoritative source (`leftover_question_answered` material) than PHASE 11.13A's version did
  (the ask-only `experienceLog` entry) — a real input change, not cosmetic.
- **Transcript meaning:** `LEFTOVER_ANSWER_AUTHORITY_TRACE_V1.md` traces the exact real dispatch
  order and quotes the exact `engine.ts` code establishing when the experience write happens
  relative to the language adapter call.

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests (10 files): 78/78 passing.
- Full suite: **101/101 test files, 1488/1488 tests passing** (1480 carried over from PHASE
  11.13A + 8 new this phase, exact).
- `npm run build`: clean; dev-only marker re-confirmed absent from `dist/`.
- Real-browser Playwright regression (`answer_authority_regression_script.mjs`, port 5203,
  cleanly terminated): **9/9 checks PASS** — rendering unchanged; new debug evidence correctly
  shows `questionAsked`/`answerReceived`/`targetFactKnown` transitioning from all-false to
  all-true exactly across the real ASK dispatch; no state-label text leaked onto the primary
  player surface.

## Systemic boundary re-confirmation

`tests/productSurfaceGate.test.ts` (5/5), `tests/testProbeSeparation.test.ts` (2/2),
`tests/dependencyDirection.test.ts` (4/4), `tests/devOnlyDisclosureBoundary.test.ts` (2/2),
`tests/newlifePlayableScene11.test.ts` (25/25), `tests/newlifePlayable11RealPathIntegration.test.ts`
(13/13), `tests/newlifePlayable11RenderedUI.test.tsx` (9/9), `tests/questionPrerequisiteBoundary.test.ts`
(6/6, PHASE 11.13A, unaffected — additive fields do not break existing property assertions) — all
re-run this phase, all still passing.

## Unresolved, stated honestly

- `ASK_SALES`/`ASK_FESTIVAL` content redundancy (recorded in PHASE 11.13A, restated in
  `CONTEXTUAL_ANSWER_AUTHORITY_AUDIT_V1.md`) — still not fixed; out of this phase's mandate.
- The real production scene's `questionAsked`/`answerReceived`/`targetFactKnown` still transition
  atomically together (single real answer path) — the falsification of their independence relies
  on synthetic test-only contract variants, not on an alternate real dialogue branch (directive
  explicitly forbids adding one this phase: "do not change Product content").
