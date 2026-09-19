/**
 * PHASE_19_NEW_LIFE_CONTEXT_COMPLETENESS_AND_PRE_HV_HARDENING_V1 Section 4 -- the fix for the
 * PHASE_18 acceptance finding: trajectory/opportunity state had no representation in
 * `NpcAiContext`, so a live model asked ambiguously about a pending opportunity ("さっきの話")
 * had no canonical signal for what "that" referred to and answered about an unrelated, already-
 * resolved matter instead. State safety was never at risk (see PHASE_18's CLOSE) -- this is a
 * context-completeness fix, not a responsibility-boundary fix.
 *
 * Deliberately does NOT introduce a second trajectory state (directive Section 4's explicit ban).
 * Every field here is a pure read of `state.playerExperiences` / `state.flags` /
 * `state.lifeOpportunityDeclines` via the existing `trajectoryEngine.ts` derivations -- the exact
 * same "canonical state, never a shadow copy" discipline `sceneContext.ts` already uses for
 * events. `ACCEPTED`/`DECLINED`/`STEPPED_BACK` are deliberately NOT modeled here: those already
 * reach the NPC as ordinary `knownFacts` the moment they happen (`acceptLifeOpportunity`/
 * `declineLifeOpportunity`/`stepBackFromTrajectory` in engine.ts each already call `addWorldFact`
 * with `knownBy: [seed.npc]`) -- duplicating that here would be exactly the "second state" this
 * module is required not to create. The one genuinely missing signal is the moment BEFORE a
 * decision is made, which by definition has no WorldFact yet (nothing has happened).
 */
import { opportunityEligible } from "../content/trajectoryEngine";
import { TRAJECTORY_SEEDS } from "../content/trajectoryDefs";
import type { CoreState, NpcId } from "../types";

export interface CurrentChoiceContext {
  kind: "trajectory_opportunity";
  /** The real, already-authored line the player would see if they pressed "consider" right now
   *  (`TrajectorySeed.opportunityLabel`) -- never a synthesized description. */
  subject: string;
}

/**
 * Non-null only while a real opportunity is currently eligible to be offered and has not yet been
 * accepted/declined (`opportunityEligible` -- the exact same canonical condition that gates the
 * "consider" button itself, so this can never claim an opportunity exists that the UI itself would
 * not also currently offer). At most one opportunity per NPC exists in the current seed roster, so
 * no ordering/priority rule is needed if that ever changes -- the first eligible match is returned
 * and this comment should be revisited if a second seed is ever added for the same NPC.
 */
export function currentChoiceContextFor(npc: NpcId, state: CoreState): CurrentChoiceContext | null {
  const seed = TRAJECTORY_SEEDS.find((s) => s.npc === npc);
  if (!seed) return null;
  if (!opportunityEligible(seed, state)) return null;
  return { kind: "trajectory_opportunity", subject: seed.opportunityLabel };
}
