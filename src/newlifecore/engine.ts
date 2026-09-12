/**
 * NEW LIFE CORE REDESIGN V1 -- the only place CoreState is ever mutated. AI output never reaches
 * this file directly; it only ever supplies a visibleUtterance string that gets stored verbatim
 * as a ConversationTurn (directive Section 14: "AI出力によってゲームstateを直接確定しない").
 */
import { resolveWorldEvents } from "./content/day1WorldEvents";
import { resolveGeneratedEvents } from "./content/eventEngine";
import { EVENT_DEFS } from "./content/eventDefs";
import { itemById } from "./content/shop";
import { newPlayerPromise, resolvePendingPromiseOnMeet, sweepPlayerPromisesForNewDay } from "./content/socialMemory";
import type { TrajectorySeed } from "./content/trajectoryDefs";
import type { LocalProblemDef } from "./content/localProblemDefs";
import { dueLocalProblemResolutions, helpAccumulationMet } from "./content/localProblemEngine";
import type { ActivityDef } from "./content/activityDefs";
import { dueActivityResolutions } from "./content/activityEngine";
import { resolveMomentEventArrival } from "./content/momentEventEngine";
import { momentEventById } from "./content/momentEventDefs";
import type { EventThreadDef } from "./content/eventThreadDefs";
import { dueEventThreadAutoResolutions } from "./content/eventThreadEngine";
import { DAY_FORCE_SLEEP_MINUTES, DAY_SLEEP_AVAILABLE_FROM, DAY_START_MINUTES } from "./types";
import type { ClockMinutes, ConversationTurn, CoreState, LocationId, NpcId, PlayerExperience, RealWorldIntent, UserUpdateResponse, WorldFact } from "./types";

export function advanceTime(state: CoreState, minutes: number): CoreState {
  const prevTime = state.time;
  let next: CoreState = { ...state, time: state.time + minutes };
  next = resolveWorldEvents(prevTime, next);
  // PHASE_12_5 -- the recurring engine runs after the legacy DAY1-3 seed events, same call site,
  // same (prevTime, stateAfterAdvance) crossing-window shape. Independent of resolveWorldEvents:
  // neither reads the other's flags/facts, so call order has no behavioral effect between them.
  next = resolveGeneratedEvents(prevTime, next, EVENT_DEFS);
  if (next.time >= DAY_FORCE_SLEEP_MINUTES) {
    next = { ...next, ended: true };
  }
  return next;
}

export function moveTo(state: CoreState, location: LocationId): CoreState {
  const withTime = advanceTime(state, 15); // flat travel cost, directive Section 2's minute-based time economy
  const arrived: CoreState = {
    ...withTime,
    playerLocation: location,
    visitedLocations: withTime.visitedLocations.includes(location) ? withTime.visitedLocations : [...withTime.visitedLocations, location],
    // PHASE_12_8 Section 3/17 -- cumulative, never reset by startNewDay (unlike visitedLocations
    // above). Feeds content/retrospective.ts's "よく行った場所" ranking only; never displayed raw.
    locationVisitCounts: { ...withTime.locationVisitCounts, [location]: (withTime.locationVisitCounts[location] ?? 0) + 1 },
  };
  // PHASE_15 Section 9 -- "something might happen" the moment you actually arrive somewhere, the
  // one genuinely NEW trigger point this phase adds (every other engine hook fires on a clock tick;
  // this one fires on arrival). A pure no-op on the vast majority of moves (see
  // `resolveMomentEventArrival`'s own doc comment for the eligibility+chance gating).
  return resolveMomentEventArrival(arrived, location);
}

export function recordConversationTurn(state: CoreState, npc: NpcId, playerUtterance: string, npcReply: string): CoreState {
  const withTime = advanceTime(state, 10); // one free-text exchange costs real in-world minutes -- a soft bound against infinite chat (directive Section 7's "無制限AIチャットにはしない")
  const turn: ConversationTurn = { day: withTime.day, time: withTime.time, playerUtterance, npcReply };
  return {
    ...withTime,
    npcMemory: { ...withTime.npcMemory, [npc]: [...withTime.npcMemory[npc], turn] },
    // PHASE_12_6 Section 6 -- actually talking to this NPC is what counts as keeping a pending
    // promise from them (see socialMemory.ts's own doc comment for why "conversation," not just
    // "walked through the location").
    playerPromises: resolvePendingPromiseOnMeet(withTime.playerPromises, npc, withTime.day),
  };
}

