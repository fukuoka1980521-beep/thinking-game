# Code Self-Audit V1 — PHASE 11.13C

## Scope discipline

Modified (2 files):
- `src/research/action-contract-v2/playableSceneContracts.ts` — `ASK_ABOUT_LEFTOVER_STOCK.
  stateDelta` reverted from creating the response material to `() => []`. Its doc comment
  corrected to state its now-narrow responsibility. No other field, no other action, changed.
- `src/newlifeplayable11/NewlifePlayable11App.tsx` — one new import
  (`commitNpcResponseIfApplicable`), `askQuestion` now calls it as a distinct line after the
  language adapter call. No render branch, no other function, changed.

Added (2 source files, 3 test files):
- `src/research/action-contract-v2/npcResponseCommit.ts` — the response-commit-point module.
- `tests/npcResponseCommitPoint.test.ts` — 3 tests (real 3-point trace + fixture consistency).
- `docs/research/evaluation/phase-11-13c/` — this document set.

Rewritten (superseded content, not merely patched):
- `tests/questionAnswerKnowledgeBoundary.test.ts` — the PHASE 11.13B synthetic-`ActionContractV2`-
  variant approach no longer represents how responses are committed (response state no longer
  lives in any ask contract's `stateDelta` at all), so it was replaced with tests using the real
  `commitNpcResponseIfApplicable`/`commitLeftoverQuestionResponse` seam, per directive Section 14's
  explicit instruction.
- `tests/questionPrerequisiteBoundary.test.ts` — cases C/D updated to dispatch through the real
  two-step orchestration (`resolveAction` then `commitNpcResponseIfApplicable`) instead of
  `resolveAction` alone, which no longer produces the full "answered" state by itself (correctly,
  post-fix). Cases A/B/E/F unaffected (they never depended on the response-commit timing).

NOT modified: `productSurface.ts`, `productFixtureLines.ts`, `causalUnlockInvariant.ts` (the
evaluator's OWN logic is unchanged — it already read from `state.materials`/`state.experienceLog`
generically; only WHICH CODE PATH populates those fields changed), `playable11.css`, `testProbes.ts`,
`dependencyDirection.ts`, `devOnlyDisclosure.ts`, `engine.ts`, `types.ts`, `contracts.ts`,
`pendingReplyContracts.ts`, `src/App.tsx`, `capturedYoheiLines.ts`, `languageAdapter.ts`.

No new LLM/model calls (no new captured-line entries; `LEFTOVER_QUESTION_RESPONSE_SEMANTICS` is
authored metadata about EXISTING captured text, not new generated content).

## A real bug found and fixed during this phase's own work

The first-drafted `UNKNOWN` response text ("洋平は、これが祭りの残りかどうか分からないと答えた")
failed its own consistency test: the naive substring check (by design, no NLU) matched "祭りの残り"
even inside the negated phrase. Caught by the test suite itself, not asserted as correct without
verification; corrected and re-verified. Recorded in `RESPONSE_VARIANT_PRODUCT_HARNESS_V1.md`
rather than silently fixed.

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests (11 files): 83/83 passing.
- Full suite: **102/102 test files, 1493/1493 tests passing** (1488 carried over from PHASE
  11.13B + 5 net new this phase, exact: +2 in `questionAnswerKnowledgeBoundary.test.ts`, +0 net in
  `questionPrerequisiteBoundary.test.ts` [same 6, bodies changed], +3 in
  `npcResponseCommitPoint.test.ts`).
- `npm run build`: clean; production `dist/` re-grepped, dev-only marker still absent.
- Real-browser Playwright regression (`event_order_regression_script.mjs`, port 5204, cleanly
  terminated): **6/6 checks PASS** — rendering unchanged; debug evidence correctly shows the real
  before/after transition; `leftover_question_answered` visible in the Materials evidence block
  once committed; no state-label leakage onto the primary player surface.

## Systemic boundary re-confirmation

`tests/productSurfaceGate.test.ts` (5/5), `tests/testProbeSeparation.test.ts` (2/2),
`tests/dependencyDirection.test.ts` (4/4), `tests/devOnlyDisclosureBoundary.test.ts` (2/2),
`tests/newlifePlayableScene11.test.ts` (25/25), `tests/newlifePlayable11RealPathIntegration.test.ts`
(13/13), `tests/newlifePlayable11RenderedUI.test.tsx` (9/9), `tests/causalUnlockInvariant.test.ts`
(4/4, PHASE 11.12, unaffected) — all re-run this phase, all still passing.

## Unresolved, stated honestly

- `ASK_SALES`/`ASK_FESTIVAL` content redundancy — still not fixed, out of every phase's mandate so
  far.
- The real production scene's `questionAsked`/`answerReceived`/`targetFactKnown` still all become
  true within the same user-visible click-to-response cycle (there is no perceptible delay between
  dispatch and commit in this synchronous UI) — the REAL distinction is now proven at the state/
  code level (Point B vs. Point C in the trace), not as a player-perceptible timing gap, since this
  scene has no asynchronous response delivery to begin with.
- Future live-LLM semantic-validation boundary documented, not implemented (directive's explicit
  scope limit).
