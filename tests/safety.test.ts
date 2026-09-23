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

// REAL_AI_DIALOGUE Run (Section 12/26): exactly one intentional, disclosed network call existed --
// the dialogue Cloud Function proxy. PHASE 12.1 (Bounded Generative World vertical slice) adds a
// SECOND documented, intentional network call, same pattern: `liveAdapterClient.ts` calls only a
// same-origin, dev-server-only local endpoint (`/api/bgw-npc-dialogue`) -- never a third-party
// host directly, never a credential (guarded separately below, unchanged). See
// docs/research/evaluation/phase-12-0/LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md. NEW_LIFE_CORE_REDESIGN_V1
// adds a THIRD, same pattern, at newlifecore/dialogue/liveAdapterClient.ts. PHASE_30_SERVERLESS_SEMANTIC_RUNTIME
// (NEW LIFE) adds a FOURTH: the NEW LIFE semantic-interpreter Cloud Function proxy
// (functions/newlife-dialogue/, docs/DATA_BOUNDARY.md's purpose-specific exception). Every OTHER
// file in src/ must remain exactly as network-free as before -- this list is not opened further
// without the same explicit documentation.
const DIALOGUE_CLIENT_FILE = join(SRC_DIR, "lib", "aiDialogueClient.ts");
const BGW_LIVE_ADAPTER_CLIENT_FILE = join(SRC_DIR, "research", "bounded-generative-world", "liveAdapterClient.ts");
const NEWLIFECORE_LIVE_ADAPTER_CLIENT_FILE = join(SRC_DIR, "newlifecore", "dialogue", "liveAdapterClient.ts");
const NEWLIFE_HTTP_INTERPRETER_FILE = join(SRC_DIR, "newlife", "semantic", "httpInterpreter.ts");
const DOCUMENTED_NETWORK_FILES = [
  DIALOGUE_CLIENT_FILE,
  BGW_LIVE_ADAPTER_CLIENT_FILE,
  NEWLIFECORE_LIVE_ADAPTER_CLIENT_FILE,
  NEWLIFE_HTTP_INTERPRETER_FILE,
];
const nonDialogueFiles = sourceFiles.filter((f) => !DOCUMENTED_NETWORK_FILES.includes(f));
const nonDialogueSource = nonDialogueFiles.map((f) => readFileSync(f, "utf-8")).join("\n");
const dialogueClientSource = readFileSync(DIALOGUE_CLIENT_FILE, "utf-8");
const bgwLiveAdapterClientSource = readFileSync(BGW_LIVE_ADAPTER_CLIENT_FILE, "utf-8");
const newlifecoreLiveAdapterClientSource = readFileSync(NEWLIFECORE_LIVE_ADAPTER_CLIENT_FILE, "utf-8");
const newlifeHttpInterpreterSource = readFileSync(NEWLIFE_HTTP_INTERPRETER_FILE, "utf-8");

describe("safety: no external network usage outside the documented dialogue clients", () => {
  it("never calls fetch, XMLHttpRequest, or WebSocket anywhere in src/ except the 4 documented network client files", () => {
    expect(nonDialogueSource).not.toMatch(/\bfetch\s*\(/);
    expect(nonDialogueSource).not.toMatch(/XMLHttpRequest/);
    expect(allSource).not.toMatch(/new WebSocket/);
  });

  it("aiDialogueClient.ts makes exactly one fetch call", () => {
    const fetchCalls = dialogueClientSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
  });

  it("liveAdapterClient.ts (PHASE 12.1) makes exactly one fetch call, to a same-origin relative path only (never a third-party host)", () => {
    const fetchCalls = bgwLiveAdapterClientSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
    expect(bgwLiveAdapterClientSource).toMatch(/fetch\("\/api\/bgw-npc-dialogue"/);
    expect(bgwLiveAdapterClientSource).not.toMatch(/https?:\/\//);
  });

  it("newlifecore/dialogue/liveAdapterClient.ts (NEW_LIFE_CORE_REDESIGN_V1) makes exactly one fetch call, to a same-origin relative path only (never a third-party host)", () => {
    const fetchCalls = newlifecoreLiveAdapterClientSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
    expect(newlifecoreLiveAdapterClientSource).toMatch(/fetch\("\/api\/newlifecore-npc-dialogue"/);
    expect(newlifecoreLiveAdapterClientSource).not.toMatch(/https?:\/\//);
  });

  it("httpInterpreter.ts (NEW LIFE) makes exactly one fetch call", () => {
    const fetchCalls = newlifeHttpInterpreterSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
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

  it("src/ never imports devtools/ (PHASE 12.1's Vertex credential/endpoint logic is server-only, never bundled into the client)", () => {
    expect(allSource).not.toMatch(/devtools\//);
    expect(allSource).not.toMatch(/aiplatform\.googleapis\.com/);
    expect(allSource).not.toMatch(/gcloud auth/);
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
