/**
 * NEW LIFE CORE REDESIGN V1 -- shared types. This module is deliberately independent of
 * ../research/bounded-generative-world (frozen, PHASE 12.1) and ../newlifev02 / ../newlifev03
 * (superseded, kept only as routes) -- it reuses NPC canon facts (read-only) from canonData.ts
 * where the NPC already exists there, but defines its own richer NPC model, its own dialogue
 * envelope, and its own world/time engine, per this directive's explicit rejection of
 * career-score-driven state ("単純スコアで人生を決めない").
 */

// PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 3 -- BARBERSHOP renamed to
// FORTUNE_HOUSE (a true 1-for-1 replacement, not an addition -- location count stays 7). Daisuke
// himself is NOT deleted (see npcDefs.ts's own note on his now-empty `schedule`) -- only the
// location he used to occupy changed purpose.
export type LocationId = "TRIAL_HOUSE" | "CHALLENGE_CENTER" | "YOHEI_STORE" | "CAFE_NODOKA" | "COMMUNITY_HALL" | "SHOPPING_STREET" | "FORTUNE_HOUSE";

// PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 Section 9 -- exactly one new, occasional
// (not core-daily) NPC added this phase, grounded in a real local-problem need (an elderly customer
// of Yohei's who has trouble getting his own shopping done -- Section 10's "older resident" gap),
// not roster padding. Section 11's location count is deliberately left unchanged this phase (he is
// reachable at YOHEI_STORE on his own light schedule, not a new place) -- see the phase's CLOSE
// report for why NPC/location expansion was kept minimal rather than run to this phase's ceiling.
// PHASE_15 Section 5/6 -- Shizuko (the new Fortune House NPC) added. Daisuke is deliberately KEPT
// in this union (not deleted -- Section 6's "データ破壊禁止") even though nothing in the game can
// reach him anymore once his `schedule` is emptied (npcDefs.ts) -- every `Record<NpcId, ...>` map
// that already had his entry stays valid and untouched, and his full characterization survives
// intact for a possible future phase, rather than being destructively removed.
export type NpcId = "kamiya" | "yohei" | "miyoko" | "jin" | "daisuke" | "hina" | "fumiko" | "kiyoshi" | "shizuko";

/** Minutes since 00:00. */
export type ClockMinutes = number;

export function formatClock(minutes: ClockMinutes): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1 Section 7 -- optional tag proving
 *  the directive's "Life Material" categories (OBJECT/PLACE_KNOWLEDGE/PROMISE/PENDING_TASK/
 *  SHARED_EVENT/WORLD_CHANGE) are real, filterable, testable state -- not just prose. Deliberately
 *  NOT a new parallel data system: a WorldFact tagged `category` is still just a WorldFact, stored
 *  and knowledge-boundary-filtered exactly like any other (see contextBuilder.ts -- unchanged).
 *  Untagged facts (the existing PHASE 12.1-12.3 ones) remain valid; this is additive only. */
export type LifeMaterialCategory = "promise" | "pending_task" | "shared_event" | "world_change" | "place_knowledge" | "object";

/** A plain-language fact the world now holds -- never a scored/typed career signal. Optionally
 *  known by specific NPCs (knowledge-boundary + gossip realism); "player" is always implicit.
 *  `day` (PHASE_12_4, optional -- `engine.ts`'s `addWorldFact` auto-fills it from `state.day` when
 *  omitted) lets end-of-day narration and future content distinguish "this happened today" from
 *  "this happened three days ago" instead of a fact staying permanently, repetitively mentionable
 *  forever once true (directive Section 8's "同じ日にならない" applies to the end-of-day screen
 *  too, not just what's visitable during the day). */
export interface WorldFact {
  id: string;
  day?: number;
  time: ClockMinutes;
  text: string;
  knownBy: NpcId[];
  category?: LifeMaterialCategory;
}

/** One free-text conversation turn, stored verbatim -- memory is the record of what was actually
 *  said, not an AI-generated summary (directive: "数値点数ではなく、出来事/発言記録を優先する").
 *  `day` (PHASE_12_3) lets the conversation UI show today's exchange live while collapsing earlier
 *  days behind a short summary, instead of an ever-growing single column (directive Section E). */
