import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "public/newlife-v37.html"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/newlife-refoundation-live.yml"), "utf8");

describe("NEW LIFE permanent isolated deploy route", () => {
  it("does not trust a stale endpoint from browser localStorage", () => {
    expect(page).toContain('const DEFAULT_ENDPOINT="https://newlife-refoundation-ai-zqtk74q2ra-an.a.run.app"');
    expect(page).not.toContain('localStorage.getItem("newlife_v37_endpoint")');
    expect(page).not.toContain('localStorage.setItem("newlife_v37_endpoint"');
  });

  it("requires a live backend health/build identity check before enabling the test", () => {
    expect(page).toContain("async function verifyBackend()");
    expect(page).toContain('fetch(endpoint,{method:"GET"');
    expect(page).toContain('data.service!=="newlife-refoundation-ai"');
    expect(page).toContain('typeof data.buildSha!=="string"');
    expect(page).toContain('consentCard.style.display="block"');
    expect(page).toContain('data.contractVersion!=="V42"');
    expect(page).toContain('data.operations.includes("continue_npc_exchange")');
  });

  it("removes Cloud Shell from the normal human-test page", () => {
    expect(page).not.toContain("ssh.cloud.google.com/cloudshell");
    expect(page).not.toContain("Google Cloud ShellでV37 LIVE AIを準備");
  });

  it("keeps the request target immutable while the reply is in flight", () => {
    expect(page).toContain("const requestTarget=target");
    expect(page).toContain("targetNpc:requestTarget");
    expect(page).toContain("dynamicState:currentDynamicState(requestTarget)");
    expect(page).toContain("relationship[npc]");
    expect(page).toContain('data.npc!==requestTarget');
    expect(page).toContain('document.getElementById("targetMika").disabled=value');
    expect(page).toContain('document.getElementById("targetRyo").disabled=value');
  });

  it("supports automatic deploys from only the refoundation candidate branch plus manual dispatch", () => {
    expect(workflow).toMatch(/workflow_dispatch:\s*\{\}/);
    expect(workflow).toContain("chatgpt/newlife-refoundation-v1");
    expect(workflow).toContain('"functions/newlife-refoundation-ai/**"');
    expect(workflow).not.toMatch(/branches:\s*\n\s*-\s*master/);
  });

  it("reduces the permanent bootstrap to one non-secret GitHub variable", () => {
    expect(workflow).toContain("GCP_PROJECT_ID: gas-test-runner-20260620-wjxf");
    expect(workflow).toContain("GCP_DEPLOY_SERVICE_ACCOUNT: newlife-refoundation-deployer@gas-test-runner-20260620-wjxf.iam.gserviceaccount.com");
    expect(workflow).toContain("vars.GCP_WIF_PROVIDER");
    expect(workflow).not.toContain("vars.GCP_PROJECT_ID");
    expect(workflow).not.toContain("vars.GCP_DEPLOY_SERVICE_ACCOUNT");
  });

  it("cleanly skips deployment until the WIF provider variable exists", () => {
    expect(workflow).toContain("GCP_WIF_READY=NO");
    expect(workflow).toContain("Missing repository variable: GCP_WIF_PROVIDER");
    expect(workflow).toContain("ready=false");
    expect(workflow).toContain("if: needs.readiness.outputs.ready == 'true'");
  });

  it("embeds and verifies the exact source commit in the deployed backend", () => {
    expect(workflow).toContain('sha="$(git rev-parse HEAD)"');
    expect(workflow).toContain("NEWLIFE_REFOUNDATION_BUILD_SHA=");
    expect(workflow).toContain('p.buildSha!==expected');
  });

  it("smoke-tests the current product operations, not retired thin-path operations", () => {
    expect(workflow).toContain('"operation":"converse_turn"');
    expect(workflow).toContain('"operation":"continue_npc_exchange"');
    expect(workflow).toContain('p.contractVersion!=="V42"');
    expect(workflow).toContain("scene revision proposal missing");
    expect(workflow).toContain('"operation":"organize_thought"');
    expect(workflow).not.toContain('"operation":"interpret_turn"');
    expect(workflow).not.toContain('"operation":"generate_npc_line"');
  });

  it("never deploys legacy NEW LIFE functions or uses a long-lived service-account key", () => {
    expect(workflow).not.toMatch(/gcloud functions deploy\s+(?:newlife-dialogue|dialogue)\b/);
    expect(workflow).not.toMatch(/credentials_json\s*:/);
    expect(workflow).not.toMatch(/service-accounts keys create/);
    expect(workflow).toContain("google-github-actions/auth@v2");
  });
});
