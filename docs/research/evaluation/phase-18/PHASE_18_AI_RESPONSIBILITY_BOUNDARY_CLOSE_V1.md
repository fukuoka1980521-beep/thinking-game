# PHASE_18_NEW_LIFE_AI_RESPONSIBILITY_BOUNDARY_V1 — CLOSE

Baseline: `52ae0ea` / `79c74ec` (STAGE A completion). This is STAGE B of
`PHASE_17_COMPLETION_THEN_PHASE_18_AI_BOUNDARY_V1`.

## Architecture before / after

**Before this stage (and, it turns out, largely already true since PHASE_12-16)**: canonical state
lives entirely in `CoreState` (`types.ts`), mutated only by named `engine.ts` functions gated on
structural UI actions; AI replies flow through a typed context packet
(`dialogue/types.ts`'s `NpcAiContext`) into a minimal text-only envelope
(`NpcReplyEnvelope`), stored verbatim as display text and never parsed back into state. This stage
traced that architecture exhaustively (`docs/product/NEWLIFE_AI_RESPONSIBILITY_BOUNDARY_V1.md`)
rather than assuming it and found it already satisfies nearly every invariant the directive names.

**What actually changed this stage**:
1. **Observability** (the one real gap): `dialogue/devObservability.ts` (new) + a dev-only panel
   in `NewlifeCoreApp.tsx` now make live-vs-fallback, latency, and failure reason visible during
   development -- previously invisible even to the developer.
2. **A new, explicit invariant test suite**: `tests/newlifecoreAiResponsibilityBoundary.test.ts`
   (8 tests, new) turns "the architecture looks correct on reading" into "a regression here fails
   CI" -- covering state-mutation isolation, cross-NPC memory isolation, Reality Bridge privacy
   isolation, Big-Choice-not-AI-decided, Fortune-memory-scoping, and fallback non-contradiction.
3. **Documentation**: the state-ownership map, AI-responsibility map, and memory-tier map the
   directive asks for now exist as an explicit document rather than only as scattered comments.

No canonical state shape, no engine function signature, and no existing prompt-building logic was
changed -- this stage found no violation requiring a structural fix.

## State ownership map / AI responsibility map / memory tier map / mutation boundary

All four requested maps are in `docs/product/NEWLIFE_AI_RESPONSIBILITY_BOUNDARY_V1.md` (sections
B2/B16, B3/B4, B5, B6/B7, B10) rather than duplicated here.

## Regression results

- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS.
- `npx vitest run tests/newlifecore*.test.*` (14 files including the new invariant suite):
  **PASS, 354/354** (346 pre-existing + 8 new invariant tests).
- PHASE_17 visual/Feynman work (STAGE A): not touched this stage; the full suite run above
  includes every STAGE A screen's existing tests, so a regression there would show up in the same
  number.

## Live Gemini evidence

Two real, screenshotted scenarios completed (current-question/day-context correctness;
unrelated-NPC-knowledge-boundary); two real failure modes also captured live (timeout,
network-level failure), both degrading safely. Full 7-scenario B17 coverage was not completed --
see `NEWLIFE_AI_RESPONSIBILITY_BOUNDARY_V1.md`'s B17 section for the honest accounting of what was
and wasn't exercised against the live model versus the deterministic adapter (which is
behaviorally equivalent for every structural invariant, per the B2/B16 table, but not for live
prose quality).

## Privacy boundary

Verified structurally (grep: `contextBuilder.ts` never references `realWorldIntents`) and at
runtime (new invariant test: a Reality Bridge statement never appears in any NPC's serialized AI
context, including the NPC it was created with).

## Failure handling

Verified structurally (`envelope.ts`, `liveAdapterClient.ts`) and live (two real failure modes
this stage, both screenshotted, both resulting in a normal in-character reply with zero player-
visible error and zero canonical-state change).

## Remaining weaknesses (honestly logged)

1. B17's 7 named scenarios are only 2/7 exercised against a real live model (Big Choice, Fortune
   cross-day, and revisit-after-resolution were only exercised via the deterministic adapter this
   stage, which the automated suite already covers structurally).
2. Live-model connectivity was intermittent in this sandboxed dev environment (2 of 4 real calls
   this stage did not complete on the first attempt) -- worth a dedicated look if live-quality
   verification needs to scale up before HV-01, but every failure mode observed degraded safely.
