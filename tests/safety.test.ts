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
// docs/research/evaluation/phase-12-0/LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md. Every OTHER file in
// src/ must remain exactly as network-free as before -- this list is not opened further without
// the same explicit documentation.
const DIALOGUE_CLIENT_FILE = join(SRC_DIR, "lib", "aiDialogueClient.ts");
const BGW_LIVE_ADAPTER_CLIENT_FILE = join(SRC_DIR, "research", "bounded-generative-world", "liveAdapterClient.ts");
// NEW_LIFE_CORE_REDESIGN_V1: a THIRD documented, intentional network call, same pattern as the
// other two -- newlifecore/dialogue/liveAdapterClient.ts calls only a same-origin, dev-server-only
// local endpoint (`/api/newlifecore-npc-dialogue`), never a third-party host directly, never a
// credential (guarded separately below, unchanged).
const NEWLIFECORE_LIVE_ADAPTER_CLIENT_FILE = join(SRC_DIR, "newlifecore", "dialogue", "liveAdapterClient.ts");
const DOCUMENTED_NETWORK_FILES = [DIALOGUE_CLIENT_FILE, BGW_LIVE_ADAPTER_CLIENT_FILE, NEWLIFECORE_LIVE_ADAPTER_CLIENT_FILE];
const nonDialogueFiles = sourceFiles.filter((f) => !DOCUMENTED_NETWORK_FILES.includes(f));
const nonDialogueSource = nonDialogueFiles.map((f) => readFileSync(f, "utf-8")).join("\n");
const dialogueClientSource = readFileSync(DIALOGUE_CLIENT_FILE, "utf-8");
const bgwLiveAdapterClientSource = readFileSync(BGW_LIVE_ADAPTER_CLIENT_FILE, "utf-8");
const newlifecoreLiveAdapterClientSource = readFileSync(NEWLIFECORE_LIVE_ADAPTER_CLIENT_FILE, "utf-8");

describe("safety: no external network usage outside the documented dialogue clients", () => {
  it("never calls fetch, XMLHttpRequest, or WebSocket anywhere in src/ except the 2 documented network client files", () => {
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

  it("PersonalizedAiDialogueGate never attempts the network call while no endpoint URL is configured", () => {
    const gateSource = readFileSync(join(SRC_DIR, "components", "PersonalizedAiDialogueGate.tsx"), "utf-8");
    expect(gateSource).toMatch(/if\s*\(\s*!DIALOGUE_ENDPOINT_URL\s*\)/);
  });

  it("never references a generative-AI API package or client in the frontend bundle (the Cloud Function in functions/dialogue/ is a separate, non-bundled deployment artifact)", () => {
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
