# Code Self-Audit V1 — PHASE 11.13A

## Scope discipline

Modified (2 files):
- `src/research/action-contract-v2/causalUnlockInvariant.ts` — corrected a stale/misleading
  comment block on `evaluateRealLeftoverStockCausalClaim` (documented the PHASE 11.12R-era claim
  it made that is no longer true post-PHASE-11.13-repair); added `evaluateLeftoverQuestionPrerequisite`
  and `QuestionPrerequisiteEvaluation` (new, narrowly-scoped, reusing State Admission + Actor
  Experience only). `evaluateRealLeftoverStockCausalClaim`'s own logic is byte-unchanged.
- `src/newlifeplayable11/NewlifePlayable11App.tsx` — one new import, one new computed value
  (`leftoverQuestionPrerequisite`), one new debug-panel evidence block. `buildAskCandidates`,
  `applyCausalityGate`, and every player-facing render branch are unchanged.

Added (2 files):
- `tests/questionPrerequisiteBoundary.test.ts` — 6 adversarial tests (directive Section 12 A-F).
- `docs/research/evaluation/phase-11-13a/` — this document set.

NOT modified: `playableSceneContracts.ts`, `productSurface.ts`, `productFixtureLines.ts`,
`playable11.css`, `testProbes.ts`, `dependencyDirection.ts`, `devOnlyDisclosure.ts`,
`BuildBoundaryDemoApp.tsx`, `src/App.tsx`, `engine.ts`, `types.ts`, `contracts.ts`,
`pendingReplyContracts.ts` — no product content, no rendering, no gating BEHAVIOR changed.

No new LLM/model calls were made (directive's explicit prohibition, re-verified: no new entries in
`capturedYoheiLines.ts`, no new fixture text in `productFixtureLines.ts`, no network-calling code
touched).

## Not a rename-only fix (directive Section 9)

Verified precisely, not asserted:
- **State write:** unchanged (`admitMaterials`, `resolveAction`'s `experienceLog` write — both
  untouched engine functions).
- **Eligibility predicate:** `applyCausalityGate`/`evaluateRealLeftoverStockCausalClaim` — logic
  unchanged; confirmed the button-gating BEHAVIOR is identical before/after this phase's edits
  (real-browser regression: `semantic_boundary_regression_evidence.json`, initial/post-accept
  button sets identical to PHASE 11.13's own screenshots).
- **Counterfactual input:** the NEW function reads the SAME `leftover_stock_moved` material's
  `concreteContent`, PLUS a second, genuinely new input source (`experienceLog`, for the answer-
  dispatch check) that did not previously feed into ANY leftover-question-related computation.
- **Transcript meaning:** `LEFTOVER_QUESTION_SEMANTIC_TRACE_V1.md` replaces the ambiguous "newly
  learned fact" phrasing from PHASE 11.13's packet with an explicit 4-state, dual-source account.

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests (9 files incl. the new one): 70/70 passing.
- Full suite: **100/100 test files, 1480/1480 tests passing** (1474 carried over from PHASE 11.13
  + 6 new this phase, exact).
- `npm run build`: clean; production `dist/` re-grepped, dev-only marker still absent.
- Real-browser Playwright regression (`semantic_boundary_regression_script.mjs`, port 5202,
  cleanly terminated): **8/8 checks PASS** — button rendering unchanged; new debug evidence present
  and correctly reflects the corrected prerequisite/target model; no knowledge-badge/evidence-label
  text leaked onto the primary player surface.

## Systemic boundary re-confirmation (directive Section 15)

`tests/productSurfaceGate.test.ts` (5/5), `tests/testProbeSeparation.test.ts` (2/2),
`tests/dependencyDirection.test.ts` (4/4), `tests/devOnlyDisclosureBoundary.test.ts` (2/2) — all
re-run this phase, all still passing, unaffected by this phase's edits (none of the files they test
were touched).

## Unresolved, stated honestly

- `ASK_SALES`/`ASK_FESTIVAL` content redundancy (`CONTEXTUAL_QUESTION_AUDIT_V1.md`) — recorded,
  not fixed; out of this phase's mandate.
- `ASK_ABOUT_LEFTOVER_STOCK` remains re-askable after being answered — a deliberate, unchanged
  design choice (matches `ASK_FESTIVAL`/`ASK_SALES`'s own re-askability); the corrected model makes
  this explicit (`reason` field) rather than silently ambiguous, but does not remove the button.