export interface ConversationTurn {
  day: number;
  time: ClockMinutes;
  playerUtterance: string;
  npcReply: string;
}

/**
 * PHASE_12_4 Section 5 -- NPC<->NPC relationships, not just PLAYER<->NPC. Each NPC's own
 * `NPC_DEFS[x].relationships` map (npcDefs.ts) is a directed edge from their own point of view
 * (asymmetric on purpose -- two people's sense of the same relationship is rarely identical).
 * `quality` is a coarse, human-readable label, deliberately NOT a numeric score (directive:
 * "擬似精密な人格スコアにはしない") -- it exists only so scripted content can branch on it
 * (e.g. whether Jin's line about Fumiko reads warm or merely dutiful), never shown to the player as
 * a stat and never fed to the live prompt as a labeled axis (only `description`'s free prose is).
 */
export type RelationshipQuality = "close" | "familiar" | "tense" | "distant";

export interface NpcRelationship {
  description: string;
  quality: RelationshipQuality;
}

export type EmploymentStatus = "working" | "not_working" | "other";

/** NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 -- Kamiya's first-meeting intake form,
 *  filled out through real UI (IntakeForm.tsx), not claimed via free text. Stored verbatim, never
 *  scored or classified into a career/personality type (directive Section 5) -- what the player
 *  actually wrote, as a fact of how DAY1 started, nothing more. */
export interface IntakeForm {
  name: string;
  employmentStatus: EmploymentStatus;
  cameHereReason: string;
  currentThoughts: string;
  troubles: string;
}

/** NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1 -- an item the player actually owns,
 *  bought through a real, structural purchase action (never inferred from AI conversation text,
 *  directive Section 8). `itemId` keys into content/shop.ts's `SHOP_ITEMS` catalog. */
export type Inventory = Record<string, number>;

/**
 * PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1, Section H -- created ONLY through a real UI
 * confirmation (RealityBridgeOffer, never inferred from free text alone -- directive Section 1's
 * "world/action consistency" principle applies here too: saying "I'll try it" in chat is not the
 * same as the player pressing the button that actually creates this record). `playerStatement` and
 * `intentLabel` are always the player's own words, verbatim -- never an AI-generated summary or
 * diagnosis (Section 7/I: "PLAYER is lazy" style inference is never constructed anywhere in this
 * codebase). Scoped to `npc: "daisuke"` for V1 -- only the Thinking Resident runs this loop.
 */
export type UserUpdateResponse = "did_it" | "did_not" | "partially" | "changed" | "undecided" | "other";

export interface RealWorldIntent {
  id: string;
  npc: NpcId;
  createdOnDay: number;
  createdAt: ClockMinutes;
  /** The player's own free-text turn that read as a real-life concern -- quoted, not paraphrased. */
  playerStatement: string;
  /** The small thing the player chose to try, in their own words. */
  intentLabel: string;
  checkedIn: boolean;
  userUpdate?: {
    day: number;
    response: UserUpdateResponse;
    note: string;
  };
}

/** PHASE_12_5_NEW_LIFE_RECURRING_WORLD_ENGINE_V1 Section 3 -- the adopted event families. All 8
 *  candidates from the directive turned out to have real canon support (see npcDefs.ts's
 *  currentConcerns/hiddenBackground/relationships), so V1 uses all 8 rather than narrowing further. */
export type EventFamily = "WORK" | "SOCIAL" | "PLACE" | "WEATHER" | "PROMISE" | "ROUTINE_BREAK" | "SHARED_SMALL_EVENT" | "RESOURCE";

/**
 * PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 Section 6 -- an NPC's own
 * invitation to the player ("明日、よかったら寄って"), created ONLY through a real UI confirmation
 * (PromiseOffer.tsx), never inferred from free text -- the same "structural action, not parsed AI
 * text" discipline `RealWorldIntent` already established. Deliberately separate from
 * `RealWorldIntent` (Section 15: Reality Bridge stays Daisuke-only and unrelated to social
 * relationship) -- this is the general NPC<->PLAYER promise mechanic every NPC can use.
 *
 * `status` is the only outcome field, and it is a plain category, never a score (Section 3: no
 * friendship/trust/affection meter). "missed" carries no penalty semantics anywhere this type is
 * read -- see `content/socialMemory.ts`'s derivation functions, which read it only to decide
 * whether an acknowledgement is eligible, never to accumulate a number.
 */
