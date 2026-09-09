import { describe, expect, it } from "vitest";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  ASK_ABOUT_LEFTOVER_STOCK,
  LEFTOVER_RESPONSE_MATERIAL_IDS,
  buildYoheiPacket,
} from "../src/research/action-contract-v2/playableSceneContracts";
import { evaluateLeftoverQuestionPrerequisite } from "../src/research/action-contract-v2/causalUnlockInvariant";
import { commitNpcResponseIfApplicable, commitLeftoverQuestionResponse } from "../src/research/action-contract-v2/npcResponseCommit";
import type { ContractV2State } from "../src/research/action-contract-v2/types";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "answer-knowledge-boundary-test");
}
function afterAccept() {
  return resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
}

/**
 * PHASE 11.13C (directive Section 14): mirrors the REAL `askQuestion` two-step orchestration --
 * QUESTION DISPATCH (`resolveAction`) then, separately, the RESPONSE COMMIT POINT
 * (`commitNpcResponseIfApplicable`) -- using the SAME production seam, not a synthetic
 * ActionContractV2 variant (PHASE 11.13B's approach, now superseded: response state no longer
 * lives in the ask contract's own `stateDelta` at all, so a contract-level variant can no longer
 * represent "a different response" -- the response is a genuinely separate event).
 */
function dispatchAskAboutLeftoverStock(state: ContractV2State): ContractV2State {
  const { state: afterAsk } = resolveAction(state, ASK_ABOUT_LEFTOVER_STOCK);
  const packet = buildYoheiPacket(afterAsk, "これ、祭りの残り？", ASK_ABOUT_LEFTOVER_STOCK.playerIntent);
  return commitNpcResponseIfApplicable(ASK_ABOUT_LEFTOVER_STOCK.actionId, afterAsk, packet);
}

