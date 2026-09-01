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

describe("safety: no external network usage", () => {
  it("never calls fetch, XMLHttpRequest, or WebSocket anywhere in src/", () => {
    expect(allSource).not.toMatch(/\bfetch\s*\(/);
    expect(allSource).not.toMatch(/XMLHttpRequest/);
    expect(allSource).not.toMatch(/new WebSocket/);
  });

  it("never references a generative-AI API package or client", () => {
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