export type PromiseStatus = "pending" | "kept" | "missed" | "declined";

export interface PlayerPromise {
  id: string;
  npc: NpcId;
  createdOnDay: number;
  /** The day by which meeting this NPC counts as keeping the promise -- a small, fixed window
   *  (content/socialMemory.ts), not an open-ended obligation. */
  dueByDay: number;
  /** Authored, natural-language invite text (content/socialMemory.ts's per-NPC catalog) -- never
   *  AI-generated, mirrors `RealWorldIntent.intentLabel`'s "never an inferred label" discipline. */
  label: string;
  status: PromiseStatus;
  /** Set once `status` leaves "pending" -- the day kept/missed/declined was determined, so
   *  Section 12's decay/pruning (engine.ts's `startNewDay`) can age resolved promises out. */
  resolvedOnDay?: number;
}

export interface CoreState {
  /** PHASE_12_3 -- starts at 1. Only `startNewDay` (engine.ts) advances it; nothing else in this
   *  codebase is allowed to write it directly (mirrors the "only engine.ts mutates CoreState"
   *  discipline already documented at the top of engine.ts). */
  day: number;
  started: boolean;
  time: ClockMinutes;
  playerLocation: LocationId;
  visitedLocations: LocationId[];
  worldFacts: WorldFact[];
  npcMemory: Record<NpcId, ConversationTurn[]>;
  flags: Record<string, boolean>;
  intakeForm: IntakeForm | null;
  /** Starting cash for the 30-day trial stay -- a modest, ordinary amount (ART/CONTENT DECISION,
   *  not canon-specified), never displayed as a game-score, only as an ordinary yen amount. */
  money: number;
  inventory: Inventory;
  realWorldIntents: RealWorldIntent[];
  /** Section I -- defaults false. Gameplay (including the Reality Bridge loop itself) never checks
   *  this flag; it only gates whether `content/research.ts`'s `deriveResearchObservation` is ever
   *  called from the UI. Opting out changes nothing about how the game plays. */
  researchOptIn: boolean;
  ended: boolean;
  /** PHASE_12_5 -- recurring-event-engine bookkeeping (content/eventEngine.ts). Maps an
   *  EventDefinition.id to the last `day` it fired, purely so cooldown can be evaluated as plain
   *  state (directive Section 13: "STATE IS CANONICAL"), never re-derived by asking the AI or by
   *  scanning worldFacts text. Persists across days like worldFacts/flags -- `startNewDay` does not
   *  reset it, matching the "the town remembers" discipline already applied to those fields. */
  eventLastFired: Record<string, number>;
  /** Same idea, one level coarser -- last day ANY event of a given family fired, so a family-level
   *  cooldown (directive Section 7: avoid the same FAMILY firing back-to-back) doesn't require
   *  scanning every individual event id. */
  familyLastFired: Partial<Record<EventFamily, number>>;
  /** PHASE_12_6 Section 6 -- the general NPC<->PLAYER promise mechanic. `content/socialMemory.ts`
   *  derives all categorical relationship tags (has_met/shared_history/pending_promise/
   *  missed_promise/familiar/slightly_awkward) from this array plus `npcMemory`/`flags` on demand --
   *  deliberately no separate stored "relationship" struct, so there is nothing extra to keep in
   *  sync or decay (Section 12: avoid state bloat). `startNewDay` (engine.ts) sweeps this array:
   *  overdue pending promises flip to "missed", and old resolved promises are pruned. */
  playerPromises: PlayerPromise[];
  /**
   * PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 Section 9 -- "meaningful experience," never a numeric
   * skill/ability. One entry per `TrajectorySeed.id` the player has ever engaged with at least once.
   * `count` exists ONLY to gate the Section 6 "experience before label" threshold
   * (`content/trajectoryEngine.ts`'s `opportunityEligible`) -- like `socialMemory.ts`'s
   * `familiar` tag (>=3 turns), it is an internal gate, never displayed as a level/XP number
   * anywhere (Section 3's ban applies here exactly as it did to relationships).
   */
  playerExperiences: PlayerExperience[];
  /** Section 11 -- "second chances": a declined opportunity must be able to resurface later, but
   *  Section 11 also forbids re-offering "同じ誘いを何度も機械的に出さない". Maps a
   *  `TrajectorySeed.id` to the last day it was declined, so `opportunityEligible` can apply a
   *  short cooldown before the SAME seed offers again -- mirrors `eventLastFired`'s shape exactly,
   *  a separate field only because trajectory seed ids and event ids are different namespaces. */
  lifeOpportunityDeclines: Record<string, number>;
  /**
   * PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 Section 3/17 -- how many times the player
   * has ever ARRIVED at each location (via `moveTo`), across the whole game, never reset by
   * `startNewDay` (unlike `visitedLocations`, which IS reset daily and only tracks "visited today").
   * Exists solely so `content/retrospective.ts` can rank "よく行った場所" -- the raw count itself is
   * never displayed; only used to pick which place(s) the retrospective's prose mentions. Same
   * "internal count, never a score" discipline as `PlayerExperience.count`.
   */
  locationVisitCounts: Partial<Record<LocationId, number>>;
  /** Section 7 -- last day each seed's late-game consequence fired (mirrors `eventLastFired`'s
   *  shape) -- a separate small map because it needs its own cooldown independent of the ordinary
   *  engage/work cooldown, and only ever applies once a trajectory is already accepted. */
  lateConsequenceLastFired: Record<string, number>;
  /** Section 4 -- the player's own words, verbatim, never AI-generated or analyzed (Section 5/18/19:
   *  never summarized into a personality claim). `null` until answered; skippable, so `null` at
   *  Day 30 is itself a valid, final state, not an error. Deliberately a single flat string, not a
   *  structured record -- there is nothing to derive FROM this field, it exists only to be read
   *  back to the player as their own words (Section 19's "PLAYER-CREATED MEANING"). */
  day30ReflectionText: string | null;
  /**
   * PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 Section 4/13/14 -- maps a
   * `LocalProblemDef.id` to the day the PLAYER first learned of it. Absence = not yet discovered by
   * the player (the problem may still exist in the world; canonical existence is not gated on
   * player knowledge -- Section 19: the town does not wait for the player to notice anything).
   * Never surfaced as a "依頼一覧" list (Section 14) -- read only by `content/day1.ts` (to decide
   * whether a response action is offered) and by `dialogue/contextBuilder.ts` (to decide whether an
   * NPC's `knownFacts` includes it, Section 15).
   */
  /**
   * PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 Section 5-10 -- GAMEPLAY ACTIVITY bookkeeping. An activity
   * session (`content/activityEngine.ts`'s `runActivity`) increments `activityHelpCount` by 1
   * regardless of how many of its tasks were actually completed (partial completion is a normal,
   * valid outcome, never a failure) and stamps `activityLastDone`. `activityResolved` is set only by
   * the daily tick once `completionThreshold` sessions have accumulated AND `resolveAfterDays` have
   * passed since the last one -- mirrors `localProblemStatus`'s "never instant" discipline exactly,
   * deliberately a separate small map rather than folded into the local-problem ones (different id
   * namespace, different definitions file).
   */
  activityHelpCount: Record<string, number>;
  activityLastDone: Record<string, number>;
  activityResolved: Record<string, boolean>;
  /**
   * PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 2 -- the ACTIVITY CONSEQUENCE CLOCK
   * fix. The day `completionThreshold` sessions were FIRST reached, written exactly once per
   * activity (never overwritten by a later session, unlike `activityLastDone` above, which keeps
   * updating for cooldown/eligibility purposes). `dueActivityResolutions` now measures
   * `resolveAfterDays` from THIS anchor, not from the most recent session -- so continuing to help
   * past the threshold can never push the world-change further away. Mirrors
   * `localProblemResolutionAnchor` below exactly (Section 2's explicit "common mechanism, common
   * fix" requirement -- both systems had the identical bug, both get the identical fix).
   */
  activityResolutionAnchor: Record<string, number>;
  localProblemsKnown: Record<string, number>;
  /**
   * Section 7/19 -- the WORLD's own resolution state per problem, entirely independent of whether
   * the player ever discovered it. Absence = still unresolved. Never a numeric progress bar --
   * exactly one of a small, plain set of outcomes, each read only to pick which authored line
   * (content/localProblemDefs.ts) narrates it, never displayed as a status label.
   */
  localProblemStatus: Record<string, LocalProblemStatus>;
  /** Section 7 -- how many distinct days the player has taken the "help" response for a given
   *  problem, purely to gate the small number of accumulate-type problems' resolution threshold
   *  (mirrors `PlayerExperience.count`'s "internal gate, never a score" discipline exactly). */
  localProblemHelpCount: Record<string, number>;
  /** Section 7 -- the day of the player's most recent help/connect action on this problem, so its
   *  world-consequence resolution can land a realistic "数日後" later rather than the same instant
   *  (mirrors `eventLastFired`'s shape). */
  localProblemLastPlayerAction: Record<string, number>;
  /** PHASE_15 Section 2 -- same ACTIVITY CONSEQUENCE CLOCK fix as `activityResolutionAnchor` above,
   *  applied to local problems: the day the resolution-triggering condition (accumulation threshold
   *  met for "accumulate"-mode help, or the single help/connect action itself otherwise) was FIRST
   *  satisfied, fixed once, never moved by further help/connect actions on an already-anchored
   *  problem. */
  localProblemResolutionAnchor: Record<string, number>;
  /**
   * PHASE_15 Section 9-24 -- HYBRID EVENT ENCOUNTER V1: MOMENT EVENTS. Maps a `MomentEventDef.id` to
   * the day it was last shown to the player (stamped once, on arrival, by
   * `content/momentEventEngine.ts`'s `resolveMomentEventArrival`, called from `moveTo`). This single
   * field does double duty as (a) "already shown today, don't show a second time on a revisit" and
   * (b) the cooldown basis for the def not reappearing again too soon on a LATER day -- deliberately
   * NOT reset by `startNewDay` (mirrors `eventLastFired`'s persistence). Whether the player actually
   * responded is tracked separately via `flags[`moment_${id}_resolved`]` (mirrors the recurring event
   * engine's own `flags[def.id]=true` convention) so an ignored moment event's choices simply vanish
   * at the next day boundary without ever blocking or nagging (Section 23: fully ignorable).
   */
  momentEventShownDay: Record<string, number>;
  /**
   * PHASE_15 Section 25-31 -- HYBRID EVENT ENCOUNTER V1: EVENT THREADS. One entry per
   * `EventThreadDef.id` the player has ever discovered; absence = not yet discovered (mirrors
   * `localProblemsKnown`'s absence semantics). `stageIndex` is the count of POST-DISCOVERY stages
   * completed so far (0 = just discovered, nothing past that yet); `lastPlayerProgressDay` is the
   * anchor `content/eventThreadEngine.ts`'s daily tick measures `autoProgressAfterDays` from -- unlike
   * the PHASE A activity/local-problem clock fix, a thread's `lastPlayerProgressDay` is deliberately
   * allowed to keep moving forward on each real stage advance (each advance IS genuine progress
   * toward resolution, not a repeated non-qualifying action, so this is not the Section 2 bug: nothing
   * here defers an already-earned resolution, it only postpones the "town moves on without you"
   * fallback for as long as the player keeps genuinely engaging).
   */
  eventThreads: Record<string, EventThreadRuntimeState>;
  /**
   * PHASE_16_NEW_LIFE_GAME_IDENTITY_REBUILD_V1 Section 18 -- FORTUNE PERSISTENCE: the most recently
   * drawn Fortune House card and the day it was drawn, set exactly once per draw (`engine.ts`'s
   * `recordFortuneCardSelection`) and never cleared by `startNewDay` (persists like every other
   * cross-day memory field). Deliberately minimal -- no raw player free text is ever stored here
   * (existing privacy rule, unchanged) -- only enough to let `content/day1.ts`'s `openingLineFor`
   * greet the player with a card-aware "その後どうでした？" follow-up on a later visit.
   */
  lastFortuneCard: { cardId: string; day: number } | null;
}

