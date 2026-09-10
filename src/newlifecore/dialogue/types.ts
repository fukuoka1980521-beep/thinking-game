import type { ConversationTurn, LocationId, NpcId } from "../types";
import type { NpcHiddenBackground } from "../npcDefs";
import type { ShopItem } from "../content/shop";

/** Directive Section 9 -- everything the AI is given per free-text turn. AI is only ever asked to
 *  perform ONE NPC's reply from this; it never receives or infers anything not listed here
 *  (knowledge-boundary enforcement starts at what this packet even contains, not just at prompt
 *  wording). `hiddenBackground` (CONTENT QUALITY GATE V1 Section 2) is the reason a line comes
 *  out the way it does -- never itself spoken or summarized by the NPC, only what shapes the
 *  reply underneath. */
export interface NpcAiContext {
  npcId: NpcId;
  displayName: string;
  identity: string;
  personality: string;
  speechStyle: string;
  values: string;
  likes: string[];
  dislikes: string[];
  currentMood: string;
  currentScheduleNote: string;
  currentLocation: LocationId;
  knownFacts: string[];
  unknownFacts: string[];
  memoryOfPlayer: ConversationTurn[];
  relationshipHistory: string[];
  hiddenBackground: NpcHiddenBackground;
  currentScene: string;
  day: number;
  timeLabel: string;
  worldFactsRelevant: string[];
  /** NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1 Section 11 -- BOUNDED, authored catalog;
   *  `null` for NPCs who do not run a shop (Kamiya, Jin) so the prompt never invents a menu for
   *  them either. The AI must answer product questions from this list only, never invent an item. */
  availableMenu: ShopItem[] | null;
  playerInput: string;
}

/** Deliberately minimal -- directive Section 14: the AI's sentence never confirms game state by
 *  itself, so the envelope carries nothing but the line it speaks. Whatever gets remembered from
 *  this turn is the player's own utterance (verbatim), not an AI-authored summary. */
export interface NpcReplyEnvelope {
  visibleUtterance: string;
}

export type NpcAiAdapter = (context: NpcAiContext) => Promise<NpcReplyEnvelope>;
