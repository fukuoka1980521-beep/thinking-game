import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// functions/newlife-refoundation-ai/ is a separate deployment artifact, not
// part of the Vite/Vitest frontend build -- but lib.js (unlike index.js) has
// zero dependency on @google/genai, so it can be required directly here with
// Node's own `require` (via createRequire) and its pure functions exercised
// for real. Same "extracted pure functions" discipline as
// tests/newlifeDialogueFunction.test.ts; the actual Vertex AI call in
// index.js cannot be exercised without credentials/deployment, same
// disclosed limitation as the other two functions' own README.md.
const require = createRequire(import.meta.url);
const lib = require(join(__dirname, "..", "functions", "newlife-refoundation-ai", "lib.js"));

function mockReq(overrides: Partial<{ method: string; body: unknown; origin: string | undefined }> = {}) {
  const { method = "POST", body = {}, origin = "https://fukuoka1980521-beep.github.io" } = overrides;
  return {
    method,
    body,
    get(header: string) {
      return header === "Origin" ? origin : undefined;
    },
  };
}

function mockRes() {
  const calls: { status?: number; json?: unknown; sent?: unknown; headers: Record<string, string> } = { headers: {} };
  const res = {
    status(code: number) {
      calls.status = code;
      return res;
    },
    json(body: unknown) {
      calls.json = body;
      return res;
    },
    send(body: unknown) {
      calls.sent = body;
      return res;
    },
    set(header: string, value: string) {
      calls.headers[header] = value;
      return res;
    },
  };
  return { res, calls };
}

function validInterpretBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    operation: "interpret_turn",
    utterance: "ミカ、なんでこの場面だめなの？",
    caseContext: "対象: MIKA. public. boundary: UNKNOWN.",
    ...overrides,
  };
}

function validProjection(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    npc: "MIKA",
    relationshipState: "NEUTRAL",
    boundaryStatus: "UNKNOWN",
    lastPlayerTurn: { action: "ASK_BOUNDARY", boundaryMode: "DISCOVER", relationalEvents: [] },
    sceneContext: "楽屋、二人きり。",
    ...overrides,
  };
}

function validNpcBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    operation: "generate_npc_line",
    projection: validProjection(),
    ...overrides,
  };
}

function validDynamicState(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    relationshipState: "NEUTRAL",
    boundaryStatus: "UNKNOWN",
    remainingMinutes: 50,
    activeCommitment: null,
    ...overrides,
  };
}

function validConverseBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    operation: "converse_turn",
    caseId: "COMMUNITY_THEATER_V1",
    targetNpc: "MIKA",
    rawPlayerUtterance: "なんで今まで言わなかったの？",
    recentDialogue: [
      { speaker: "SYSTEM", text: "16:40。通し稽古が止まっている。" },
      { speaker: "MIKA", text: "この場面、明日はやりません。" },
    ],
    dynamicState: validDynamicState(),
    ...overrides,
  };
}


function validNpcExchangeBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    operation: "continue_npc_exchange",
    caseId: "COMMUNITY_THEATER_V1",
    targetNpc: "MIKA",
    recentDialogue: [
      { speaker: "PLAYER", text: "二人で決めてください。" },
      { speaker: "RYO", text: "美香、この変更案なら進められるか？" },
    ],
    continuationDepth: 1,
    dynamicState: validDynamicState(),
    ...overrides,
  };
}

function validStreetConverseBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    operation: "converse_turn",
    caseId: "STREET_TRIAL_V1",
    targetNpc: "HINA",
    rawPlayerUtterance: "何が起きているの？",
    recentDialogue: [
      { speaker: "HINA", text: "合計は30点なんです。" },
      { speaker: "YOHEI", text: "予約12、店頭18だろ。" },
    ],
    dynamicState: validDynamicState(),
    ...overrides,
  };
}

function validCafeConverseBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    operation: "converse_turn",
    caseId: "CAFE_BOUNDARY_V1",
    targetNpc: "MIYOKO",
    rawPlayerUtterance: "昨日の『手伝う』って、席を貸す意味まで含んでいたの？",
    recentDialogue: [
      { speaker: "MIYOKO", text: "私は待合にするとは言ってないのよ。" },
      { speaker: "FUMIKO", text: "でも、手伝えることがあればって言ってくれたでしょう。" },
    ],
    dynamicState: validDynamicState(),
    ...overrides,
  };
}

function validOrganizeThoughtBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    operation: "organize_thought",
    validatedWorldFacts: "明日18:00が初回公演。チケットは販売済み。17:30までに決める必要がある。",
    recentDialogue: [{ speaker: "MIKA", text: "この場面、明日はやりません。" }],
    currentProblem: "この場面をどう扱うかを17:30までに決める必要がある。",
    ...overrides,
  };
}

describe("functions/newlife-refoundation-ai/lib.js — validateInput (envelope)", () => {
  it("rejects a body that isn't an object, or a missing/invalid operation", () => {
    expect(lib.validateInput(null)).toBe("invalid_body");
    expect(lib.validateInput({})).toBe("invalid_operation");
    expect(lib.validateInput({ operation: "delete_everything" })).toBe("invalid_operation");
  });
});

describe("functions/newlife-refoundation-ai/lib.js — validateInput (interpret_turn)", () => {
  it("accepts a well-formed request", () => {
    expect(lib.validateInput(validInterpretBody())).toBeNull();
  });

  it("rejects a missing/blank utterance", () => {
    expect(lib.validateInput(validInterpretBody({ utterance: "" }))).toBe("missing_or_invalid_utterance");
    expect(lib.validateInput(validInterpretBody({ utterance: "   " }))).toBe("missing_or_invalid_utterance");
    expect(lib.validateInput(validInterpretBody({ utterance: undefined }))).toBe("missing_or_invalid_utterance");
  });

  it("rejects an utterance over the max length (data minimization / cost control)", () => {
    const tooLong = "あ".repeat(lib.MAX_UTTERANCE_LENGTH + 1);
    expect(lib.validateInput(validInterpretBody({ utterance: tooLong }))).toBe("missing_or_invalid_utterance");
  });

  it("rejects a non-string or over-length caseContext", () => {
    expect(lib.validateInput(validInterpretBody({ caseContext: 5 }))).toBe("invalid_case_context");
    const tooLong = "a".repeat(lib.MAX_CASE_CONTEXT_LENGTH + 1);
    expect(lib.validateInput(validInterpretBody({ caseContext: tooLong }))).toBe("invalid_case_context");
  });

  it("accepts an empty caseContext (opaque, caller-optional free text)", () => {
    expect(lib.validateInput(validInterpretBody({ caseContext: "" }))).toBeNull();
  });
});

