/**
 * Behavior tests for the V11 stage 4 semantic interpreter contract. Each
 * `it` cites the trigger requirement or spec passage it pins down so a
 * future patch that changes behavior has to consciously edit the matching
 * test, not just happen to keep it green.
 */
import { describe, expect, it } from "vitest";
import {
  CONSERVATIVE_CLARIFY_CLASSIFICATION,
  FixedResponseAdapter,
  NullSemanticInterpreterAdapter,
  interpretTurn,
  isValidRawTurnClassification,
  type SemanticInterpreterAdapter,
  type TurnInterpretationRequest,
} from "./semanticInterpreter";
import { ALL_ACTION_TYPES, ALL_BOUNDARY_MODES, ALL_RELATIONAL_EVENTS, type TurnClassification } from "./types";

const VALID: TurnClassification = {
  action: "ASK_BOUNDARY",
  boundaryMode: "DISCOVER",
  relationalEvents: [],
  needsClarification: false,
};

const REQUEST: TurnInterpretationRequest = {
  utterance: "どこまでなら大丈夫?",
  speaker: "PLAYER",
  caseContext: "turn 1, addressed to Mika",
};

describe("isValidRawTurnClassification — schema validation", () => {
  it("accepts a well-formed classification", () => {
    expect(isValidRawTurnClassification(VALID)).toBe(true);
  });

  it("accepts every closed ActionType value, not just one example", () => {
    for (const action of ALL_ACTION_TYPES) {
      if (action === "CLARIFY") continue; // CLARIFY has its own paired-field invariant, tested separately
      expect(isValidRawTurnClassification({ ...VALID, action })).toBe(true);
    }
  });

  it("accepts every closed BoundaryMode value", () => {
    for (const boundaryMode of ALL_BOUNDARY_MODES) {
      expect(isValidRawTurnClassification({ ...VALID, boundaryMode })).toBe(true);
    }
  });

  it("accepts every closed RelationalEvent value individually", () => {
    for (const event of ALL_RELATIONAL_EVENTS) {
      expect(isValidRawTurnClassification({ ...VALID, relationalEvents: [event] })).toBe(true);
    }
  });

  it("rejects non-object / null / array values", () => {
    expect(isValidRawTurnClassification(null)).toBe(false);
    expect(isValidRawTurnClassification("not an object")).toBe(false);
    expect(isValidRawTurnClassification(42)).toBe(false);
    expect(isValidRawTurnClassification([VALID])).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { action: _action, ...rest } = VALID;
    expect(isValidRawTurnClassification(rest)).toBe(false);
  });

  it("rejects an out-of-enum ACTION value (hallucinated action)", () => {
    expect(isValidRawTurnClassification({ ...VALID, action: "NEGOTIATE_SALARY" })).toBe(false);
  });

  it("rejects an out-of-enum BOUNDARY_MODE value", () => {
    expect(isValidRawTurnClassification({ ...VALID, boundaryMode: "MAYBE" })).toBe(false);
  });

  it("rejects a relationalEvents entry outside the closed set", () => {
    expect(isValidRawTurnClassification({ ...VALID, relationalEvents: ["RUDENESS"] })).toBe(false);
  });

  it("rejects a non-boolean needsClarification", () => {
    expect(isValidRawTurnClassification({ ...VALID, needsClarification: "false" })).toBe(false);
  });

  it("ignores an extra hallucinated field (e.g. a confidence score or free-text notes) rather than rejecting it", () => {
    expect(isValidRawTurnClassification({ ...VALID, confidence: 0.42, notes: "player seemed blunt" })).toBe(true);
  });

  it("accepts personalTrackSignal omitted, null, or 'OPENED'", () => {
    expect(isValidRawTurnClassification(VALID)).toBe(true);
    expect(isValidRawTurnClassification({ ...VALID, personalTrackSignal: null })).toBe(true);
    expect(isValidRawTurnClassification({ ...VALID, personalTrackSignal: "OPENED" })).toBe(true);
  });

  it("rejects an invalid personalTrackSignal value", () => {
    expect(isValidRawTurnClassification({ ...VALID, personalTrackSignal: "CLOSED" })).toBe(false);
  });

  it("accepts multiple relationalEvents in one turn (compound utterance, e.g. apology + insult same turn per V15's Q apology+insult probe)", () => {
    const compound = { ...VALID, action: "APOLOGIZE_AND_REPAIR", relationalEvents: ["ACKNOWLEDGES_MISTAKE", "PERSONAL_INSULT"] };
    expect(isValidRawTurnClassification(compound)).toBe(true);
  });

  it("accepts the exact conservative CLARIFY default", () => {
    expect(isValidRawTurnClassification(CONSERVATIVE_CLARIFY_CLASSIFICATION)).toBe(true);
  });

  it("rejects needsClarification:true paired with a resolved, non-CLARIFY action (smuggled guess under an uncertainty flag)", () => {
    expect(
      isValidRawTurnClassification({
        action: "FORCE_UNCONFIRMED_PLAN",
        boundaryMode: "CROSS_WITHOUT_PERMISSION",
        relationalEvents: [],
        needsClarification: true,
      }),
    ).toBe(false);
  });

  it("rejects action:CLARIFY paired with needsClarification:false (would make an uncertain turn look confidently resolved)", () => {
    expect(
      isValidRawTurnClassification({
        action: "CLARIFY",
        boundaryMode: "UNKNOWN",
        relationalEvents: [],
        needsClarification: false,
      }),
    ).toBe(false);
  });

  it("rejects action:CLARIFY with a non-UNKNOWN boundaryMode or non-empty relationalEvents even if needsClarification is true", () => {
    expect(
      isValidRawTurnClassification({
        action: "CLARIFY",
        boundaryMode: "DISCOVER",
        relationalEvents: [],
        needsClarification: true,
      }),
    ).toBe(false);
    expect(
      isValidRawTurnClassification({
        action: "CLARIFY",
        boundaryMode: "UNKNOWN",
        relationalEvents: ["THREAT"],
        needsClarification: true,
      }),
    ).toBe(false);
  });
});