3. One minor, low-severity live-model observation: a reply included a plausible but uncanonical
   weather detail ("気持ちの良い晴れ") not present in `NpcAiContext` -- harmless flavor text with
   no game-state consequence, not a boundary violation, but worth knowing about if weather is ever
   made canonical later (it would need to be added to the typed packet rather than left to the
   model to invent consistently).
4. `NpcAiContext`'s field names were not renamed to match the directive's example names verbatim
   (judged unnecessary churn against a widely-referenced, already-tested interface) -- the mapping
   is documented instead of the code being renamed.

## B20 — FINAL JUDGMENTS

- CANONICAL_STATE_OWNERSHIP = **PASS** (exhaustive function-list trace + a new runtime invariant
  test proving an adversarial reply cannot mutate state)
- AI_EXPRESSION_BOUNDARY = **PASS** (`NpcReplyEnvelope` is text-only; verified nothing else is
  extracted from a raw adapter response)
- MEMORY_TIERING = **PASS** (3 tiers identified and mapped to existing fields; no new state needed)
- RELEVANT_MEMORY_SELECTION = **PASS** (NPC-scoped by construction; proven at runtime this stage)
- STATIC_DYNAMIC_SEPARATION = **PASS** (mapped explicitly this stage; was already true by field
  origin, just undocumented as a named split before now)
- SCENARIO_GUARD = **PASS** (the safety-route/crisis-signal check runs before any adapter is
  called, unchanged this stage, re-verified via the existing passing safety-route tests)
- MODEL_INDEPENDENCE = **PASS** (two interchangeable adapters behind one interface; the actual
  model call is a dev-server-only process boundary, not just a module boundary)
- CONVERSATION_OBSERVABILITY = **PASS** (was the one real gap; fixed and verified live this stage)
- LIVE_MODEL_CONTEXT_INTEGRITY = **CONDITIONAL** (both scenarios actually run were correct and
  boundary-respecting; only 2/7 named scenarios were exercised live, and connectivity was
  intermittent -- real evidence exists, but it is not exhaustive)
- PRIVACY_BOUNDARY = **PASS** (verified structurally and at runtime)
- STATE_COHERENCE = **PASS** (354/354 automated tests, including 8 new invariant tests that did
  not exist before this stage)
- VISUAL_FEYNMAN_REGRESSION = **PASS** (all STAGE A screens' own tests, 346/346, re-run in the same
  suite this stage with zero change to their assertions or results)
- READY_FOR_HUMAN_VALIDATION = **NO** -- blocked specifically by LIVE_MODEL_CONTEXT_INTEGRITY being
  CONDITIONAL rather than a clean PASS (only 2/7 named B17 scenarios exercised live, and
  connectivity was intermittent). Per directive B23, HV-01 requires
  LIVE_MODEL_CONTEXT_INTEGRITY != FAIL (satisfied -- nothing failed) AND
  READY_FOR_HUMAN_VALIDATION = YES (not yet satisfied, held back deliberately rather than rounded
  up from partial live coverage to a clean pass).

## B22 — Commit

Separate from the STAGE A commits (`52ae0ea`, `79c74ec`), per directive B22: **`fe61d28`**.

## B23 — Final Human Validation gate

Per directive: HV-01 opens only if PHASE_17_COMPLETE=YES (already true, STAGE A) **and**
STATE_COHERENCE=PASS (true) **and** VISUAL_FEYNMAN_REGRESSION=PASS (true) **and**
LIVE_MODEL_CONTEXT_INTEGRITY!=FAIL (true -- CONDITIONAL, not FAIL) **and**
READY_FOR_HUMAN_VALIDATION=YES (**false** this Run). Net result: **HV-01 does not open yet.** The
gate is held by one thing only -- live-model verification is real but partial (2/7 named
scenarios). Completing the remaining 5 scenarios live (or accepting the deterministic-adapter
equivalent as sufficient, an Owner call, not an autonomous one per directive Section governing
business-facing scope calls) is what would flip READY_FOR_HUMAN_VALIDATION to YES.

---

**NEW_LIFE_FINAL_BASELINE_COMMIT = fe61d28**

**READY_FOR_HV01 = NO**
