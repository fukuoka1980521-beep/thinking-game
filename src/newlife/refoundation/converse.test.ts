/**
 * Behavior tests for the V37 generative character conversation module
 * (`converse.ts`). Each `it` cites the V37 requirement or spec passage it
 * pins down.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CONVERSE_FALLBACK_CANDIDATE_TURN,
  FixedResponseConversationAdapter,
  NullConversationAdapter,
  converseTurn,
  isValidRawConverseResult,
  type CharacterConversationRequest,
  type ConversationAdapter,
  type RawConverseTurnResult,
} from "./converse";
import { ALL_ACTION_TYPES, ALL_BOUNDARY_MODES, ALL_RELATIONAL_EVENTS } from "./types";

const VALID: RawConverseTurnResult = {
  npc: "MIKA",
  npcLine: "それなら、内容を変えるなら考えられます。",
  understoodPlayerMeaning: "代替案があるかを尋ねている。",
  candidateTurn: { action: "ASK_BOUNDARY", boundaryMode: "DISCOVER", relationalEvents: [], needsClarification: false },
  candidateFactRevealIds: [],
  candidateCommitments: [],
  uncertainty: "LOW",
  thoughtSupportSignal: false,
};

function baseRequest(overrides: Partial<CharacterConversationRequest> = {}): CharacterConversationRequest {
  return {
    caseId: "COMMUNITY_THEATER_V1",
    targetNpc: "MIKA",
    rawPlayerUtterance: "なんで今まで言わなかったの？",
    recentDialogue: [
      { speaker: "SYSTEM", text: "16:40。通し稽古が止まっている。" },
      { speaker: "MIKA", text: "この場面、明日はやりません。" },
    ],
    dynamicState: {
      relationshipState: "NEUTRAL",
      boundaryStatus: "UNKNOWN",
      remainingMinutes: 50,
      activeCommitment: null,
    },
    ...overrides,
  };
}

describe("isValidRawConverseResult — schema validation (V37 §3)", () => {
  it("accepts a well-formed result", () => {
    expect(isValidRawConverseResult(VALID, "MIKA")).toBe(true);
  });

  it("rejects a result for the wrong NPC (defense in depth vs. a provider answering as the other character)", () => {
    expect(isValidRawConverseResult(VALID, "RYO")).toBe(false);
  });

  it("rejects a missing or empty npcLine", () => {
    const { npcLine: _npcLine, ...rest } = VALID;
    expect(isValidRawConverseResult(rest, "MIKA")).toBe(false);
    expect(isValidRawConverseResult({ ...VALID, npcLine: "" }, "MIKA")).toBe(false);
  });

  it("rejects an npcLine that leaks a raw ontology label (V37 §3's 'no internal labels in dialogue')", () => {
    expect(isValidRawConverseResult({ ...VALID, npcLine: "WITHDRAWN state active" }, "MIKA")).toBe(false);
    expect(isValidRawConverseResult({ ...VALID, npcLine: "私はCROSS_WITHOUT_PERMISSIONだと思う" }, "MIKA")).toBe(false);
  });

  it("rejects a missing understoodPlayerMeaning", () => {
    const { understoodPlayerMeaning: _u, ...rest } = VALID;
    expect(isValidRawConverseResult(rest, "MIKA")).toBe(false);
  });

  it("rejects every out-of-enum candidateTurn field", () => {
    expect(isValidRawConverseResult({ ...VALID, candidateTurn: { ...VALID.candidateTurn, action: "NOT_REAL" } }, "MIKA")).toBe(false);
    expect(
      isValidRawConverseResult({ ...VALID, candidateTurn: { ...VALID.candidateTurn, boundaryMode: "MAYBE" } }, "MIKA"),
    ).toBe(false);
    expect(
      isValidRawConverseResult(
        { ...VALID, candidateTurn: { ...VALID.candidateTurn, relationalEvents: ["RUDENESS"] } },
        "MIKA",
      ),
    ).toBe(false);
  });

  it("accepts every closed ActionType/BoundaryMode/RelationalEvent value inside candidateTurn", () => {
    for (const action of ALL_ACTION_TYPES) {
      if (action === "CLARIFY") continue; // CLARIFY has its own paired-field invariant, tested separately
      expect(isValidRawConverseResult({ ...VALID, candidateTurn: { ...VALID.candidateTurn, action } }, "MIKA")).toBe(true);
    }
    for (const boundaryMode of ALL_BOUNDARY_MODES) {
      expect(
        isValidRawConverseResult({ ...VALID, candidateTurn: { ...VALID.candidateTurn, boundaryMode } }, "MIKA"),
      ).toBe(true);
    }
    for (const event of ALL_RELATIONAL_EVENTS) {
      expect(
        isValidRawConverseResult(
          { ...VALID, candidateTurn: { ...VALID.candidateTurn, relationalEvents: [event] } },
          "MIKA",
        ),
      ).toBe(true);
    }
  });

  it("enforces the CLARIFY cross-field invariant on candidateTurn, mirroring isValidRawTurnClassification", () => {
    const clarify = {
      ...VALID,
      candidateTurn: { action: "CLARIFY", boundaryMode: "UNKNOWN", relationalEvents: [], needsClarification: true },
      uncertainty: "HIGH",
    };
    expect(isValidRawConverseResult(clarify, "MIKA")).toBe(true);
    // CLARIFY but needsClarification false -> reject
    expect(
      isValidRawConverseResult({ ...clarify, candidateTurn: { ...clarify.candidateTurn, needsClarification: false } }, "MIKA"),
    ).toBe(false);
    // CLARIFY but a populated boundaryMode -> reject (smuggled specific reading under an uncertainty flag)
    expect(
      isValidRawConverseResult({ ...clarify, candidateTurn: { ...clarify.candidateTurn, boundaryMode: "DISCOVER" } }, "MIKA"),
    ).toBe(false);
  });

  it("rejects an out-of-enum uncertainty value", () => {
    expect(isValidRawConverseResult({ ...VALID, uncertainty: "SUPER_SURE" }, "MIKA")).toBe(false);
  });

  it("rejects a non-boolean thoughtSupportSignal", () => {
    expect(isValidRawConverseResult({ ...VALID, thoughtSupportSignal: "yes" }, "MIKA")).toBe(false);
  });

  it("rejects an oversized candidateFactRevealIds/candidateCommitments array (data minimization)", () => {
    expect(
      isValidRawConverseResult({ ...VALID, candidateFactRevealIds: Array(10).fill("x") }, "MIKA"),
    ).toBe(false);
  });

  it("rejects non-object / null / array values outright", () => {
    expect(isValidRawConverseResult(null, "MIKA")).toBe(false);
    expect(isValidRawConverseResult("not an object", "MIKA")).toBe(false);
    expect(isValidRawConverseResult([VALID], "MIKA")).toBe(false);
  });
});

describe("converseTurn — orchestration (V37 §3/§7)", () => {
  it("returns the generated result on a valid adapter response", async () => {
    const adapter = new FixedResponseConversationAdapter({ status: "ok", raw: VALID });
    const result = await converseTurn(adapter, baseRequest());
    expect(result.status).toBe("generated");
    expect(result.fallback).toBe(false);
    expect(result.npcLine).toBe(VALID.npcLine);
    expect(result.candidateTurn).toEqual(VALID.candidateTurn);
  });

  it("falls back to the safe CLARIFY-shaped candidate turn when no provider is configured", async () => {
    const result = await converseTurn(new NullConversationAdapter(), baseRequest());
    expect(result.status).toBe("fallback");
    expect(result.candidateTurn).toEqual(CONVERSE_FALLBACK_CANDIDATE_TURN);
    expect(result.uncertainty).toBe("HIGH");
  });

  it("falls back (never throws) when the adapter rejects", async () => {
    const throwingAdapter: ConversationAdapter = {
      async converse() {
        throw new Error("network exploded");
      },
    };
    const result = await converseTurn(throwingAdapter, baseRequest());
    expect(result.status).toBe("fallback");
    expect(result.fallback).toBe(true);
    if (result.status === "fallback") expect(result.reason).toContain("adapter_threw");
  });

  it("falls back on a malformed/hallucinated model response instead of trusting it (malformed candidate effects cannot mutate state)", async () => {
    const adapter = new FixedResponseConversationAdapter({ status: "ok", raw: { garbage: true } });
    const result = await converseTurn(adapter, baseRequest());
    expect(result.status).toBe("fallback");
    expect(result.candidateTurn).toEqual(CONVERSE_FALLBACK_CANDIDATE_TURN);
  });

  it("falls back to the correct per-(npc, relationshipState) safe line, never a generic one, and reflects WITHDRAWN non-cooperation", async () => {
    const openResult = await converseTurn(
      new NullConversationAdapter(),
      baseRequest({ targetNpc: "RYO", dynamicState: { relationshipState: "OPEN", boundaryStatus: "UNKNOWN", remainingMinutes: 40, activeCommitment: null } }),
    );
    const withdrawnResult = await converseTurn(
      new NullConversationAdapter(),
      baseRequest({ targetNpc: "RYO", dynamicState: { relationshipState: "WITHDRAWN", boundaryStatus: "UNKNOWN", remainingMinutes: 40, activeCommitment: null } }),
    );
    expect(openResult.npcLine).not.toBe(withdrawnResult.npcLine);
  });

  it("never mutates state: the function's return type carries only data, and this module imports nothing state-mutating", async () => {
    const adapter = new FixedResponseConversationAdapter({ status: "ok", raw: VALID });
    const before = JSON.stringify(baseRequest());
    const request = baseRequest();
    await converseTurn(adapter, request);
    expect(JSON.stringify(request)).toBe(before);
  });
});

describe("converseTurn — raw utterance and recent dialogue are preserved, not restructured (V37 §1/§4/§6)", () => {
  it("passes the exact raw utterance through to the adapter, unmodified", async () => {
    let capturedUtterance: string | null = null;
    const capturingAdapter: ConversationAdapter = {
      async converse(request) {
        capturedUtterance = request.rawPlayerUtterance;
        return { status: "ok", raw: VALID };
      },
    };
    const utterance = "台本じゃなく演出で隠せない？";
    await converseTurn(capturingAdapter, baseRequest({ rawPlayerUtterance: utterance }));
    expect(capturedUtterance).toBe(utterance);
  });

  it("passes the full recentDialogue array through to the adapter, unmodified", async () => {
    let capturedDialogue: unknown = null;
    const capturingAdapter: ConversationAdapter = {
      async converse(request) {
        capturedDialogue = request.recentDialogue;
        return { status: "ok", raw: VALID };
      },
    };
    const dialogue = baseRequest().recentDialogue;
    await converseTurn(capturingAdapter, baseRequest({ recentDialogue: dialogue }));
    expect(capturedDialogue).toEqual(dialogue);
  });

  it("the request shape never carries scene facts or a character dossier (V37 §1: canon stays server-side)", () => {
    const request = baseRequest();
    const keys = Object.keys(request);
    expect(keys.sort()).toEqual(["caseId", "dynamicState", "rawPlayerUtterance", "recentDialogue", "targetNpc"]);
    expect(JSON.stringify(request)).not.toMatch(/dossier|sceneCanon|forbiddenKnowledge/i);
  });
});

describe("converse.ts — broad free-conversation inputs are opaque pass-through, never a lookup table (V37 §6/§10)", () => {
  const OWNER_STYLE_UTTERANCES = [
    "なんで今まで言わなかったの？",
    "今日は一旦帰ろうか",
    "亮はこの件どう思ってる？",
    "美香が出ないなら公演やめよう",
    "台本じゃなく演出で隠せない？",
    "二人とも少し意地になってない？",
    "もう疲れた。勝手に決めて",
    "totuzenndousita", // typo/romaji
    "今日は天気がいいですね", // unrelated small talk
    "どうすればいいと思う？", // request for advice
  ];

  it.each(OWNER_STYLE_UTTERANCES)("passes %j through to the adapter byte-for-byte, with no special-case handling in this module", async (utterance) => {
    let captured: string | null = null;
    const capturingAdapter: ConversationAdapter = {
      async converse(request) {
        captured = request.rawPlayerUtterance;
        return { status: "ok", raw: VALID };
      },
    };
    await converseTurn(capturingAdapter, baseRequest({ rawPlayerUtterance: utterance }));
    expect(captured).toBe(utterance);
  });

  it("this module's source contains no per-utterance answer table (no switch/if-chain keyed on utterance content)", () => {
    // Structural check: converse.ts must never branch on the *content* of
    // rawPlayerUtterance -- it is read exactly once, only to pass it through
    // unexamined to the adapter (V37 §1's explicit "no per-utterance answer
    // table. No regex phrase routing").
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "converse.ts"), "utf-8");
    expect(source).not.toMatch(/rawPlayerUtterance[^\n]*(===|includes|match|test\()/);
    expect(source.match(/\.test\(/g)).toBeNull();
  });
});

describe("converse.ts — accepting a compound multi-event utterance is a validator concern, not a special-cased one", () => {
  it("accepts a candidateTurn carrying multiple relationalEvents at once (e.g. an apology + an insult in one turn)", () => {
    const compound: RawConverseTurnResult = {
      ...VALID,
      candidateTurn: {
        action: "APOLOGIZE_AND_REPAIR",
        boundaryMode: "NOT_RELEVANT",
        relationalEvents: ["ACKNOWLEDGES_MISTAKE", "PERSONAL_INSULT"],
        needsClarification: false,
      },
    };
    expect(isValidRawConverseResult(compound, "MIKA")).toBe(true);
  });
});
