# Code Self-Audit V1 — PHASE 11.13D

## Scope discipline

Modified (2 files):
- `src/research/action-contract-v2/playableSceneContracts.ts` — replaced the single
  `LEFTOVER_QUESTION_ANSWER_MATERIAL_ID` export with `StructuredResponseOutcome` (type) and
  `LEFTOVER_RESPONSE_MATERIAL_IDS` (3 distinct ids). No action contract's eligibility/narration
  changed.
- `src/research/action-contract-v2/causalUnlockInvariant.ts` — `evaluateLeftoverQuestionPrerequisite`
  now reads `targetStatus`/`answerReceived` via structural material-id lookup instead of
  substring-searching response `concreteContent`. Added `TargetFactStatus` type and `targetStatus`
  field; `targetFactKnown` kept, redefined precisely as `targetStatus === "KNOWN_TRUE"`. The
  reveal-leak check (`revealAlreadyLeaksTarget`, on `leftover_stock_moved` only) is UNCHANGED —
  explicitly in scope per directive Section 13's own carve-out.

Rewritten (1 file, superseded content):
- `src/research/action-contract-v2/npcResponseCommit.ts` — `LeftoverQuestionResponseSemantic`
  renamed/generalized to the imported `StructuredResponseOutcome`; response materials now use
  distinct structural ids per outcome instead of one shared id with content-dependent meaning;
  added a `DENY` outcome; `concreteContent` is now explicitly documented as display-only and may
  freely contain the target phrase in every branch.

Added (1 new test file, updates to 3 existing):
- `tests/structuredResponseSemantics.test.ts` — 18 tests: full CONFIRM/DENY/UNKNOWN/NO_RESPONSE
  truth table, the mandatory DENY-with-literal-phrase adversarial case, prose-mutation invariant
  (fixed-semantic/varied-prose and varied-semantic/similar-prose), LLM-string-cannot-mutate-state
  structural proof.
- `tests/questionAnswerKnowledgeBoundary.test.ts`, `tests/questionPrerequisiteBoundary.test.ts`,
  `tests/npcResponseCommitPoint.test.ts` — updated references from the old single material id /
  semantic name to the new structural ids and `CONFIRM`/`DENY`/`UNKNOWN` vocabulary; one new DENY
  test added to `questionAnswerKnowledgeBoundary.test.ts`.

NOT modified: `NewlifePlayable11App.tsx` (the debug panel already `JSON.stringify`s the whole
evaluation object, so the new `targetStatus` field appears automatically with zero JSX change),
`productSurface.ts`, `productFixtureLines.ts`, `playable11.css`, `testProbes.ts`,
`dependencyDirection.ts`, `devOnlyDisclosure.ts`, `engine.ts`, `types.ts`, `contracts.ts`,
`pendingReplyContracts.ts`, `capturedYoheiLines.ts`, `languageAdapter.ts`, `src/App.tsx`.

No new LLM/model calls (no new captured-line entries; all new response outcomes are
authored/synthetic text for structural-authority testing, never claimed as real captures).

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests (12 files): 102/102 passing.
- Full suite: **103/103 test files, 1512/1512 tests passing** (1493 carried over from PHASE
  11.13C + 19 net new this phase, exact: +18 in `structuredResponseSemantics.test.ts`, +1 in
  `questionAnswerKnowledgeBoundary.test.ts`).
- `npm run build`: clean; production `dist/` re-grepped, dev-only marker still absent.
- Real-browser Playwright regression (`structured_response_regression_script.mjs`, port 5205,
  cleanly terminated): **6/6 checks PASS** — rendering unchanged; debug evidence correctly shows
  `targetStatus` transitioning `UNRESOLVED -> KNOWN_TRUE` across the real CONFIRM path; the new
  structurally-named material visible in evidence; no state-label leakage onto the primary player
  surface.

## Systemic boundary re-confirmation

`tests/productSurfaceGate.test.ts` (5/5), `tests/testProbeSeparation.test.ts` (2/2),
`tests/dependencyDirection.test.ts` (4/4), `tests/devOnlyDisclosureBoundary.test.ts` (2/2),
`tests/newlifePlayableScene11.test.ts` (25/25), `tests/newlifePlayable11RealPathIntegration.test.ts`
(13/13), `tests/newlifePlayable11RenderedUI.test.tsx` (9/9), `tests/causalUnlockInvariant.test.ts`
(4/4, PHASE 11.12, unaffected — the static claim data it tests documents history, untouched) — all
re-run this phase, all still passing.

## Unresolved, stated honestly

- `ASK_SALES`/`ASK_FESTIVAL` content redundancy — still not fixed, out of every phase's mandate so
  far.
- `evaluateRealLeftoverStockCausalClaim`'s and `evaluateLeftoverQuestionPrerequisite`'s
  reveal-leak checks remain substring-based (on the static, author-controlled reveal text only) —
  an accepted, documented, in-scope-per-directive residual, not a gap introduced by this phase.
- The real production scene only ever reaches the CONFIRM outcome; DENY/UNKNOWN are proven through
  the real commit function directly but have no live dialogue branch reaching them (no such branch
  was added, per directive's explicit "do not change Product content" boundary for this phase).
- No belief-tracking (NPC-claimed vs. world-true) engine was built, per directive's own explicit
  scope limit; documented as a simplification specific to this scene.
