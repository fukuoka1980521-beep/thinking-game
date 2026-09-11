/**
 * PHASE_12_5_NEW_LIFE_RECURRING_WORLD_ENGINE_V1 -- the recurring world engine. Where
 * day1WorldEvents.ts (unchanged, still runs) is four bespoke, hand-coded, one-shot `if` blocks,
 * this module is a single generic evaluator over a data table (content/eventDefs.ts) implementing
 * the directive's own cycle: CURRENT WORLD STATE -> ELIGIBILITY -> SMALL EVENT -> STATE CHANGE ->
 * NPC KNOWLEDGE -> LIFE MATERIAL -> FOLLOW-UP ELIGIBILITY.
 *
 * Directive Section 13 ("STATE IS CANONICAL. TEXT IS PRESENTATION.") applies literally here: this
 * file decides occurrence/eligibility/state-mutation/knowledge/cooldown entirely from `CoreState`
 * -- no AI call exists anywhere in this module or in eventDefs.ts. The live/deterministic dialogue
 * adapters never see this file; they only ever read the `worldFacts` it produces, exactly the way
 * they already read day1WorldEvents.ts's facts (contextBuilder.ts's knownBy filter, unchanged).
 *
 * Kept alongside (not merged into) day1WorldEvents.ts deliberately -- migrating the four existing
 * hand-coded events into this generic shape would touch flag names multiple other files/tests
 * already assert on (shelfFixed, benchFixed, hinaShopOpen...) for zero behavioral gain. New content
 * goes here from now on; the old file stays exactly as a frozen, still-running DAY1-3 seed.
 */
import { NPC_DEFS } from "../npcDefs";
import { npcAvailabilityAt } from "../schedule";
import { computePlayerNpcTags } from "./socialMemory";
import type { PlayerSocialTag } from "./socialMemory";
import type { ClockMinutes, CoreState, EventFamily, LifeMaterialCategory, LocationId, NpcId, RelationshipQuality } from "../types";

export interface EventEligibility {
  /** Event never eligible before this day (in-world day, 1-indexed). */
  minDay?: number;
  /** ALL of these flags must be true. Includes chain prerequisites -- a follow-up stage lists its
   *  earlier stage's own `id` here (every fired event auto-sets `flags[def.id] = true`, see below),
   *  so "did the earlier stage happen" is read as plain state, never inferred from prose. */
  requiredFlags?: string[];
  /** ALL of these flags must be false/absent. */
  forbiddenFlags?: string[];
  /** ALL listed NPCs must be schedule-AVAILABLE (not BUSY/AWAY/CLOSED) at the current time for the
   *  event to be eligible -- an NPC-NPC event about two people cannot fire while one of them is on
   *  the phone or off-site (directive's own worked example already assumes this). */
  npcsAvailable?: NpcId[];
  /** ALL listed relationship checks must hold, read from the participant's OWN (asymmetric)
   *  `NPC_DEFS[a].relationships[b].quality` -- directive Section 11: only the existing coarse
   *  categorical states, never a numeric score. */
  requiredRelationship?: { a: NpcId; b: NpcId; qualities: RelationshipQuality[] }[];
  /** PHASE_12_6 Section 9/10 -- at least one of `tags` must be present in the PLAYER's own
   *  categorical relationship with `npc` (`content/socialMemory.ts`'s `computePlayerNpcTags`,
   *  itself derived state -- see that module's own doc comment for why this is not a score). Lets a
   *  background event's candidate set shift based on what the player has done, without making the
   *  event player-presence-required (it still fires on the clock regardless of where the player
   *  is) and without an unlock-ladder ("好感度アンロック方式にしない" -- this is an OR-of-tags gate,
   *  not a threshold to climb). */
  requiredPlayerRelationship?: { npc: NpcId; tags: PlayerSocialTag[] };
  /** 0..1, default 1 (always fires once otherwise eligible). Directive Section 7 forbids an evenly
   *  distributed schedule but Section 2 also forbids delegating occurrence to the LLM or to true
   *  randomness (Math.random would make a run non-reproducible and untestable) -- this is a pure,
   *  deterministic hash of (event id, day), so the SAME state always produces the SAME outcome on
   *  replay, yet different event ids land on different days rather than a uniform cadence. See
   *  `pseudoChance` below; this is content unevenness, not a probability the AI ever touches. */
  occurrenceChance?: number;
}

