import { describe, expect, it } from "vitest";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../src/research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  ASK_ABOUT_LEFTOVER_STOCK,
} from "../src/research/action-contract-v2/playableSceneContracts";
import { evaluateLeftoverQuestionPrerequisite } from "../src/research/action-contract-v2/causalUnlockInvariant";
import { commitLeftoverQuestionResponse, commitNpcResponseIfApplicable } from "../src/research/action-contract-v2/npcResponseCommit";
import type { ContractV2State } from "../src/research/action-contract-v2/types";
import type { StructuredResponseOutcome } from "../src/research/action-contract-v2/playableSceneContracts";

function baseState() {
  return openYoheiLeftoverStockRequest(createInitialState(), "structured-response-semantics-test");
}
function afterAsk() {
  const accepted = resolvePendingReplyEvent(baseState(), PLAYER_ACCEPTS_HELP_MOVE_STOCK).state;
  return resolveAction(accepted, ASK_ABOUT_LEFTOVER_STOCK).state;
}

describe("PHASE 11.13D: CONFIRM / DENY / UNKNOWN / NO_RESPONSE truth table (directive Section 9/17)", () => {
  it("CONFIRM -> questionAsked=true, answerReceived=true, targetStatus=KNOWN_TRUE", () => {
    const state = commitLeftoverQuestionResponse(afterAsk(), "CONFIRM");
    const r = evaluateLeftoverQuestionPrerequisite(state);
    expect(r).toMatchObject({ questionAsked: true, answerReceived: true, targetStatus: "KNOWN_TRUE", targetFactKnown: true });
  });

  it("DENY -> questionAsked=true, answerReceived=true, targetStatus=KNOWN_FALSE (mandatory, directive Section 10)", () => {
    const state = commitLeftoverQuestionResponse(afterAsk(), "DENY");
    const r = evaluateLeftoverQuestionPrerequisite(state);
    expect(r).toMatchObject({ questionAsked: true, answerReceived: true, targetStatus: "KNOWN_FALSE", targetFactKnown: false });
  });

  it("UNKNOWN -> questionAsked=true, answerReceived=true, targetStatus=UNRESOLVED", () => {
    const state = commitLeftoverQuestionResponse(afterAsk(), "UNKNOWN");
    const r = evaluateLeftoverQuestionPrerequisite(state);
    expect(r).toMatchObject({ questionAsked: true, answerReceived: true, targetStatus: "UNRESOLVED", targetFactKnown: false });
  });

  it("NO_RESPONSE -> questionAsked=true, answerReceived=false, targetStatus=UNRESOLVED", () => {
    const state = afterAsk(); // ask dispatched, nothing committed
    const r = evaluateLeftoverQuestionPrerequisite(state);
    expect(r).toMatchObject({ questionAsked: true, answerReceived: false, targetStatus: "UNRESOLVED", targetFactKnown: false });
  });

  it("KNOWN_FALSE is never collapsed into UNRESOLVED -- the two are mechanically distinguishable", () => {
    const denyState = commitLeftoverQuestionResponse(afterAsk(), "DENY");
    const unknownState = commitLeftoverQuestionResponse(afterAsk(), "UNKNOWN");
    const denyResult = evaluateLeftoverQuestionPrerequisite(denyState);
    const unknownResult = evaluateLeftoverQuestionPrerequisite(unknownState);
    expect(denyResult.targetStatus).not.toBe(unknownResult.targetStatus);
    expect(denyResult.targetStatus).toBe("KNOWN_FALSE");
    expect(unknownResult.targetStatus).toBe("UNRESOLVED");
  });
});

describe("PHASE 11.13D: DENY with the literal target phrase MUST NOT be read as CONFIRM (directive Section 10, mandatory)", () => {
  it("committing DENY produces text containing '祭りの残り' yet still resolves KNOWN_FALSE, not KNOWN_TRUE -- proves substring authority is gone", () => {
    const state = commitLeftoverQuestionResponse(afterAsk(), "DENY");
    const denyMaterial = state.materials.find((m) => m.id.includes("response_deny"));
    expect(denyMaterial?.concreteContent).toContain("祭りの残り"); // the adversarial precondition
    const result = evaluateLeftoverQuestionPrerequisite(state);
    expect(result.targetStatus).toBe("KNOWN_FALSE"); // NOT KNOWN_TRUE, despite the substring
  });
});