describe("functions/newlife-refoundation-ai/lib.js — validateInput (generate_npc_line)", () => {
  it("accepts a well-formed request, including a null lastPlayerTurn (first turn of the case)", () => {
    expect(lib.validateInput(validNpcBody())).toBeNull();
    expect(lib.validateInput(validNpcBody({ projection: validProjection({ lastPlayerTurn: null }) }))).toBeNull();
  });

  it("rejects an npc outside MIKA/RYO", () => {
    expect(lib.validateInput(validNpcBody({ projection: validProjection({ npc: "SOMEONE_ELSE" }) }))).toBe(
      "invalid_npc",
    );
  });

  it("rejects a relationshipState or boundaryStatus outside the closed enums", () => {
    expect(
      lib.validateInput(validNpcBody({ projection: validProjection({ relationshipState: "ANGRY" }) })),
    ).toBe("invalid_relationship_state");
    expect(
      lib.validateInput(validNpcBody({ projection: validProjection({ boundaryStatus: "BROKEN" }) })),
    ).toBe("invalid_boundary_status");
  });

  it("rejects a lastPlayerTurn with an action/boundaryMode/relationalEvents outside the closed enums", () => {
    expect(
      lib.validateInput(
        validNpcBody({ projection: validProjection({ lastPlayerTurn: { action: "NOT_REAL", boundaryMode: "UNKNOWN", relationalEvents: [] } }) }),
      ),
    ).toBe("invalid_last_player_turn");
    expect(
      lib.validateInput(
        validNpcBody({
          projection: validProjection({
            lastPlayerTurn: { action: "ASK_FACT", boundaryMode: "NOT_A_MODE", relationalEvents: [] },
          }),
        }),
      ),
    ).toBe("invalid_last_player_turn");
    expect(
      lib.validateInput(
        validNpcBody({
          projection: validProjection({
            lastPlayerTurn: { action: "ASK_FACT", boundaryMode: "UNKNOWN", relationalEvents: ["NOT_A_REAL_EVENT"] },
          }),
        }),
      ),
    ).toBe("invalid_last_player_turn");
  });

  it("rejects a non-string or over-length sceneContext", () => {
    const tooLong = "a".repeat(lib.MAX_SCENE_CONTEXT_LENGTH + 1);
    expect(lib.validateInput(validNpcBody({ projection: validProjection({ sceneContext: tooLong }) }))).toBe(
      "invalid_scene_context",
    );
  });

  it("rejects a missing or non-object projection", () => {
    expect(lib.validateInput({ operation: "generate_npc_line" })).toBe("missing_projection");
    expect(lib.validateInput({ operation: "generate_npc_line", projection: "not-an-object" })).toBe(
      "missing_projection",
    );
  });
});

describe("functions/newlife-refoundation-ai/lib.js — validateInput (converse_turn, V37 §1)", () => {
  it("accepts a well-formed request", () => {
    expect(lib.validateInput(validConverseBody())).toBeNull();
  });

  it("accepts an empty recentDialogue (first turn of the case)", () => {
    expect(lib.validateInput(validConverseBody({ recentDialogue: [] }))).toBeNull();
  });

  it("rejects a caseId outside the closed CASE_IDS set", () => {
    expect(lib.validateInput(validConverseBody({ caseId: "SOME_OTHER_CASE" }))).toBe("invalid_case_id");
  });

  it("rejects a targetNpc outside MIKA/RYO", () => {
    expect(lib.validateInput(validConverseBody({ targetNpc: "SOMEONE_ELSE" }))).toBe("invalid_target_npc");
  });

  it("rejects a missing/blank rawPlayerUtterance", () => {
    expect(lib.validateInput(validConverseBody({ rawPlayerUtterance: "" }))).toBe("missing_or_invalid_utterance");
    expect(lib.validateInput(validConverseBody({ rawPlayerUtterance: undefined }))).toBe("missing_or_invalid_utterance");
  });

  it("rejects an oversized rawPlayerUtterance (data minimization)", () => {
    const tooLong = "あ".repeat(lib.MAX_UTTERANCE_LENGTH + 1);
    expect(lib.validateInput(validConverseBody({ rawPlayerUtterance: tooLong }))).toBe("missing_or_invalid_utterance");
  });

  it("rejects a non-array recentDialogue, or one over the max entry count", () => {
    expect(lib.validateInput(validConverseBody({ recentDialogue: "not-an-array" }))).toBe("invalid_recent_dialogue");
    const tooMany = Array.from({ length: lib.MAX_RECENT_DIALOGUE_ENTRIES + 1 }, () => ({ speaker: "PLAYER", text: "x" }));
    expect(lib.validateInput(validConverseBody({ recentDialogue: tooMany }))).toBe("invalid_recent_dialogue");
  });

  it("rejects a recentDialogue entry with a speaker outside the closed set, or an oversized/blank line", () => {
    expect(
      lib.validateInput(validConverseBody({ recentDialogue: [{ speaker: "NARRATOR", text: "x" }] })),
    ).toBe("invalid_recent_dialogue");
    expect(
      lib.validateInput(validConverseBody({ recentDialogue: [{ speaker: "PLAYER", text: "" }] })),
    ).toBe("invalid_recent_dialogue");
    const tooLongLine = "a".repeat(lib.MAX_DIALOGUE_LINE_LENGTH + 1);
    expect(
      lib.validateInput(validConverseBody({ recentDialogue: [{ speaker: "PLAYER", text: tooLongLine }] })),
    ).toBe("invalid_recent_dialogue");
  });

  it("rejects a missing dynamicState, or one with an out-of-enum relationshipState/boundaryStatus", () => {
    expect(lib.validateInput(validConverseBody({ dynamicState: undefined }))).toBe("missing_dynamic_state");
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ relationshipState: "ANGRY" }) })),
    ).toBe("invalid_relationship_state");
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ boundaryStatus: "BROKEN" }) })),
    ).toBe("invalid_boundary_status");
  });

  it("rejects a non-numeric or out-of-range remainingMinutes", () => {
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ remainingMinutes: "50" }) })),
    ).toBe("invalid_remaining_minutes");
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ remainingMinutes: -1 }) })),
    ).toBe("invalid_remaining_minutes");
  });

  it("accepts a non-null activeCommitment string, and rejects an oversized one", () => {
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ activeCommitment: "COMMIT_PLAN (SEEK_PERMISSION)" }) })),
    ).toBeNull();
    const tooLong = "a".repeat(lib.MAX_ACTIVE_COMMITMENT_LENGTH + 1);
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ activeCommitment: tooLong }) })),
    ).toBe("invalid_active_commitment");
  });

  it("accepts a concrete scene revision in dynamic state and rejects an oversized draft", () => {
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ sceneRevisionText: "会社で上司と退職の話をする場面。" }) })),
    ).toBeNull();
    const tooLong = "あ".repeat(lib.MAX_SCENE_REVISION_LENGTH + 1);
    expect(
      lib.validateInput(validConverseBody({ dynamicState: validDynamicState({ sceneRevisionText: tooLong }) })),
    ).toBe("invalid_scene_revision");
  });
});