export interface EventWorldFactTemplate {
  /** Base id -- the engine appends `_d{day}` so a recurring definition's re-firing on a later day
   *  never collides with (or gets deduped against) its own earlier firing. */
  id: string;
  text: string;
  knownBy: NpcId[];
  category: LifeMaterialCategory;
  /** PHASE_12_6 Section 13 -- optional alternate authored phrasings of the SAME canonical fact, for
   *  a recurring definition whose firings would otherwise read byte-identical every time (the PHASE
   *  12.5 CLOSE report's own noted weakness). Picked deterministically by `pseudoChance` (never
   *  Math.random -- same reproducibility rationale as `occurrenceChance`), so the same state always
   *  picks the same variant on replay. The underlying fact (`id`/`knownBy`/`category`) never varies
   *  -- only which of these strings gets stored as `WorldFact.text` ("STATE IS CANONICAL. TEXT IS
   *  PRESENTATION," applied to authored text itself, not just to the live AI). Optional and used
   *  sparingly (directive: "text variationだけを先に磨かない") -- most definitions still have none. */
  textVariants?: string[];
}

export interface EventDefinition {
  id: string;
  family: EventFamily;
  /** Documentation/authoring aid only -- eligibility already encodes the real gates (availability,
   *  relationship). Not read by the engine itself. */
  participants: NpcId[];
  /** Directive Section 4's candidate field, used for diegetic discovery (Section 14): when a fact
   *  fires at a location, `content/day1.ts`'s `buildLocationScene` can surface its `worldFact.text`
   *  as an extra ambient line for a player who happens to visit there that same day -- "noticing the
   *  shop/goods changed" without any log/list UI. `null` for events with no single physical location
   *  (e.g. a fact two NPCs both simply now know). */
  location: LocationId | null;
  /** Directive Section 9 -- true only for events that make no sense unless the player is actually
   *  there to be part of them (a promise made directly to the protagonist). False for the NPC-NPC
   *  background events that must be able to progress with nobody watching (Section 9's own example).
   *  The engine does not gate firing on this (both kinds resolve on the clock regardless -- that IS
   *  the "player-independent world" requirement); it exists so content authors reading eventDefs.ts
   *  can see at a glance which category an event is, and so a future UI/prompt layer could choose to
   *  only ever surface the true ones as something the player is expected to have been present for. */
  playerPresenceRequired: boolean;
  /** Minutes-of-day this event's trigger crosses. Same "prevTime < T && next.time >= T" crossing
   *  pattern day1WorldEvents.ts already uses -- fires at most once per in-world day regardless of
   *  day number, and correctly still fires even if the player's single action skipped past T. */
  triggerTime: ClockMinutes;
  eligibility: EventEligibility;
  /** Minimum days since this exact id last fired. 0 = may refire the very next day it is otherwise
   *  eligible (still at most once per day, since triggerTime only crosses once/day). Chain follow-up
   *  stages conventionally use 0 -- their own gating is `requiredFlags`, not cooldown. */
  cooldownDays: number;
  /** Minimum days since ANY event of this family last fired -- directive Section 7's "同じ種類の
   *  イベントが連続しないように" at the family level, not just the per-id level. Optional; omitted
   *  for chain follow-up stages (they should fire as soon as their prerequisite allows, not be
   *  blocked by their own stage-1 having just used up the family's cooldown). */
  familyCooldownDays?: number;
  /** Extra flags to set when this event fires, beyond the automatic `flags[def.id] = true`. */
  setFlags?: Record<string, boolean>;
  /** Flags to clear when this event fires -- the mechanism a chain's LAST stage uses to reset its
   *  EARLIER stages' completion flags, so the whole chain can start over once cooldown allows
   *  (directive Section 6: short chains are permitted to recur, not just fire once ever). */
  resetFlagsOnFire?: string[];
  worldFact: EventWorldFactTemplate;
}

/** Deterministic, non-cryptographic string hash -> [0,1). Same input always produces the same
 *  output (reproducible, testable, replayable) -- deliberately NOT Math.random(), which the
 *  directive's "禁止: 完全ランダムなイベント" (Section 2) rules out precisely because it would make
 *  a run's event pattern non-reproducible and therefore non-debuggable/non-testable.
 *
 *  FNV-1a plus a murmur-style finalizer -- an earlier version used a bare `h = h*31 + charCode`
 *  loop with no finalizer, which turned out to have almost no avalanche: consecutive `${id}_${day}`
 *  seeds only differ in their last 1-2 characters, and without a finalizer that difference barely
 *  moves the final hash (found via `tests/newlifecoreEventEngine.test.ts`'s occurrenceChance
 *  distribution check -- `drizzle_start` never fired once across a 30-day simulation despite a
 *  nominal 50% daily chance, because every day's hash landed within a hair of the same value). The
 *  finalizer below is what actually gives each day an independent-looking chance from a
 *  deterministic input. */
export function pseudoChance(seed: string): number {
  let h = 0x811c9dc5; // FNV-1a offset basis
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV-1a prime
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 0xffffffff;
}