/**
 * PHASE_12_6 Section 6/7 -- the ONLY two places a PlayerPromise's initial state is set, both
 * reachable exclusively from a real UI confirm action (PromiseOffer.tsx's accept/decline buttons),
 * mirroring `createRealWorldIntent`'s "never inferred from free text" discipline. `label` is always
 * the pre-authored invite text the offer displayed (`content/socialMemory.ts`'s `INVITE_LABELS`),
 * never AI-generated.
 */
// Includes `withTime.day` (not just time-of-day + array length, which `createRealWorldIntent`'s id
// pattern also uses) -- a daily schedule repeats the same clock times day after day, so on a long
// run the SAME npc can be invited at the SAME time-of-day with the SAME playerPromises.length on
// two DIFFERENT days, colliding without the day component (found via the 30-day social-memory
// simulation: 17 promises, only 6 unique ids).
export function acceptPlayerPromise(state: CoreState, npc: NpcId, label: string): CoreState {
  const withTime = advanceTime(state, 5);
  const promise = newPlayerPromise(`promise_${npc}_d${withTime.day}_${withTime.time}_${withTime.playerPromises.length}`, npc, withTime, label);
  return { ...withTime, playerPromises: [...withTime.playerPromises, promise] };
}

export function declinePlayerPromise(state: CoreState, npc: NpcId, label: string): CoreState {
  const withTime = advanceTime(state, 5);
  const promise = {
    ...newPlayerPromise(`promise_${npc}_d${withTime.day}_${withTime.time}_${withTime.playerPromises.length}`, npc, withTime, label),
    status: "declined" as const,
    resolvedOnDay: withTime.day,
  };
  return { ...withTime, playerPromises: [...withTime.playerPromises, promise] };
}

export function addWorldFact(state: CoreState, fact: Omit<WorldFact, "id"> & { id: string }): CoreState {
  if (state.worldFacts.some((f) => f.id === fact.id)) return state;
  return { ...state, worldFacts: [...state.worldFacts, { ...fact, day: fact.day ?? state.day }] };
}

export function doShortAction(state: CoreState, minutes = 10): CoreState {
  return advanceTime(state, minutes);
}

export interface PurchaseResult {
  state: CoreState;
  totalCost: number;
  purchasedLabels: string[];
}

/**
 * Directive Section 8/9/10 -- the ONLY function that ever changes `money`/`inventory`. Never
 * called from AI reply text; only from a real, structural UI confirm action
 * (NewlifeCoreApp.tsx's order/shopping picker). A no-op (zero cost, empty labels, unchanged state)
 * if nothing was selected or the player cannot afford it -- canonical actions never partially
 * succeed silently.
 */
export function purchaseItems(state: CoreState, npc: NpcId, itemIds: string[]): PurchaseResult {
  const items = itemIds.map((id) => itemById(id)).filter((i): i is NonNullable<ReturnType<typeof itemById>> => Boolean(i));
  const totalCost = items.reduce((sum, i) => sum + i.price, 0);
  if (items.length === 0 || totalCost > state.money) {
    return { state, totalCost, purchasedLabels: [] };
  }
  const withTime = advanceTime(state, 10); // one short transaction, same order of magnitude as a conversation turn
  const inventory = { ...withTime.inventory };
  for (const item of items) inventory[item.id] = (inventory[item.id] ?? 0) + 1;
  const labels = items.map((i) => i.label);
  const withFact = addWorldFact(withTime, {
    id: `purchase_${npc}_${withTime.time}`,
    time: withTime.time,
    text: `PLAYERが${labels.join("、")}を買った`,
    knownBy: [npc],
  });
  return { state: { ...withFact, money: withFact.money - totalCost, inventory }, totalCost, purchasedLabels: labels };
}

/** Directive Section 12/13/15 -- a real trial-house living action with a real result (food in
 *  hand becomes a meal), not a button that does nothing. Requires at least one food-ingredient
 *  item actually owned; a no-op otherwise (the UI never offers this action when it would be one). */
export function canCookMeal(state: CoreState): boolean {
  return Object.entries(state.inventory).some(([id, count]) => count > 0 && itemById(id)?.isFoodIngredient);
}

