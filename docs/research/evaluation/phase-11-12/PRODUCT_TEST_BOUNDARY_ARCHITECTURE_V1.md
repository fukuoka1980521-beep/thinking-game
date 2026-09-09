# Product/Test Boundary Architecture V1 — PHASE 11.12

## Principle evaluated (directive Section 8)

"PRODUCT CORE must not know WHY QA wants to test something. QA/RESEARCH should drive or observe the
Product Core through adapters." Validated against this repository's actual reality below, not
accepted on authority alone.

**Validation result: the principle holds, with one adjustment.** This repo's "Product Core"
(`src/research/action-contract-v2/engine.ts` + `types.ts` + `contracts.ts`) genuinely does not know
about tests — `resolveAction`/`resolvePendingReplyEvent` take a `ContractV2State` and an
`ActionContractV2`/`PendingReplyEventSpec` and have no test-awareness whatsoever (confirmed by
reading `engine.ts`). The actual leak was never in the core; it was in the **composition layer**
between "everything `playableSceneContracts.ts` exports" and "what `NewlifePlayable11App.tsx`
renders" — a layer that did not previously exist as a distinct, checkable step. The adjustment: the
principle as stated talks about "the core," but this repo's failure was one level up, in scene
composition. The architecture below targets that layer specifically.

## Ownership model adopted (directive Section 9)

Minimum structure, not the full candidate enum automatically:

```
ActionOwner = "PRODUCT" | "QA" | "RESEARCH" | "DEBUG"
```

Kept the 4-way split (not collapsed to PRODUCT/non-PRODUCT) because the trace evidence shows
genuinely distinct reasons things exist: `ASK_WEATHER_SCENE` exists to satisfy a specific regression
assertion (QA), the invented leftover-stock fixture exists to satisfy the authoring-sufficiency gate
for an isolated research route (RESEARCH/fixture, already handled by the existing
`ISOLATED_SCENE_FIXTURE` convention — see `CONTAMINATION_TAXONOMY_V1.md`), and the debug panel
exists for reviewer inspection (DEBUG). A single boolean (`isTest`) would have collapsed these
distinct reasons back into one undifferentiated flag — exactly the granularity loss the directive
warns against ("do not simply add another boolean").

**Not implemented:** a full metadata schema on every action (author, date, review status, etc.) —
only `owner` and the two justification strings (`sceneJustification` for PRODUCT,
`testPurpose` for everything else) were added, because those are the two fields the actual gate
(`composeProductSurface`) checks. No speculative fields.

## Product Surface Gate (directive Section 10)

Implemented in `src/research/action-contract-v2/productSurface.ts`. The required conceptual
question ("WHY WOULD THE PLAYER WANT/NEED TO DO THIS IN THIS SCENE?") is operationalized as: every
action composed into a product surface must have a registry entry with `owner: "PRODUCT"` AND a
non-empty `sceneJustification`. An action with no entry is rejected (fail-closed default), not
defaulted to PRODUCT. Demonstrated against the REAL exported `ASK_WEATHER_SCENE` (see
`tests/productSurfaceGate.test.ts`) — the gate throws `ProductSurfaceViolation` citing its `QA`
ownership, proving this is not decorative.

## Test Probe Separation (directive Section 11)

Implemented in `src/research/action-contract-v2/testProbes.ts`. `invokeTestProbe` reuses the same
`buildYoheiPacket`/`LanguageAdapter` surface the product UI reuses, but constructs no
`ActionContractV2`, calls no `resolveAction`, and is imported by no UI component. Demonstrated
(`tests/testProbeSeparation.test.ts`) reproducing test L's exact regression coverage ("UNKNOWN
weather stays unknown, both before and after accept") without a button.

## Dependency Direction (directive Section 12)

