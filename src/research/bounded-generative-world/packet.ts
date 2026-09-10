/**
 * PHASE 12.1: packet builder -- the ONE function that assembles CURRENT_CANON_INDEX +
 * CURRENT_WORLD_STATE + NPC_EXPERIENCE + PLAYER_CONTEXT into a dialogue packet
 * (GENERATIVE_CANON_INPUT_POLICY_V1.md, PHASE 12.0R). Pure function of state; never mutates
 * anything; used identically by both adapters so neither can drift from the other's view of the
 * world.
 */

import { NPC_CANON, WORLD_FACTS } from "./canonData";
import { hasActiveMaterial, miyokoCurrentActivity, yoheiCurrentActivity } from "./worldState";
import type { BgwNpcId, BgwWorldState, Classification, LocationId, NpcDialoguePacket } from "./types";

const ALLOWED_CLASSIFICATIONS: Classification[] = ["IN_SCOPE", "NPC_KNOWLEDGE_GAP", "NOT_FEASIBLE_NOW", "OUT_OF_WORLD_SCOPE", "INSUFFICIENT_CONTEXT"];

function npcActivity(npcId: BgwNpcId, state: BgwWorldState): string {
  if (npcId === "yohei") return yoheiCurrentActivity(state);
  if (npcId === "miyoko") return miyokoCurrentActivity(state);
  return state.jinJobLocation ? `相馬は、${state.jinJobLocation === "YOHEI_STORE" ? "洋平商店" : "喫茶のどか"}で修理の仕事をしている。` : "相馬は、今日はどこか別の場所で仕事をしているようだ。";
}

function npcLocationOf(npcId: BgwNpcId, state: BgwWorldState): LocationId {
  if (npcId === "yohei") return "YOHEI_STORE";
  if (npcId === "miyoko") return "CAFE_NODOKA";
  return state.jinJobLocation ?? "SHOPPING_STREET";
}

/** Which authored consequence ids are even reachable from THIS npc/location -- narrows the
 *  allowed-response boundary per interaction, not globally (directive Section 13's
 *  ALLOWED_RESPONSE_BOUNDARY field). */
function allowedConsequenceIdsFor(npcId: BgwNpcId, state: BgwWorldState): string[] {
  if (npcId === "yohei" && state.flags.yoheiTaskActive && state.jinJobLocation !== "YOHEI_STORE" && !hasActiveMaterial(state, "yohei_help_promise")) {
    return ["YOHEI_HELP_PROMISE"];
  }
  return [];
}

export function buildNpcDialoguePacket(npcId: BgwNpcId, state: BgwWorldState, playerUtterance: string): NpcDialoguePacket {
  const recent = state.experienceLog
    .filter((e) => e.npc === npcId)
    .slice(-3)
    .map((e) => `プレイヤー「${e.playerUtterance}」に対し、分類=${e.classification}`);
  return {
    npcId,
    canon: NPC_CANON[npcId],
    worldFacts: WORLD_FACTS,
    npcCurrentActivity: npcActivity(npcId, state),
    npcLocation: npcLocationOf(npcId, state),
    npcRelationshipToPlayer: "今月チャレンジ町に来た新しい滞在者として、顔を合わせたことがある程度の間柄",
    currentLocation: state.playerLocation,
    recentRelevantExperience: recent,
    playerUtterance,
    allowedClassifications: ALLOWED_CLASSIFICATIONS,
    allowedConsequenceIds: allowedConsequenceIdsFor(npcId, state),
  };
}
