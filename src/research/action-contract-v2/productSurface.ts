/**
 * PHASE 11.12: Product Surface ownership gate.
 *
 * Root cause (see docs/research/evaluation/phase-11-12/RESEARCH_PRODUCT_CONTAMINATION_TRACE_V1.md):
 * `ActionContractV2` (types.ts) carries no concept of WHO an action belongs to. Any exported
 * contract -- authored for a QA regression, a research probe, or an actual player-facing scene --
 * is structurally indistinguishable, so a UI component composing "all the ASK_* consts a module
 * exports" cannot tell a test artifact from a product action. This is what let PHASE 11.11's
 * `ASK_WEATHER_SCENE` (authored to satisfy test L: "UNKNOWN weather remains explicitly unknown",
 * `tests/newlifePlayableScene11.test.ts` lines 160-168) become a permanent player-visible button
 * (`NewlifePlayable11App.tsx` line 160-162) with no separate decision ever made about whether a
 * player should be able to ask it.
 *
 * This module does NOT modify `ActionContractV2` or any PHASE 11.11 file. It adds a side-table
 * (`ACTION_OWNERSHIP_REGISTRY`) and a composition gate (`composeProductSurface`) that any UI
 * wiring a set of actions into player-visible buttons should route through going forward. Existing
 * PHASE 11.11 code does not call this yet -- rewiring the live scene is PHASE 11.11's own repair
 * (deferred; see phase-11-12 directive Section 22/29), not this phase's task. What this phase
 * proves is that the gate exists, is real (not decorative), and correctly rejects the actual
 * historical defect when pointed at the real exported contracts.
 */

import type { ActionContractV2 } from "./types";

export type ActionOwner = "PRODUCT" | "QA" | "RESEARCH" | "DEBUG";

export interface ActionOwnershipEntry {
  owner: ActionOwner;
  /** Non-empty only for `owner: "PRODUCT"`. Must state a player-facing reason -- "verifies X" or
   *  "regression-checks Y" is not an acceptable value here; that belongs in a QA/RESEARCH entry's
   *  `testPurpose` instead. Enforced by `composeProductSurface`, not merely by convention. */
  sceneJustification: string | null;
  /** Non-empty only for `owner` other than "PRODUCT". Records WHY the action exists at all, so the
   *  classification itself is auditable rather than a bare label. */
  testPurpose: string | null;
}

/**
 * Classification of every PHASE 11.11 scene action, decided from repository evidence (see the
 * trace doc), not from current rendering behavior. `ASK_WEATHER_SCENE` is classified `QA` because
 * its only demonstrated reason to exist is test L; nothing in `PLAYABLE_SCENE_SPEC_V1.md` gives an
 * independent player-facing motivation for a weather question in a leftover-stock errand scene.
 * `ASK_ABOUT_LEFTOVER_STOCK` is classified `PRODUCT` -- its ownership is legitimate; its defect
 * (see `CAUSALITY_COUNTERFACTUAL_INVARIANT_V1.md`) is a different contamination class, caught by a
 * different gate (`causalUnlockInvariant.ts`), not this one. The two gates are deliberately
 * independent so each catches one failure mode.
 */
export const ACTION_OWNERSHIP_REGISTRY: Record<string, ActionOwnershipEntry> = {
  ASK_WHAT_HELP_NEEDED: {
    owner: "PRODUCT",
    sceneJustification: "player needs to learn the concrete subject of Yohei's request before deciding to accept or decline it",
    testPurpose: null,
  },
  ASK_FESTIVAL_SCENE: {
    owner: "PRODUCT",
    sceneJustification: "ordinary small talk about the festival Yohei just ran a stall at is a legitimate thing to ask him in this scene",
    testPurpose: null,
  },
  ASK_SALES_SCENE: {
    owner: "PRODUCT",
    sceneJustification:
      "asking how sales went is a legitimate contextual follow-up once the festival has come up in conversation (PHASE 11.13: gated by its own SCENE ELIGIBILITY precondition, HAS_ASKED_FESTIVAL, not offered upfront merely because the engine can answer it)",
    testPurpose: null,
  },
  ASK_WEATHER_SCENE: {
    owner: "QA",
    sceneJustification: null,
    testPurpose:
      "authored to give tests/newlifePlayableScene11.test.ts test L (\"UNKNOWN weather remains explicitly unknown in every packet variant\") a real ActionContractV2/playerIntent to build a packet against; PLAYABLE_SCENE_SPEC_V1.md gives no independent scene-semantic reason a player would ask Yohei about rain while negotiating a stock-moving errand",
  },
  ASK_ABOUT_LEFTOVER_STOCK: {
    owner: "PRODUCT",
    sceneJustification: "the new-possibility follow-up unlocked by accepting the request -- ownership is legitimate; whether its content is genuinely new to the player is validated separately by the causal-unlock invariant, not by this registry",
    testPurpose: null,
  },
};