Rule: files under `src/newlifeplayable11/**` (excluding `tests/**`) must not import
`testProbes.ts`. Enforced by a pure scanner (`dependencyDirection.ts`) callable both against the
real repository tree (currently clean — 0 violations) and against synthetic fixtures (proving
detection without ever writing a real violating file). "Repository-native" per directive Section 12
— a Vitest test reading `fs`, the same pattern `tests/newlifePlayableScene11.test.ts`'s own
"Q: scope discipline" block already uses, not a new dependency.

**Scope limitation, stated honestly:** the scanner currently encodes exactly one rule (product UI
importing `testProbes`). It does not yet generally enforce "research must not import product" or
vice versa across the whole repository, because no evidence from this trace showed that broader
direction being violated. Extending it is straightforward (add another `ForbiddenImportRule` entry)
if a future phase's trace finds a new instance.

## Build/Mode Boundary (directive Section 13)

`devOnlyDisclosure.ts` + `BuildBoundaryDemoApp.tsx`, verified against a REAL `vite build` (see
`SYSTEMIC_GATES_IMPLEMENTATION_V1.md`). Both required halves are present per the directive's own
instruction ("need both COMPOSITION BOUNDARY and BUILD/SURFACE BOUNDARY"):
- Composition boundary: `composeProductSurface` (rejects at the type/data level, independent of
  build mode — works identically in dev and prod).
- Build/surface boundary: `import.meta.env.DEV` compile-time exclusion (removes rendering entirely
  from the shipped artifact).

Neither alone would have been sufficient: a hidden-but-still-composed action would still mutate
state if reachable; a build-excluded-but-still-composed action would still show up in dev builds
with no ownership check. They are independent, non-substitutable gates, as required.

## Route Classification (directive Section 14)

**Finding: no explicit lifecycle distinction currently exists.** Every isolated route in
`src/App.tsx` (`newlifecontractv2`, `newlifeplayable11`, and ~25 other `?newlife*=1` routes) is
wired identically — one query-param check, one component render, no metadata distinguishing
"research harness" from "product candidate" from "owner play build." `initialViewFromLocation`
treats all ~28 routes as a flat list.

**Minimum explicit lifecycle proposed (not implemented this phase — see Section 25 scope note
below):** a single string tag per route, e.g. `RESEARCH_HARNESS | PRODUCT_CANDIDATE |
OWNER_PLAY_BUILD | DEFAULT_PRODUCT`, recorded in a comment or small lookup table next to the route
registration, so "isolated route exists" is never silently read as "ready for player-facing
validation" (the directive's explicit warning, Section 14). **Why not implemented now:** this would
touch `App.tsx`'s route table for all ~28 existing routes, which is broader than this phase's scope
(directive Section 25: "Do NOT rewrite unrelated NEW LIFE architecture"; Section 2 of the project's
own autonomy standard: "Run の目的に直接必要な変更だけを行う"). Recorded as a **remaining
uncontrolled path** in the root-cause verdict.

## Player Knowledge Provenance (directive Section 17)

**Audit finding:** no PLAYER-side analog to Actor Experience currently exists.
`ContractV2State.experienceLog: ExperienceWrite[]` records what the PLAYER *did*
(`actorId: "player"`), not what the PLAYER *learned* — there is no structure recording "the player
now knows fact X because Yohei told them in dialogue." This is precisely why the leftover-stock
false unlock (item 3) was possible: nothing tracked that ASK_WHAT's answer already asserted the two
facts ASK_ABOUT_LEFTOVER_STOCK's answer would later restate.

**Decision: did not build a new knowledge-provenance system.** Per directive's own instruction
("Do NOT create a giant new knowledge system... Prefer reuse"), and because the counterfactual
causal-unlock invariant (`causalUnlockInvariant.ts`) solves the concrete, demonstrated problem
(EVAL_METRIC_LEAK) without needing a full player-knowledge ledger — it operates on explicit,
human-authored fact tags scoped to one unlock claim at a time, which is sufficient for this repo's
current finite, fully-captured-line scenes. A general player-knowledge ledger remains a legitimate
future need if scenes grow past a handful of captured lines, but building it now would be
speculative infrastructure for a problem the existing invariant already covers at current scale.
