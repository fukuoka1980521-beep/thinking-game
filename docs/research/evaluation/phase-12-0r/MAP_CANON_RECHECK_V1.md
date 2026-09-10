# Map Canon Recheck V1 — PHASE 12.0R

Directive Section 8: re-evaluate the PHASE 12.0 5-location map against corrected canon. Do not
expand unless necessary.

## What changes and why

`CHALLENGE_TOWN_MAP_SYSTEM_V1.md` (PHASE 12.0) included `CHALLENGE_CENTER` specifically as
Kamiya's location, sourced from the older, thinner Challenge Town Bible characterization. Two
independent things changed this:

1. Kamiya's occupation is now UNKNOWN/CONFLICTING (`NEW_LIFE_CURRENT_CANON_INDEX_V1.md` Part 3) —
   the "Challenge Center employee" framing is not confirmed by the current, more detailed cast
   canon, which instead places him at the community hall (集会所) and on coordination visits to
   the shops.
2. Kamiya is not in the PHASE 12.1 active trio at all (`PHASE_12_1_NPC_SELECTION_V1.md`) — so a
   location authored specifically to host him is no longer needed for V1's actual NPC set
   (Yohei, Miyoko, Jin).

## Corrected V1 location set — still 5 locations (a swap, not an expansion)

| Location | PHASE 12.0 version | PHASE 12.0R correction |
|---|---|---|
| TRIAL_HOUSE | unchanged | unchanged — canon-confirmed ("DAY1: arrival, temporary housing," `NEW_LIFE_30DAY_WORLD_MASTER_V1.md`) |
| SHOPPING_STREET | unchanged (hub) | unchanged — canon-confirmed (shōtengai is the hub of every `docs/world/` NPC's "places legitimately visited" list) |
| YOHEI_STORE | unchanged | unchanged — canon-confirmed, now ALSO a possible Jin job-site (「洋平の詰まった倉庫の扉を直す」-style witnessable jobs, `NEW_LIFE_CAST_MASTER_V2.md`) |
| CAFE_NODOKA | unchanged | unchanged — canon-confirmed, now ALSO a possible Jin job-site (chair/shelf repair for Miyoko) |
| ~~CHALLENGE_CENTER~~ → **COMMUNITY_HALL** | Kamiya's location, sourced from the UNCONFIRMED-by-later-canon characterization | Replaced with **COMMUNITY_HALL (集会所)** — canon-confirmed in `docs/world/NEW_LIFE_CAST_MASTER_V1.md` (Yohei's/Kamiya's shōtengai-meeting location, later Jin's festival-labor site) and `NEW_LIFE_30DAY_WORLD_MASTER_V1/V2.md`'s civic thread. Kept in the location SET even though Kamiya isn't in the active trio, because it is real canon texture reachable from the hub and gives Jin a third possible (if likely inactive on Day 1 specifically, since festival-hall labor starts DAY11+) job-site, keeping the map genuinely canon-grounded rather than removing a location for no reason |

**Net result: still 5 locations, same hub-and-spoke shape, zero net expansion.** One location's
name/grounding changed; the total count and structure did not.

## PARK / VACANT_STORE / COLLECTION_AREA — still deferred, now for a slightly different reason

PHASE 12.0 deferred PARK and VACANT_STORE as low-information-density/gated-on-optional-content.
COLLECTION_AREA (ゴミ集積所, Iwata/Saeki's canon anchor) is now ALSO a real, confirmed location, but
is deferred for the same reason PARK was: it has no assigned role for any of the 3 active-trio
NPCs, and Iwata/Saeki are themselves correctly "NOT NEEDED IN SLICE" this phase
(`CAST_CANON_AUDIT_V1.md`). Kept as a documented, canon-real PHASE 12.2+ candidate, not silently
dropped.

## Jin's placement is a state field, not a static assignment

Unlike Yohei/Miyoko's fixed `YOHEI_STORE`/`CAFE_NODOKA` anchors, Jin's location for a given visit
is itself world-state-derived ("wherever a job takes him," canon) — implemented the same way
`NPC_CURRENT_ACTIVITY` already works for Yohei (`WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`), just
applied to LOCATION as well as activity for this one NPC. This is not a new mechanism; it reuses
the state-derived-presence pattern PHASE 12.0 already designed, now demonstrated on the NPC whose
canon most directly calls for it.

## Verdict

**MAP CANON: PASS.** No location was added or removed net; one location's grounding was corrected
from an unconfirmed characterization to a directly canon-sourced one, and the set remains
consistent with the corrected NPC trio.
