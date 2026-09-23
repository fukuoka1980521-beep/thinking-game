/**
 * Real execution of `scripts/newlife-deploy/lib.mjs`'s pure logic (imported
 * directly, not re-implemented here) via vitest/`npm test` — the same
 * "exercise the actual module, don't just assert on text" approach
 * `tests/newlifeDialogueFunction.test.ts` uses for `functions/newlife-dialogue/lib.js`.
 * The CLI wrapper scripts (`wire-endpoint.mjs`, `smoke-test.mjs`,
 * `live-eval.mjs`) could not be invoked directly as `node <script>` in this
 * Run (same class of tool-permission gap disclosed in the Phase 27/28B
 * reports for `npm`/`npx`/`node --check`) — this file instead pins every
 * piece of logic factored into `lib.mjs` so a future Run with that
 * permission can run the CLIs with confidence the underlying logic is
 * already covered.
 */
import { describe, expect, it } from "vitest";
import {
  CONFIG_FILE_RELATIVE_PATH,
  extractCurrentEndpointUrl,
  buildUpdatedConfigContent,
  diffLines,
  NPC_IDS,
  ALLOWED_ORIGINS,
  NEGATIVE_CONSTRAINTS,
  buildSyntheticSnapshot,
  SMOKE_TEST_CASES,
  LIVE_EVAL_FIXED_SET,
} from "../scripts/newlife-deploy/lib.mjs";
import { readFileSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..");

describe("scripts/newlife-deploy/lib.mjs against the real config.ts", () => {
  // NOTE: these 3 tests deliberately do NOT hardcode "the real file's current endpoint is empty".
  // A successful Phase 33 run (wire-endpoint.mjs --apply --commit) legitimately, permanently
  // changes that value from "" to a real deployed HTTPS URL -- these tests read whatever is
  // currently shipped and assert lib.mjs's logic is correct *relative to that*, so they keep
  // passing before AND after the first real deploy, instead of pinning a one-time-only snapshot.
  it("extracts the currently-shipped endpoint from the real file (empty pre-deploy, a real HTTPS URL after)", () => {
    const content = readFileSync(path.join(REPO_ROOT, CONFIG_FILE_RELATIVE_PATH), "utf8");
    const currentUrl = extractCurrentEndpointUrl(content);
    expect(currentUrl === "" || /^https:\/\//.test(currentUrl)).toBe(true);
  });

  it("builds an updated file that only changes the constant line, and the diff shows exactly that", () => {
    const content = readFileSync(path.join(REPO_ROOT, CONFIG_FILE_RELATIVE_PATH), "utf8");
    const currentUrl = extractCurrentEndpointUrl(content);
    const updated = buildUpdatedConfigContent(content, "https://example.com/newlife-dialogue");
    expect(updated).toContain('export const NEWLIFE_DIALOGUE_ENDPOINT_URL = "https://example.com/newlife-dialogue";');
    expect(extractCurrentEndpointUrl(updated)).toBe("https://example.com/newlife-dialogue");

    const diff = diffLines(content, updated);
    expect(diff).toEqual([
      `- export const NEWLIFE_DIALOGUE_ENDPOINT_URL = "${currentUrl}";`,
      '+ export const NEWLIFE_DIALOGUE_ENDPOINT_URL = "https://example.com/newlife-dialogue";',
    ]);
  });

  it("round-trips back to the original shipped value (rollback case)", () => {
    const content = readFileSync(path.join(REPO_ROOT, CONFIG_FILE_RELATIVE_PATH), "utf8");
    const currentUrl = extractCurrentEndpointUrl(content);
    const wired = buildUpdatedConfigContent(content, "https://example.com/newlife-dialogue");
    const rolledBack = buildUpdatedConfigContent(wired, currentUrl);
    expect(rolledBack).toBe(content);
  });

  it("throws instead of silently no-op-ing if the constant declaration is missing", () => {
    expect(() => extractCurrentEndpointUrl("no such constant here")).toThrow();
    expect(() => buildUpdatedConfigContent("no such constant here", "https://x")).toThrow();
  });

  it("produces no diff when the requested url already matches", () => {
    const content = readFileSync(path.join(REPO_ROOT, CONFIG_FILE_RELATIVE_PATH), "utf8");
    const sameContent = buildUpdatedConfigContent(content, extractCurrentEndpointUrl(content));
    expect(diffLines(content, sameContent)).toEqual([]);
  });
});

describe("scripts/newlife-deploy/lib.mjs synthetic payload construction", () => {
  it("builds a FactsSnapshot-shaped object for every current NPC", () => {
    for (const npc of NPC_IDS) {
      const snapshot = buildSyntheticSnapshot(npc);
      expect(snapshot.npc).toBe(npc);
      expect(snapshot.day).toBe(25);
      expect(snapshot.unknown).toEqual([]);
      expect(Object.keys(snapshot.known).sort()).toEqual(
        ["menu", "profit", "reservation_count", "seats", "workshop", "yesterday"].sort(),
      );
      expect(snapshot.negativeConstraints).toEqual(NEGATIVE_CONSTRAINTS);
    }
  });

  it("respects a custom day", () => {
    const snapshot = buildSyntheticSnapshot("hina", 5);
    expect(snapshot.day).toBe(5);
  });

  it("never emits a banned negative-constraint term inside its own known facts", () => {
    const snapshot = buildSyntheticSnapshot("daisuke");
    const allKnownText = Object.values(snapshot.known).join(" ");
    for (const term of NEGATIVE_CONSTRAINTS) {
      expect(allKnownText).not.toContain(term);
    }
  });

  it("ALLOWED_ORIGINS matches the deployed function's own CORS allowlist", () => {
    const libJs = readFileSync(path.join(REPO_ROOT, "functions/newlife-dialogue/lib.js"), "utf8");
    for (const origin of ALLOWED_ORIGINS) {
      expect(libJs).toContain(origin);
    }
  });
});

describe("scripts/newlife-deploy smoke-test and live-eval fixed sets", () => {
  it("smoke test covers every required structural case (instruction 5)", () => {
    const names = SMOKE_TEST_CASES.map((c) => c.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "options_cors",
        "get_rejected",
        "malformed_body",
        "valid_synthetic_request",
        "prompt_injection_synthetic",
        "compound_semantic_request",
        "typo_tolerant_request",
      ]),
    );
  });

  it("every post-style smoke test case targets a real current NPC", () => {
    for (const testCase of SMOKE_TEST_CASES) {
      if (testCase.kind === "post") {
        expect(NPC_IDS).toContain(testCase.npc);
      }
    }
  });

  it("live-eval fixed set includes all four exact Owner-found transcripts verbatim", () => {
    const utterances = LIVE_EVAL_FIXED_SET.map((c) => c.utterance);
    expect(utterances).toContain("おはようございます。どんな焼き菓子売るのですか");
    expect(utterances).toContain("口調が堅苦しいよ");
    expect(utterances).toContain("原価高いのですか、なにかこだわっているてんありますか");
    expect(utterances).toContain("商品についてのこだわりありますか");
  });

  it("live-eval fixed set spans all six NPCs", () => {
    const npcsUsed = new Set(LIVE_EVAL_FIXED_SET.map((c) => c.npc));
    for (const npc of NPC_IDS) {
      expect(npcsUsed.has(npc)).toBe(true);
    }
  });

  it("live-eval fixed set has unique ids", () => {
    const ids = LIVE_EVAL_FIXED_SET.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("live-eval unknown-fact case is actually day-gated unknown (day < 20 for profit)", () => {
    const unknownCase = LIVE_EVAL_FIXED_SET.find((c) => c.id === "unknown-fact-1");
    expect(unknownCase).toBeDefined();
    expect(unknownCase!.day).toBeLessThan(20);
  });
});


describe("scripts/newlife-deploy — previously proven GCP target", () => {
  it("defaults deployment to the repository's previously selected Vertex AI project and sets GCP_PROJECT explicitly", () => {
    const deploySource = readFileSync(path.join(REPO_ROOT, "scripts/newlife-deploy/deploy.ps1"), "utf8");
    expect(deploySource).toContain('gas-test-runner-20260620-wjxf');
    expect(deploySource).toContain('--set-env-vars=GCP_PROJECT=$ProjectId');
  });

  it("readiness check can fall back to the previously selected project without mutating gcloud config", () => {
    const readinessSource = readFileSync(path.join(REPO_ROOT, "scripts/newlife-deploy/check-readiness.ps1"), "utf8");
    expect(readinessSource).toContain('$KnownProjectId = "gas-test-runner-20260620-wjxf"');
    expect(readinessSource).not.toContain("gcloud config set project $KnownProjectId");
  });

  it("client timeout leaves headroom for the server's one transparent retry", () => {
    const clientSource = readFileSync(path.join(REPO_ROOT, "src/newlife/semantic/httpInterpreter.ts"), "utf8");
    expect(clientSource).toContain("const REQUEST_TIMEOUT_MS = 25_000");
  });
});


describe("scripts/newlife-deploy — Phase 33 local context restore", () => {
  it("original-branch capture is null-safe under PowerShell native empty output", () => {
    const source = readFileSync(path.join(REPO_ROOT, "scripts/newlife-deploy/run-phase33-local.ps1"), "utf8");
    expect(source).toContain('$originalBranch = "$(& git branch --show-current)".Trim()');
  });

  it("canonical Phase 33 doc records the post-push restore and stash-preservation behavior", () => {
    const doc = readFileSync(path.join(REPO_ROOT, "docs/newlife/evaluation/PHASE_33_ONE_CLICK_LOCAL_EXECUTION_V1.md"), "utf8");
    expect(doc).toContain("switches back to the Owner's original local branch");
    expect(doc).toContain("stash is preserved");
  });
});


describe("scripts/newlife-deploy — null-safe native command output", () => {
  it("gcloud native outputs are string-cast before Trim in the Phase 33 runner and deploy fallback", () => {
    const runner = readFileSync(path.join(REPO_ROOT, "scripts/newlife-deploy/run-phase33-local.ps1"), "utf8");
    const deploy = readFileSync(path.join(REPO_ROOT, "scripts/newlife-deploy/deploy.ps1"), "utf8");
    expect(runner).toContain('$account = "$(& gcloud config get-value account 2>$null)".Trim()');
    expect(deploy).toContain('$deployedUrl = "$(& gcloud functions describe newlife-dialogue');
  });
});
