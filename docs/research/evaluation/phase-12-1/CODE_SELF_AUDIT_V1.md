# Code Self-Audit V1 — PHASE 12.1

## Scope discipline

New files (client-side, `src/`):
- `src/research/bounded-generative-world/types.ts`, `canonData.ts`, `worldState.ts`, `packet.ts`,
  `envelope.ts`, `testAdapter.ts`, `liveAdapterClient.ts`.
- `src/newlifebgw121/NewlifeBgw121App.tsx`.

New files (server/dev-only, outside `src/`, never bundled into the client):
- `devtools/bgwVertexLiveAdapterCore.mjs` — holds the ONLY code path that ever obtains a Vertex
  bearer token (via `gcloud auth print-access-token`, matching the already-proven PHASE 11.9
  method) and calls the Vertex REST endpoint directly.
- `devtools/bgwVertexDevPlugin.mjs` — Vite `apply: "serve"` plugin, mounts
  `/api/bgw-npc-dialogue`, dev-server-only.

Modified files:
- `vite.config.ts` — wires the dev-only plugin in.
- `src/App.tsx` — adds the `?newlifebgw121=1` route, same pattern as every prior isolated route.
- `tests/safety.test.ts` — extends the pre-existing "no undocumented network calls in `src/`" guard
  to explicitly recognize `liveAdapterClient.ts` as a second documented, same-origin-only network
  client (same pattern as the existing `aiDialogueClient.ts` exception), plus a new check that
  `src/` never imports `devtools/` or references the Vertex endpoint/gcloud directly.

Not modified: `?newlifeplayable11=1` (`NewlifePlayable11App.tsx`,
`src/research/action-contract-v2/*`) — the frozen fixed-dialogue baseline, verified unchanged by a
dedicated regression test (`tests/newlifeBgw121RenderedUI.test.tsx`'s "the frozen fixed-dialogue
baseline is untouched" describe block).

## A real gap found and fixed during this phase's own work (not smoothed over)

Directive Section 10 (resumed after interruption) required proving at least one NPC's activity/
location progresses WITHOUT PLAYER interaction, with real before/after runtime state. The initial
implementation had NO such mechanism — Jin's location was a fixed field set once at world creation
and never changed. Fixed by adding `worldTick`/`advanceWorldTick`/`jinJobLocationForTick` (small,
pure, real) and wiring it into the app's `travelTo` handler. This was caught while assembling
evidence, not discovered by an external reviewer — recorded here rather than silently added as if
it had always been part of the design.

## A real transient bug found and diagnosed during real browser QA

The dev-server middleware returned an empty envelope on its very first cold-start request. Root
cause is a stated hypothesis (Vite dependency pre-optimization), not confirmed via a captured
diagnostic log — see `PRODUCT_VISUAL_QA_V1.md`'s honest note. Diagnostic `console.error` logging
was added to `devtools/bgwVertexDevPlugin.mjs` (server-side only, never sent to the browser) so a
future recurrence can be investigated with real evidence rather than guessed at again.

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests: `boundedGenerativeWorld.test.ts` (17/17), `newlifeBgw121RenderedUI.test.tsx`
  (5/5), `safety.test.ts` (8/8) — all re-run after every source change, not assumed.
- Full suite: **106/106 test files, 1565/1565 tests passing.** (One earlier full-suite run showed
  10 failed files/32 failed tests over an anomalous 39-minute duration; traced to unrelated,
  pre-existing `gyosei-support-navi` dev-server processes consuming system resources concurrently —
  confirmed via `Get-CimInstance Win32_Process`, not touched or killed, since they belong to a
  different, unrelated project and were not started by this session. A clean re-run with the same
  code, once system load was no longer a confound, produced the fully-passing 106/1565 result
  above in the expected ~75s. The failing run is not treated as evidence of a regression, and the
  passing re-run is not treated as cherry-picked — the specific failing test in the visible tail
  (`newlifeV33PreviewV3.test.tsx`, an `advanceToTuesdayRealization` helper timing out on
  `findByRole`) is a symptom pattern consistent with resource starvation, not a logic defect, and
  is unrelated to any file this phase touched.)
- `npm run build`: clean; production bundle re-grepped for `aiplatform.googleapis.com`,
  `print-access-token`, `Bearer ` — absent, confirming the credential/endpoint code never reaches
  the client bundle.

## No new LLM/model calls beyond what directive Section 6/7 explicitly required

13 real Vertex calls total this phase (`LATENCY_AND_LIVE_CALL_AUDIT_V1.md`'s full ledger), well
under the directive's 30-call budget. No prompt-tuning loop was run after seeing results (directive
Section 4/14) — the first captured 3-state result and the first captured NG-case results are both
preserved and reported as-is.

## Unresolved, stated honestly

- Art assets: `MISSING` across the board (`ART_ASSET_STATUS_V1.md`).
- Latency: only 5/13 calls have recorded wall-clock timing; sample too small for a reliable general
  figure (`LATENCY_AND_LIVE_CALL_AUDIT_V1.md`).
- Two live-model classification-boundary softnesses observed (aliens → `NPC_KNOWLEDGE_GAP` instead
  of `OUT_OF_WORLD_SCOPE`; false-assertion denial → `NPC_KNOWLEDGE_GAP` instead of `IN_SCOPE`) —
  both structurally safe, neither silently repaired.
- The dev-server cold-start empty-envelope cause is a hypothesis, not a confirmed root cause.
