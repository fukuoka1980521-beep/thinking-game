import { NPC_DEFS, npcDisplayName } from "../npcDefs";
import { npcAvailabilityAt } from "../schedule";
import { menuForNpc } from "../content/shop";
import { LOCATION_LABEL } from "../content/day1";
import { daysSinceLastMeeting, computePlayerNpcTags } from "../content/socialMemory";
import { LOCAL_PROBLEM_DEFS } from "../content/localProblemDefs";
import { isLocalProblemDiscovered, isLocalProblemResolved } from "../content/localProblemEngine";
import { formatClock } from "../types";
import type { CoreState, NpcId } from "../types";
import type { NpcAiContext } from "./types";

const MEMORY_WINDOW = 6; // last N turns with this NPC -- bounded, per directive's "全文を毎回送らない"

function describeMood(npc: NpcId, state: CoreState): string {
  const availability = npcAvailabilityAt(npc, state.time, state.flags);
  if (availability === "BUSY") return "少し立て込んでいて、余裕がない";
  if (state.time >= 17 * 60) return "一日の終わりが近く、少し疲れている";
  return "落ち着いている";
}

/** Section 16 -- item labels this NPC sold TODAY, in the order bought. Derived from the existing
 *  `purchase_${npc}_${time}` WorldFacts `engine.ts`'s `purchaseItems` already writes (day-stamped by
 *  `addWorldFact`), so no new state was needed -- only a recency-scoped read of state already kept. */
function recentPurchasesToday(npc: NpcId, state: CoreState): string[] {
  return state.worldFacts
    .filter((f) => f.day === state.day && f.id.startsWith(`purchase_${npc}_`))
    .map((f) => f.text);
}

/** Section 4/15 -- every LOCAL PROBLEM this NPC (as owner or hearsay) currently knows about and
 *  that isn't resolved yet, as the already-NPC-voiced line from the moment it was discovered. */
function knownLocalProblemMentions(npc: NpcId, state: CoreState): string[] {
  return LOCAL_PROBLEM_DEFS.filter((def) => (def.npc === npc || def.hearsayNpc === npc) && isLocalProblemDiscovered(def, state) && !isLocalProblemResolved(def, state)).map(
    (def) => def.discoverResultText,
  );
}

export function buildNpcAiContext(npc: NpcId, state: CoreState, playerInput: string): NpcAiContext {
  const def = NPC_DEFS[npc];
  const scheduleBlock = def.schedule.find((b) => state.time >= b.fromMinutes && state.time < b.toMinutes);
  const relevantFacts = state.worldFacts.filter((f) => f.knownBy.includes(npc)).map((f) => f.text);
  const fullMemory = state.npcMemory[npc] ?? [];
  const memory = fullMemory.slice(-MEMORY_WINDOW);

  return {
    npcId: npc,
    displayName: npcDisplayName(npc),
    identity: def.identity,
    personality: def.personality,
    speechStyle: def.speechStyle,
    values: def.values,
    likes: def.likes,
    dislikes: def.dislikes,
    currentMood: describeMood(npc, state),
    currentScheduleNote: scheduleBlock?.note ?? "特に決まった用事はない時間",
    currentLocation: state.playerLocation,
    knownFacts: [...def.knowledge.firsthand, ...def.knowledge.heard, ...relevantFacts],
    unknownFacts: def.knowledge.unknowns,
    memoryOfPlayer: memory,
    historicalTurnCount: fullMemory.length,
    daysSinceLastMeeting: daysSinceLastMeeting(npc, state),
    pendingPromiseWithPlayer: computePlayerNpcTags(npc, state).includes("pending_promise"),
    missedPromiseWithPlayer: computePlayerNpcTags(npc, state).includes("missed_promise"),
    // PHASE_12_4 -- `quality` (close/familiar/tense/distant) is deliberately NOT fed into the
    // prompt as a labeled axis (directive Section 5: not a stat the AI should ever recite); only
    // the free-prose `description` goes to the live model, same as before this Run.
    relationshipHistory: Object.entries(def.relationships).map(([otherId, rel]) => `${npcDisplayName(otherId as NpcId)}: ${rel.description}`),
    hiddenBackground: def.hiddenBackground,
    currentScene: `${LOCATION_LABEL[state.playerLocation]}で、プレイヤーと向き合っている`,
    day: state.day,
    timeLabel: formatClock(state.time),
    worldFactsRelevant: relevantFacts,
    availableMenu: menuForNpc(npc),
    recentPurchasesToday: recentPurchasesToday(npc, state),
    knownLocalProblemMentions: knownLocalProblemMentions(npc, state),
    playerInput,
  };
}