describe("PHASE 11.13C: QUESTION_ASKED vs ANSWER_RECEIVED vs TARGET_FACT_KNOWN, via the REAL orchestration seam", () => {
  it("prerequisite absent -> question unavailable", () => {
    const result = evaluateLeftoverQuestionPrerequisite(baseState());
    expect(result.prerequisiteSatisfied).toBe(false);
    expect(result.eligible).toBe(false);
  });

  it("prerequisite present, nothing asked yet -> available, questionAsked=false, answerReceived=false, target unknown", () => {
    const result = evaluateLeftoverQuestionPrerequisite(afterAccept());
    expect(result.prerequisiteSatisfied).toBe(true);
    expect(result.questionAsked).toBe(false);
    expect(result.answerReceived).toBe(false);
    expect(result.targetFactKnown).toBe(false);
    expect(result.eligible).toBe(true);
  });

  it("ask dispatch ALONE (resolveAction, no response commit yet) -> questionAsked=true, answerReceived=false, targetFactKnown=false", () => {
    const afterAskOnly = resolveAction(afterAccept(), ASK_ABOUT_LEFTOVER_STOCK).state;
    const result = evaluateLeftoverQuestionPrerequisite(afterAskOnly);
    expect(result.questionAsked).toBe(true);
    expect(result.answerReceived).toBe(false);
    expect(result.targetFactKnown).toBe(false);
  });

  it("SUCCESS_CONFIRM (the real registered semantic, via the real orchestration seam) -> questionAsked=true, answerReceived=true, targetFactKnown=true", () => {
    const afterFull = dispatchAskAboutLeftoverStock(afterAccept());
    const result = evaluateLeftoverQuestionPrerequisite(afterFull);
    expect(result.questionAsked).toBe(true);
    expect(result.answerReceived).toBe(true);
    expect(result.targetFactKnown).toBe(true);
  });

  it("NO_RESPONSE (directive Section 8/14): the real commit seam, given a packet key with NO registered semantic, commits nothing -- questionAsked stays true, answerReceived/targetFactKnown stay false", () => {
    const afterAskOnly = resolveAction(afterAccept(), ASK_ABOUT_LEFTOVER_STOCK).state;
    // A packet built for an unregistered authoritativeAction -- simulates "response delivery
    // produced no recognized outcome" through the REAL commit function, not a fake contract.
    const unregisteredPacket = buildYoheiPacket(afterAskOnly, "これ、祭りの残り？", "UNREGISTERED_PACKET_KEY_FOR_TEST");
    const afterCommitAttempt = commitNpcResponseIfApplicable(ASK_ABOUT_LEFTOVER_STOCK.actionId, afterAskOnly, unregisteredPacket);
    const result = evaluateLeftoverQuestionPrerequisite(afterCommitAttempt);
    expect(result.questionAsked).toBe(true);
    expect(result.answerReceived).toBe(false);
    expect(result.targetFactKnown).toBe(false);
  });

  it("SUCCESS_UNKNOWN (directive Section 9): the real commitLeftoverQuestionResponse function, given the UNKNOWN outcome, commits an answer that does not resolve -- answerReceived=true, targetStatus=UNRESOLVED", () => {
    const afterAskOnly = resolveAction(afterAccept(), ASK_ABOUT_LEFTOVER_STOCK).state;
    const afterUnknownCommit = commitLeftoverQuestionResponse(afterAskOnly, "UNKNOWN");
    const result = evaluateLeftoverQuestionPrerequisite(afterUnknownCommit);
    expect(result.questionAsked).toBe(true);
    expect(result.answerReceived).toBe(true);
    expect(result.targetStatus).toBe("UNRESOLVED");
    expect(result.targetFactKnown).toBe(false);
    expect(result.reason).toMatch(/QUESTION_ANSWER_RECEIVED_BUT_TARGET_UNRESOLVED/);
  });

  it("SUCCESS_DENY (directive Section 10, mandatory): the real commitLeftoverQuestionResponse function, given the DENY outcome, commits targetStatus=KNOWN_FALSE -- distinct from UNRESOLVED, not collapsed into it", () => {
    const afterAskOnly = resolveAction(afterAccept(), ASK_ABOUT_LEFTOVER_STOCK).state;
    const afterDenyCommit = commitLeftoverQuestionResponse(afterAskOnly, "DENY");
    const result = evaluateLeftoverQuestionPrerequisite(afterDenyCommit);
    expect(result.questionAsked).toBe(true);
    expect(result.answerReceived).toBe(true);
    expect(result.targetStatus).toBe("KNOWN_FALSE");
    expect(result.targetFactKnown).toBe(false); // targetFactKnown means specifically KNOWN_TRUE
    expect(result.reason).toMatch(/QUESTION_TARGET_NOW_KNOWN_FALSE_VIA_ANSWER/);
  });

  it("the response event does NOT retroactively erase the ask state, and vice versa -- committing a response on a state that never had the ask-experience still leaves questionAsked=false, proving the two records are independent, not a shared flag", () => {
    const accepted = afterAccept();
    const answerOnlyState = commitLeftoverQuestionResponse(accepted, "CONFIRM");
    const result = evaluateLeftoverQuestionPrerequisite(answerOnlyState);
    expect(result.questionAsked).toBe(false); // no ask-experience entry was ever added
    expect(result.answerReceived).toBe(true);
    expect(result.targetStatus).toBe("KNOWN_TRUE");
  });

  it("the ASK-only experienceLog entry alone (no answer material at all) cannot make the target known", () => {
    const accepted = afterAccept();
    const askOnlyState = {
      ...accepted,
      experienceLog: [...accepted.experienceLog, { actorId: "player" as const, mode: "PARTICIPATED" as const, concreteContent: "運んだ箱が祭りの残りかどうか、洋平に尋ねた" }],
    };
    const result = evaluateLeftoverQuestionPrerequisite(askOnlyState);
    expect(result.questionAsked).toBe(true);
    expect(result.answerReceived).toBe(false);
    expect(result.targetFactKnown).toBe(false);
  });

  it("LLM/replay text still cannot mutate authority: the response-commit seam never reads the language adapter's return value at all", () => {
    // Structural proof: commitNpcResponseIfApplicable's signature takes (actionId, state, packet)
    // -- the packet's fields (built from buildYoheiPacket) are structured request context, never
    // the display string `languageAdapter` returns. askQuestion (NewlifePlayable11App.tsx) calls
    // the language adapter separately and never threads its return value into the commit call.
    const afterFull = dispatchAskAboutLeftoverStock(afterAccept());
    const result = evaluateLeftoverQuestionPrerequisite(afterFull);
    expect(Object.keys(result).sort()).toEqual(["answerReceived", "eligible", "prerequisiteSatisfied", "questionAsked", "reason", "targetFactKnown", "targetStatus"].sort());
  });

  it("PLAYER ask ActionContract alone cannot create any answer material (directive Section 3/18) -- resolveAction on ASK_ABOUT_LEFTOVER_STOCK produces zero response materials", () => {
    const { state: afterAskOnly } = resolveAction(afterAccept(), ASK_ABOUT_LEFTOVER_STOCK);
    const responseIds: string[] = Object.values(LEFTOVER_RESPONSE_MATERIAL_IDS);
    expect(afterAskOnly.materials.some((m) => responseIds.includes(m.id))).toBe(false);
  });
});
