# Real-Path Contamination Integration V1 — PHASE 11.12R

## Objective

PHASE 11.12 built and unit-proved 4 systemic gates but explicitly did not wire them into the live
`?newlifeplayable11=1` scene (deferred by that phase's own scope discipline). This phase closes
that gap: the REAL rendering path in `src/newlifeplayable11/NewlifePlayable11App.tsx` now routes
through the same gates, and the 3 accepted contamination classes (TEST_AFFORDANCE_LEAK,
DEBUG_UI_LEAK, EVAL_METRIC_LEAK) are demonstrated blocked/confined on the real composition path,
not only in isolated unit helpers.

## Exact old ingress path (frozen, unchanged, kept as evidence)

`src/newlifeplayable11/NewlifePlayable11App.tsx` previously rendered one hardcoded JSX `<button>`
per action constant, imported directly from `playableSceneContracts.ts`, with no intermediate
composition step:

```
ASK_WHAT_HELP_NEEDED, ASK_FESTIVAL_SCENE, ASK_SALES_SCENE, ASK_WEATHER_SCENE  -> 4 unconditional buttons
askAboutLeftoverEligible (precondition only) -> ASK_ABOUT_LEFTOVER_STOCK button
inline <p> Vertex disclosure -> rendered unconditionally inside {started && (...)}
```

This is preserved, unmodified, in `docs/research/evaluation/phase-11-11/` (screenshots,
transcripts, `PLAYABLE_SCENE_SPEC_V1.md`) — nothing there was edited or deleted this phase.

## Exact new real composition path

`src/newlifeplayable11/NewlifePlayable11App.tsx` (current):

```
buildAskCandidates(state)                         [ASK_WHAT, ASK_FESTIVAL, ASK_SALES, ASK_WEATHER,
                                                     +ASK_ABOUT_LEFTOVER_STOCK iff precondition-eligible]
        |
        v
applyCausalityGate(candidates, causalVerdict)     [excludes ASK_ABOUT_LEFTOVER_STOCK unless
                                                     evaluateRealLeftoverStockCausalClaim(state)
                                                     === CAUSAL_UNLOCK_VALID]
        |
        v
evaluateProductSurface(candidates)                [ownership gate -- ACTION_OWNERSHIP_REGISTRY;
                                                     excludes any non-PRODUCT/unclassified action,
                                                     e.g. ASK_WEATHER_SCENE (owner: QA)]
        |
        v
.accepted.map(...) -> <button> per action          [the ONLY render path -- no second list]
```

Every step is a plain function call in the render body of the ONE existing component; no second,
parallel action list exists anywhere. Verified precisely (not assumed): `grep -c
'data-testid="playable11-ask-' src/newlifeplayable11/NewlifePlayable11App.tsx` returns 0 — there is
no literal per-action `<button data-testid="playable11-ask-...">` left in the source at all; every
per-action button testid now comes from the single `ASK_ACTION_UI_META` lookup table rendered
through one `.map()` call over `acceptedAskActions`. `grep -n 'actionId ===='
src/newlifeplayable11/NewlifePlayable11App.tsx` returns nothing — confirming no manual
`if (actionId === "ASK_WEATHER_SCENE") hide` (or equivalent) branch exists anywhere in the file.

## Result: the real scene, mechanically

| State | Real rendered ASK_* buttons (old, PHASE 11.11) | Real rendered ASK_* buttons (now) |
|---|---|---|
| Initial | WHAT, FESTIVAL, SALES, WEATHER (4) | WHAT, FESTIVAL, SALES (3) |
| After ACCEPT | WHAT, FESTIVAL, SALES, WEATHER, LEFTOVER (5) | WHAT, FESTIVAL, SALES (3) |
| After DECLINE | WHAT, FESTIVAL, SALES, WEATHER (4) | WHAT, FESTIVAL, SALES (3) |

(ACCEPT/DECLINE/LEAVE buttons are unaffected — they are `PendingReplyEventSpec` dispatches, never
part of this candidate list, and their own behavior/wording is unchanged, confirmed by
`tests/newlifePlayable11RenderedUI.test.tsx`'s decline-wording byte-identity check.)

**This reduction is a direct, mechanical consequence of the ownership gate (removes WEATHER) and
the causality gate (removes LEFTOVER after accept) — no manual `if (actionId === ...) hide` logic
was added anywhere** (verified by reading the diff: `NewlifePlayable11App.tsx` contains no
`actionId ===` string-literal branch; exclusion happens only inside `evaluateProductSurface` and
`applyCausalityGate`, both defined once in `src/research/action-contract-v2/`).

## What did NOT change

- `playableSceneContracts.ts`, `yoheiSourceEvents.ts`, `capturedYoheiLines.ts`,
  `languageAdapter.ts`, `pendingReplyContracts.ts`, `engine.ts`, `types.ts`, `contracts.ts` — none
  of these files were opened with a write/edit tool this phase (only read, for reference); they
  remain in the same untracked (`??`) state `git status --porcelain` showed for them at the start
  of this Run, unchanged by this phase's work.
- Decline wording, accept narration, world-continuity text, leave narration — all unchanged
  (`tests/newlifePlayable11RenderedUI.test.tsx` asserts byte-identity on the decline line).
- `ASK_WEATHER_SCENE` and `ASK_ABOUT_LEFTOVER_STOCK` themselves are untouched as data — they still
  exist, fully functional, reachable via `testProbes.ts`/direct engine calls for QA purposes. Only
  their entry into the RENDERED product surface changed.

## Full detail

See `REAL_PRODUCT_SURFACE_ACTION_AUDIT_V1.md`, `REAL_DEBUG_BOUNDARY_AUDIT_V1.md`,
`REAL_CAUSALITY_GATE_AUDIT_V1.md`, `REAL_PATH_ADVERSARIAL_REINTRODUCTION_V1.md` for the per-gate
evidence, and `real_path_visual_evidence.json` / `screenshots/` for the real-browser mechanical
verification (Playwright, against a real `vite` dev server on port 5199, not assumed from
unit tests alone).
