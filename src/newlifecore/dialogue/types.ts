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
  /** PHASE_12_4 -- the FULL (unwindowed) lifetime turn count with this NPC, separate from
   *  `memoryOfPlayer` (which stays windowed to MEMORY_WINDOW for the live prompt). Exists because
   *  the 30-day structural simulation (tests/newlifecoreThirtyDaySimulation.test.ts) measured that
   *  `deterministicAdapter.ts`'s variety-picker seed, previously `memoryOfPlayer.length`, silently
   *  froze at a constant value once the window filled (day 7+ of 30 all picked the same reply
   *  variant) -- the exact kind of "same greeting frequency" monotony Section I asks this Run to
   *  measure honestly rather than launder away. */
  historicalTurnCount: number;
  /** PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 Section 14 -- `null` if
   *  never met or no conversation turn yet. Fed to the live prompt as an optional, natural-entry
   *  signal ("3日ぶり") the model MAY use, never a mandatory callback -- see the server-only live
   *  prompt builder's own instruction wording (never referenced by path here -- that module lives
   *  outside src/, and tests/safety.test.ts's own guard flags any string mentioning its path from
   *  within src/, on purpose). The deterministic adapter uses this mechanically (a REUNION reply
   *  bucket, `>= 3` days) so the effect is testable without a live model. */
  daysSinceLastMeeting: number | null;
  /** Section 6/14 -- true if this NPC currently has an unresolved (not yet due) promise with the
   *  player. Never itself a reason to force a line about it -- see the same "natural, not
   *  mandatory" note above. */
  pendingPromiseWithPlayer: boolean;
  /** Section 4/14 -- true only while a missed promise with this NPC is still RECENT (see
   *  socialMemory.ts's `MISSED_PROMISE_RELEVANCE_DAYS`) -- an old miss stops being relevant on its
   *  own, without any separate decay bookkeeping here. */
  missedPromiseWithPlayer: boolean;
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
