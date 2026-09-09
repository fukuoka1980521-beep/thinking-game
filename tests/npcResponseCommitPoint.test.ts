import { describe, expect, it } from "vitest";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  ASK_ABOUT_LEFTOVER_STOCK,
  buildYoheiPacket,
} from "../src/research/action-contract-v2/playableSceneContracts";
import { evaluateLeftoverQuestionPrerequisite } from "../src/research/action-contract-v2/causalUnlockInvariant";
import { commitNpcResponseIfApplicable, LEFTOVER_QUESTION_RESPONSE_SEMANTICS } from "../src/research/action-contract-v2/npcResponseCommit";
import { createReplayLanguageAdapter, packetKey } from "../src/research/action-contract-v2/languageAdapter";
import { CAPTURED_YOHEI_LINES } from "../src/research/action-contract-v2/capturedYoheiLines";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "npc-response-commit-point-test");
}

describe("PHASE 11.13C: real Product trace, mechanically captured at 3 points (directive Section 13)", () => {
  it("A: after reveal / B: after ask resolution, before response commit / C: after response commit", () => {
    // --- A: after physical reveal ---
    const afterReveal = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const pointA = evaluateLeftoverQuestionPrerequisite(afterReveal);
    expect(pointA).toMatchObject({ prerequisiteSatisfied: true, questionAsked: false, answerReceived: false, targetFactKnown: false });
    expect(afterReveal.materials.map((m) => m.id)).toEqual(["leftover_stock_moved"]);
    expect(afterReveal.experienceLog.map((e) => e.concreteContent)).toEqual([]);

    // --- B: immediately after PLAYER ask resolution, BEFORE response commit ---
    // This mirrors askQuestion's exact real call order up to (but not including) the commit line.
    const { state: afterAskResolutionOnly } = resolveAction(afterReveal, ASK_ABOUT_LEFTOVER_STOCK);
    const packet = buildYoheiPacket(afterAskResolutionOnly, "これ、祭りの残り？", ASK_ABOUT_LEFTOVER_STOCK.playerIntent);
    const languageAdapter = createReplayLanguageAdapter(CAPTURED_YOHEI_LINES);
    const visibleLine = languageAdapter(packet); // the response-delivery seam itself
    const pointB = evaluateLeftoverQuestionPrerequisite(afterAskResolutionOnly);
    expect(pointB).toMatchObject({ prerequisiteSatisfied: true, questionAsked: true, answerReceived: false, targetFactKnown: false });
    expect(afterAskResolutionOnly.materials.map((m) => m.id)).toEqual(["leftover_stock_moved"]); // no response material yet
    expect(afterAskResolutionOnly.experienceLog.map((e) => e.concreteContent)).toEqual(["運んだ箱が祭りの残りかどうか、洋平に尋ねた"]);
    expect(visibleLine).toContain("祭りの残り"); // the visible line IS already available at this point...
    // ...but the evaluator (point B, computed from state, not from `visibleLine`) still correctly
    // reports targetFactKnown=false, proving the display string's availability does not, by
    // itself, commit authoritative state -- exactly the LLM-string-vs-authority separation
    // directive Section 5 requires.

    // --- C: after the real response commit (askQuestion's actual next line) ---
    const afterResponseCommit = commitNpcResponseIfApplicable(ASK_ABOUT_LEFTOVER_STOCK.actionId, afterAskResolutionOnly, packet);
    const pointC = evaluateLeftoverQuestionPrerequisite(afterResponseCommit);
    expect(pointC).toMatchObject({ prerequisiteSatisfied: true, questionAsked: true, answerReceived: true, targetFactKnown: true });
    expect(afterResponseCommit.materials.map((m) => m.id).sort()).toEqual(["leftover_question_response_confirm", "leftover_stock_moved"]);
    expect(afterResponseCommit.experienceLog.map((e) => e.concreteContent)).toEqual(["運んだ箱が祭りの残りかどうか、洋平に尋ねた"]); // unchanged by the commit
  });
});

describe("PHASE 11.13C/D: fixture/semantic consistency (directive Section 11 -- fixture-level assertion, not generic parsing)", () => {
  it("every packetKey registered as CONFIRM has real captured text that actually confirms, not denies", () => {
    for (const [key, semantic] of Object.entries(LEFTOVER_QUESTION_RESPONSE_SEMANTICS)) {
      const captured = CAPTURED_YOHEI_LINES.find((c) => c.packetKey === key);
      expect(captured, `no captured line found for registered packetKey "${key}"`).toBeDefined();
      if (semantic === "CONFIRM") {
        expect(captured!.text).not.toMatch(/分からな|知らな|違う|いや、/);
        expect(captured!.text).toMatch(/祭りの残り/);
      }
    }
  });

  it("the registered packetKey matches what the real packet actually produces (no drift between the registry and the real dispatch)", () => {
    const afterReveal = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
    const { state: afterAsk } = resolveAction(afterReveal, ASK_ABOUT_LEFTOVER_STOCK);
    const packet = buildYoheiPacket(afterAsk, "これ、祭りの残り？", ASK_ABOUT_LEFTOVER_STOCK.playerIntent);
    expect(Object.prototype.hasOwnProperty.call(LEFTOVER_QUESTION_RESPONSE_SEMANTICS, packetKey(packet))).toBe(true);
  });
});