export function cookAndEat(state: CoreState): CoreState {
  if (!canCookMeal(state)) return state;
  const withTime = advanceTime(state, 20);
  return addWorldFact({ ...withTime, flags: { ...withTime.flags, ateMeal: true } }, { id: "ate_meal_day1", time: withTime.time, text: "PLAYERは仮住まいで食事をした", knownBy: [] });
}

export function canSleep(state: CoreState): boolean {
  return state.time >= DAY_SLEEP_AVAILABLE_FROM;
}

export function sleep(state: CoreState): CoreState {
  return { ...state, ended: true };
}

/**
 * PHASE_12_3 Section H/M -- the one function that crosses a day boundary. Persists everything that
 * should read as "the town remembers" (worldFacts, npcMemory, realWorldIntents, money, inventory,
 * intakeForm, all flags) and only resets what is genuinely day-scoped: the clock, location, and the
 * two flags that describe THIS day's own events (`ateMeal` -- a new day is a new question of
 * whether the player ate; `isRaining` -- yesterday's weather doesn't carry over). `flags` like
 * `met_*`, `intakeFormSubmitted`, `shelfFixed`, `jinCalledToYohei`, `rainHappened` persist
 * unchanged, which is also why day1WorldEvents.ts's one-time triggers correctly never refire on a
 * later day (their `!flags.x` guards are already false).
 */
export function startNewDay(state: CoreState): CoreState {
  // PHASE_12_5 -- isDrizzling (content/eventDefs.ts's drizzle_start/drizzle_end pair) joins the
  // same day-scoped reset as isRaining: normally cleared same-day by drizzle_end, but this is the
  // fail-safe for the edge case where the player sleeps mid-drizzle before 14:00.
  const { ateMeal: _ateMeal, isRaining: _isRaining, isDrizzling: _isDrizzling, ...persistentFlags } = state.flags;
  const nextDay = state.day + 1;
  const advanced: CoreState = {
    ...state,
    day: nextDay,
    time: DAY_START_MINUTES,
    playerLocation: "TRIAL_HOUSE",
    visitedLocations: ["TRIAL_HOUSE"],
    flags: persistentFlags,
    ended: false,
    // PHASE_12_6 Section 6/12 -- overdue pending promises become "missed" (never surfaced as a
    // failure anywhere downstream, see socialMemory.ts), and old resolved promises are pruned so
    // this array stays bounded over a long session.
    playerPromises: sweepPlayerPromisesForNewDay(state.playerPromises, nextDay),
  };
  // PHASE_13 Section 7/19 -- local problems that came due (via player help/connect, or resolving on
  // their own without the player) resolve at the START of the new day, same timing shape as every
  // other "town remembers overnight" mechanic in this codebase.
  const withLocalProblems = tickLocalProblemsForNewDay(advanced);
  // PHASE_14 Section 10 -- same timing for GAMEPLAY ACTIVITY world-changes.
  const withActivities = tickActivitiesForNewDay(withLocalProblems);
  // PHASE_15 Section 19 -- same timing for EVENT THREADS the player has stopped engaging with.
  return tickEventThreadsForNewDay(withActivities);
}

/**
 * PHASE_12_3 Section H -- the ONLY place a RealWorldIntent is created. Called strictly from a real
 * UI confirm action (RealityBridgeOffer.tsx), never inferred from the conversation content itself
 * (mirrors purchaseItems' "structural action, not parsed AI text" discipline). Records exactly what
 * the player wrote as `playerStatement`/`intentLabel` -- no inferred label is ever constructed here
 * or anywhere else in this codebase.
 */
export function createRealWorldIntent(state: CoreState, npc: NpcId, playerStatement: string, intentLabel: string): CoreState {
  const withTime = advanceTime(state, 5);
  const intent: RealWorldIntent = {
    id: `intent_${npc}_${withTime.time}_${withTime.realWorldIntents.length}`,
    npc,
    createdOnDay: withTime.day,
    createdAt: withTime.time,
    playerStatement,
    intentLabel,
    checkedIn: false,
  };
  return addWorldFact(
    { ...withTime, realWorldIntents: [...withTime.realWorldIntents, intent] },
    { id: `${intent.id}_created`, time: withTime.time, text: `PLAYERは「${intentLabel}」を試してみると話した。`, knownBy: [npc] },
  );
}

