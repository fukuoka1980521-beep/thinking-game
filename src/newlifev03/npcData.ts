/**
 * NEW LIFE V0.3 -- local NPC reference data. Reuses (read-only) the frozen
 * ../research/bounded-generative-world/canonData NPC_CANON for yohei/miyoko/jin's
 * displayName/role so this module never re-defines their canon. Kamiya has no entry there (he
 * was out of PHASE 12.1's 3-NPC slice) -- his brief here matches
 * docs/research/evaluation/phase-12-0/CHARACTER_MAP_ART_DIRECTION_V1.md's Kamiya section
 * (36, Challenge Center employee, business-casual, earnest, not a bored bureaucrat).
 */
import { NPC_CANON } from "../research/bounded-generative-world/canonData";
import type { BgwNpcId } from "../research/bounded-generative-world/types";

export type V03NpcId = BgwNpcId | "kamiya";

export function npcDisplayName(id: V03NpcId): string {
  if (id === "kamiya") return "神谷";
  return NPC_CANON[id].displayName;
}

/** Static flavor only -- never shown as an explicit "relationship chart" in the UI (directive
 *  Section "NPC DEPTH": revealed through dialogue/behavior, not a stated diagram). Used to write
 *  cross-references in content.ts consistently rather than inventing a new fact each time. */
export const NPC_RELATIONSHIP_NOTES: Record<V03NpcId, string> = {
  yohei: "相馬とは長い付き合い。美代子とは商売相手（野菜や豆を融通し合う）。",
  miyoko: "洋平の店の客。相馬が店の修理で出入りすることがある。",
  jin: "洋平とは長い付き合い。頼まれれば喫茶のどかの修理もする。",
  kamiya: "洋平・美代子・相馬の仕事状況をある程度把握している（チャレンジセンター業務として）。",
};

export type NpcMood = "NEUTRAL" | "BUSY" | "WARM" | "TIRED" | "PREOCCUPIED";

/** Deterministic per-day mood -- NPCs are not uniformly kind every day (directive: "毎回親切に
 *  しない"). Pure function of (npc, day), not of player choices, so it is genuinely independent
 *  of the player (directive "WORLD CONTINUITY": "プレイヤー不在でも進行"). */
export function moodFor(npc: V03NpcId, day: number): NpcMood {
  const table: Record<V03NpcId, NpcMood[]> = {
    yohei: ["NEUTRAL", "BUSY", "NEUTRAL", "WARM", "BUSY", "NEUTRAL", "TIRED"],
    miyoko: ["WARM", "NEUTRAL", "TIRED", "NEUTRAL", "WARM", "BUSY", "NEUTRAL"],
    jin: ["NEUTRAL", "NEUTRAL", "BUSY", "TIRED", "NEUTRAL", "WARM", "BUSY"],
    kamiya: ["NEUTRAL", "BUSY", "NEUTRAL", "NEUTRAL", "PREOCCUPIED", "NEUTRAL", "BUSY"],
  };
  return table[npc][(day - 1) % 7];
}