describe("interpretTurn — fallback collapsing (requirement 1/3/7)", () => {
  it("falls back to the conservative CLARIFY classification when the adapter reports unavailable", async () => {
    const result = await interpretTurn(new NullSemanticInterpreterAdapter(), REQUEST);
    expect(result.status).toBe("fallback");
    expect(result.classification).toEqual(CONSERVATIVE_CLARIFY_CLASSIFICATION);
    expect(result.personalTrackSignal).toBeNull();
    if (result.status === "fallback") expect(result.reason).toBe("no_provider_configured");
  });

  it("falls back when the adapter throws instead of resolving to an unavailable status", async () => {
    const throwingAdapter: SemanticInterpreterAdapter = {
      classify: async () => {
        throw new Error("boom");
      },
    };
    const result = await interpretTurn(throwingAdapter, REQUEST);
    expect(result.status).toBe("fallback");
    expect(result.classification).toEqual(CONSERVATIVE_CLARIFY_CLASSIFICATION);
    if (result.status === "fallback") expect(result.reason).toBe("adapter_threw:boom");
  });

  it("falls back on a malformed response shape (missing field)", async () => {
    const adapter = new FixedResponseAdapter({ status: "ok", raw: { action: "ASK_BOUNDARY" } });
    const result = await interpretTurn(adapter, REQUEST);
    expect(result.status).toBe("fallback");
    if (result.status === "fallback") expect(result.reason).toBe("malformed_response");
  });

  it("falls back on a malformed response shape (hallucinated enum value)", async () => {
    const adapter = new FixedResponseAdapter({
      status: "ok",
      raw: { action: "NEGOTIATE_SALARY", boundaryMode: "DISCOVER", relationalEvents: [], needsClarification: false },
    });
    const result = await interpretTurn(adapter, REQUEST);
    expect(result.status).toBe("fallback");
  });

  it("falls back on a non-object response (e.g. a raw string or array)", async () => {
    const adapter = new FixedResponseAdapter({ status: "ok", raw: "ASK_BOUNDARY" });
    const result = await interpretTurn(adapter, REQUEST);
    expect(result.status).toBe("fallback");
  });
});