describe("functions/newlife-refoundation-ai/lib.js — validateInput (continue_npc_exchange, V41)", () => {
  it("accepts a bounded NPC-to-NPC continuation request", () => {
    expect(lib.validateInput(validNpcExchangeBody())).toBeNull();
  });

  it("requires recent dialogue to end with the other NPC, never a synthetic player turn or the same NPC", () => {
    expect(lib.validateInput(validNpcExchangeBody({ recentDialogue: [{ speaker: "PLAYER", text: "続けて" }] }))).toBe("invalid_exchange_source");
    expect(lib.validateInput(validNpcExchangeBody({ recentDialogue: [{ speaker: "MIKA", text: "私が返します" }] }))).toBe("invalid_exchange_source");
  });

  it("hard-bounds continuationDepth to the server maximum", () => {
    expect(lib.validateInput(validNpcExchangeBody({ continuationDepth: 0 }))).toBe("invalid_continuation_depth");
    expect(lib.validateInput(validNpcExchangeBody({ continuationDepth: lib.MAX_NPC_EXCHANGE_DEPTH + 1 }))).toBe("invalid_continuation_depth");
  });
});

describe("functions/newlife-refoundation-ai/lib.js — V43 second-case generalization", () => {
  it("accepts the street-trial case and rejects cross-case NPCs", () => {
    expect(lib.validateInput(validStreetConverseBody())).toBeNull();
    expect(lib.validateInput(validStreetConverseBody({ targetNpc: "MIKA" }))).toBe("invalid_target_npc");
    expect(lib.validateInput(validConverseBody({ targetNpc: "HINA" }))).toBe("invalid_target_npc");
  });

  it("selects street canon and distinct Hina/Yohei dossiers server-side", () => {
    expect(lib.getCaseCanon("STREET_TRIAL_V1").observableArtifacts.signText).toBe("本日30点");
    expect(lib.getCaseNpcIds("STREET_TRIAL_V1")).toEqual(["HINA", "YOHEI"]);
    expect(lib.STREET_TRIAL_CHARACTER_DOSSIERS.HINA.knowledge.join(" ")).toContain("予約");
    expect(lib.STREET_TRIAL_CHARACTER_DOSSIERS.YOHEI.speechModel).toContain("短く具体的");
  });

  it("buildConversePrompt uses the requested case rather than theater canon", () => {
    const prompt = lib.buildConversePrompt(validStreetConverseBody());
    expect(prompt).toContain("本日30点");
    expect(prompt).toContain("予約12点");
    expect(prompt).toContain("陽菜");
    expect(prompt).not.toContain("青いマフラー");
  });

  it("normalizeConverseResponse never hands a street case to theater NPCs", () => {
    const parsed = {
      npcLine: "分かりました。",
      understoodPlayerMeaning: "進めたい",
      candidateTurn: { action: "OTHER", boundaryMode: "NOT_RELEVANT", relationalEvents: [], needsClarification: false },
      candidateFactRevealIds: [],
      candidateCommitments: [],
      uncertainty: "LOW",
      thoughtSupportSignal: false,
      sceneStatus: "NPC_EXCHANGE",
      nextNpc: "MIKA",
      sceneRevisionProposal: { hasProposal: false, revisedText: "", changeSummary: "" },
    };
    const normalized = lib.normalizeConverseResponse(parsed, "HINA", "STREET_TRIAL_V1");
    expect(normalized.sceneStatus).toBe("AWAIT_PLAYER");
    expect(normalized.nextNpc).toBeNull();
    expect(normalized.sceneRevisionProposal).toEqual({ hasProposal: false, revisedText: "", changeSummary: "" });
  });

  it("suppresses theater-only scene revision metadata even if a street model response tries to provide it", () => {
    const parsed = {
      npcLine: "説明すれば伝わると思います。",
      understoodPlayerMeaning: "今日は口頭説明で対応する",
      candidateTurn: { action: "OTHER", boundaryMode: "NOT_RELEVANT", relationalEvents: [], needsClarification: false },
      candidateFactRevealIds: [],
      candidateCommitments: [],
      uncertainty: "LOW",
      thoughtSupportSignal: false,
      sceneStatus: "AWAIT_PLAYER",
      nextNpc: null,
      sceneRevisionProposal: { hasProposal: true, revisedText: "台本らしき文", changeSummary: "irrelevant" },
    };
    const normalized = lib.normalizeConverseResponse(parsed, "YOHEI", "STREET_TRIAL_V1");
    expect(normalized.npcLine).toContain("説明");
    expect(normalized.sceneRevisionProposal).toEqual({ hasProposal: false, revisedText: "", changeSummary: "" });
  });
});

