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
  // PHASE_12_4 -- Hina isn't anywhere at all until her shop actually opens (day >= 3, see
  // content/day1WorldEvents.ts); her `schedule` block only describes her hours AFTER that.
  if (npc === "hina" && !flags.hinaShopOpen) {
    return null;
  }
  const block = NPC_DEFS[npc].schedule.find((b) => time >= b.fromMinutes && time < b.toMinutes);
  return block?.location ?? null;
}

export function npcAvailabilityAt(npc: NpcId, time: ClockMinutes, flags: CoreState["flags"]): Availability {
  if (npc === "jin" && flags.jinCalledToYohei && time >= 11 * 60 + 30 && time < 13 * 60 + 30) {
    return "AVAILABLE";
  }
  if (npc === "hina" && !flags.hinaShopOpen) {
    return "CLOSED";
  }
  const block = NPC_DEFS[npc].schedule.find((b) => time >= b.fromMinutes && time < b.toMinutes);
  if (!block) return "CLOSED";
  return block.availability;
}

export function npcsPresentAt(location: LocationId, time: ClockMinutes, flags: CoreState["flags"]): NpcId[] {
  return (Object.keys(NPC_DEFS) as NpcId[]).filter((npc) => npcLocationAt(npc, time, flags) === location);
}

/**
 * PHASE_15_1_CLOSED_STATE_UX_FIX -- the ONLY source of "when does this place open again" text
 * anywhere in the codebase. Reads the NPC's own canonical `schedule` (npcDefs.ts) directly -- never a
 * hardcoded per-location string -- so a future schedule edit can never leave a closed-state message
 * stale. Returns the earliest later-today block start for this NPC at this location, or `null` if
 * nothing more opens there today (the correct case for "closed for the rest of the day," where
 * telling the player to wait would be misleading rather than helpful).
 */
export function nextOpeningTimeAt(npc: NpcId, location: LocationId, afterTime: ClockMinutes): ClockMinutes | null {
  const upcoming = NPC_DEFS[npc].schedule
    .filter((b) => b.location === location && b.fromMinutes > afterTime)
    .sort((a, b) => a.fromMinutes - b.fromMinutes);
  return upcoming.length > 0 ? upcoming[0].fromMinutes : null;
}
