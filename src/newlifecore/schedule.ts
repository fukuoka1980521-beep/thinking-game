/**
 * NEW LIFE CORE REDESIGN V1 -- derives an NPC's location/availability from the authored schedule
 * PLUS any world-event overrides (e.g. Yohei calling Jin over for help -- an NPC-NPC interaction
 * that moves the world whether or not the player is present to see it, directive Section 6).
 */
import { NPC_DEFS } from "./npcDefs";
import type { ClockMinutes, CoreState, LocationId, NpcId } from "./types";

export type Availability = "AVAILABLE" | "BUSY" | "AWAY" | "CLOSED";

export function npcLocationAt(npc: NpcId, time: ClockMinutes, flags: CoreState["flags"]): LocationId | null {
  // World-event override: Yohei phones Jin for the stockroom shelf around midday -- see
  // content/day1WorldEvents.ts. Independent of whether the player ever visits either of them.
  if (npc === "jin" && flags.jinCalledToYohei && time >= 11 * 60 + 30 && time < 13 * 60 + 30) {
    return "YOHEI_STORE";
  }
  const block = NPC_DEFS[npc].schedule.find((b) => time >= b.fromMinutes && time < b.toMinutes);
  return block?.location ?? null;
}

export function npcAvailabilityAt(npc: NpcId, time: ClockMinutes, flags: CoreState["flags"]): Availability {
  if (npc === "jin" && flags.jinCalledToYohei && time >= 11 * 60 + 30 && time < 13 * 60 + 30) {
    return "AVAILABLE";
  }
  const block = NPC_DEFS[npc].schedule.find((b) => time >= b.fromMinutes && time < b.toMinutes);
  if (!block) return "CLOSED";
  return block.availability;
}

export function npcsPresentAt(location: LocationId, time: ClockMinutes, flags: CoreState["flags"]): NpcId[] {
  return (Object.keys(NPC_DEFS) as NpcId[]).filter((npc) => npcLocationAt(npc, time, flags) === location);
}
