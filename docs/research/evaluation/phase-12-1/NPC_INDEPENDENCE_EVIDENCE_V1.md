# NPC Independence Evidence V1 — PHASE 12.1

Directive Section 10: prove with actual runtime state, not only declarations, that Yohei/Miyoko/Jin
have activities before PLAYER visits, and that at least one NPC's activity/location progresses
WITHOUT PLAYER interaction. This was a genuine gap found while assembling this phase's evidence
(the original implementation had NPC activity that was state-derived but never actually changed
over time on its own) and was fixed with a small, real mechanism before capturing final evidence —
not declared without a working implementation behind it.

## Activities exist before any visit (trivially true, verified directly)

`createInitialBgwState()` sets `flags.yoheiTaskActive: true` and `jinJobLocation: "YOHEI_STORE"`
before the component ever renders — `yoheiCurrentActivity`/`miyokoCurrentActivity`/`npcsPresentAt`
are pure functions of this pre-existing state, never of whether a location has been visited.

## Real mechanism added: `advanceWorldTick` (world clock progresses on PLAYER travel, not conversation)

```ts
export function jinJobLocationForTick(tick: number): LocationId | null {
  if (tick <= 2) return "YOHEI_STORE";
  if (tick <= 4) return "CAFE_NODOKA";
  return null;
}
export function advanceWorldTick(state: BgwWorldState): BgwWorldState {
  const worldTick = state.worldTick + 1;
  return { ...state, worldTick, jinJobLocation: jinJobLocationForTick(worldTick) };
}
```

Called once per PLAYER travel to ANY location (`NewlifeBgw121App.tsx`'s `travelTo`) — Jin's own job
progresses as a function of elapsed world-time, never of whether the PLAYER ever opens a
conversation with him specifically. This matches his canon ("moves between odd jobs across town;
no single fixed place of business") rather than being an arbitrary game-mechanic tick.

## Before/after state, captured directly (`tests/boundedGenerativeWorld.test.ts`)

```
BEFORE (worldTick=0): jinJobLocation="YOHEI_STORE"  -- npcsPresentAt(YOHEI_STORE) includes "jin"

... PLAYER travels twice (never talks to Jin) ...
AFTER 2 ticks:  jinJobLocation="YOHEI_STORE" (still finishing the same job)

... PLAYER travels a 3rd time ...
AFTER 3 ticks:  jinJobLocation="CAFE_NODOKA"  -- npcsPresentAt(YOHEI_STORE) no longer includes "jin"
                                                  npcsPresentAt(CAFE_NODOKA) now includes "jin"

... PLAYER travels twice more ...
AFTER 5 ticks:  jinJobLocation=null  -- Jin is not reachable at any of this slice's locations today
```

`experienceLog` is `[]` at every one of these checkpoints — confirmed directly in the test — proving
the progression happened with ZERO player-NPC interaction of any kind, not merely without talking
to Jin specifically.

## Real browser confirmation (not only a unit test)

`product_visual_qa_live_script.mjs`'s full run (real browser, live Vertex adapter): after
traveling TRIAL_HOUSE → SHOPPING_STREET → YOHEI_STORE (2 ticks), Jin was present and the location
narration read 「洋平は、詰まった倉庫の扉の修理を相馬に頼んでいるところだ。相馬が作業をしている。」
Later in the SAME run, after additional travel (SHOPPING_STREET → YOHEI_STORE again, more ticks
elapsed), Jin had moved on and the SAME location's narration read 「洋平は、倉庫の在庫を一人で運ぼう
としている。」 — a materially different scene at the identical location, produced entirely by the
world clock advancing during ordinary map travel, not by any consequence the player caused. See
`screenshots/02_yohei_store_encounter.png` and `screenshots/04_return_to_changed_location.png`.

## Verdict

**NPC INDEPENDENCE: PASS**, backed by real before/after runtime state (unit test) and a real
browser observation of the same effect (Playwright), not a declaration alone.