describe("functions/newlife-refoundation-ai/lib.js — V45 ambiguous relationship case", () => {
  it("accepts Miyoko/Fumiko only inside the cafe-boundary case", () => {
    expect(lib.validateInput(validCafeConverseBody())).toBeNull();
    expect(lib.validateInput(validCafeConverseBody({ targetNpc: "FUMIKO" }))).toBeNull();
    expect(lib.validateInput(validCafeConverseBody({ targetNpc: "HINA" }))).toBe("invalid_target_npc");
    expect(lib.validateInput(validStreetConverseBody({ targetNpc: "MIYOKO" }))).toBe("invalid_target_npc");
  });

  it("keeps the prior statement and the two interpretations distinct in server-owned canon", () => {
    const canon = lib.getCaseCanon("CAFE_BOUNDARY_V1");
    expect(canon.observableArtifacts.priorExchange).toContain("何か手伝えることがあれば");
    expect(canon.interpretationAmbiguity).toContain("共有された明示的合意はない");
    expect(lib.getCaseNpcIds("CAFE_BOUNDARY_V1")).toEqual(["MIYOKO", "FUMIKO"]);
  });

  it("buildConversePrompt uses Miyoko's cafe canon without leaking theater or stock-count conflicts", () => {
    const prompt = lib.buildConversePrompt(validCafeConverseBody());
    expect(prompt).toContain("混雑時の待合は喫茶みよこへ");
    expect(prompt).toContain("美代子");
    expect(prompt).toContain("文子");
    expect(prompt).not.toContain("青いマフラー");
    expect(prompt).not.toContain("予約12点／店頭18点");
  });

  it("shared instruction forbids declaring one interpretation objectively correct and allows resolution without agreement about the past", () => {
    const instruction = lib.CONVERSE_SYSTEM_INSTRUCTION;
    expect(instruction).toMatch(/どちらか一方の解釈を客観的に正しい事実へ格上げしない/);
    expect(instruction).toMatch(/実際に何と言ったか／何が明示されなかったか/);
    expect(instruction).toMatch(/過去の意味について完全に同意させる必要はない/);
    expect(instruction).toMatch(/全部自分が悪かった/);
  });

  it("the cafe case has no theater revision field in the model schema", () => {
    const FakeType = { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY", BOOLEAN: "BOOLEAN" };
    const schema = lib.buildConverseResponseSchema(FakeType, "CAFE_BOUNDARY_V1");
    expect(schema.properties.sceneRevisionProposal).toBeUndefined();
    expect(schema.required).not.toContain("sceneRevisionProposal");
    expect(lib.caseUsesSceneRevision("CAFE_BOUNDARY_V1")).toBe(false);
  });

  it("NPC handoff cannot jump from the cafe case to Hina/Yohei", () => {
    const parsed = {
      npcLine: "今いる方をどうするかは、私が決めたいの。",
      understoodPlayerMeaning: "今日の対応を決めたい",
      candidateTurn: { action: "ASK_BOUNDARY", boundaryMode: "DISCOVER", relationalEvents: [], needsClarification: false },
      candidateFactRevealIds: [],
      candidateCommitments: [],
      uncertainty: "LOW",
      thoughtSupportSignal: false,
      sceneStatus: "NPC_EXCHANGE",
      nextNpc: "HINA",
    };
    const normalized = lib.normalizeConverseResponse(parsed, "MIYOKO", "CAFE_BOUNDARY_V1");
    expect(normalized.sceneStatus).toBe("AWAIT_PLAYER");
    expect(normalized.nextNpc).toBeNull();
    expect(normalized.sceneRevisionProposal).toEqual({ hasProposal: false, revisedText: "", changeSummary: "" });
  });
});

describe("functions/newlife-refoundation-ai/lib.js — validateInput (organize_thought, V37 §5)", () => {
  it("accepts a well-formed request", () => {
    expect(lib.validateInput(validOrganizeThoughtBody())).toBeNull();
  });

  it("rejects a non-string or oversized validatedWorldFacts", () => {
    expect(lib.validateInput(validOrganizeThoughtBody({ validatedWorldFacts: 5 }))).toBe("invalid_validated_world_facts");
    const tooLong = "a".repeat(lib.MAX_WORLD_FACTS_LENGTH + 1);
    expect(lib.validateInput(validOrganizeThoughtBody({ validatedWorldFacts: tooLong }))).toBe(
      "invalid_validated_world_facts",
    );
  });

  it("accepts an empty validatedWorldFacts (opaque, caller-optional free text)", () => {
    expect(lib.validateInput(validOrganizeThoughtBody({ validatedWorldFacts: "" }))).toBeNull();
  });

  it("rejects an invalid recentDialogue, same rules as converse_turn", () => {
    expect(lib.validateInput(validOrganizeThoughtBody({ recentDialogue: [{ speaker: "NARRATOR", text: "x" }] }))).toBe(
      "invalid_recent_dialogue",
    );
  });

  it("rejects a missing/blank currentProblem", () => {
    expect(lib.validateInput(validOrganizeThoughtBody({ currentProblem: "" }))).toBe(
      "missing_or_invalid_current_problem",
    );
  });
});

describe("functions/newlife-refoundation-ai/lib.js — CANONICAL WORLD MODEL stays server-side (V37 §1)", () => {
  it("SCENE_CANON and CHARACTER_DOSSIERS exist and are never accepted as client input fields", () => {
    expect(lib.SCENE_CANON.caseId).toBe("COMMUNITY_THEATER_V1");
    expect(lib.CHARACTER_DOSSIERS.MIKA).toBeDefined();
    expect(lib.CHARACTER_DOSSIERS.RYO).toBeDefined();
    // validateConverseTurnInput only ever reads caseId/targetNpc/rawPlayerUtterance/
    // recentDialogue/dynamicState from the client body -- canon is looked up
    // server-side from CHARACTER_DOSSIERS[targetNpc], never taken from the request.
    const body = validConverseBody({ characterDossier: { fabricated: true }, sceneCanon: { fabricated: true } });
    expect(lib.validateInput(body)).toBeNull();
    const prompt = lib.buildConversePrompt(body);
    expect(prompt).not.toContain("fabricated");
  });

  it("each character dossier declares forbiddenKnowledge, and buildConversePrompt embeds it", () => {
    expect(lib.CHARACTER_DOSSIERS.MIKA.forbiddenKnowledge.length).toBeGreaterThan(0);
    expect(lib.CHARACTER_DOSSIERS.RYO.forbiddenKnowledge.length).toBeGreaterThan(0);
    const prompt = lib.buildConversePrompt(validConverseBody());
    expect(prompt).toContain(JSON.stringify(lib.CHARACTER_DOSSIERS.MIKA.forbiddenKnowledge));
  });

  it("buildConversePrompt cites only the requested NPC's dossier, never inventing a third character", () => {
    const prompt = lib.buildConversePrompt(validConverseBody({ targetNpc: "MIKA" }));
    expect(prompt).toContain("美香");
    expect(prompt).not.toContain("JIN");
  });

  it("buildConversePrompt embeds the raw utterance and recent dialogue as untrusted/opaque data, never restructured", () => {
    const body = validConverseBody({ rawPlayerUtterance: "台本じゃなく演出で隠せない？" });
    const prompt = lib.buildConversePrompt(body);
    expect(prompt).toContain(JSON.stringify("台本じゃなく演出で隠せない？"));
    expect(prompt).toContain(JSON.stringify(body.recentDialogue));
  });

  it("this module's own source contains no per-utterance answer table for converse_turn (no lookup keyed on rawPlayerUtterance content)", () => {
    const fs = require("node:fs");
    const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", "lib.js"), "utf-8");
    expect(source).not.toMatch(/rawPlayerUtterance[^\n]*(===|includes|switch)/);
  });
});

describe("functions/newlife-refoundation-ai/lib.js — normalizeConverseResponse (V38)", () => {
  function validParsed(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      npc: "MIKA",
      npcLine: "昨日、最終版を読んで気づいたんです。",
      understoodPlayerMeaning: "なぜ今まで黙っていたのかを尋ねている。",
      candidateTurn: {
        action: "ASK_FACT",
        boundaryMode: "DISCOVER",
        relationalEvents: [],
        needsClarification: false,
      },
      candidateFactRevealIds: ["mika_read_final_script_yesterday"],
      candidateCommitments: [],
      uncertainty: "LOW",
      thoughtSupportSignal: false,
      ...overrides,
    };
  }

  it("overwrites a wrong echoed npc with the request's authoritative targetNpc, without discarding the line", () => {
    const parsed = validParsed({ npc: "RYO" });
    const result = lib.normalizeConverseResponse(parsed, "MIKA");
    expect(result).not.toBeNull();
    expect(result.npc).toBe("MIKA");
    expect(result.npcLine).toBe(parsed.npcLine);
  });

  it("preserves a valid candidateTurn/metadata unchanged when everything is well-formed", () => {
    const parsed = validParsed();
    const result = lib.normalizeConverseResponse(parsed, "MIKA");
    expect(result.candidateTurn).toEqual(parsed.candidateTurn);
    expect(result.candidateFactRevealIds).toEqual(parsed.candidateFactRevealIds);
    expect(result.uncertainty).toBe("LOW");
  });

  it("salvages a usable npcLine and collapses ALL effect metadata to CLARIFY/UNKNOWN/[]/HIGH when candidateTurn is malformed", () => {
    const parsed = validParsed({
      candidateTurn: { action: "NOT_A_REAL_ACTION", boundaryMode: "DISCOVER", relationalEvents: [], needsClarification: false },
      candidateFactRevealIds: ["should_be_dropped"],
      candidateCommitments: ["should_be_dropped"],
      thoughtSupportSignal: true,
    });
    const result = lib.normalizeConverseResponse(parsed, "MIKA");
    expect(result).not.toBeNull();
    expect(result.npcLine).toBe(parsed.npcLine);
    expect(result.candidateTurn).toEqual({
      action: "CLARIFY",
      boundaryMode: "UNKNOWN",
      relationalEvents: [],
      needsClarification: true,
    });
    expect(result.candidateFactRevealIds).toEqual([]);
    expect(result.candidateCommitments).toEqual([]);
    expect(result.uncertainty).toBe("HIGH");
    expect(result.thoughtSupportSignal).toBe(false);
  });

  it("also collapses metadata when candidateTurn's own CLARIFY invariant is inconsistent (e.g. needsClarification mismatched)", () => {
    const parsed = validParsed({
      candidateTurn: { action: "CLARIFY", boundaryMode: "UNKNOWN", relationalEvents: [], needsClarification: false },
    });
    const result = lib.normalizeConverseResponse(parsed, "MIKA");
    expect(result.candidateTurn.needsClarification).toBe(true);
  });

  it("returns null (missing/unusable npcLine is not accepted) when npcLine is absent, blank, or oversized", () => {
    expect(lib.normalizeConverseResponse(validParsed({ npcLine: undefined }), "MIKA")).toBeNull();
    expect(lib.normalizeConverseResponse(validParsed({ npcLine: "" }), "MIKA")).toBeNull();
    expect(lib.normalizeConverseResponse(validParsed({ npcLine: "   " }), "MIKA")).toBeNull();
    expect(lib.normalizeConverseResponse(validParsed({ npcLine: "あ".repeat(lib.MAX_NPC_LINE_LENGTH + 1) }), "MIKA")).toBeNull();
  });

  it("returns null for a non-object or null parsed payload", () => {
    expect(lib.normalizeConverseResponse(null, "MIKA")).toBeNull();
    expect(lib.normalizeConverseResponse("not an object", "MIKA")).toBeNull();
    expect(lib.normalizeConverseResponse(undefined, "MIKA")).toBeNull();
  });

  it("falls back to a placeholder understoodPlayerMeaning when that field is missing/oversized, without discarding the line", () => {
    const result = lib.normalizeConverseResponse(validParsed({ understoodPlayerMeaning: undefined }), "MIKA");
    expect(result).not.toBeNull();
    expect(typeof result.understoodPlayerMeaning).toBe("string");
    expect(result.understoodPlayerMeaning.length).toBeGreaterThan(0);
  });
});

