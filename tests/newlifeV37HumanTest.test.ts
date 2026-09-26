import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "public/newlife-v37.html"), "utf8");
const script = fs.readFileSync(path.join(root, "scripts/newlife-deploy/pde010-cloud-shell-v37-human-test.sh"), "utf8");

describe("NEW LIFE V37 isolated human test", () => {
  it("uses converse_turn as the primary free-conversation operation", () => {
    expect(page).toContain('operation:"converse_turn"');
    expect(page).not.toContain('operation:"interpret_turn"');
    expect(page).not.toContain('operation:"generate_npc_line"');
  });

  it("preserves raw player utterance and recent raw dialogue in the request", () => {
    expect(page).toContain("rawPlayerUtterance:utterance");
    expect(page).toContain("recentDialogue:recentDialogue()");
  });

  it("continues NPC-to-NPC exchanges only through the dedicated V41 operation and hard cap", () => {
    expect(page).toContain('operation:"continue_npc_exchange"');
    expect(page).toContain("const MAX_NPC_EXCHANGE_TURNS=3");
    expect(page).toContain("continuationDepth:depth");
    expect(page).toContain('data?.sceneStatus!=="NPC_EXCHANGE"');
    expect(page).toContain("await continueNpcExchange(data)");
  });
  it("keeps thought organization as a separate operation and separate panel", () => {
    expect(page).toContain('operation:"organize_thought"');
    expect(page).toContain("思考整理（キャラクターの発言ではありません）");
  });

  it("does not include a phrase-specific reply table or regex router", () => {
    expect(page).not.toContain("totuzenndousita:");
    expect(page).not.toContain("switch(utterance");
    expect(page).not.toMatch(/utterance\.match\s*\(/);
    expect(page).not.toMatch(/utterance\.test\s*\(/);
  });

  it("deploys only the isolated refoundation backend from the V37 branch", () => {
    expect(script).toContain('FUNCTION_NAME="newlife-refoundation-ai"');
    expect(script).toContain('SOURCE_BRANCH="chatgpt/newlife-refoundation-v1"');
    expect(script).not.toContain("newlife-dialogue");
  });

  it("smoke-tests both V37 operations before publishing a test URL", () => {
    expect(script).toContain("Smoke 1/2: converse_turn");
    expect(script).toContain("Smoke 2/2: organize_thought");
    expect(script).toContain("PDE010_SMOKE=PASS");
    expect(script).toContain("PDE010_TEST_URL=");
  });

  it("fails closed if required APIs are disabled and never enables them", () => {
    expect(script).toContain("This script will not enable APIs automatically.");
    expect(script).not.toContain("gcloud services enable");
  });
});