/**
 * PHASE_12_3 Section H -- "その後どうだった？" answered through a real UI (RealityBridgeCheckIn.tsx,
 * the six-option/free-text panel), never scored. `USER_UPDATE`, not `ACTION_RESULT` -- no
 * success/failure framing is stored or derivable from this record; `response` is a plain category
 * of what happened, and `note` (optional) is the player's own words if they chose 自由記述.
 */
const USER_UPDATE_LABEL: Record<UserUpdateResponse, string> = {
  did_it: "やってみた",
  did_not: "やらなかった",
  partially: "少しだけやった",
  changed: "状況が変わった",
  undecided: "まだ決めていない",
  other: "自由記述",
};

export function checkInRealWorldIntent(state: CoreState, intentId: string, response: UserUpdateResponse, note: string): CoreState {
  const target0 = state.realWorldIntents.find((i) => i.id === intentId);
  if (!target0 || target0.checkedIn) return state; // true no-op, mirrors addWorldFact's dedupe discipline
  const withTime = advanceTime(state, 5);
  const target = withTime.realWorldIntents.find((i) => i.id === intentId)!;
  const updated: RealWorldIntent = { ...target, checkedIn: true, userUpdate: { day: withTime.day, response, note } };
  const withIntent = {
    ...withTime,
    realWorldIntents: withTime.realWorldIntents.map((i) => (i.id === intentId ? updated : i)),
  };
  const detail = note.trim() ? `「${note.trim()}」` : `「${USER_UPDATE_LABEL[response]}」`;
  return addWorldFact(withIntent, {
    id: `${intentId}_checked_in`,
    time: withTime.time,
    text: `PLAYERは、以前の「${target.intentLabel}」について、${detail}と話した。`,
    knownBy: [target.npc],
  });
}

export function timeRemainingLabel(time: ClockMinutes): string {
  const remaining = DAY_FORCE_SLEEP_MINUTES - time;
  if (remaining <= 0) return "まもなく日が変わる";
  return `${Math.floor(remaining / 60)}時間程度`;
}

/**
 * PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 Section 6/13 -- the ONE function behind both the
 * unlabeled "help again" action and the (once accepted) "work" action -- same seed, same cooldown,
 * same bookkeeping; only the caller picks which label/reward tier applies (content/day1.ts, based
 * on `trajectoryEngine.ts`'s `hasAcceptedTrajectory`). Real time and real (modest) money, so
 * Section 15's opportunity cost and Section 14's "money is a constraint, not a score" both fall out
 * of the existing engine primitives (`advanceTime`, `state.money`) for free -- no new economy system.
 */
export function recordTrajectoryEngagement(state: CoreState, seed: TrajectorySeed, minutes: number, money: number, resultText: string): CoreState {
  const withTime = advanceTime(state, minutes);
  const prior = withTime.playerExperiences.find((e) => e.id === seed.id);
  const updated: PlayerExperience = prior
    ? { ...prior, count: prior.count + 1, lastDay: withTime.day }
    : { id: seed.id, npc: seed.npc, count: 1, lastDay: withTime.day };
  const playerExperiences = prior ? withTime.playerExperiences.map((e) => (e.id === seed.id ? updated : e)) : [...withTime.playerExperiences, updated];
  const withExperience = { ...withTime, playerExperiences, money: withTime.money + money };
  return addWorldFact(withExperience, { id: `${seed.id}_engaged_d${withExperience.day}`, time: withExperience.time, text: resultText, knownBy: [seed.npc] });
}

/**
 * Section 6/8/12 -- the ONLY place `flags[seed.acceptedFlag]` is ever set, reachable exclusively
 * from a real UI confirm action (LifeOpportunityOffer.tsx), mirroring `acceptPlayerPromise`'s
 * discipline. Never framed as a "job" internally beyond a boolean flag -- no separate employment
 * record, no salary schedule, nothing resembling a career-progress system.
 */
export function acceptLifeOpportunity(state: CoreState, seed: TrajectorySeed): CoreState {
  const withTime = advanceTime(state, seed.opportunityMinutes);
  const withFlag = { ...withTime, flags: { ...withTime.flags, [seed.acceptedFlag]: true }, money: withTime.money + seed.opportunityMoney };
  // day-stamped so content/day1.ts's end-of-day narrative can show this happened TODAY specifically
  // (the same "today, not ever" discipline every other narrative line in this codebase already
  // follows) -- flags alone carry no timestamp, so a real WorldFact is what makes that possible here.
  return addWorldFact(withFlag, { id: `${seed.id}_accepted_d${withFlag.day}`, time: withFlag.time, text: seed.acceptedResultText, knownBy: [seed.npc], category: "world_change" });
}