export class ProductSurfaceViolation extends Error {
  constructor(actionId: string, reason: string) {
    super(`PRODUCT_SURFACE_VIOLATION: "${actionId}" ${reason}`);
    this.name = "ProductSurfaceViolation";
  }
}

export interface ProductSurfaceRejection {
  actionId: string;
  owner: ActionOwner | "UNCLASSIFIED";
  reason: string;
}

export interface ProductSurfaceEvaluation {
  accepted: ActionContractV2[];
  rejected: ProductSurfaceRejection[];
}

/**
 * PHASE 11.12R: the real-composition-path entry point. `composeProductSurface` (below) throws on
 * the first violation, which is correct for a strict assertion context but would crash the entire
 * scene render if wired directly into `NewlifePlayable11App.tsx` -- one QA-owned candidate in the
 * list would take down every legitimate PRODUCT button with it. `evaluateProductSurface` never
 * throws: it partitions candidates into `accepted` (render these) and `rejected` (exclude these,
 * with a reason, exposed as dev-visible evidence rather than silently dropped). Same fail-closed
 * ownership rule as `composeProductSurface` -- unclassified is always rejected, never defaulted to
 * PRODUCT.
 */
export function evaluateProductSurface(candidates: ActionContractV2[], registry: Record<string, ActionOwnershipEntry> = ACTION_OWNERSHIP_REGISTRY): ProductSurfaceEvaluation {
  const accepted: ActionContractV2[] = [];
  const rejected: ProductSurfaceRejection[] = [];
  for (const candidate of candidates) {
    const entry = registry[candidate.actionId];
    if (!entry) {
      rejected.push({ actionId: candidate.actionId, owner: "UNCLASSIFIED", reason: "no ACTION_OWNERSHIP_REGISTRY entry (unclassified actions are rejected, not defaulted to PRODUCT)" });
      continue;
    }
    if (entry.owner !== "PRODUCT") {
      rejected.push({ actionId: candidate.actionId, owner: entry.owner, reason: `owned by "${entry.owner}" (reason on file: ${entry.testPurpose ?? "none recorded"})` });
      continue;
    }
    if (!entry.sceneJustification || entry.sceneJustification.trim() === "") {
      rejected.push({ actionId: candidate.actionId, owner: entry.owner, reason: 'classified "PRODUCT" but has no sceneJustification' });
      continue;
    }
    accepted.push(candidate);
  }
  return { accepted, rejected };
}

/**
 * The strict composition gate (directive Section 10/19A+D), kept for contexts that should hard-fail
 * on any violation (e.g. a startup assertion, or a test asserting rejection). Implemented on top of
 * `evaluateProductSurface` so the two never drift. Fails closed: an action with no registry entry is
 * rejected, not silently admitted -- an unclassified action is exactly as disqualifying as one
 * explicitly classified QA/RESEARCH/DEBUG. There is no "default PRODUCT" case.
 */
export function composeProductSurface(candidates: ActionContractV2[], registry: Record<string, ActionOwnershipEntry> = ACTION_OWNERSHIP_REGISTRY): ActionContractV2[] {
  const { accepted, rejected } = evaluateProductSurface(candidates, registry);
  if (rejected.length > 0) {
    throw new ProductSurfaceViolation(rejected[0].actionId, `is ${rejected[0].reason}`);
  }
  return accepted;
}