describe("PHASE 11.13D: adversarial prose mutation invariant (directive Section 11/12) -- semantic fixed, prose varied", () => {
  const UNKNOWN_PROSE_VARIANTS = ["祭りの残りかどうかは分からない", "由来は知らない", "それは俺にも分からん", "特に何も知らない"];

  it.each(UNKNOWN_PROSE_VARIANTS)("UNKNOWN semantic with varied prose (%s) all produce identical targetStatus=UNRESOLVED", (prose) => {
    const state = afterAsk();
    const stateWithVariantProse: ContractV2State = {
      ...state,
      materials: [
        ...state.materials,
        {
          id: "leftover_question_response_unknown",
          type: "SHARED_EVENT",
          concreteContent: prose, // prose varies; the material id (the authoritative signal) does not
          origin: "NPC_RESPONSE:test",
          dayCreated: state.day,
          authority: "WORLD_EVENT_WITNESSED",
          status: "ACTIVE",
          knownBy: ["player", "yohei"],
          possibleConsumers: [],
        },
      ],
    };
    const result = evaluateLeftoverQuestionPrerequisite(stateWithVariantProse);
    expect(result.targetStatus).toBe("UNRESOLVED");
  });

  const CONFIRM_PARAPHRASES = ["うん、それは祭りで余ったやつだ", "そう、売れ残りのやつだよ", "ああ、それで合ってる"];

  it.each(CONFIRM_PARAPHRASES)("CONFIRM semantic with a paraphrase NOT containing the old exact substring (%s) still produces KNOWN_TRUE", (prose) => {
    const state = afterAsk();
    const stateWithParaphrase: ContractV2State = {
      ...state,
      materials: [
        ...state.materials,
        {
          id: "leftover_question_response_confirm",
          type: "SHARED_EVENT",
          concreteContent: prose,
          origin: "NPC_RESPONSE:test",
          dayCreated: state.day,
          authority: "WORLD_EVENT_WITNESSED",
          status: "ACTIVE",
          knownBy: ["player", "yohei"],
          possibleConsumers: [],
        },
      ],
    };
    const result = evaluateLeftoverQuestionPrerequisite(stateWithParaphrase);
    expect(result.targetStatus).toBe("KNOWN_TRUE");
  });

  it("DENY with the target phrase stated literally still produces KNOWN_FALSE (directive Section 11's DENY requirement)", () => {
    const state = afterAsk();
    const stateWithLiteralDeny: ContractV2State = {
      ...state,
      materials: [
        ...state.materials,
        {
          id: "leftover_question_response_deny",
          type: "SHARED_EVENT",
          concreteContent: "いや、これは祭りの残りじゃないよ。",
          origin: "NPC_RESPONSE:test",
          dayCreated: state.day,
          authority: "WORLD_EVENT_WITNESSED",
          status: "ACTIVE",
          knownBy: ["player", "yohei"],
          possibleConsumers: [],
        },
      ],
    };
    const result = evaluateLeftoverQuestionPrerequisite(stateWithLiteralDeny);
    expect(result.targetStatus).toBe("KNOWN_FALSE");
  });
});

describe("PHASE 11.13D: prose mutation invariant, formalized (directive Section 12)", () => {
  function stateWithResponseMaterial(outcome: StructuredResponseOutcome, prose: string): ContractV2State {
    const state = afterAsk();
    const idByOutcome: Record<StructuredResponseOutcome, string> = {
      CONFIRM: "leftover_question_response_confirm",
      DENY: "leftover_question_response_deny",
      UNKNOWN: "leftover_question_response_unknown",
    };
    return {
      ...state,
      materials: [
        ...state.materials,
        {
          id: idByOutcome[outcome],
          type: "SHARED_EVENT",
          concreteContent: prose,
          origin: "NPC_RESPONSE:test",
          dayCreated: state.day,
          authority: "WORLD_EVENT_WITNESSED",
          status: "ACTIVE",
          knownBy: ["player", "yohei"],
          possibleConsumers: [],
        },
      ],
    };
  }

  it("changing ONLY prose, semantic fixed as CONFIRM -> authoritative targetStatus unchanged across all variants", () => {
    const proseVariants = ["ああ、そうだ。祭りの残りだよ。", "うん、それは祭りの余りだ。", "そういうことだ、間違いない。"];
    const statuses = proseVariants.map((p) => evaluateLeftoverQuestionPrerequisite(stateWithResponseMaterial("CONFIRM", p)).targetStatus);
    expect(new Set(statuses).size).toBe(1);
    expect(statuses[0]).toBe("KNOWN_TRUE");
  });

  it("changing ONLY semantic, prose held deliberately similar -> authoritative targetStatus changes correctly", () => {
    const similarProseConfirm = "これは祭りの残りだ。";
    const similarProseDeny = "これは祭りの残りじゃない。"; // one negation word apart from the CONFIRM prose above
    const confirmResult = evaluateLeftoverQuestionPrerequisite(stateWithResponseMaterial("CONFIRM", similarProseConfirm));
    const denyResult = evaluateLeftoverQuestionPrerequisite(stateWithResponseMaterial("DENY", similarProseDeny));
    expect(confirmResult.targetStatus).toBe("KNOWN_TRUE");
    expect(denyResult.targetStatus).toBe("KNOWN_FALSE");
  });
});

describe("PHASE 11.13D: LLM/display string cannot mutate semantic state; response commit happens at the real seam", () => {
  it("commitNpcResponseIfApplicable never receives or reads a display string -- only actionId/state/packet", () => {
    const state = afterAsk();
    const packet = { worldFacts: [], firsthand: [], unknown: [], currentLocalFacts: [], pendingRequestContent: "KNOWN: x", playerUtterance: "これ、祭りの残り？", authoritativeAction: "ASK_ABOUT_LEFTOVER_STOCK" };
    const result = commitNpcResponseIfApplicable("ASK_ABOUT_LEFTOVER_STOCK", state, packet);
    expect(result.materials.some((m) => m.id === "leftover_question_response_confirm")).toBe(true);
  });

  it("PHASE 11.13C event order remains intact: ask dispatch alone never creates any response material", () => {
    const state = afterAsk();
    expect(state.materials.some((m) => m.id.startsWith("leftover_question_response_"))).toBe(false);
  });
});