/**
 * PHASE_15 Section 25 -- a multi-day mini-story's own state machine, entirely derived from real
 * player/world actions, never a numeric quest-progress bar (mirrors `LocalProblemStatus`'s "plain
 * category, never a score" discipline). `DISCOVERED` = the player has learned of it but not yet
 * advanced it; `ACTIVE`/`PROGRESSED` = at least one further stage has been reached through real player
 * engagement; `WAITING` is reserved for a thread whose next stage is not yet eligible (currently
 * unused by V1's linear stage lists -- kept in the type for a future branching thread, Section 26's
 * own explicit list); `RESOLVED` = the player carried it to its final stage; `ABANDONED` is reserved
 * for a thread the player explicitly stepped back from (unused by V1 -- no thread currently offers a
 * step-back action, since none commits the player to anything); `RESOLVED_WITHOUT_PLAYER` = the world
 * moved it to its conclusion on its own because the player stopped engaging (Section 19's "player is
 * not the hero" applied to threads, same principle as `LocalProblemStatus`'s identical outcome).
 */
export type EventThreadStatus = "DISCOVERED" | "ACTIVE" | "WAITING" | "PROGRESSED" | "RESOLVED" | "ABANDONED" | "RESOLVED_WITHOUT_PLAYER";

export interface EventThreadRuntimeState {
  status: EventThreadStatus;
  stageIndex: number;
  discoveredOnDay: number;
  lastPlayerProgressDay: number;
}

