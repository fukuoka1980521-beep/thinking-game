# Vertical Slice Product Flow V1 — PHASE 12.0

Directive Section 19, 22.

## Time window (directive Section 19 — "not 30 days, one small window")

**V1 scope: Day 1, MORNING through AFTERNOON** (not the full day-to-NIGHT cycle the existing
Chapter 1 `TimeOfDay` enum supports). Rationale: the opening (`OPENING_PRODUCT_SPEC_V1.md`) plus
one map traversal plus one full NPC encounter (including the AI-necessity experiment's 3-state
comparison) plus one consequence commit is fully demonstrable within a morning-into-afternoon
window without needing NIGHT's separate beats (café anomaly's deeper texture, the strange light) —
those remain valid PHASE 12.2+ additions once the core loop is proven.

## The flow (directive Section 22)

```
OPENING (OPENING_PRODUCT_SPEC_V1.md)
  ↓
first town/map view (CHALLENGE_TOWN_MAP_SYSTEM_V1.md -- 5 locations, TRIAL_HOUSE as start)
  ↓
PLAYER chooses where to go (structured map control, per BOUNDED_FREE_TEXT_CONVERSATION_V1.md's
  "MAP = structured controls" division)
  ↓
location scene (e.g. YOHEI_STORE)
  ↓
NPC/world activity already occurring (NPC_CURRENT_ACTIVITY read from state -- Yohei mid-task in
  STATE A, or not, depending on accumulated world state -- NOT reset to a default "idle, waiting"
  pose)
  ↓
PLAYER chooses whether/how to engage (structured: approach / leave; matches existing ACCEPT/
  DECLINE/LEAVE pattern from the fixed-dialogue baseline, kept because it is still the right shape
  for THIS decision)
  ↓
free conversation becomes available (BOUNDED_FREE_TEXT_CONVERSATION_V1.md)
  ↓
world/NPC reaction (WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md's full pipeline)
  ↓
something may remain afterward (a committed LifeMaterial consequence, e.g. a PROMISE -- directive
  Section 20)
  ↓
return to map (world state persists; a later visit to the same location may look different,
  demonstrating persistence without needing a full day/night cycle)
```

## Minimal world simulation proof requirements (directive Section 19, checked against this flow)

| Requirement | Where satisfied |
|---|---|
| PLAYER can move | Map traversal step |
| NPCs exist independently | NPC/world activity step, state-derived, not menu-derived |
| Same location can differ by world state | Revisiting YOHEI_STORE after a task resolves (or after Daichi arrives) shows a different `NPC_CURRENT_ACTIVITY` — same location, different content |
| Meeting depends on world conditions | CHALLENGE_CENTER only reachable once `challengeCenterKnown` (map edge itself is state-gated, `CHALLENGE_TOWN_MAP_SYSTEM_V1.md`) |
| Conversation depends on accumulated context | `RECENT_RELEVANT_EXPERIENCE`/`NPC_RELATIONSHIP_TO_PLAYER` fields feed every generation call — a second conversation is never context-free |

## Recommended PHASE 12.1 implementation scope (required final question 13, restated here as the
## flow this document specifies)

The smallest slice that actually exercises every mandatory component (directive Section 3) without
building the full 30-day game:

1. New isolated route (e.g. `?newlife12=1`), NOT a further mutation of `newlifeplayable11`
   (`FIXED_DIALOGUE_BASELINE_STATUS_V1.md`).
2. Opening beat (text-only is acceptable for V1; `OPENING_PRODUCT_SPEC_V1.md`).
3. Map view: 5 locations, simple node/hub presentation (functional, not final art —
   `CHARACTER_MAP_ART_DIRECTION_V1.md` is the spec for later art, not a blocker for a placeholder
   V1 render).
4. One NPC fully wired end-to-end (recommend **Yohei** — richest existing canonical grounding,
   reuses the most from the fixed-dialogue baseline's already-proven packet/adapter shapes) with:
   a. state-derived `CURRENT_ACTIVITY` (STATE A/B/C from Section 8's experiment),
   b. bounded free-text input,
   c. deterministic test adapter wired first (CI-safe),
   d. the local live Vertex adapter wired second, gated fully behind `import.meta.env.DEV` /
      explicit Owner-triggered use, never required for tests.
5. Miyoko and Kamiya present on the map with authored `CURRENT_ACTIVITY` text (state-derived, not
   yet full free-text conversation) — satisfies "at least 3 NPCs have independent activities"
   (directive Section 6) without requiring 3x the generative-pipeline wiring in the first slice.
6. One consequence commit (a `PROMISE` material from a successful Yohei help-offer, per
   `WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md` §Consequence).
7. Real-browser Playwright regression using the deterministic test adapter (matches this project's
   established verification pattern); a SEPARATE, explicitly-labeled Owner-only manual session
   using the live adapter for the actual AI-necessity Product evidence (directive Section 16's
   "Owner Product experiment must be able to use real model output").

Explicitly NOT in PHASE 12.1: PARK/VACANT_STORE, the café anomaly, Yui, Iwata, Chinatsu, Daichi,
NIGHT time-of-day, any multi-day persistence. All remain valid, canon-grounded future expansion,
deliberately deferred to keep the first slice small and falsifiable.
