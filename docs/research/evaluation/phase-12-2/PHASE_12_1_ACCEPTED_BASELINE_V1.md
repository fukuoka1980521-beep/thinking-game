# PHASE 12.1 Accepted Baseline V1 — PHASE 12.2

## Checkpoint

**Commit hash**: `5cf68ef60b39c0e9e24460b850a8c659a5c1f3df` — "research: implement bounded
generative new life slice." Sits on `3f86dd4f400107e4548e35e61c1ee3e81fba3f45` (PHASE 12.0/12.0R
design checkpoint).

## What is frozen this phase (directive Section 1)

Unmodified, verified by diff-review before any PHASE 12.2 edit began:

- `src/research/bounded-generative-world/types.ts` — classification/envelope/packet types.
- `src/research/bounded-generative-world/canonData.ts` — NPC canon extracts, `WORLD_FACTS`,
  `LOCATIONS`, `TRAVEL_EDGES`.
- `src/research/bounded-generative-world/envelope.ts` — hard structural validation.
- `src/research/bounded-generative-world/testAdapter.ts` — deterministic fixtures.
- `src/research/bounded-generative-world/liveAdapterClient.ts` — browser-side live call wrapper.
- `devtools/bgwVertexLiveAdapterCore.mjs` — the live Vertex prompt/call/parse logic.
- `devtools/bgwVertexDevPlugin.mjs` — dev-server middleware wiring.

## What was extended, not modified (a genuine distinction, not a loophole)

- `src/research/bounded-generative-world/worldState.ts` — **unchanged** classification/consequence
  logic; only consumed via its already-exported functions (`yoheiCurrentActivity`,
  `miyokoCurrentActivity`, `npcsPresentAt`, `advanceWorldTick`, `hasActiveMaterial`,
  `commitConsequence`), none of which were edited this phase.
- `src/research/bounded-generative-world/packet.ts` — **unchanged**.
- `src/newlifebgw121/mapLayout.ts` (new file) — PURE presentation coordinates (which pixel/percent
  position a location marker sits at), explicitly NOT map logic (reachability still comes from
  `TRAVEL_EDGES`, untouched).

## What changed (all presentation, not generative behavior)

- `src/newlifebgw121/NewlifeBgw121App.tsx` — full visual rewrite (rendering, layout, new
  presentation-only local state like `justCommitted`); calls the exact same adapters, packet
  builder, and consequence-commit function as PHASE 12.1, unmodified.
- `src/newlifebgw121/newlifebgw121.css` (new) — visual styling.
- `src/newlifebgw121/mapLayout.ts` (new) — map node coordinates, presentation only.

## Confirmation the generative core is untouched

`tests/boundedGenerativeWorld.test.ts` (17 tests — classification, envelope validation, consequence
commit, NPC-independent progression) required **zero changes** this phase and all still pass
unmodified, directly demonstrating that no mechanical/generative behavior shifted underneath the
new visual layer.