/** Section 7/19 -- deliberately NOT a numeric score or percentage. `player_helped`/`player_connected`
 *  are set the moment the player takes that response (an intermediate state -- the world hasn't
 *  visibly changed yet); `resolved`/`resolved_without_player` are set only by the daily resolution
 *  tick (content/localProblemEngine.ts's `tickLocalProblems`, called from `startNewDay`), never
 *  immediately on the player's own action -- the "数日後" gap is real elapsed game time, not a
 *  cosmetic delay. */
export type LocalProblemStatus = "player_helped" | "player_connected" | "resolved" | "resolved_without_player";

/** PHASE_12_7 Section 7 -- the adopted trajectory families. V1 implements exactly 3 concrete seeds
 *  (Section 25) spanning 3 of these families; UNCOMMITTED is deliberately not a family an
 *  opportunity ever targets -- it is simply what happens when a player never accepts one, and
 *  requires no code of its own (Section 8: never a failure state). */
export type TrajectoryFamily = "EMPLOYMENT" | "INDEPENDENT" | "SHOP_BUSINESS" | "COMMUNITY" | "RELATIONSHIP_BASED";

export interface PlayerExperience {
  /** A `TrajectorySeed.id` (content/trajectoryDefs.ts). */
  id: string;
  npc: NpcId;
  count: number;
  lastDay: number;
}

