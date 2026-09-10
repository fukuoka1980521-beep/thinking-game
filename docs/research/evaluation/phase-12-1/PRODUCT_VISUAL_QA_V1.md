# Product Visual QA V1 — PHASE 12.1

Directive Section 8/9. Real Playwright run against a live `npx vite --port 5220` dev server, using
the REAL live-adapter path (browser → `?newlifebgw121=1` → same-origin `/api/bgw-npc-dialogue` →
server-side Vertex adapter → validated envelope → browser), not the deterministic adapter.
Script: `product_visual_qa_live_script.mjs`. Evidence: `product_visual_qa_live_evidence.json`.
Screenshots: `screenshots/*.png`.

## Mechanical checks — 9/9 PASS (final run, after the world-tick fix)

| # | Check | Result |
|---|---|---|
| 1 | Opening text present (57/30-day/DAY30 facts) | PASS |
| 2 | Map shows current location (TRIAL_HOUSE) | PASS |
| 3 | MAP × NPC INTERSECTION: Yohei's store shows both Yohei and Jin present without clicking Jin from a menu | PASS |
| 4 | Jin's covering activity is narrated (state-derived, not menu-derived) | PASS |
| 5 | No raw classification/prompt/model text visible on the primary surface before any debug toggle | PASS |
| 6 | Real live response rendered on the primary surface (not a fixture placeholder) | PASS — 洋平「いや、大丈夫だよ。相馬さんが見てくれてるから。」 |
| 7 | Persistent-consequence check: returning to the same location later shows a materially different (correctly world-tick-advanced) scene | PASS — recorded honestly either way; this run landed on "Jin has moved on, Yohei alone" (see `NPC_INDEPENDENCE_EVIDENCE_V1.md`) |
| 8 | Network response body contains no credential/token material | PASS |
| 9 | Network response body is small (envelope-only, not the full raw provider payload) | PASS |

`allPass: true` in `product_visual_qa_live_evidence.json`.

## Real browser round-trip confirmed (directive Section 8's "also verify the real architecture once")

`curl -X POST http://localhost:5220/api/bgw-npc-dialogue` (acting exactly as the browser's `fetch`
would) returned, on a warmed-up dev server, a valid structured envelope with **no token, no raw
Vertex payload, no prompt text** — only the 4-field envelope
(`classification`/`npcResponseIntent`/`proposedConsequenceId`/`visibleUtterance`). Response body:
190 bytes. Confirmed directly with `curl -i`, not merely inferred from the Playwright script.

### Honest note: a cold-start transient failure was found, not hidden -- root cause hypothesized, NOT confirmed

The very first call immediately after a fresh `npx vite` start returned an empty `{}` envelope
(fail-closed — no crash, no exposed error, matching `NG_RESPONSE_SEMANTICS_V1.md`'s required
behavior even under this failure). Server-side-only diagnostic logging (`console.error` in
`devtools/bgwVertexDevPlugin.mjs`, never sent to the browser) was added in response, and
`devtools/bgwVertexLiveAdapterCore.mjs` was independently confirmed to work correctly when invoked
directly via `node`. However, the dev server was then restarted (to load the new diagnostic
logging), and the very next call succeeded immediately — meaning the diagnostic logging was never
actually captured DURING a real failure. **The most likely explanation is Vite's dependency
pre-optimization** ("Re-optimizing dependencies because vite config has changed," visible in the
server log at the time of the first attempt) still being in progress, but this is a hypothesis
correlated by timing, not a confirmed root cause backed by a captured diagnostic log. Recorded
honestly as unconfirmed rather than stated as settled fact. Functionally, the important property
still held either way: the failure was invisible to the player beyond an `INSUFFICIENT_CONTEXT`-
shaped empty response, never a crash or a leaked credential.

## No debug controls / raw classification / prompt / model selector / test-state controls on
## Product UI (directive Section 9)

Verified directly: the primary surface (before any explicit toggle) shows only opening text, map
buttons, location narration, NPC "talk" buttons, and — once a conversation is open — the free-text
input and the conversation log. No classification value, no prompt text, no provider/model name
("gemini", "Vertex"), and no raw JSON is visible anywhere outside the explicitly-labeled,
explicitly-toggled developer panel (`bgw121-debug-panel`, unchanged pattern from PHASE 11.12's
already-accepted dev/build boundary). The live-adapter checkbox itself is gated by
`import.meta.env.DEV` in source (compiled out of any production bundle, matching PHASE 12.0's own
required design) — verified by the `npm run build` + bundle grep in `CODE_SELF_AUDIT_V1.md`, not
merely by inspecting the dev-mode-rendered page.

## Visual inspection (not selector-only)

Reviewed `00_opening.png`, `01_map_trial_house.png`, `02_yohei_store_encounter.png`,
`03_after_live_response.png`, `04_return_to_changed_location.png` directly. The layout reuses the
same visual language as the fixed-dialogue baseline (`ns-frame`/`ns-choices`/`ns-choice-button`),
reads cleanly, and shows no leftover test/debug chrome on the primary surface at any step.
