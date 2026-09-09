# Real Product Surface Action Audit V1 — PHASE 11.12R

## Fail-closed ownership, wired for real

`NewlifePlayable11App.tsx` now calls `evaluateProductSurface` (the non-throwing, real-composition-
path variant added this phase in `productSurface.ts`) on every render. Unlike `composeProductSurface`
(throws on first violation — appropriate for a strict assertion context, would crash the scene if
used directly here), `evaluateProductSurface` partitions candidates into `accepted` (rendered) and
`rejected` (excluded, with a machine-readable reason, exposed in the debug panel — see
`REAL_DEBUG_BOUNDARY_AUDIT_V1.md`).

Fail-closed behavior confirmed unchanged from PHASE 11.12: an action with no
`ACTION_OWNERSHIP_REGISTRY` entry is rejected (`owner: "UNCLASSIFIED"`), never defaulted to
PRODUCT — proven again in the real path by `tests/newlifePlayable11RealPathIntegration.test.ts`'s
adversarial test (below).

## Real weather-probe result

`ASK_WEATHER_SCENE` reaches `buildAskCandidates(state)` on every call (it is unconditionally
included — SCENE ELIGIBILITY for it is `[ALWAYS]`, unchanged from PHASE 11.11:
`tests/newlifePlayable11RealPathIntegration.test.ts` → "buildAskCandidates itself still offers
ASK_WEATHER_SCENE as a candidate... it is the SUBSEQUENT ownership gate that excludes it" — PASSING).
It is then rejected by `evaluateProductSurface` because `ACTION_OWNERSHIP_REGISTRY.ASK_WEATHER_SCENE.
owner === "QA"`. Verified three independent ways:
1. Data-flow test (`newlifePlayable11RealPathIntegration.test.ts`): composed action-id list
   `["ASK_WHAT_HELP_NEEDED", "ASK_FESTIVAL_SCENE", "ASK_SALES_SCENE"]` — no weather.
2. Rendered-DOM test (`newlifePlayable11RenderedUI.test.tsx`, React Testing Library): actual button
   `data-testid` list in the real component — no `playable11-ask-weather`.
3. Real-browser Playwright check against a running `vite` dev server (port 5199,
   `real_path_visual_verify.mjs`): "QA weather probe ABSENT from real rendered button list" — PASS,
   screenshot `screenshots/01_real_path_initial_scene.png`.

## Synthetic probe result (`QA_UNKNOWN_MEMORY_PROBE`)

A fully synthetic `ActionContractV2` (`actionId: "QA_UNKNOWN_MEMORY_PROBE"`) was constructed inside
a test and spliced into the output of the REAL `buildAskCandidates(state)` call (the exact function
`NewlifePlayable11App.tsx` itself calls — imported, not re-implemented). No special-case code for
this action id exists anywhere in `productSurface.ts` or `NewlifePlayable11App.tsx` (confirmed by
reading both files — the only string this action id matches against is the generic "no registry
entry" fail-closed branch). Result: `evaluateProductSurface` rejects it with
`owner: "UNCLASSIFIED"`, `reason` matching "no ACTION_OWNERSHIP_REGISTRY entry" —
`tests/newlifePlayable11RealPathIntegration.test.ts`'s "ADVERSARIAL (Section 5)" test — PASSING.

## Real rendered button counts, before/after

| State | Buttons before (PHASE 11.11) | Buttons after (PHASE 11.12R, real) |
|---|---|---|
| Initial | 7 | 6 |
| After ACCEPT | 6 | 4 |
| After DECLINE | 5 | 4 |
| After LEAVE | 0 | 0 (unchanged) |

## Ownership registry risk (directive Section 16)

**Adversarial test performed:** constructed an adversarial registry entry relabeling
`ASK_WEATHER_SCENE` as `{ owner: "PRODUCT", sceneJustification: "<plausible non-empty text>" }` and
ran it through `composeProductSurface`/`evaluateProductSurface` with that registry substituted.

**Result: nothing in the type system or the gate itself stops a false PRODUCT relabeling with a
plausible-sounding justification.** `sceneJustification` is free text, checked only for
non-emptiness, never for truthfulness. Recorded exactly as the directive requires:

**`OWNERSHIP_METADATA_NOT_SELF_AUTHENTICATING`** — ownership classification is one gate in a
larger defense-in-depth chain (see `PRODUCT_TEST_BOUNDARY_ARCHITECTURE_V1.md` from PHASE 11.12 and
`CODE_SELF_AUDIT_V1.md`'s "Semantic Gate Composition" section this phase), not a semantic proof.
This is explicitly **not treated as a blocker** per directive Section 16 — no AI classifier or
policy engine was built to "solve" it; the mitigation is that a false relabeling must be written
down, in a reviewable file, as a specific claim (`ACTION_OWNERSHIP_REGISTRY["X"] = {owner:
"PRODUCT", sceneJustification: "..."}`), which raises the cost of contamination (it must survive
code review) without claiming to make it impossible.