describe("functions/newlife-refoundation-ai/lib.js — Mika character voice register constraints (V38)", () => {
  it("Mika's dossier declares an explicit pronoun/politeness/register model, not just a generic personality label", () => {
    const mika = lib.CHARACTER_DOSSIERS.MIKA;
    expect(mika.speechModel).toContain("私");
    expect(mika.speechModel).toMatch(/です|ます/);
    // The register model states her firmness must not slide into a rough/masculine
    // register (a constraint, not a description of how she normally sounds).
    expect(mika.speechModel).toMatch(/男性的な断定口調には寄せない/);
  });

  it("Mika's voiceAvoid explicitly rejects rough masculine-sounding declaratives and forced feminine-caricature endings", () => {
    const mika = lib.CHARACTER_DOSSIERS.MIKA;
    expect(mika.voiceAvoid.some((line: string) => /男性的/.test(line))).toBe(true);
    expect(mika.voiceAvoid.some((line: string) => /わ|かしら/.test(line))).toBe(true);
  });

  it("Mika's voiceAvoid and mustNot both forbid mirroring the player's rough register", () => {
    const mika = lib.CHARACTER_DOSSIERS.MIKA;
    expect(mika.voiceAvoid.some((line: string) => /ミラーリング/.test(line))).toBe(true);
    expect(mika.mustNot.some((line: string) => /masculine-coded|caricatured-feminine/.test(line))).toBe(true);
  });

  it("CONVERSE_SYSTEM_INSTRUCTION instructs the model to preserve each NPC's own idiolect rather than copy the player's tone", () => {
    expect(lib.CONVERSE_SYSTEM_INSTRUCTION).toMatch(/その口調をコピーせず/);
    expect(lib.CONVERSE_SYSTEM_INSTRUCTION).toMatch(/speechModel/);
  });

  it("Ryo's dossier is unchanged: practical/logistics-first register, no gendered-register rules added", () => {
    const ryo = lib.CHARACTER_DOSSIERS.RYO;
    expect(ryo.speechModel).toContain("実務的");
    expect(ryo.voiceAnchors).toBeUndefined();
    expect(ryo.voiceAvoid).toBeUndefined();
  });
});