/** Section 7/11 -- declining is resolved immediately (never a lingering "pending opportunity"
 *  record -- there is nothing to leave unresolved), and only ever records WHEN, for the short
 *  re-offer cooldown `opportunityEligible` (trajectoryEngine.ts) reads. */
export function declineLifeOpportunity(state: CoreState, seed: TrajectorySeed): CoreState {
  const withTime = advanceTime(state, 5);
  const withDecline = { ...withTime, lifeOpportunityDeclines: { ...withTime.lifeOpportunityDeclines, [seed.id]: withTime.day } };
  return addWorldFact(withDecline, { id: `${seed.id}_declined_d${withDecline.day}`, time: withDecline.time, text: seed.declinedResultText, knownBy: [seed.npc] });
}

/** Section 29 -- change of mind. Clears the accepted flag; deliberately does NOT touch
 *  `playerExperiences` (the count of times they've done this before is still a true fact about
 *  their history, even after stepping back -- Section 9's "meaningful experience" persists
 *  regardless of the current engagement decision) and does NOT set a decline-cooldown (stepping
 *  back is not a decline of a fresh offer; the opportunity to resume later should stay just as open
 *  as the original one was, matching Section 11's "second chances" spirit). */
export function stepBackFromTrajectory(state: CoreState, seed: TrajectorySeed): CoreState {
  const withTime = advanceTime(state, 5);
  const { [seed.acceptedFlag]: _removed, ...flags } = withTime.flags;
  // PHASE_12_8 Section 17/19 -- a permanent historical marker (never cleared, unlike
  // `acceptedFlag`) so content/retrospective.ts can say "途中でやめた" even if the player later
  // re-accepts the SAME trajectory or moves on to a different one entirely -- the fact that a
  // step-back happened at some point is itself a real, past-tense fact about their 30 days.
  const withoutFlag = { ...withTime, flags: { ...flags, [`${seed.id}_ever_stepped_back`]: true } };
  return addWorldFact(withoutFlag, { id: `${seed.id}_stepback_d${withoutFlag.day}`, time: withoutFlag.time, text: seed.stepBackResultText, knownBy: [seed.npc] });
}

/**
 * PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 Section 6/7 -- late-game consequence for an
 * ALREADY-ACCEPTED trajectory. Never a promotion/rank system -- one flat, occasional textured beat
 * ("今度は少し任される") per seed, gated by day/prior-work-count/cooldown
 * (`trajectoryEngine.ts`'s `lateConsequenceEligible`), reachable only through a real scene action.
 */
export function recordLateConsequence(state: CoreState, seed: TrajectorySeed): CoreState {
  const withTime = advanceTime(state, 30);
  const withMoney = { ...withTime, money: withTime.money + seed.lateConsequenceMoney, lateConsequenceLastFired: { ...withTime.lateConsequenceLastFired, [seed.id]: withTime.day } };
  return addWorldFact(withMoney, {
    id: `${seed.id}_late_d${withMoney.day}`,
    time: withMoney.time,
    text: seed.lateConsequenceResultText,
    knownBy: [seed.npc],
    category: "shared_event",
  });
}

/**
 * PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 Section 4/13 -- the ONLY place a problem
 * moves from "ambient cue" to real player knowledge, reachable only from the structural
 * "気になったので聞いてみる"-style scene action (content/day1.ts), never inferred from free text.
 * `localProblemsKnown[id]` stores the DAY discovered (Section 14: player-facing memory, never a
 * displayed list) -- also stamps a WorldFact known by both the owning NPC and (if defined) the
 * hearsay NPC, so the latter can genuinely reference it in conversation too (Section 4's hearsay
 * discovery path, reusing the existing knowledge-boundary mechanism, not a new one).
 */
