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

  it("only ever allows POST and OPTIONS", () => {
    const { res, calls } = mockRes();
    lib.applyCors(mockReq(), res);
    expect(calls.headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
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
    expect(schema.properties.npc.enum).toEqual(["MIKA", "RYO"]);
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
