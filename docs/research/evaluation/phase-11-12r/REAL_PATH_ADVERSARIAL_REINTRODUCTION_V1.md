# Real-Path Adversarial Reintroduction V1 — PHASE 11.12R

Directive Section 20: repeat the required reintroduction attempts against the REAL composition
path this time (`NewlifePlayable11App.tsx`'s actual render, or functions it actually calls), not
only isolated unit helpers (which PHASE 11.12 already covered). All 4 attempts below were executed
as real tests / real browser checks.

## A. QA weather probe → real Product Surface

**Attempt:** the unmodified `ASK_WEATHER_SCENE` reaches the real `buildAskCandidates(state)` call
(the exact function the live component uses) on every invocation — confirmed
(`tests/newlifePlayable11RealPathIntegration.test.ts`: "buildAskCandidates itself still offers
ASK_WEATHER_SCENE as a candidate").

**Result: BLOCKED, on the real path.** Excluded by `evaluateProductSurface` before reaching
`.accepted`; confirmed absent from the actual rendered DOM (`tests/newlifePlayable11RenderedUI.test.tsx`)
and from a real browser screenshot against a running dev server
(`screenshots/01_real_path_initial_scene.png`, `real_path_visual_evidence.json`: "QA weather probe
ABSENT from real rendered button list" — PASS).

## B. Synthetic QA memory probe → real Product Surface

**Attempt:** a synthetic `ActionContractV2` (`actionId: "QA_UNKNOWN_MEMORY_PROBE"`) spliced into
the output of the real `buildAskCandidates(state)` call (not a separate, hand-rolled list), then
passed through the real `evaluateProductSurface`.

**Result: BLOCKED.** Rejected with `owner: "UNCLASSIFIED"` (no registry entry) — no code anywhere
special-cases this action id; the rejection is the generic fail-closed default.
(`tests/newlifePlayable11RealPathIntegration.test.ts`, "ADVERSARIAL (Section 5)" — PASSING.)

## C. Debug replay disclosure → primary PLAYER render

**Attempt:** check whether the Vertex-replay disclosure sentence reaches the primary player action
surface (`playable11-actions`) at any point in a real playthrough, including with the debug panel
open (the harder case — proving separation, not just default-hidden).

**Result: CONFINED to the dev/debug evidence surface.** Absent from `playable11-actions` in every
state checked (initial, after ASK_WHAT, after ACCEPT, with debug panel open or closed); present
only inside `playable11-debug-panel`, and only in `import.meta.env.DEV` builds (see
`REAL_DEBUG_BOUNDARY_AUDIT_V1.md` for the full build-artifact grep). Confirmed via RTL `within()`
scoping (cannot be satisfied by "present somewhere on the page") and via real-browser Playwright
check.

## D. Fake state-only causal unlock → real contextual eligibility

**Attempt:** verify that the real, live `ACCEPT_HELP → ASK_ABOUT_LEFTOVER_STOCK` claim — the actual
historical instance, not a synthetic stand-in — is evaluated by the real causality gate wired into
`NewlifePlayable11App.tsx`'s render body, using real runtime state (not a static claim constant),
and that a state-only eligibility flip (`LEFTOVER_STOCK_MOVED` becoming `true`) is NOT treated as
sufficient on its own.

**Result: BLOCKED/CONFINED — the button does not render.** `evaluateRealLeftoverStockCausalClaim`
returns `CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN` for the real post-accept state; `applyCausalityGate`
excludes `ASK_ABOUT_LEFTOVER_STOCK` from the candidate list before it ever reaches the ownership
gate. Confirmed the button is absent from the real rendered DOM after a real ACCEPT click
(`tests/newlifePlayable11RenderedUI.test.tsx`) and from the real browser screenshot
(`screenshots/03_real_path_after_accept.png`).

## Summary

| # | Class | Real-path mechanism | Result |
|---|---|---|---|
| A | QA weather probe as product button | Ownership gate, wired into real render | BLOCKED |
| B | Synthetic QA probe injected into real candidate source | Ownership gate, generic fail-closed default | BLOCKED |
| C | Debug/replay disclosure on primary surface | Build boundary + composition boundary, wired into real render | CONFINED |
| D | Fake state-only causal unlock (the real historical instance) | Causality gate, wired into real render, live state | BLOCKED |

All 4 were verified against the actual rendered button list and/or an actual running browser
instance — not only against isolated unit helpers, per directive Section 20's explicit requirement.