describe("interpretTurn — successful interpretation", () => {
  it("passes through a valid classification unchanged", async () => {
    const adapter = new FixedResponseAdapter({ status: "ok", raw: VALID });
    const result = await interpretTurn(adapter, REQUEST);
    expect(result.status).toBe("interpreted");
    expect(result.classification).toEqual(VALID);
    expect(result.personalTrackSignal).toBeNull();
  });

  it("threads a personalTrackSignal through separately from the TurnClassification fields", async () => {
    const adapter = new FixedResponseAdapter({ status: "ok", raw: { ...VALID, personalTrackSignal: "OPENED" } });
    const result = await interpretTurn(adapter, REQUEST);
    expect(result.status).toBe("interpreted");
    expect(result.personalTrackSignal).toBe("OPENED");
    // classification itself must not carry the signal as a stray key
    expect(Object.keys(result.classification).sort()).toEqual(
      ["action", "boundaryMode", "needsClarification", "relationalEvents"].sort(),
    );
  });

  it("preserves multiple relationalEvents from a compound utterance without dropping or deduplicating", async () => {
    const raw = { ...VALID, action: "PROPOSE_REWRITE", relationalEvents: ["PUBLIC_SHAMING", "PERSONAL_INSULT"] };
    const adapter = new FixedResponseAdapter({ status: "ok", raw });
    const result = await interpretTurn(adapter, REQUEST);
    expect(result.status).toBe("interpreted");
    expect(result.classification.relationalEvents).toEqual(["PUBLIC_SHAMING", "PERSONAL_INSULT"]);
  });

  it("returns the exact conservative default object identity's shape on the fallback path (no partial/guessed fields survive)", async () => {
    const adapter = new FixedResponseAdapter({ status: "unavailable", reason: "timeout" });
    const result = await interpretTurn(adapter, REQUEST);
    expect(result.classification.action).toBe("CLARIFY");
    expect(result.classification.needsClarification).toBe(true);
  });
});

describe("interpretTurn — style neutrality (requirement 4)", () => {
  it("produces byte-identical output for a diplomatic and a blunt utterance that an adapter classifies the same way (V13 §9's own equivalence-pair pattern)", async () => {
    const diplomaticAdapter = new FixedResponseAdapter({ status: "ok", raw: VALID });
    const bluntAdapter = new FixedResponseAdapter({ status: "ok", raw: VALID });

    const diplomatic = await interpretTurn(diplomaticAdapter, {
      utterance: "その場面、どこまでなら大丈夫か教えてもらえますか?",
      speaker: "PLAYER",
      caseContext: REQUEST.caseContext,
    });
    const blunt = await interpretTurn(bluntAdapter, {
      utterance: "どこまでならいい?",
      speaker: "PLAYER",
      caseContext: REQUEST.caseContext,
    });

    expect(diplomatic.classification).toEqual(blunt.classification);
    expect(diplomatic.personalTrackSignal).toEqual(blunt.personalTrackSignal);
  });

  it("this module never reads request.utterance — it is opaque pass-through to the adapter (regex/tone scoring cannot live here)", async () => {
    let observedUtterance: string | null = null;
    const observingAdapter: SemanticInterpreterAdapter = {
      classify: async (request) => {
        observedUtterance = request.utterance;
        return { status: "ok", raw: VALID };
      },
    };
    await interpretTurn(observingAdapter, REQUEST);
    // the adapter (not this module) is the only thing that ever sees the text;
    // this assertion just confirms the request reaches the adapter untouched.
    expect(observedUtterance).toBe(REQUEST.utterance);
  });
});

describe("interpretTurn — no direct state mutation (requirement 3)", () => {
  it("takes no state argument and its result carries only classification/signal fields, never relationship- or ending-state shape", async () => {
    const adapter = new FixedResponseAdapter({ status: "ok", raw: VALID });
    const result = await interpretTurn(adapter, REQUEST);
    expect(Object.keys(result).sort()).toEqual(["classification", "personalTrackSignal", "status"].sort());
    // no relationshipState / repairWindow / taskLedger / causalEventHistory key anywhere in the result
    const serialized = JSON.stringify(result);
    for (const stateOnlyKey of ["relationshipState", "repairWindow", "taskLedger", "causalEventHistory", "correctiveActionLog"]) {
      expect(serialized.includes(stateOnlyKey)).toBe(false);
    }
  });
});
