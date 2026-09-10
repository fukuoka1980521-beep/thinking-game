# Challenge Town Map System V1 — PHASE 12.0

Directive Section 5. The map is a game system (it generates encounters, directive Section 21), not
decorative art. Locations below are drawn from `NEWLIFE_CHAPTER1_STATE_MODEL_V01.md`'s "New
locations" section and `NEWLIFE_CHAPTER1_CAUSAL_MAP_V01.md`, both already-canonical and already
mapped to a real (if superseded-vintage) implementation's location IDs — reused, not invented.

## V1 location set (5 locations — within directive's 4-6 target)

| Location | Identity | Travel relationship | Possible NPC presence | World activity | Time relevance |
|---|---|---|---|---|---|
| **TRIAL_HOUSE** (temporary housing) | Protagonist's own space; the only fully private location | Starting point each day; short walk to SHOPPING_STREET | None (player-only) | Unpacking, the recurring recent-loss texture detail, morning departure / evening return | Anchors MORNING start and NIGHT end of the day-window |
| **SHOPPING_STREET** | Ordinary commercial street; hosts the notice board (Chain 4) and is the through-route to CAFE and Yohei's store | Central hub — connects to TRIAL_HOUSE, CAFE, YOHEI_STORE, CHALLENGE_CENTER (once known) | Yohei (his store fronts onto it), passersby/ambient life | Notice board inspectable object; general daily commerce | Available across the whole day-window |
| **YOHEI_STORE** | General store; Yohei's identity-defining location | Off SHOPPING_STREET | Yohei (primary), occasionally Daichi | Yohei's independent task (e.g., delivery stock), the AI-necessity experiment's home location | Morning/afternoon most active (matches "run his shop" as his stated daily purpose) |
| **CAFE_NODOKA** | Miyoko's café; also where the café-anomaly chain and Daichi/Chinatsu appear | Off SHOPPING_STREET | Miyoko (primary), Daichi (regular), Chinatsu (background presence) | Café service; the anomaly beat (never explained, per canon) | Whole day-window; canonically a recurring return-visit location |
| **CHALLENGE_CENTER** | Administrative/support office; Kamiya's location | Reachable once `challengeCenterKnown` (Chain 4) — before that, visible on the map as a place the player doesn't yet know the purpose of, or simply not yet listed, per the V1 scope decision below | Kamiya | Intake/consultation work; the WORK-axis mirror scene | Business hours framing (daytime) |

**V1 scope decision**: PARK and VACANT_STORE (both canonical, both real Chapter 1 locations) are
deliberately deferred past V1. Rationale: PARK has no assigned NPC or authored purpose beyond
"ordinary, not every location needs an event" (canon's own words) — low information density for a
5-location slice meant to prove NPC-independent-purpose and map-generates-encounters. VACANT_STORE
is gated on `strangeLightSeen`, itself an optional Day-1-night beat — appropriate for a fuller
30-day build, not a "part of one day" slice (directive Section 19). Both remain valid additions for
a PHASE 12.2+ expansion; their omission here is a scope choice, not a canon rejection.

## Why these 5 and not a "huge town"

Every location above has an assigned NPC OR a direct causal-chain function (notice board) OR is
the mandatory player-private anchor (TRIAL_HOUSE) — no decorative filler location. This matches
directive Section 5's explicit "meaningful places, not a huge town" requirement and Section 19's
"part of one day," not all 30.

## Location identity (directive Section 5 checklist, per location)

Already tabulated above (identity / travel relationship / NPC presence / activity / time
relevance). No location exists that fails to satisfy at least identity + one other column.

## Travel model

A simple graph, not a full 2D walkable map for V1 (matches "smallest spatial world," directive
Section 5's "do not treat as decorative artwork" — the requirement is meaningful travel structure,
not pixel-precision movement): TRIAL_HOUSE — SHOPPING_STREET — {YOHEI_STORE, CAFE_NODOKA,
CHALLENGE_CENTER*}. SHOPPING_STREET is the hub; the other three are leaves reachable from it.
`CHALLENGE_CENTER*`'s edge only exists once `challengeCenterKnown` (state-gated edge, not merely a
state-gated destination — the map's own connectivity changes with world state, itself a small
"map as game system" demonstration).

## Map × NPC intersection (directive Section 21 — the required non-menu encounter)

An encounter must emerge because an NPC was legitimately AT a location the player independently
chose, not because the player picked the NPC from a list. Concretely for V1: visiting YOHEI_STORE
during a `yoheiTaskActive` window produces an encounter with Yohei already mid-task (STATE A of
Section 10's AI-necessity experiment) — the player chose the LOCATION, not "talk to Yohei," and the
game surfaces what Yohei happens to be doing there. This is structurally different from the
fixed-dialogue baseline's model (NPC always present, always in the same idle state, waiting to be
clicked).

## Mobile layout / presentation note (forward pointer)

Full visual treatment is `CHARACTER_MAP_ART_DIRECTION_V1.md`'s job. Functionally: 5 location nodes
plus a hub layout is small enough to render as a simple node-and-edge or icon-list view at mobile
width without needing pan/zoom — noted here as a functional constraint the art spec must respect,
not a visual decision made by this document.