export function discoverLocalProblem(state: CoreState, def: LocalProblemDef): CoreState {
  if (state.localProblemsKnown[def.id] !== undefined) return state;
  const withTime = advanceTime(state, 10);
  const withKnown = { ...withTime, localProblemsKnown: { ...withTime.localProblemsKnown, [def.id]: withTime.day } };
  const knownBy: NpcId[] = def.hearsayNpc ? [def.npc, def.hearsayNpc] : [def.npc];
  return addWorldFact(withKnown, { id: `${def.id}_discovered`, time: withKnown.time, text: def.discoverResultText, knownBy, category: "place_knowledge" });
}

/** Section 6/7 -- an ordinary help action, never a "quest accept". Sets the intermediate
 *  `player_helped` status and bumps the accumulate-mode counter; the actual world-change text
 *  (Section 8's reward) is never written here -- only `tickLocalProblemsForNewDay` (below), once
 *  `resolveAfterDays` have genuinely passed, ever writes that. */
export function respondToLocalProblemHelp(state: CoreState, def: LocalProblemDef): CoreState {
  if (!def.helpActionLabel || !def.helpResultText) return state;
  const withTime = advanceTime(state, 40);
  const helpCount = (withTime.localProblemHelpCount[def.id] ?? 0) + 1;
  const withCounted = { ...withTime, localProblemHelpCount: { ...withTime.localProblemHelpCount, [def.id]: helpCount } };
  // PHASE_15 Section 2 -- ACTIVITY CONSEQUENCE CLOCK fix: fix the resolution anchor the FIRST time
  // the accumulation condition is met, and never again -- a help action after the anchor is already
  // set (whether because this same call just met it, or an earlier one already did) must not move it.
  const alreadyAnchored = withCounted.localProblemResolutionAnchor[def.id] !== undefined;
  const anchorNow = !alreadyAnchored && helpAccumulationMet(def, withCounted);
  const withCount: CoreState = {
    ...withCounted,
    localProblemResolutionAnchor: anchorNow ? { ...withCounted.localProblemResolutionAnchor, [def.id]: withCounted.day } : withCounted.localProblemResolutionAnchor,
    localProblemLastPlayerAction: { ...withCounted.localProblemLastPlayerAction, [def.id]: withCounted.day },
    localProblemStatus: { ...withCounted.localProblemStatus, [def.id]: "player_helped" },
  };
  return addWorldFact(withCount, { id: `${def.id}_helped_d${withCount.day}`, time: withCount.time, text: def.helpResultText, knownBy: [def.npc], category: "shared_event" });
}

/** Section 6/7 -- connecting the problem to another NPC, equally valid to helping directly and
 *  equally never forced -- resolves through the SAME daily tick, on the SAME "数日後" timing.
 *  PHASE_15 Section 2 -- connect is always a single, immediate-mode action (no accumulation), so its
 *  anchor is fixed on this action whenever it isn't already set (a repeat connect attempt after
 *  the fact is not currently offered anyway -- `localProblemConnectEligible` already blocks it once
 *  status is "player_connected" -- but the same-time-as-set-once discipline is kept here regardless,
 *  matching the help mutator's shape exactly). */
export function respondToLocalProblemConnect(state: CoreState, def: LocalProblemDef): CoreState {
  if (!def.connectNpc || !def.connectActionLabel || !def.connectResultText) return state;
  const withTime = advanceTime(state, 20);
  const alreadyAnchored = withTime.localProblemResolutionAnchor[def.id] !== undefined;
  const withStatus: CoreState = {
    ...withTime,
    localProblemResolutionAnchor: alreadyAnchored ? withTime.localProblemResolutionAnchor : { ...withTime.localProblemResolutionAnchor, [def.id]: withTime.day },
    localProblemLastPlayerAction: { ...withTime.localProblemLastPlayerAction, [def.id]: withTime.day },
    localProblemStatus: { ...withTime.localProblemStatus, [def.id]: "player_connected" },
  };
  return addWorldFact(withStatus, { id: `${def.id}_connected_d${withStatus.day}`, time: withStatus.time, text: def.connectResultText, knownBy: [def.npc, def.connectNpc], category: "shared_event" });
}

/**
 * PHASE_15 Section 9-24 -- the ONLY place a moment event's response is recorded, reachable exclusively
 * from a real scene-action click (never inferred from free text, same discipline as every other
 * structural action in this file). A no-op if the def/choice pair doesn't actually exist or the event
 * isn't the one currently active there -- mirrors `discoverLocalProblem`'s defensive-dedupe shape.
 */
