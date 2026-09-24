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
