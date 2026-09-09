# Strategist Root-Fix Real-Path Packet V1 — PHASE 11.12R

Evidence-packaging document for independent Strategist review of the REAL-PATH integration, per
directive Section 23 ("Return to PHASE 11.11C-style product repair ONLY if... "). No self-judgment
substitutes for the Strategist's own read of the linked documents.

## Exact old ingress path

`NewlifePlayable11App.tsx` rendered one hardcoded `<button>` per action constant (including
`ASK_WEATHER_SCENE`) with no composition step, and an unconditional inline Vertex-disclosure `<p>`
outside any gate. Full detail, preserved as evidence: `REAL_PATH_CONTAMINATION_INTEGRATION_V1.md`.

## Exact new real composition path

`buildAskCandidates(state) → applyCausalityGate(candidates, causalVerdict) →
evaluateProductSurface(candidates) → .accepted.map(...) → <button>` — one path, defined once,
called once per render, in the one existing component. No `actionId ===` manual branch exists
anywhere in the file (grep-verified, 0 matches).

## Real weather-probe result

**BLOCKED on the real path.** `ASK_WEATHER_SCENE` still reaches `buildAskCandidates` (scene
eligibility `[ALWAYS]`, unchanged) but is excluded by `evaluateProductSurface` (`owner: "QA"`).
Verified 3 ways: data-flow test, RTL rendered-DOM test, real-browser Playwright screenshot against
a live `vite` dev server. Initial screen: 6 real buttons (was 7); weather absent from all three.

## Synthetic probe result

**BLOCKED.** `QA_UNKNOWN_MEMORY_PROBE`, spliced into the real `buildAskCandidates` output with no
special-case code added anywhere, is rejected by the generic fail-closed default
(`owner: "UNCLASSIFIED"`).

## Debug result

**CONFINED.** The Vertex/replay disclosure sentence is deleted from the primary render path
entirely (not hidden by CSS) and now renders only inside the `showDebug`-gated panel, itself
additionally gated by a literal `if (import.meta.env.DEV)` call site — the corrected pattern from
PHASE 11.12's own recorded mistake, re-verified against a real `npm run build` of the actual wired-
in call site (not only the standalone demo route): marker absent from `dist/`. Confirmed present in
the debug panel in this (DEV) test/dev environment, and confirmed absent from the primary player
surface even with the panel open (`within()`-scoped assertion).

## Causal old-claim result

**`CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN`**, computed from real live state (not a static constant),
using State Admission evidence (`leftover_stock_moved.concreteContent`) chosen specifically because
it is path-independent (valid regardless of which questions the player asked before ACCEPT — see
`REAL_CAUSALITY_GATE_AUDIT_V1.md` for why this beats Actor Experience/interaction-transcript as the
evidence source here). `ASK_ABOUT_LEFTOVER_STOCK` was NOT edited, reworded, or replaced — it is
simply excluded from the real candidate list post-accept as a direct, honest consequence. Post-
accept button count: 4 (was 6 in PHASE 11.11).

## QA coverage result

**PRESERVED.** `tests/testProbeSeparation.test.ts` (PHASE 11.12, untouched) still exercises the
identical "UNKNOWN weather stays unknown" regression via `invokeTestProbe`, with zero product-
surface exposure, unaffected by this phase's UI changes.

## Ownership metadata adversarial result

**`OWNERSHIP_METADATA_NOT_SELF_AUTHENTICATING`.** A plausible-sounding but false PRODUCT relabeling
of `ASK_WEATHER_SCENE` (non-empty, reasonable-reading `sceneJustification`) is accepted by the gate
— nothing checks truthfulness, only non-emptiness. Recorded per directive Section 16 as a known,
non-blocking gap: ownership is one gate in a 5-layer defense-in-depth chain (documented in
`CODE_SELF_AUDIT_V1.md`'s "Semantic Gate Composition" section), not a semantic proof by itself. No
AI classifier or policy engine was built to close this gap, per the directive's own instruction.

## Full test/build totals

`npx tsc --noEmit`: clean. `npx vitest run`: **99/99 test files, 1466/1466 tests passing** (97
files/1452 tests carried over from PHASE 11.12 + 2 new files/14 new tests this phase, confirmed
exact). `npm run build`: clean; production `dist/` grepped and confirmed free of the dev-only
marker at the real wired-in call site. Real-browser mechanical verification (Playwright against a
live `vite` dev server, port 5199, cleanly terminated afterward): 11/11 checks PASS, 5 screenshots
captured under `docs/research/evaluation/phase-11-12r/screenshots/`.

## Actual build artifact result

Production bundle (`npm run build` → `dist/`): `PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a` —
absent (confirmed by direct grep). Note recorded precisely, not overclaimed: the button-testid
string `playable11-ask-weather` is still present in the bundle as inert metadata (an unused entry
in the `ASK_ACTION_UI_META` lookup table) — this does not contradict the "button never renders"
finding, which was proven at the DOM/browser level, not by asserting every source string
disappears from the bundle (a stronger and unnecessary claim the directive never made).

## Remaining ingress risks

1. `evaluateProductSurface`'s ownership check is not self-authenticating (see above) — a future,
   deliberately-mislabeled registry entry with a plausible justification would pass this specific
   gate; it would still need to survive code review, and (for a genuinely new "possibility" claim)
   the separate counterfactual causality gate.
2. No route-lifecycle enforcement exists across this repository's ~26 other `?newlife*=1` routes —
   only `?newlifeplayable11=1` and `?boundarydemo1112=1` were classified this phase, at
   documentation level only (`CODE_SELF_AUDIT_V1.md`'s table).
3. The causal-unlock invariant's fact tags remain human-authored; no automated extraction exists.
4. The dependency-direction scanner still encodes exactly one rule (product UI must not import
   `testProbes`) — unchanged scope from PHASE 11.12.

## Final verdicts (directive Section 22)

| Verdict | Value |
|---|---|
| ROOT CONTAMINATION PATH | **UNDER_CONTROL** — all 3 accepted primary paths (TEST_AFFORDANCE_LEAK, DEBUG_UI_LEAK, EVAL_METRIC_LEAK) are now blocked/confined on the REAL composition path, verified by real-DOM and real-browser checks, not only unit helpers. |
| REAL PRODUCT ACTION BOUNDARY | **PASS** — real weather probe and real synthetic probe both blocked on the real path (A/B above). |
| REAL DEBUG BOUNDARY | **PASS** — real disclosure confined to dev/debug surface, compile-time excluded from the real production bundle at the real call site. |
| REAL COUNTERFACTUAL CAUSALITY | **PASS** (contaminated claim correctly rejected as invalid, per the directive's own accepted resolution: "PASS or the contaminated claim is correctly rejected as invalid"). |
| QA COVERAGE AFTER SEPARATION | **PRESERVED**. |
| OWNERSHIP METADATA | **USEFUL_BUT_NOT_SUFFICIENT**. |
| ROOT FIX | **READY_FOR_PRODUCT_REPAIR** — all Section 23 conditions are met on the evidence in this packet. Whether to actually proceed is the Strategist's call, not self-declared here. |

## Claim discipline (directive Section 24)

This packet does not claim all future contamination is impossible. Allowed claim, and the only one
made: **the demonstrated QA/debug/evaluation contamination routes (weather probe, synthetic probe,
debug disclosure, the historical leftover-stock causal claim) are now blocked or confined on the
real isolated Product composition path** — verified against the actual rendered DOM and a real
running browser instance, not only against isolated unit helpers.
