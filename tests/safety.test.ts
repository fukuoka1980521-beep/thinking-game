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

// REAL_AI_DIALOGUE Run (Section 12/26): exactly one intentional, disclosed
// network call exists now -- the dialogue Cloud Function proxy. Every other
// file in src/ must remain exactly as network-free as before.
const DIALOGUE_CLIENT_FILE = join(SRC_DIR, "lib", "aiDialogueClient.ts");
const nonDialogueFiles = sourceFiles.filter((f) => f !== DIALOGUE_CLIENT_FILE);
const nonDialogueSource = nonDialogueFiles.map((f) => readFileSync(f, "utf-8")).join("\n");
const dialogueClientSource = readFileSync(DIALOGUE_CLIENT_FILE, "utf-8");

describe("safety: no external network usage outside the one documented dialogue client", () => {
  it("never calls fetch, XMLHttpRequest, or WebSocket anywhere in src/ except aiDialogueClient.ts", () => {
    expect(nonDialogueSource).not.toMatch(/\bfetch\s*\(/);
    expect(nonDialogueSource).not.toMatch(/XMLHttpRequest/);
    expect(allSource).not.toMatch(/new WebSocket/);
  });

  it("aiDialogueClient.ts makes exactly one fetch call", () => {
    const fetchCalls = dialogueClientSource.match(/\bfetch\s*\(/g) ?? [];
    expect(fetchCalls).toHaveLength(1);
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
