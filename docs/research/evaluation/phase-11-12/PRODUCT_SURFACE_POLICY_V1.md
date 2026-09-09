# Product Surface Policy V1 — PHASE 11.12

Concern-ownership policy (directive Section 9/10), stated as the rule going forward for any future
work that composes actions into a player-visible NEW LIFE scene under this repository's research
routes.

## The rule

An action may enter a scene's player-visible composition (button list, or any other player-facing
affordance) **only if**:

1. It has an entry in that scene's ownership registry (e.g. `productSurface.ts`'s
   `ACTION_OWNERSHIP_REGISTRY`) with `owner: "PRODUCT"`. An action with no entry is rejected, not
   defaulted to PRODUCT.
2. That entry's `sceneJustification` states a player-facing reason to ask/do this **in this
   specific scene's fiction**. "A test needs to exercise this branch" is not an acceptable value,
   mechanically enforced (`composeProductSurface` rejects an empty/missing justification).
3. The justification is independently checkable against the scene's own spec document — i.e., a
   reviewer reading the spec should be able to find the player-facing reason without reading test
   code.

## What is NOT PRODUCT

- `owner: "QA"` — exists to give a specific regression assertion something real to call
  (`testPurpose` required, `sceneJustification` forbidden). Reached only via `testProbes.ts`'s
  `invokeTestProbe`, never composed into a UI action list.
- `owner: "RESEARCH"` — exists to make an isolated scene fixture concrete enough to pass the
  authoring-sufficiency gate, explicitly NOT proposed as canon (the existing
  `ISOLATED_SCENE_FIXTURE:` marking convention already implements this; no code in
  `productSurface.ts` currently uses this owner value, since no PHASE 11.11 action needed it — the
  fixture leak this owner value would guard against was already caught by the pre-existing
  convention, per `CONTAMINATION_TAXONOMY_V1.md`'s FIXTURE_TO_CANON_LEAK entry).
- `owner: "DEBUG"` — exists for developer/reviewer inspection (`showDebug`-style panels, provenance
  disclosure). Must be gated by BOTH a composition boundary (not composed into the primary render
  path) AND a build/surface boundary (`import.meta.env.DEV`) — see
  `PRODUCT_TEST_BOUNDARY_ARCHITECTURE_V1.md`'s Section 13 entry for why both are required together.

## Who checks this

`composeProductSurface(candidates)` is the single enforcement point. It is NOT currently called by
`NewlifePlayable11App.tsx` (deferred to PHASE 11.11's own product repair, per directive Section
22/29) — this policy document states what the check *should* enforce once that repair wires the
gate in, and what it *already proves* when pointed at the real exported contracts in a test context
(`tests/productSurfaceGate.test.ts`).

## Non-goals

- This policy does not attempt to classify every action in every NEW LIFE route in this repository
  — only the PHASE 11.11 scene's actions, where the demonstrated leak occurred. Extending
  `ACTION_OWNERSHIP_REGISTRY` to other routes is straightforward but out of this phase's scope
  (directive Section 25).
- This policy does not replace human judgment about what counts as a legitimate player-facing
  reason — `sceneJustification` is free text, reviewed by a person, not machine-validated for
  semantic quality (only for non-emptiness). A bad-faith justification string that technically
  passes the mechanical check is still possible; this policy raises the cost of contamination
  (a justification must be written and will be visible in review) rather than making it impossible.
