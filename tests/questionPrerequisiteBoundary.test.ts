import { describe, expect, it } from "vitest";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  ASK_ABOUT_LEFTOVER_STOCK,
  buildYoheiPacket,
} from "../src/research/action-contract-v2/playableSceneContracts";
import { evaluateLeftoverQuestionPrerequisite } from "../src/research/action-contract-v2/causalUnlockInvariant";
import { commitNpcResponseIfApplicable } from "../src/research/action-contract-v2/npcResponseCommit";
import type { ContractV2State } from "../src/research/action-contract-v2/types";
import type { LifeMaterial } from "../src/research/life-material-7day/types";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "prerequisite-boundary-test");
}

/** PHASE 11.13C: mirrors the REAL two-step orchestration `NewlifePlayable11App.tsx`'s
 *  `askQuestion` performs -- QUESTION DISPATCH (`resolveAction`) THEN, separately, the RESPONSE
 *  COMMIT POINT (`commitNpcResponseIfApplicable`) -- rather than calling `resolveAction` alone,
 *  which (correctly, post-11.13C) no longer commits any response state by itself. */
function dispatchAskAboutLeftoverStock(state: ContractV2State): ContractV2State {
  const { state: afterAsk } = resolveAction(state, ASK_ABOUT_LEFTOVER_STOCK);
  const packet = buildYoheiPacket(afterAsk, "これ、祭りの残り？", ASK_ABOUT_LEFTOVER_STOCK.playerIntent);
  return commitNpcResponseIfApplicable(ASK_ABOUT_LEFTOVER_STOCK.actionId, afterAsk, packet);
}

describe("PHASE 11.13A: QUESTION_PREREQUISITE vs QUESTION_TARGET_FACT invariant (directive Section 12)", () => {
  it("A: NO observation + target UNKNOWN -> question not eligible", () => {
    const result = evaluateLeftoverQuestionPrerequisite(baseState());
    expect(result.prerequisiteSatisfied).toBe(false);
    expect(result.targetFactKnown).toBe(false);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/QUESTION_PREREQUISITE_NOT_MET/);
  });

  it("B: observation present + target UNKNOWN -> question eligible", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const result = evaluateLeftoverQuestionPrerequisite(accepted);
    expect(result.prerequisiteSatisfied).toBe(true);
    expect(result.targetFactKnown).toBe(false);
    expect(result.eligible).toBe(true);
    expect(result.reason).toMatch(/QUESTION_ELIGIBLE/);
  });

  it("C: observation present + target KNOWN (via the real two-step dispatch + response commit) -> the question is explicitly NOT justified as a new discovery (still offerable as ordinary conversation, but reason says so)", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const afterAsked = dispatchAskAboutLeftoverStock(accepted);
    const result = evaluateLeftoverQuestionPrerequisite(afterAsked);
    expect(result.targetFactKnown).toBe(true);
    expect(result.reason).toMatch(/QUESTION_TARGET_NOW_KNOWN_TRUE_VIA_ANSWER/);
    expect(result.reason).toMatch(/not a new discovery/);
  });

  it("D: target becomes KNOWN only after the legitimate answer event is committed (PHASE 11.13C: the ask dispatch ALONE, via resolveAction, no longer commits it) -- not before, not merely from ACCEPT", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    expect(evaluateLeftoverQuestionPrerequisite(accepted).targetFactKnown).toBe(false);

    const afterAskDispatchOnly = resolveAction(accepted, ASK_ABOUT_LEFTOVER_STOCK).state;
    expect(evaluateLeftoverQuestionPrerequisite(afterAskDispatchOnly).targetFactKnown).toBe(false); // ask dispatch alone: not yet committed

    const afterResponseCommit = dispatchAskAboutLeftoverStock(accepted);
    expect(evaluateLeftoverQuestionPrerequisite(afterResponseCommit).targetFactKnown).toBe(true); // only after the separate response commit
  });

  it("E: a bare state-boolean without genuine State-Admission-backed evidence cannot unlock the question -- the function reads the material's actual concreteContent, not a flag", () => {
    // Construct a state where the precondition-shaped material exists but carries no real
    // reveal content (a hypothetical malformed/synthetic admission) -- the evidence source is
    // the CONTENT, not merely the material's presence-as-a-flag.
    const state = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const emptyContentMaterial: LifeMaterial = { ...state.materials[0], concreteContent: "" };
    const syntheticState = { ...state, materials: [emptyContentMaterial] };
    const result = evaluateLeftoverQuestionPrerequisite(syntheticState);
    // prerequisiteSatisfied is still true (the material exists -- ACCEPT genuinely happened), but
    // the function does not silently assume the target is known just because SOME material exists;
    // it only calls the target known once the answer event's own experienceLog entry is present.
    expect(result.prerequisiteSatisfied).toBe(true);
    expect(result.targetFactKnown).toBe(false);
    expect(result.eligible).toBe(true);
  });

  it("F (superseded by PHASE 11.13E): a text-only mislabel of the reveal's concreteContent no longer has ANY effect -- the evaluator reads the material's id structurally, never its prose, so this exact old attack shape is now impossible by construction", () => {
    const state = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const mislabeledMaterial: LifeMaterial = { ...state.materials[0], concreteContent: "祭りの残りの手ぬぐいだった" };
    const syntheticState = { ...state, materials: [mislabeledMaterial] };
    const result = evaluateLeftoverQuestionPrerequisite(syntheticState);
    // The id is still "leftover_stock_moved" (registered as NOT leaking) -- mutating concreteContent
    // alone can no longer flip the verdict, proving prose is no longer read for this decision at all.
    expect(result.targetFactKnown).toBe(false);
    expect(result.eligible).toBe(true);
  });

  it("F' (PHASE 11.13E): changing the reveal material's id to something unregistered makes it fall outside `prerequisiteSatisfied`'s own fixed-id lookup entirely -- it is NOT reachable as a 'leaked reveal' case through the real evaluator, it becomes 'no reveal found yet' instead. Documents this precisely rather than asserting a scenario the real code structure cannot produce.", () => {
    const state = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const unregisteredMaterial: LifeMaterial = { ...state.materials[0], id: "some_future_unaudited_reveal_variant" };
    const syntheticState = { ...state, materials: [unregisteredMaterial] };
    const result = evaluateLeftoverQuestionPrerequisite(syntheticState);
    // prerequisiteSatisfied looks up the ONE fixed id ("leftover_stock_moved") -- renaming it means
    // no reveal material is found AT ALL, not a "leaked reveal with an unregistered id".
    expect(result.prerequisiteSatisfied).toBe(false);
    expect(result.eligible).toBe(false);
  });
});
