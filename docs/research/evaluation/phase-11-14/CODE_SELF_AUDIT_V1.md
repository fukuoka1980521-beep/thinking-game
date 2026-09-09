# Code Self-Audit V1 — PHASE 11.14

## Scope discipline

Modified (5 files):
- `src/research/action-contract-v2/playableSceneContracts.ts` — opening/accept/decline narration
  text; new `NOT_YET_ASKED_FESTIVAL` (Dimension 1: already-asked, Actor Experience); new
  `QuestionTarget`/`RESPONSE_RESOLVES_SIMPLE_TARGETS`/`questionTargetKnownMaterialId`/
  `questionTargetUnresolved` (Dimension 2: target-resolved-by-another-response, State Admission);
  new `LEFTOVER_TARGET_UNRESOLVED` (reuses the existing three-outcome material system); updated
  eligibility for `ASK_FESTIVAL_SCENE`, `ASK_SALES_SCENE`, `ASK_ABOUT_LEFTOVER_STOCK`.
- `src/research/action-contract-v2/npcResponseCommit.ts` — new `FESTIVAL_RESPONSE_RESOLVES_
  LEFTOVER` registry, `questionTargetKnownMaterial`, `commitSimpleTargetsIfApplicable`; extended
  `RESPONSE_COMMIT_HANDLERS` with `ASK_FESTIVAL_SCENE` (resolves 2 targets in 1 commit) and
  `ASK_SALES_SCENE` handlers.
- `src/research/action-contract-v2/productFixtureLines.ts` — one word-register text change
  (`くれるか` → `くれる？`) plus an updated `reason` field documenting it.
- `src/newlifeplayable11/NewlifePlayable11App.tsx` — pre-scene relationship-grounding clause;
  `begin()` de-duplicated to single-source `state.narration` (removed a second, independently
  hand-typed copy of the opening line).
- No changes to: `causalUnlockInvariant.ts`, `productSurface.ts`, `capturedYoheiLines.ts`
  (historical Vertex capture, untouched), `engine.ts`, `types.ts`, `languageAdapter.ts`,
  `pendingReplyContracts.ts`, `yoheiSourceEvents.ts`, `devOnlyDisclosure.ts`, `playable11.css`.

Updated tests (2 files):
- `tests/newlifePlayable11RealPathIntegration.test.ts` — new `askInFull` helper (mirrors the real
  app's resolveAction + response-commit pipeline, not just half of it); rewrote 2 tests whose
  premises the repair intentionally invalidates (ASK_SALES becoming available after asking
  festival was exactly the defect being fixed); added 3 new tests for the multiple-target-
  resolution, PATH D, and PATH C scenarios directive Section 17 requires.
- `tests/newlifePlayable11RenderedUI.test.tsx` — rewrote the ASK_SALES test to assert the corrected
  behavior; added a new test for festival-before-accept leftover suppression; updated 2 decline-
  text assertions for the new polite-register line.

No changes to any other test file (`questionPrerequisiteBoundary.test.ts`,
`questionAnswerKnowledgeBoundary.test.ts`, `structuredResponseSemantics.test.ts`,
`npcResponseCommitPoint.test.ts`, `zeroProseAuthorityAudit.test.ts`, `productSurfaceGate.test.ts`,
`newlifePlayableScene11.test.ts` all still pass unmodified — verified by running them, not assumed).

No new LLM/model calls. No new runtime mechanism (NLU/RAG/embeddings/conversation engine) —
target resolution is two small, explicit, human-authored registries keyed by action id / material
id, read by plain array membership checks, exactly the same idiom PHASE 11.13D/E already
established for response outcomes and reveal facts.

## A design choice made explicit, not left implicit

`ASK_SALES_SCENE` was NOT deleted (directive Section 11 offered this as an option: "remove the
now-redundant sales question"). It was kept, wired into the same general target-resolution
mechanism as everything else, and made unreachable-under-current-content rather than
unreachable-by-construction. Reasoning: the mechanism this phase built is meant to be
demonstrably general (Section 9/10's explicit ask), and `ASK_SALES_SCENE` is real, useful evidence
that the mechanism correctly suppresses a real redundant question rather than one contrived for a
test. If a future content revision changes the festival answer to NOT mention sales, `ASK_SALES_
SCENE` becomes reachable again automatically, with no code change — judged better than deleting a
contract that would need to be re-authored from scratch in that case.

## Verification totals

- `npx tsc --noEmit`: clean (one pre-existing unused-import error was introduced and fixed during
  this phase's own work — see below — not left in the final state).
- Targeted tests (9 files): 119/119 passing.
- Full suite: **104/104 test files, 1541/1541 tests passing** (1537 carried over from PHASE
  11.13E + 4 net new this phase: 3 in `newlifePlayable11RealPathIntegration.test.ts`, 1 in
  `newlifePlayable11RenderedUI.test.tsx`).
- `npm run build`: clean.
- Dev-only Vertex disclosure boundary re-verified: the actual gated sentence ("洋平のセリフは...")
  is absent from `dist/`. (An earlier broad grep for the provenance project-id string DID match
  `dist/` — that string is `capturedYoheiLines.ts`'s `PROVENANCE` object, which is legitimately
  unconditional runtime data consumed by the real captured-line replay, not the dev-only-gated
  disclosure sentence; re-checked with a narrower, correct pattern. Recorded here so the false
  alarm and its resolution are both on the record, not silently dropped.)
- Real-browser Playwright regression (`product_visual_qa_script.mjs`, port 5211, two independent
  sessions): **16/16 checks PASS.**

## A real mistake caught and fixed during this phase's own work

First draft of the test-file edits removed the `ASK_SALES_SCENE` symbol usage from
`newlifePlayable11RealPathIntegration.test.ts` but left the now-unused import in place, which
`tsc --noEmit` correctly flagged (`TS6133`) before the build step. Fixed by removing the dead
import. Caught by the verification step itself, not asserted as clean without running it.

## Unresolved, stated honestly

- The ask-question button labels (「祭りどうだった？」 etc.) and Yohei's mid-conversation dialogue
  tags were reviewed for naturalness (directive Section 14) and judged already acceptable — see
  `NATURAL_DIALOGUE_REPAIR_V1.md` sections 6/7 for the explicit reasoning, not a silent skip.
  `ASK_SALES_SCENE`'s own `ACTION_OWNERSHIP_REGISTRY` entry text (`productSurface.ts`) still
  describes it as "gated by its own SCENE ELIGIBILITY precondition, HAS_ASKED_FESTIVAL" — still
  accurate (that gate is unchanged, only strengthened by the added target-resolution AND
  condition) — no edit was needed there.
- No product-content work beyond what directive Section 1-6/14 explicitly required was performed
  (no change to `ASK_WEATHER_SCENE`'s content, no new scene branches, no art/CSS changes).
- Owner replay itself is a recommendation, not something this phase performs — see the final
  output message's verdict fields.
