import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(__dirname, "..", "src");

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const sourceFiles = collectSourceFiles(SRC_DIR);
const allSource = sourceFiles.map((f) => readFileSync(f, "utf-8")).join("\n");

// REAL_AI_DIALOGUE Run (Section 12/26) + PHASE_30_SERVERLESS_SEMANTIC_RUNTIME
// (NEW LIFE) + refoundation live-provider integration: exactly three
// intentional, disclosed network call *sites* exist now -- the CASE1
// dialogue Cloud Function proxy, the legacy NEW LIFE semantic-interpreter
// Cloud Function proxy (functions/newlife-dialogue/), and the isolated
// refoundation live-provider proxy (functions/newlife-refoundation-ai/,
// still undeployed -- see src/newlife/refoundation/config.ts's empty
// endpoint constant). Every other file in src/ must remain exactly as
// network-free as before. httpAdapters.ts is one file implementing *four*
// adapter classes (HttpSemanticInterpreterAdapter/HttpNpcGenerationAdapter/
// HttpConversationAdapter/HttpThoughtOrganizerAdapter, the latter two added
// for V37's converse_turn/organize_thought operations) that share one
// `postJson` helper, so it makes exactly one `fetch(` call site even though
// it backs four adapters -- matching the "one fetch call per disclosed
// file" shape the other two files already established.
const DIALOGUE_CLIENT_FILE = join(SRC_DIR, "lib", "aiDialogueClient.ts");
const NEWLIFE_HTTP_INTERPRETER_FILE = join(SRC_DIR, "newlife", "semantic", "httpInterpreter.ts");
const REFOUNDATION_HTTP_ADAPTERS_FILE = join(SRC_DIR, "newlife", "refoundation", "httpAdapters.ts");
const DISCLOSED_NETWORK_FILES = new Set([
  DIALOGUE_CLIENT_FILE,
  NEWLIFE_HTTP_INTERPRETER_FILE,
  REFOUNDATION_HTTP_ADAPTERS_FILE,
]);
const nonDialogueFiles = sourceFiles.filter((f) => !DISCLOSED_NETWORK_FILES.has(f));
const nonDialogueSource = nonDialogueFiles.map((f) => readFileSync(f, "utf-8")).join("\n");
const dialogueClientSource = readFileSync(DIALOGUE_CLIENT_FILE, "utf-8");
const newlifeHttpInterpreterSource = readFileSync(NEWLIFE_HTTP_INTERPRETER_FILE, "utf-8");
const refoundationHttpAdaptersSource = readFileSync(REFOUNDATION_HTTP_ADAPTERS_FILE, "utf-8");

describe("safety: no external network usage outside the three documented dialogue clients", () => {
  it("never calls fetch, XMLHttpRequest, or WebSocket anywhere in src/ except the three disclosed clients", () => {
    expect(nonDialogueSource).not.toMatch(/\bfetch\s*\(/);
    expect(nonDialogueSource).not.toMatch(/XMLHttpRequest/);
    expect(allSource).not.toMatch(/new WebSocket/);
  });

  it("aiDialogueClient.ts makes exactly one fetch call", () => {
    const fetchCalls = dialogueClientSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
  });

  it("httpInterpreter.ts (NEW LIFE) makes exactly one fetch call", () => {
    const fetchCalls = newlifeHttpInterpreterSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
  });

  it("httpAdapters.ts (refoundation) makes exactly one fetch call, shared by all four adapter classes", () => {
    const fetchCalls = refoundationHttpAdaptersSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
  });

  it("HttpSemanticInterpreterAdapter/HttpNpcGenerationAdapter never attempt the network call while no endpoint URL is configured", () => {
    expect(refoundationHttpAdaptersSource).toMatch(/if\s*\(\s*!endpointUrl\s*\)/);
  });

  it("PersonalizedAiDialogueGate never attempts the network call while no endpoint URL is configured", () => {
    const gateSource = readFileSync(join(SRC_DIR, "components", "PersonalizedAiDialogueGate.tsx"), "utf-8");
    expect(gateSource).toMatch(/if\s*\(\s*!DIALOGUE_ENDPOINT_URL\s*\)/);
  });

  it("HttpSemanticInterpreter never attempts the network call while no endpoint URL is configured", () => {
    expect(newlifeHttpInterpreterSource).toMatch(/if\s*\(\s*!this\.endpointUrl\s*\)/);
  });

  it("never references a generative-AI API package or client in the frontend bundle (the Cloud Functions in functions/dialogue/ and functions/newlife-dialogue/ are separate, non-bundled deployment artifacts)", () => {
    for (const term of ["openai", "anthropic", "generativeai", "@google/genai"]) {
      expect(allSource.toLowerCase()).not.toContain(term);
    }
  });

  it("never hardcodes an API key or bearer token", () => {
    expect(allSource).not.toMatch(/api[_-]?key/i);
    expect(allSource).not.toMatch(/Bearer\s+[A-Za-z0-9]/);
  });
});

describe("safety: no trust-score / dependency-building framing", () => {
  it("never implements AI trust/affinity score fields", () => {
    for (const term of ["trustScore", "affinityScore", "aiIntimacy", "AI信頼度", "AI好感度", "AI親密度"]) {
      expect(allSource).not.toContain(term);
    }
  });
});