// 08:45 -- chosen so the first, arranged Challenge Center visit (a 15-minute walk) lands right at
// Kamiya's 09:00 opening, never showing "closed" for the one meeting the day is structured around.
export const DAY_START_MINUTES = 8 * 60 + 45;
export const DAY_FORCE_SLEEP_MINUTES = 23 * 60 + 30; // 23:30
export const DAY_SLEEP_AVAILABLE_FROM = 20 * 60; // 20:00, player may choose to sleep

export function createInitialCoreState(): CoreState {
  return {
    day: 1,
    started: false,
    time: DAY_START_MINUTES,
    playerLocation: "TRIAL_HOUSE",
    visitedLocations: ["TRIAL_HOUSE"],
    worldFacts: [],
    npcMemory: { kamiya: [], yohei: [], miyoko: [], jin: [], daisuke: [], hina: [], fumiko: [], kiyoshi: [], shizuko: [] },
    flags: {},
    intakeForm: null,
    money: 8000,
    inventory: {},
    realWorldIntents: [],
    researchOptIn: false,
    ended: false,
    eventLastFired: {},
    familyLastFired: {},
    playerPromises: [],
    playerExperiences: [],
    lifeOpportunityDeclines: {},
    locationVisitCounts: {},
    lateConsequenceLastFired: {},
    day30ReflectionText: null,
    activityHelpCount: {},
    activityLastDone: {},
    activityResolved: {},
    activityResolutionAnchor: {},
    localProblemsKnown: {},
    localProblemStatus: {},
    localProblemHelpCount: {},
    localProblemLastPlayerAction: {},
    localProblemResolutionAnchor: {},
    momentEventShownDay: {},
    eventThreads: {},
    lastFortuneCard: null,
  };
}