describe("functions/newlife-refoundation-ai/lib.js — converse_turn / organize_thought schema construction", () => {
  const FakeType = { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY", BOOLEAN: "BOOLEAN" };

  it("the converse_turn schema's candidateTurn sub-schema reuses the same closed enums as interpret_turn", () => {
    const schema = lib.buildConverseResponseSchema(FakeType);
    const candidateTurn = schema.properties.candidateTurn;
    expect(candidateTurn.properties.action.enum).toEqual(lib.ACTION_TYPES);
    expect(candidateTurn.properties.boundaryMode.enum).toEqual(lib.BOUNDARY_MODES);
    expect(candidateTurn.properties.relationalEvents.items.enum).toEqual(lib.RELATIONAL_EVENTS);
    expect(schema.properties.uncertainty.enum).toEqual(lib.UNCERTAINTY_LEVELS);
    expect(schema.required).toContain("npcLine");
    expect(schema.required).toContain("candidateTurn");
    expect(schema.properties.sceneStatus.enum).toEqual(lib.SCENE_STATUSES);
    expect(schema.properties.nextNpc.enum).toEqual(lib.NPC_IDS);
    expect(schema.required).toContain("sceneStatus");
    expect(schema.required).toContain("nextNpc");
    expect(schema.properties.sceneRevisionProposal.required).toEqual(["hasProposal", "revisedText", "changeSummary"]);
    expect(schema.required).toContain("sceneRevisionProposal");
  });

  it("V44 omits theater-only revision metadata from the street response schema", () => {
    const streetSchema = lib.buildConverseResponseSchema(FakeType, "STREET_TRIAL_V1");
    expect(lib.caseUsesSceneRevision("COMMUNITY_THEATER_V1")).toBe(true);
    expect(lib.caseUsesSceneRevision("STREET_TRIAL_V1")).toBe(false);
    expect(streetSchema.properties.sceneRevisionProposal).toBeUndefined();
    expect(streetSchema.required).not.toContain("sceneRevisionProposal");
    expect(streetSchema.required).toContain("npcLine");
    expect(streetSchema.required).toContain("sceneStatus");
  });

  it("the organize_thought schema has no npc field at all (V37 §5 separation)", () => {
    const schema = lib.buildOrganizeThoughtResponseSchema(FakeType);
    expect(Object.keys(schema.properties)).not.toContain("npc");
    expect(Object.keys(schema.properties).sort()).toEqual(["known", "nextCheck", "options", "possible", "unknown"]);
  });

  it("both new system instructions forbid following player-embedded instructions", () => {
    expect(lib.CONVERSE_SYSTEM_INSTRUCTION).toMatch(/信頼できないデータ/);
    expect(lib.CONVERSE_SYSTEM_INSTRUCTION).toMatch(/品質シグナルとして一切使わないこと/);
    expect(lib.ORGANIZE_THOUGHT_SYSTEM_INSTRUCTION).toMatch(/信頼できないデータ/);
  });

  it("the thought-organizer instruction forbids speaking as a character and forbids diagnosis/moral scoring", () => {
    expect(lib.ORGANIZE_THOUGHT_SYSTEM_INSTRUCTION).toMatch(/登場人物\(NPC\)として話してはならず/);
    expect(lib.ORGANIZE_THOUGHT_SYSTEM_INSTRUCTION).toMatch(/道徳的評価・性格評価・点数化を一切行わないこと/);
    expect(lib.ORGANIZE_THOUGHT_SYSTEM_INSTRUCTION).toMatch(/カウンセリング・治療的な言葉づかいを一切使わないこと/);
  });

  it("buildOrganizeThoughtPrompt embeds validatedWorldFacts/recentDialogue/currentProblem as opaque data", () => {
    const body = validOrganizeThoughtBody();
    const prompt = lib.buildOrganizeThoughtPrompt(body);
    expect(prompt).toContain(JSON.stringify(body.validatedWorldFacts));
    expect(prompt).toContain(JSON.stringify(body.currentProblem));
  });
});

describe("functions/newlife-refoundation-ai/lib.js — applyCors", () => {
  it("echoes the origin and sets Vary when the origin is on the allowlist", () => {
    const { res, calls } = mockRes();
    lib.applyCors(mockReq({ origin: "https://fukuoka1980521-beep.github.io" }), res);
    expect(calls.headers["Access-Control-Allow-Origin"]).toBe("https://fukuoka1980521-beep.github.io");
    expect(calls.headers.Vary).toBe("Origin");
  });

  it("never echoes an origin outside the allowlist", () => {
    const { res, calls } = mockRes();
    lib.applyCors(mockReq({ origin: "https://evil.example.com" }), res);
    expect(calls.headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("only ever allows GET, POST, and OPTIONS (V40 adds GET for the no-model-call health path)", () => {
    const { res, calls } = mockRes();
    lib.applyCors(mockReq(), res);
    expect(calls.headers["Access-Control-Allow-Methods"]).toBe("GET, POST, OPTIONS");
  });
});

describe("functions/newlife-refoundation-ai/lib.js — V39 conversation progression / loop-prevention policy", () => {
  it("CONVERSE_SYSTEM_INSTRUCTION states the general progression policy: don't re-ask a materially-answered question, don't demand impossible certainty, move to one concrete next step", () => {
    const instruction = lib.CONVERSE_SYSTEM_INSTRUCTION;
    expect(instruction).toMatch(/既に実質的な回答がある場合/);
    expect(instruction).toMatch(/同じ形でもう一度尋ね直さないこと/);
    expect(instruction).toMatch(/不可能な保証/);
    expect(instruction).toMatch(/次に必要な具体的な一手.*1つだけ示し/);
    expect(instruction).toMatch(/新たに確認すべき具体的な問いを最大1つだけ尋ね/);
  });

  it("CONVERSE_SYSTEM_INSTRUCTION instructs the NPC to state its own minimum requirement from resolutionPolicy/boundary instead of bouncing the question back", () => {
    expect(lib.CONVERSE_SYSTEM_INSTRUCTION).toMatch(/resolutionPolicy\.minimumRequirementIfAsked/);
    expect(lib.CONVERSE_SYSTEM_INSTRUCTION).toMatch(/質問をそのままプレイヤーに投げ返すのではなく/);
  });

  it("this progression policy is general (present once in the shared instruction), not a per-utterance/per-phrase rule -- no Owner transcript literal appears anywhere in lib.js", () => {
    const fs = require("node:fs");
    const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", "lib.js"), "utf-8");
    const ownerTranscriptLiterals = [
      "それほどしつこく言うなら",
      "具体的にどういう内容",
      "なんで今まで言わなかったの",
    ];
    for (const literal of ownerTranscriptLiterals) {
      expect(source).not.toContain(literal);
    }
    // Still no per-utterance answer table keyed on the raw player text (V37 §7 invariant, unchanged by V39).
    expect(source).not.toMatch(/rawPlayerUtterance[^\n]*(===|includes|switch)/);
  });

  it("Mika's dossier declares resolutionPolicy distinguishing practical non-identifiability + review/approval from an impossible absolute guarantee", () => {
    const policy = lib.CHARACTER_DOSSIERS.MIKA.resolutionPolicy;
    expect(policy).toBeDefined();
    expect(policy.practicalAcceptanceCriteria).toMatch(/絶対に誰にも分からない/);
    expect(policy.practicalAcceptanceCriteria).toMatch(/実務的に見て自分だと特定されない程度/);
    expect(policy.practicalAcceptanceCriteria).toMatch(/確認できること/);
    expect(typeof policy.minimumRequirementIfAsked).toBe("string");
    expect(policy.minimumRequirementIfAsked.length).toBeGreaterThan(0);
  });

  it("buildConversePrompt embeds Mika's resolutionPolicy as part of her dossier (server-owned canon, not client-supplied)", () => {
    const prompt = lib.buildConversePrompt(validConverseBody({ targetNpc: "MIKA" }));
    expect(prompt).toContain(JSON.stringify(lib.CHARACTER_DOSSIERS.MIKA.resolutionPolicy));
  });

  it("V41 NPC handoff policy is general, bounded, and does not fabricate a new player utterance", () => {
    const instruction = lib.CONVERSE_SYSTEM_INSTRUCTION;
    expect(instruction).toMatch(/NPC_EXCHANGE/);
    expect(instruction).toMatch(/プレイヤーの追加権限なしに/);
    expect(instruction).toMatch(/sceneStatus/);
    const prompt = lib.buildNpcExchangePrompt(validNpcExchangeBody());
    expect(prompt).toContain("今はプレイヤーから新しい発言はありません");
    expect(prompt).toContain("continuationDepth");
    expect(prompt).not.toContain("rawPlayerUtterance");
  });
  it("V42 gives the disputed scene a concrete script artifact and Mika concrete private identifying anchors", () => {
    expect(lib.SCENE_CANON.disputedSceneExcerpt).toContain("ここを出たら、もう戻るな");
    expect(lib.SCENE_CANON.disputedSceneExcerpt).toContain("青いマフラー");
    expect(JSON.stringify(lib.CHARACTER_DOSSIERS.MIKA.knowledge)).toContain("駅前の古い喫茶店");
    expect(JSON.stringify(lib.CHARACTER_DOSSIERS.MIKA.knowledge)).toContain("青いマフラー");
  });

  it("V42 system policy distinguishes an actual draft from a player claim and lets Mika critique concrete remaining anchors", () => {
    const instruction = lib.CONVERSE_SYSTEM_INSTRUCTION;
    expect(instruction).toMatch(/dynamicState\.sceneRevisionText/);
    expect(instruction).toMatch(/まだ見せてもらっていない/);
    expect(instruction).toMatch(/sceneRevisionProposal\.hasProposal=true/);
    expect(instruction).toMatch(/どの具体的な言い回し・設定・行動が残っているのか/);
  });

  it("normalizes valid scene revision proposals and suppresses malformed/empty ones", () => {
    expect(lib.normalizeSceneRevisionProposal({ hasProposal: true, revisedText: "会社を辞める場面。", changeSummary: "舞台を会社に変更" })).toEqual({
      hasProposal: true, revisedText: "会社を辞める場面。", changeSummary: "舞台を会社に変更"
    });
    expect(lib.normalizeSceneRevisionProposal({ hasProposal: true, revisedText: "", changeSummary: "x" })).toEqual({
      hasProposal: false, revisedText: "", changeSummary: ""
    });
  });
  it("Ryo gets the same general progression rule (present once in the shared instruction) plus his own logistics-based minimum requirement, but no Mika-specific privacy/identifiability criteria", () => {
    const ryo = lib.CHARACTER_DOSSIERS.RYO;
    expect(ryo.resolutionPolicy).toBeDefined();
    expect(typeof ryo.resolutionPolicy.minimumRequirementIfAsked).toBe("string");
    // Ryo's own resolutionPolicy is logistics/feasibility, never privacy/identifiability language.
    expect(ryo.resolutionPolicy.practicalAcceptanceCriteria).toBeUndefined();
    expect(JSON.stringify(ryo.resolutionPolicy)).not.toMatch(/自分だと特定|自分だと分かる|実話/);
    // The shared progression policy in CONVERSE_SYSTEM_INSTRUCTION is a single
    // NPC-agnostic block (not duplicated/branched per character).
    expect(lib.CONVERSE_SYSTEM_INSTRUCTION.match(/新たに確認すべき具体的な問いを最大1つだけ尋ね/g)?.length).toBe(1);
  });
});

describe("functions/newlife-refoundation-ai/lib.js — schema/prompt construction never invents ontology", () => {
  it("the interpret_turn schema's enums exactly match the closed ACTION_TYPES/BOUNDARY_MODES/RELATIONAL_EVENTS lists", () => {
    const FakeType = { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY", BOOLEAN: "BOOLEAN" };
    const schema = lib.buildInterpretResponseSchema(FakeType);
    expect(schema.properties.action.enum).toEqual(lib.ACTION_TYPES);
    expect(schema.properties.boundaryMode.enum).toEqual(lib.BOUNDARY_MODES);
    expect(schema.properties.relationalEvents.items.enum).toEqual(lib.RELATIONAL_EVENTS);
    expect(schema.required).toEqual(["action", "boundaryMode", "relationalEvents", "needsClarification"]);
  });

  it("the interpret_turn prompt embeds the utterance and caseContext as untrusted/opaque data, never restructured", () => {
    const prompt = lib.buildInterpretPrompt("ミカ、なんでだめなの？", "対象: MIKA. public.");
    expect(prompt).toContain(JSON.stringify("ミカ、なんでだめなの？"));
    expect(prompt).toContain(JSON.stringify("対象: MIKA. public."));
  });

  it("the generate_npc_line schema is restricted to { npc, text } for MIKA/RYO only", () => {
    const FakeType = { OBJECT: "OBJECT", STRING: "STRING" };
    const schema = lib.buildNpcResponseSchema(FakeType);
    expect(schema.properties.npc.enum).toEqual(lib.NPC_IDS);
    expect(Object.keys(schema.properties).sort()).toEqual(["npc", "text"]);
    expect(schema.required).toEqual(["npc", "text"]);
  });

  it("the generate_npc_line prompt cites only the supplied projection, never inventing a third NPC or extra biography", () => {
    const prompt = lib.buildNpcPrompt(validProjection());
    expect(prompt).toContain("MIKA");
    expect(prompt).not.toContain("JIN");
    expect(prompt).toContain(JSON.stringify(validProjection().sceneContext));
  });

  it("both system instructions forbid following player-embedded instructions and forbid leaking internal labels", () => {
    expect(lib.INTERPRET_SYSTEM_INSTRUCTION).toMatch(/信頼できないデータ/);
    expect(lib.INTERPRET_SYSTEM_INSTRUCTION).toMatch(/品質シグナルとして一切使わないこと/);
    expect(lib.NPC_SYSTEM_INSTRUCTION).toMatch(/創作しないこと/);
    expect(lib.NPC_SYSTEM_INSTRUCTION).toMatch(/オントロジー用語やラベルを、そのままセリフの中に出力しないこと/);
    expect(lib.NPC_SYSTEM_INSTRUCTION).toMatch(/WITHDRAWN/);
  });
});

describe("functions/newlife-refoundation-ai/lib.js — buildHealthResponse (V45)", () => {
  it("returns the exact safe shape with buildSha defaulted to \"unknown\" when no build SHA is supplied", () => {
    expect(lib.buildHealthResponse(undefined)).toEqual({
      service: "newlife-refoundation-ai",
      buildSha: "unknown",
      contractVersion: "V45",
      operations: ["converse_turn", "continue_npc_exchange", "organize_thought"],
    });
    // No-arg call (matches how index.js calls it when the env var is unset).
    expect(lib.buildHealthResponse()).toEqual({
      service: "newlife-refoundation-ai",
      buildSha: "unknown",
      contractVersion: "V45",
      operations: ["converse_turn", "continue_npc_exchange", "organize_thought"],
    });
  });

  it("echoes a supplied build SHA verbatim instead of defaulting", () => {
    expect(lib.buildHealthResponse("abc1234")).toEqual({
      service: "newlife-refoundation-ai",
      buildSha: "abc1234",
      contractVersion: "V45",
      operations: ["converse_turn", "continue_npc_exchange", "organize_thought"],
    });
  });

  it("never includes project/location/model identity, credentials, or any player-data field", () => {
    const response = lib.buildHealthResponse("abc1234") as Record<string, unknown>;
    expect(Object.keys(response).sort()).toEqual(["buildSha", "contractVersion", "operations", "service"]);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toMatch(/project|location|apiKey|token|credential/i);
  });

  it("is a pure function of its single argument -- takes no client/model dependency and cannot itself call Vertex AI", () => {
    expect(lib.buildHealthResponse.length).toBe(1);
  });
});

describe("functions/newlife-refoundation-ai/lib.js — no secret material", () => {
  it("never hardcodes an API key or bearer token anywhere in this function's own source", () => {
    const fs = require("node:fs");
    for (const file of ["index.js", "lib.js"]) {
      const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", file), "utf-8");
      expect(source).not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']/i);
      expect(source).not.toMatch(/Bearer\s+[A-Za-z0-9]/);
    }
  });
});

describe("functions/newlife-refoundation-ai/index.js — prior real Vertex AI lessons reused", () => {
  it("uses the proven 2048 output-token budget and one empty-response retry pattern", () => {
    const fs = require("node:fs");
    const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", "index.js"), "utf-8");
    expect(source).toContain("maxOutputTokens: 2048");
    expect(source).toContain("const generateOnce = () =>");
    expect(source).toMatch(/if \(!text\)[\s\S]*response = await generateOnce\(\)/);
  });

  it("never logs the request body or player free text on error", () => {
    const fs = require("node:fs");
    const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", "index.js"), "utf-8");
    expect(source).not.toMatch(/console\.(log|error)\([^)]*req\.body/);
  });
});

describe("functions/newlife-refoundation-ai/index.js — health/version path (V40)", () => {
  const fs = require("node:fs");
  const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", "index.js"), "utf-8");

  it("imports buildHealthResponse from lib.js", () => {
    expect(source).toMatch(/buildHealthResponse/);
    expect(source).toMatch(/require\(["']\.\/lib["']\)/);
  });

  it("handles GET by returning buildHealthResponse(...) and returning immediately, before the POST-only 405 branch", () => {
    expect(source).toMatch(
      /req\.method === "GET"\)[\s\S]{0,120}res\.status\(200\)\.json\(buildHealthResponse\(process\.env\.NEWLIFE_REFOUNDATION_BUILD_SHA\)\)[\s\S]{0,40}return;/
    );
    // The GET branch must appear before the generic "not POST -> 405" check,
    // so GET is handled on its own rather than falling into method_not_allowed.
    const getBranchIndex = source.indexOf('req.method === "GET"');
    const postOnlyCheckIndex = source.indexOf('req.method !== "POST"');
    expect(getBranchIndex).toBeGreaterThan(-1);
    expect(postOnlyCheckIndex).toBeGreaterThan(-1);
    expect(getBranchIndex).toBeLessThan(postOnlyCheckIndex);
  });

  it("does not call the model, the rate limiter, or read req.body anywhere in the GET branch", () => {
    const getBranchStart = source.indexOf('req.method === "GET"');
    const postOnlyCheckIndex = source.indexOf('req.method !== "POST"');
    const getBranch = source.slice(getBranchStart, postOnlyCheckIndex);
    expect(getBranch).not.toMatch(/callModel|getClient|modelCallLimiter|req\.body|validateInput/);
  });

  it("does not change the existing OPTIONS preflight or POST-only 405 responses", () => {
    expect(source).toContain('res.status(204).send("");');
    expect(source).toContain('res.status(405).json({ error: "method_not_allowed" });');
  });
});

describe("functions/newlife-refoundation-ai/index.js — converse_turn envelope (V38)", () => {
  const fs = require("node:fs");
  const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", "index.js"), "utf-8");

  it("imports and calls normalizeConverseResponse instead of returning the raw parsed model output directly", () => {
    expect(source).toMatch(/normalizeConverseResponse/);
    expect(source).toContain("normalizeConverseResponse(parsed, body.targetNpc, body.caseId)");
    expect(source).toContain("buildConverseResponseSchema(Type, body.caseId)");
  });

  it("retries converse_turn exactly once when no usable line comes back, before failing closed", () => {
    expect(source).toMatch(/attemptConverseTurn\(client, req\.body\)[\s\S]*if \(!normalized\)[\s\S]*attemptConverseTurn\(client, req\.body\)/);
    expect(source).toMatch(/if \(!normalized\)[\s\S]*res\.status\(502\)/);
  });

  it("does not add any per-utterance answer table for converse_turn (no lookup keyed on rawPlayerUtterance/targetNpc content)", () => {
    expect(source).not.toMatch(/rawPlayerUtterance[^\n]*(===|includes|switch)/);
    expect(source).not.toMatch(/targetNpc\s*===\s*"MIKA"[\s\S]{0,80}targetNpc\s*===\s*"RYO"/);
  });

  it("does not change the shared interpret_turn/generate_npc_line/organize_thought response path (still falls through to the shared parse-and-respond block)", () => {
    expect(source).toContain('res.status(502).json({ error: "empty_model_response" });');
    expect(source).toContain('res.status(502).json({ error: "malformed_model_response" });');
    expect(source).toContain("res.status(200).json(parsed);");
  });
});

describe("functions/newlife-refoundation-ai/index.js — NPC-to-NPC continuation route (V41)", () => {
  const fs = require("node:fs");
  const source = fs.readFileSync(join(__dirname, "..", "functions", "newlife-refoundation-ai", "index.js"), "utf-8");

  it("routes continue_npc_exchange through a dedicated prompt without pretending the player spoke again", () => {
    expect(source).toContain('req.body.operation === "continue_npc_exchange"');
    expect(source).toContain("attemptNpcExchangeTurn");
    expect(source).toContain("buildNpcExchangePrompt(body)");
    expect(source).not.toMatch(/continue_npc_exchange[\s\S]{0,600}rawPlayerUtterance/);
  });
});
describe("functions/newlife-refoundation-ai/lib.js — fixed-window limiter", () => {
  it("allows only the configured number of model calls inside one window and resets after expiry", () => {
    let now = 1_000;
    const limiter = lib.createFixedWindowLimiter(2, 60_000, () => now);
    expect(limiter.consume()).toBe(true);
    expect(limiter.consume()).toBe(true);
    expect(limiter.consume()).toBe(false);
    now += 60_000;
    expect(limiter.consume()).toBe(true);
  });
});