export function respondToMomentEvent(state: CoreState, defId: string, choiceId: string): CoreState {
  const def = momentEventById(defId);
  const choice = def?.choices.find((c) => c.id === choiceId);
  if (!def || !choice || state.momentEventShownDay[def.id] !== state.day || state.flags[`moment_${def.id}_resolved`]) return state;
  const withTime = advanceTime(state, 5);
  const withFlags: CoreState = { ...withTime, flags: { ...withTime.flags, [`moment_${def.id}_resolved`]: true, ...(choice.setFlags ?? {}) } };
  return addWorldFact(withFlags, { id: `${def.id}_d${withFlags.day}`, time: withFlags.time, text: choice.resultText, knownBy: [], category: "shared_event" });
}

/**
 * PHASE_15 Section 25-31 -- the ONLY place `state.eventThreads[def.id]` is first created, reachable
 * only from the real "様子が気になったので聞いてみる"-style discover action (content/day1.ts), same
 * pattern as `discoverLocalProblem`.
 */
export function discoverEventThread(state: CoreState, def: EventThreadDef): CoreState {
  if (state.eventThreads[def.id] !== undefined) return state;
  const withTime = advanceTime(state, 10);
  const withThread: CoreState = {
    ...withTime,
    eventThreads: { ...withTime.eventThreads, [def.id]: { status: "DISCOVERED", stageIndex: 0, discoveredOnDay: withTime.day, lastPlayerProgressDay: withTime.day } },
  };
  return addWorldFact(withThread, { id: `${def.id}_discovered`, time: withThread.time, text: def.discoverResultText, knownBy: def.knownBy, category: def.category });
}

/**
 * Section 27 -- advances a thread exactly one stage via a real scene action. When the stage just
 * completed was the LAST one in `def.stages`, the thread resolves as `RESOLVED` and its `resultText`
 * is recorded as the thread's own conclusion (Section 25's "プレイヤーが最後まで関わりきった場合の
 * 結末"); otherwise it simply moves to `PROGRESSED` awaiting the next beat.
 */
export function progressEventThread(state: CoreState, def: EventThreadDef): CoreState {
  const runtime = state.eventThreads[def.id];
  if (!runtime || runtime.stageIndex >= def.stages.length) return state;
  const stage = def.stages[runtime.stageIndex];
  const withTime = advanceTime(state, 15);
  const isFinal = runtime.stageIndex + 1 >= def.stages.length;
  const withThread: CoreState = {
    ...withTime,
    eventThreads: {
      ...withTime.eventThreads,
      [def.id]: { ...runtime, stageIndex: runtime.stageIndex + 1, status: isFinal ? "RESOLVED" : "PROGRESSED", lastPlayerProgressDay: withTime.day },
    },
  };
  const factId = isFinal ? `${def.id}_resolved` : `${def.id}_stage_d${withThread.day}_${runtime.stageIndex}`;
  return addWorldFact(withThread, { id: factId, time: withThread.time, text: stage.resultText, knownBy: def.knownBy, category: isFinal ? "world_change" : def.category });
}

/** Section 19 -- called from `startNewDay`, same timing as `tickLocalProblemsForNewDay`/
 *  `tickActivitiesForNewDay`. A thread the player has stopped engaging with resolves on its own,
 *  using its OWN authored `resolvedWithoutPlayerText` (Section 19: never dressed up as a player
 *  accomplishment). */
function tickEventThreadsForNewDay(state: CoreState): CoreState {
  const due = dueEventThreadAutoResolutions(state);
  let next = state;
  for (const def of due) {
    const runtime = next.eventThreads[def.id];
    next = { ...next, eventThreads: { ...next.eventThreads, [def.id]: { ...runtime, status: "RESOLVED_WITHOUT_PLAYER" } } };
    next = addWorldFact(next, { id: `${def.id}_resolved_without_player_d${next.day}`, time: next.time, text: def.resolvedWithoutPlayerText, knownBy: def.knownBy, category: "world_change" });
  }
  return next;
}