function isEligible(def: EventDefinition, state: CoreState): boolean {
  const e = def.eligibility;
  if (e.minDay !== undefined && state.day < e.minDay) return false;
  if (e.requiredFlags?.some((f) => !state.flags[f])) return false;
  if (e.forbiddenFlags?.some((f) => state.flags[f])) return false;

  const lastFired = state.eventLastFired[def.id];
  if (lastFired !== undefined && state.day - lastFired < def.cooldownDays) return false;

  if (def.familyCooldownDays !== undefined) {
    const lastFamily = state.familyLastFired[def.family];
    if (lastFamily !== undefined && state.day - lastFamily < def.familyCooldownDays) return false;
  }

  if (e.npcsAvailable?.some((npc) => npcAvailabilityAt(npc, state.time, state.flags) !== "AVAILABLE")) return false;

  if (e.requiredRelationship) {
    for (const rel of e.requiredRelationship) {
      const quality = NPC_DEFS[rel.a].relationships[rel.b]?.quality;
      if (!quality || !rel.qualities.includes(quality)) return false;
    }
  }

  if (e.requiredPlayerRelationship) {
    const { npc, tags } = e.requiredPlayerRelationship;
    const playerTags = computePlayerNpcTags(npc, state);
    if (!tags.some((t) => playerTags.includes(t))) return false;
  }

  if (e.occurrenceChance !== undefined && e.occurrenceChance < 1) {
    if (pseudoChance(`${def.id}_${state.day}`) >= e.occurrenceChance) return false;
  }

  return true;
}

/** Section 13 -- deterministic pick among `text` plus any `textVariants`, seeded by the fact's own
 *  base id and the firing day so it's reproducible and independent of `occurrenceChance`'s own
 *  seed space (a different seed string, so the two hashes don't correlate). */
function pickPresentationText(template: EventWorldFactTemplate, day: number): string {
  const options = [template.text, ...(template.textVariants ?? [])];
  if (options.length === 1) return options[0];
  const index = Math.floor(pseudoChance(`text_${template.id}_${day}`) * options.length);
  return options[Math.min(index, options.length - 1)];
}

function fire(def: EventDefinition, state: CoreState): CoreState {
  const factId = `${def.worldFact.id}_d${state.day}`;
  // Defensive dedupe -- should be structurally unreachable given the crossing-window trigger check
  // in resolveGeneratedEvents already fires each definition at most once per day, but matches
  // addWorldFact's own dedupe discipline rather than assuming the caller got it right.
  if (state.worldFacts.some((f) => f.id === factId)) return state;

  const text = pickPresentationText(def.worldFact, state.day);

  let next: CoreState = {
    ...state,
    flags: { ...state.flags, [def.id]: true, ...(def.setFlags ?? {}) },
    eventLastFired: { ...state.eventLastFired, [def.id]: state.day },
    familyLastFired: { ...state.familyLastFired, [def.family]: state.day },
    worldFacts: [
      ...state.worldFacts,
      { id: factId, day: state.day, time: def.triggerTime, text, knownBy: def.worldFact.knownBy, category: def.worldFact.category },
    ],
  };

  if (def.resetFlagsOnFire && def.resetFlagsOnFire.length > 0) {
    const reset: Record<string, boolean> = {};
    for (const f of def.resetFlagsOnFire) reset[f] = false;
    next = { ...next, flags: { ...next.flags, ...reset } };
  }

  return next;
}

/**
 * Called once per `advanceTime` tick (engine.ts), same call site as `resolveWorldEvents`, with the
 * same `(prevTime, stateAfterTimeAdvance)` shape. Iterates the full event table each tick -- table
 * size (16-ish definitions) makes a full scan trivially cheap, and a scan is the simplest thing that
 * is obviously correct (directive's own anti-over-engineering instruction, Section 4).
 */
export function resolveGeneratedEvents(prevTime: ClockMinutes, state: CoreState, defs: EventDefinition[]): CoreState {
  let next = state;
  for (const def of defs) {
    if (!(prevTime < def.triggerTime && next.time >= def.triggerTime)) continue;
    if (!isEligible(def, next)) continue;
    next = fire(def, next);
  }
  return next;
}

/**
 * Directive Section 14 -- diegetic discovery support: definitions bound to `location` whose fact
 * fired TODAY (day-gated, same "today, not ever" discipline as day1.ts's `factToday`, so a restock
 * from three days ago doesn't keep re-announcing itself forever) at the given location. Returns the
 * already-natural-language `worldFact.text` lines only -- never an id, family name, or any other
 * internal term, so a caller can append them straight into a scene's ambient text.
 */
export function eventTraceLinesAt(state: CoreState, defs: EventDefinition[], location: LocationId): string[] {
  const lines: string[] = [];
  for (const d of defs) {
    if (d.location !== location) continue;
    // Read the ACTUAL stored fact's text, not the template's base `text` -- a presentation variant
    // (Section 13) may have been picked at fire time, and the stored WorldFact is the canonical
    // record of what was actually said/shown (`fire()`'s `pickPresentationText`).
    const fact = state.worldFacts.find((f) => f.id === `${d.worldFact.id}_d${state.day}` && f.day === state.day);
    if (fact) lines.push(fact.text);
  }
  return lines;
}
