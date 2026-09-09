import { describe, expect, it } from "vitest";
import { createInitialState, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  PLAYER_DECLINES_HELP_MOVE_STOCK,
  ASK_WEATHER_SCENE,
} from "../src/research/action-contract-v2/playableSceneContracts";
import { buildAskCandidates, applyCausalityGate } from "../src/newlifeplayable11/NewlifePlayable11App";
import { evaluateProductSurface, ACTION_OWNERSHIP_REGISTRY } from "../src/research/action-contract-v2/productSurface";
import { evaluateRealLeftoverStockCausalClaim } from "../src/research/action-contract-v2/causalUnlockInvariant";
import type { ActionContractV2 } from "../src/research/action-contract-v2/types";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "real-path-test");
}

function realComposedActionIds(state: ReturnType<typeof baseState>) {
  const causalVerdict = evaluateRealLeftoverStockCausalClaim(state);
  const candidates = applyCausalityGate(buildAskCandidates(state), causalVerdict);
  return evaluateProductSurface(candidates).accepted.map((a) => a.actionId);
}

describe("PHASE 11.12R: the REAL composition path (buildAskCandidates -> causality gate -> ownership gate)", () => {
  it("initial state: the real QA weather probe is excluded by the ownership gate, not by manual removal", () => {
    const ids = realComposedActionIds(baseState());
    expect(ids).toEqual(["ASK_WHAT_HELP_NEEDED", "ASK_FESTIVAL_SCENE", "ASK_SALES_SCENE"]);
    expect(ids).not.toContain("ASK_WEATHER_SCENE");
  });

  it("buildAskCandidates itself still offers ASK_WEATHER_SCENE as a candidate (precondition-eligible) -- it is the SUBSEQUENT ownership gate that excludes it, not scene eligibility", () => {
    const candidates = buildAskCandidates(baseState());
    expect(candidates.map((c) => c.actionId)).toContain("ASK_WEATHER_SCENE");
  });

  it("after ACCEPT_HELP: the real causal-unlock gate rejects the historical leftover-stock claim using live state -- ASK_ABOUT_LEFTOVER_STOCK never reaches the ownership gate, let alone renders", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const causalVerdict = evaluateRealLeftoverStockCausalClaim(accepted);
    expect(causalVerdict.verdict).toBe("CAUSAL_UNLOCK_INVALID_ALREADY_KNOWN");

    const candidatesBeforeCausality = buildAskCandidates(accepted);
    expect(candidatesBeforeCausality.map((c) => c.actionId)).toContain("ASK_ABOUT_LEFTOVER_STOCK");

    const ids = realComposedActionIds(accepted);
    expect(ids).not.toContain("ASK_ABOUT_LEFTOVER_STOCK");
    expect(ids).not.toContain("ASK_WEATHER_SCENE");
    expect(ids).toEqual(["ASK_WHAT_HELP_NEEDED", "ASK_FESTIVAL_SCENE", "ASK_SALES_SCENE"]);
  });

  it("no replacement causal claim was fabricated: the scene has strictly fewer real product actions after accept than PHASE 11.11 rendered, with no new action introduced to compensate", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const ids = realComposedActionIds(accepted);
    // PHASE 11.11 rendered 6 buttons post-accept (4 ASK_* + leftover-followup + LEAVE, LEAVE handled
    // separately from this candidate list). The real gated composition now yields only 3.
    expect(ids.length).toBe(3);
    expect(ids).not.toContain("ASK_ABOUT_LEFTOVER_STOCK");
  });

  it("after DECLINE: unaffected by the causality gate (leftover was never a candidate), still excludes the weather probe via ownership", () => {
    const declined = resolvePendingReplyEvent(baseState(), PLAYER_DECLINES_HELP_MOVE_STOCK).state;
    const ids = realComposedActionIds(declined);
    expect(ids).toEqual(["ASK_WHAT_HELP_NEEDED", "ASK_FESTIVAL_SCENE", "ASK_SALES_SCENE"]);
  });

  it("ADVERSARIAL (Section 5): injecting a synthetic QA_UNKNOWN_MEMORY_PROBE into the SAME real candidate source is rejected by the real ownership gate -- no special-case code was added for this action id", () => {
    const state = baseState();
    const realCandidates = buildAskCandidates(state);
    const syntheticProbe: ActionContractV2 = {
      actionId: "QA_UNKNOWN_MEMORY_PROBE",
      playerIntent: "ASK_UNKNOWN_MEMORY_PROBE",
      eligibility: [{ id: "always", check: () => true }],
      playerVisiblePromise: "synthetic adversarial probe -- must never reach the player",
      failurePostcondition: null,
      authoritativeEvent: "SYNTHETIC_ADVERSARIAL_PROBE",
      successPostcondition: { id: "always", check: () => true },
      partialSuccessPostcondition: null,
      visibleFeedback: () => ({ onSuccess: [], onPartialSuccess: null, onFailure: null }),
      stateDelta: () => [],
      actorExperienceWrite: () => [],
      conditionalFollowUpAffordance: () => "NONE",
    };
    const injectedCandidates = [...realCandidates, syntheticProbe];
    const { accepted, rejected } = evaluateProductSurface(injectedCandidates);

    expect(accepted.map((a) => a.actionId)).not.toContain("QA_UNKNOWN_MEMORY_PROBE");
    const rejection = rejected.find((r) => r.actionId === "QA_UNKNOWN_MEMORY_PROBE");
    expect(rejection).toBeDefined();
    expect(rejection?.owner).toBe("UNCLASSIFIED");
    expect(rejection?.reason).toMatch(/no ACTION_OWNERSHIP_REGISTRY entry/);
  });

  it("real newlifeplayable11 scene state/action behavior outside these boundaries is unchanged: ACCEPT still admits the leftover_stock_moved material and resolves PendingReply exactly as PHASE 11.11 verified", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    expect(accepted.pendingReply?.status).toBe("RESOLVED");
    expect(accepted.materials.some((m) => m.id === "leftover_stock_moved" && m.status === "ACTIVE")).toBe(true);
  });
});

describe("PHASE 11.12R Section 16: ownership metadata risk -- adversarial plausible-justification relabel", () => {
  it("a plausible-sounding but false PRODUCT relabeling of ASK_WEATHER_SCENE is NOT stopped by the gate itself -- OWNERSHIP_METADATA_NOT_SELF_AUTHENTICATING", () => {
    const adversarialRegistry = {
      ...ACTION_OWNERSHIP_REGISTRY,
      ASK_WEATHER_SCENE: {
        owner: "PRODUCT" as const,
        sceneJustification: "players who are farmers care about weather and may ask about it in any rural scene",
        testPurpose: null,
      },
    };
    const { accepted, rejected } = evaluateProductSurface([ASK_WEATHER_SCENE], adversarialRegistry);
    expect(accepted.map((a) => a.actionId)).toContain("ASK_WEATHER_SCENE");
    expect(rejected).toEqual([]);
  });
});
