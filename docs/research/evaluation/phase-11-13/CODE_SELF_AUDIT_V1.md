# Code Self-Audit V1 — PHASE 11.13

## Scope discipline

Modified (5 files, all tracked in the `f43d534` checkpoint or newly added):
- `src/research/action-contract-v2/playableSceneContracts.ts` — new `NOT_YET_ASKED_WHAT`/
  `HAS_ASKED_FESTIVAL` preconditions; `ASK_WHAT_HELP_NEEDED`/`ASK_SALES_SCENE` eligibility;
  `PLAYER_ACCEPTS_HELP_MOVE_STOCK` narration + material content (physical reveal);
  `PLAYER_DECLINES_HELP_MOVE_STOCK` narration (Yohei acknowledgment); world-continuity text
  (avoid stating "残り" before it is earned).
- `src/newlifeplayable11/NewlifePlayable11App.tsx` — `buildAskCandidates` generalized to filter by
  each action's own eligibility; language adapter swapped to `createProductLanguageAdapter`; visual
  hierarchy CSS classes applied.
- `src/research/action-contract-v2/productSurface.ts` — one doc-string update
  (`ASK_SALES_SCENE.sceneJustification`), no logic change.
- `tests/newlifePlayable11RealPathIntegration.test.ts`, `tests/newlifePlayable11RenderedUI.test.tsx`
  — updated where product semantics were intentionally corrected (directive Section 21), safety
  assertions (ownership rejection, adversarial injection, debug boundary, decline non-guilt
  language via the unmodified shared contract) preserved unchanged.

Added (2 files):
- `src/research/action-contract-v2/productFixtureLines.ts` — the `SYSTEM_AUTHORED_PRODUCT_FIXTURE`
  layer for the one packet key whose real captured line leaked too early.
- `src/newlifeplayable11/playable11.css` — scoped visual-hierarchy CSS, does not touch the shared
  `situation.css` other scenes depend on.

NOT modified: `engine.ts`, `types.ts`, `contracts.ts`, `pendingReplyContracts.ts` (tracked, shared
core), `yoheiSourceEvents.ts`, `capturedYoheiLines.ts`, `languageAdapter.ts`, `testProbes.ts`,
`dependencyDirection.ts`, `devOnlyDisclosure.ts`, `causalUnlockInvariant.ts`'s core logic,
`BuildBoundaryDemoApp.tsx`, `src/App.tsx`.

No NLU, RAG, embeddings, new memory system, new conversation engine, or default-30-day integration
was introduced (grep-checked; `src/newlife/**` untouched).

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests (8 files): 64/64 passing.
- Full suite: `npx vitest run` → **99/99 test files, 1474/1474 tests passing** (1466 carried over
  from PHASE 11.12R + 8 net new this phase, confirmed exact).
- `npm run build`: clean; production `dist/` re-grepped, dev-only marker still absent.
- Real-browser Playwright visual QA: 17/17 checks PASS (`product_visual_qa_evidence.json`).
- Dev server (port 5201) cleanly terminated; no stray processes or `dist-*` scratch directories
  left in the working tree.

## Judgment calls made, stated plainly

- The physical reveal narration names the towels as festival-*patterned* but deliberately does not
  confirm they are the *leftover/unsold* stock — that confirmation is reserved for the follow-up
  question's answer. This reading of directive Section 6/8 ("PLAYER now sees festival hand towels
  remaining inside" / "PLAYER legitimately knows it") was resolved in favor of keeping the existing,
  tested, fact-tag-based causal invariant mechanism working correctly (a design that split "sees
  towels" from "confirmed as leftover" into two distinct facts) rather than reinterpreting the
  mechanism itself. Recorded here so the Strategist can independently judge whether this reading is
  correct.
- `ASK_FESTIVAL_SCENE` was deliberately left re-askable (no one-shot restriction) — the directive
  only explicitly requires ASK_WHAT to be one-shot (Section 10's literal wording); ordinary small
  talk being repeatable was treated as within "conversation that remains independently valid may
  continue" (Section 13).
- `ASK_SALES_SCENE`, once unlocked, was also left re-askable (same reasoning).

## Unresolved product defects, stated honestly

- The visual hierarchy (Section 18) is CSS-only (border weight/style, opacity, font-weight) — no
  icon system, no layout restructuring. Whether this is sufficient "modest visual priority" is a
  product judgment the Strategist should make from the screenshots, not a claim this document
  makes.
- `ASK_FESTIVAL`/`ASK_SALES` remaining permanently re-askable after being answered once could still
  read as mildly FAQ-like on a long revisit, though directive Section 13 explicitly sanctions this
  ("conversation that remains independently valid may continue").
- The scene still has no mechanism preventing a player from asking `ASK_FESTIVAL` an unlimited
  number of times in a row and receiving the identical answer verbatim each time — not flagged by
  the directive as a defect to fix this phase, but noted for completeness.
