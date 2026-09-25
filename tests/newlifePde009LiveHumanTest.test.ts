import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "public/newlife-pde009.html"), "utf8");
const script = fs.readFileSync(path.join(root, "scripts/newlife-deploy/pde009-cloud-shell-human-test.sh"), "utf8");

describe("NEW LIFE PDE-009 live human test", () => {
  it("requires an explicit live endpoint and does not fake AI locally", () => {
    expect(page).toContain('params.get("endpoint")');
    expect(page).toContain('operation:"interpret_turn"');
    expect(page).toContain('operation:"generate_npc_line"');
    expect(page).not.toContain("const phases=[");
    expect(page).not.toContain("限定ルールで反応");
  });

  it("sends the player utterance into both semantic context and NPC-visible scene context", () => {
    expect(page).toContain("utterance,caseContext");
    expect(page).toContain("直前にプレイヤーが");
  });

  it("keeps the human test isolated from the legacy public NEW LIFE route", () => {
    expect(page).toContain("LIVE会話精度テスト");
    expect(script).toContain('FUNCTION_NAME="newlife-refoundation-ai"');
    expect(script).not.toContain("newlife-dialogue");
  });

  it("does not enable APIs automatically", () => {
    expect(script).toContain("This script will not enable APIs automatically.");
    expect(script).not.toContain("gcloud services enable");
  });


  it("includes the scene facts needed to answer why Mika raised the issue now and how Ryo can compromise", () => {
    expect(page).toContain("美香は昨日、最終版をちゃんと読んで");
    expect(page).toContain("公開台本にそのまま使ってよいと明示的に同意したわけではない");
    expect(page).toContain("美香本人の実話そのものが必須ではない");
  });

  it("retries one transient AI/network failure instead of ending the conversation immediately", () => {
    expect(page).toContain("for(let attempt=1;attempt<=2;attempt++)");
    expect(page).toContain("err.status===502");
    expect(page).toContain("await new Promise(r=>setTimeout(r,700))");
  });


  it("allows longer provider latency and identifies which AI stage failed", () => {
    expect(page).toContain("setTimeout(()=>ctrl.abort(),45000)");
    expect(page).toContain("意味解釈で失敗:");
    expect(page).toContain("NPC返答生成で失敗:");
    expect(script).toContain("--timeout=45s");
    expect(script).toContain("--max-time 50");
  });

  it("smoke-tests both backend operations before exposing the human-test URL", () => {
    expect(script).toContain("Smoke 1/2: interpret_turn");
    expect(script).toContain("Smoke 2/2: generate_npc_line");
    expect(script).toContain("PDE009_SMOKE=PASS");
    expect(script).toContain("PDE009_TEST_URL=");
  });
});