/**
 * Section 7/19 -- called from `startNewDay`, AFTER the day has already advanced (so "today" below
 * means the new day). Writes the small number of resolutions `dueLocalProblemResolutions` (a pure
 * function, content/localProblemEngine.ts) determined were due -- world-change text for a
 * player-driven resolution, a DIFFERENT plain sentence for a without-player resolution (Section 19:
 * never dressed up as a player accomplishment when the player did nothing). Both stay ordinary
 * WorldFacts, read by `buildEndOfDayNarrative`/ambient scene text exactly like everything else --
 * never a separate "problems resolved" panel.
 */
function tickLocalProblemsForNewDay(state: CoreState): CoreState {
  const due = dueLocalProblemResolutions(state);
  let next = state;
  for (const { def, outcome } of due) {
    const text = outcome === "resolved" ? def.worldChangeText : (def.autoResolveText ?? def.worldChangeText);
    const knownBy: NpcId[] = def.hearsayNpc ? [def.npc, def.hearsayNpc] : [def.npc];
    next = {
      ...next,
      localProblemStatus: { ...next.localProblemStatus, [def.id]: outcome },
    };
    next = addWorldFact(next, { id: `${def.id}_${outcome}_d${next.day}`, time: next.time, text, knownBy, category: "world_change" });
  }
  return next;
}

/**
 * PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 Section 6/9/10 -- the ONLY place an activity session resolves,
 * called exactly once when the player ends the session (budget exhausted or they chose to wrap up).
 * `doneTasks` is whatever subset of `def.tasks` was actually completed -- partial completion is the
 * NORMAL case, never a failure state, and this function does not distinguish "why" the session ended
 * (out of time vs. player chose to stop) since Section 6 treats both as equally legitimate outcomes.
 * Time spent is the sum of the done tasks' own minutes (never the full budget -- a player who does
 * one 10-minute task and then stops should not be charged for 35 unused minutes).
 */
export function runActivity(state: CoreState, def: ActivityDef, doneTasks: { id: string; minutes: number; resultText: string }[]): CoreState {
  const totalMinutes = doneTasks.reduce((sum, t) => sum + t.minutes, 0);
  const withTime = advanceTime(state, totalMinutes);
  const count = (withTime.activityHelpCount[def.id] ?? 0) + 1;
  // PHASE_15 Section 2 -- ACTIVITY CONSEQUENCE CLOCK fix: same anchor-once discipline as
  // `respondToLocalProblemHelp` above. Fixed the exact session `completionThreshold` is first
  // reached; every session after that (the player kept helping past the threshold) leaves it alone.
  const alreadyAnchored = withTime.activityResolutionAnchor[def.id] !== undefined;
  const anchorNow = !alreadyAnchored && count >= def.completionThreshold;
  const withCount: CoreState = {
    ...withTime,
    activityHelpCount: { ...withTime.activityHelpCount, [def.id]: count },
    activityResolutionAnchor: anchorNow ? { ...withTime.activityResolutionAnchor, [def.id]: withTime.day } : withTime.activityResolutionAnchor,
    activityLastDone: { ...withTime.activityLastDone, [def.id]: withTime.day },
  };
  const reaction = doneTasks.length >= def.tasks.length ? def.npcReactionAllDone : doneTasks.length >= 2 ? def.npcReactionPartial : def.npcReactionMinimal;
  return addWorldFact(withCount, { id: `${def.id}_session_d${withCount.day}_${withCount.time}`, time: withCount.time, text: reaction, knownBy: [def.npc], category: "shared_event" });
}

/** Section 10 -- called from `startNewDay`, same "resolve at the start of the new day" timing as
 *  `tickLocalProblemsForNewDay`. */
function tickActivitiesForNewDay(state: CoreState): CoreState {
  const due = dueActivityResolutions(state);
  let next = state;
  for (const { def } of due) {
    next = { ...next, activityResolved: { ...next.activityResolved, [def.id]: true } };
    next = addWorldFact(next, { id: `${def.id}_worldchange_d${next.day}`, time: next.time, text: def.worldChangeText, knownBy: [def.npc], category: "world_change" });
  }
  return next;
}

/** Section 4/19 -- the ONLY place `day30ReflectionText` is ever written, from a real UI textarea
 *  (Day30Retrospective.tsx), never inferred or summarized. Stores exactly what the player typed,
 *  verbatim, or `null` if they skipped it -- both are valid, final states. */
export function submitDay30Reflection(state: CoreState, text: string): CoreState {
  const trimmed = text.trim();
  return { ...state, day30ReflectionText: trimmed.length > 0 ? trimmed : null };
}
