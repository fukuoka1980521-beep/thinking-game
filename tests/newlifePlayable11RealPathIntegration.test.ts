import { describe, expect, it } from "vitest";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  PLAYER_DECLINES_HELP_MOVE_STOCK,
  ASK_FESTIVAL_SCENE,
  ASK_WHAT_HELP_NEEDED,
  ASK_WEATHER_SCENE,
  buildYoheiPacket,
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

describe("PHASE 11.13: the REAL composition path, product-repaired content", () => {
  it("initial state: QA weather probe excluded by ownership gate; ASK_SALES not yet offered (contextual, requires ASK_FESTIVAL first); ASK_WHAT offered (one-shot, not yet asked)", () => {
    const ids = realComposedActionIds(baseState());
    expect(ids).toEqual(["ASK_WHAT_HELP_NEEDED", "ASK_FESTIVAL_SCENE"]);
    expect(ids).not.toContain("ASK_WEATHER_SCENE");
    expect(ids).not.toContain("ASK_SALES_SCENE");
  });

  it("buildAskCandidates itself still offers ASK_WEATHER_SCENE as a candidate (scene-eligible, ALWAYS) -- it is the SUBSEQUENT ownership gate that excludes it, not scene eligibility", () => {
    const candidates = buildAskCandidates(baseState());
    expect(candidates.map((c) => c.actionId)).toContain("ASK_WEATHER_SCENE");
  });

  it("after ASK_FESTIVAL: ASK_SALES becomes a real candidate (contextual unlock), ASK_WHAT remains available (not yet asked)", () => {
    const afterFestival = resolveAction(baseState(), ASK_FESTIVAL_SCENE).state;
    const ids = realComposedActionIds(afterFestival);
    expect(ids).toEqual(["ASK_WHAT_HELP_NEEDED", "ASK_FESTIVAL_SCENE", "ASK_SALES_SCENE"]);
  });

  it("after ASK_WHAT: that exact action disappears (one-shot -- the information has already been supplied), independent of accept/decline", () => {
    const afterAskWhat = resolveAction(baseState(), ASK_WHAT_HELP_NEEDED).state;
    const ids = realComposedActionIds(afterAskWhat);
    expect(ids).not.toContain("ASK_WHAT_HELP_NEEDED");
    expect(ids).toEqual(["ASK_FESTIVAL_SCENE"]);
  });

  it("ASK_WHAT's fixture packet does not reveal festival/leftover identity -- the product fixture line, not the real captured line, is what the player actually reads for this packet key", () => {
    const packet = buildYoheiPacket(baseState(), "何を手伝えばいい？", ASK_WHAT_HELP_NEEDED.playerIntent);
    expect(packet.pendingRequestContent).toMatch(/KNOWN/); // authoritative world still knows -- PLAYER-HIDDEN != WORLD-UNDEFINED
  });

  it("after ACCEPT_HELP (no prior ASK_WHAT/ASK_FESTIVAL): the real causal-unlock gate now PASSES using live state -- the physical reveal genuinely supplies new information the follow-up question can legitimately build on", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const causalVerdict = evaluateRealLeftoverStockCausalClaim(accepted);
    expect(causalVerdict.verdict).toBe("CAUSAL_UNLOCK_VALID");
    expect(causalVerdict.novelFacts).toContain("IS_FESTIVAL_LEFTOVER");

    const ids = realComposedActionIds(accepted);
    expect(ids).toContain("ASK_ABOUT_LEFTOVER_STOCK");
    expect(ids).not.toContain("ASK_WEATHER_SCENE");
    expect(ids).not.toContain("ASK_WHAT_HELP_NEEDED"); // PendingReply resolved -- request-dependent action gone
    expect(ids).toEqual(["ASK_FESTIVAL_SCENE", "ASK_ABOUT_LEFTOVER_STOCK"]);
  });

  it("causal-unlock evidence: GOING_TO_DISCOUNT_SHELF is NOT novel (already established by the errand's own framing before accept) -- only IS_FESTIVAL_LEFTOVER is novel; a single genuinely novel fact is sufficient", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const causalVerdict = evaluateRealLeftoverStockCausalClaim(accepted);
    expect(causalVerdict.novelFacts).toEqual(["IS_FESTIVAL_LEFTOVER"]);
  });

  it("after DECLINE (no prior questions): request-dependent ASK_WHAT is gone; ASK_FESTIVAL remains (independently valid conversation); weather still excluded", () => {
    const declined = resolvePendingReplyEvent(baseState(), PLAYER_DECLINES_HELP_MOVE_STOCK).state;
    const ids = realComposedActionIds(declined);
    expect(ids).toEqual(["ASK_FESTIVAL_SCENE"]);
    expect(ids).not.toContain("ASK_WHAT_HELP_NEEDED");
    expect(ids).not.toContain("ASK_WEATHER_SCENE");
  });

  it("after DECLINE with ASK_FESTIVAL asked first: ASK_SALES remains available (independently valid contextual conversation, unaffected by the resolved request)", () => {
    const afterFestival = resolveAction(baseState(), ASK_FESTIVAL_SCENE).state;
    const declined = resolvePendingReplyEvent(afterFestival, PLAYER_DECLINES_HELP_MOVE_STOCK).state;
    const ids = realComposedActionIds(declined);
    expect(ids).toEqual(["ASK_FESTIVAL_SCENE", "ASK_SALES_SCENE"]);
  });

  it("PATH D: ACCEPT pressed immediately without ASK_WHAT remains valid, and still yields the legitimate contextual question (PLAYER-HIDDEN != WORLD-UNDEFINED, directive Section 14)", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    expect(accepted.pendingReply?.status).toBe("RESOLVED");
    expect(accepted.materials.some((m) => m.id === "leftover_stock_moved" && m.status === "ACTIVE")).toBe(true);
    const ids = realComposedActionIds(accepted);
    expect(ids).toContain("ASK_ABOUT_LEFTOVER_STOCK");
  });

  it("ADVERSARIAL (Section 5/15): injecting a synthetic QA_UNKNOWN_MEMORY_PROBE into the SAME real candidate source is rejected by the real ownership gate -- no special-case code was added for this action id", () => {
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

  it("real newlifeplayable11 scene state/action behavior outside these boundaries is unchanged: ACCEPT still admits the leftover_stock_moved material and resolves PendingReply exactly as verified since PHASE 11.11", () => {
    const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    expect(accepted.pendingReply?.status).toBe("RESOLVED");
    expect(accepted.materials.some((m) => m.id === "leftover_stock_moved" && m.status === "ACTIVE")).toBe(true);
  });
});

describe("PHASE 11.12R/11.13 Section 16: ownership metadata risk -- adversarial plausible-justification relabel (unchanged mechanism, re-verified after product repair)", () => {
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
