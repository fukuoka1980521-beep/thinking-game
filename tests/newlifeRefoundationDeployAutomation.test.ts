/**
 * Static safety checks for the permanent GitHub Actions deploy route for
 * `functions/newlife-refoundation-ai/` (docs/newlife/refoundation/V34_...).
 *
 * These checks read the real committed files as plain text (no YAML parser
 * dependency exists in this repo yet, and adding one just for this workflow
 * would be disproportionate -- same "extract with a targeted regex, don't
 * add a parser" discipline `tests/newlifeDeployScripts.test.ts` already uses
 * for `config.ts`) plus a real `bash -n` syntax check for the bootstrap
 * script (mirrors `newlife-deploy-readiness-ci.yml`'s existing PowerShell/
 * Node syntax-check steps for the sibling `.ps1`/`.mjs` scripts).
 *
 * The workflow YAML itself cannot live at `.github/workflows/` yet -- see
 * the V34 doc for the exact GitHub App permission rejection this repo hit --
 * so its canonical, tested copy lives under
 * `docs/newlife/refoundation/github-actions/`. These tests exist so that
 * copy cannot silently drift from the safety properties it's supposed to
 * have while it waits to be activated.
 */
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..");
const WORKFLOW_PATH = path.join(
  REPO_ROOT,
  "docs/newlife/refoundation/github-actions/newlife-refoundation-live.yml",
);
const BOOTSTRAP_SCRIPT_PATH = path.join(
  REPO_ROOT,
  "scripts/newlife-deploy/bootstrap-refoundation-wif.sh",
);

const workflow = readFileSync(WORKFLOW_PATH, "utf8");
const bootstrapScript = readFileSync(BOOTSTRAP_SCRIPT_PATH, "utf8");

describe("newlife-refoundation-live.yml (canonical, pre-activation copy)", () => {
  it("triggers only on workflow_dispatch, never push or pull_request", () => {
    expect(workflow).toMatch(/^on:\s*\n\s+workflow_dispatch:\s*\{\}\s*$/m);
    expect(workflow).not.toMatch(/^\s*push:/m);
    expect(workflow).not.toMatch(/^\s*pull_request:/m);
    expect(workflow).not.toMatch(/^\s*schedule:/m);
  });

  it("declares only contents:read and id-token:write permissions", () => {
    const permsBlock = workflow.match(/^permissions:\n((?:^ {2}.+\n)+)/m);
    expect(permsBlock).not.toBeNull();
    const lines = permsBlock![1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines.sort()).toEqual(["contents: read", "id-token: write"]);
  });

  it("authenticates via google-github-actions/auth (OIDC/WIF), never a raw key input", () => {
    expect(workflow).toContain("google-github-actions/auth@v2");
    expect(workflow).not.toMatch(/credentials_json\s*:/);
  });

  it("reads GCP identifiers only from repository variables, never from secrets", () => {
    expect(workflow).toContain("vars.GCP_PROJECT_ID");
    expect(workflow).toContain("vars.GCP_WIF_PROVIDER");
    expect(workflow).toContain("vars.GCP_DEPLOY_SERVICE_ACCOUNT");
    expect(workflow).not.toMatch(/secrets\.\w+/);
  });

  it("fails early with an explicit message when a required repository variable is missing", () => {
    expect(workflow).toMatch(/Missing required repository variable/);
  });

  it("never contains a private/service-account key material pattern", () => {
    expect(workflow).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/);
    expect(workflow).not.toMatch(/"type"\s*:\s*"service_account"/);
    expect(workflow).not.toMatch(/gcloud iam service-accounts keys create/);
  });

  it("deploys the isolated refoundation function with the exact requested parameters", () => {
    expect(workflow).toContain("gcloud functions deploy newlife-refoundation-ai");
    expect(workflow).toContain("--gen2");
    expect(workflow).toContain("--runtime=nodejs20");
    expect(workflow).toContain("--region=asia-northeast1");
    expect(workflow).toContain("--source=functions/newlife-refoundation-ai");
    expect(workflow).toContain("--entry-point=newlifeRefoundationAi");
    expect(workflow).toContain("--allow-unauthenticated");
    expect(workflow).toContain("--memory=256Mi");
    expect(workflow).toContain("--timeout=20s");
    expect(workflow).toContain("--max-instances=1");
    expect(workflow).toContain("--set-env-vars=GCP_PROJECT=");
  });

  it("never deploys the legacy dialogue functions", () => {
    // Comments may name legacy paths to document the isolation boundary.
    // Only executable deploy/source arguments are prohibited.
    expect(workflow).not.toMatch(/gcloud functions deploy\s+(?:newlife-dialogue|dialogue)\b/);
    expect(workflow).not.toMatch(/--source=(?:functions\/newlife-dialogue|functions\/dialogue)(?:\s|\\|$)/);
  });

  it("verifies required APIs rather than silently attempting to enable them", () => {
    expect(workflow).toMatch(/gcloud services list --enabled/);
    expect(workflow).not.toMatch(/gcloud services enable/);
  });

  it("smoke-tests both operations against the live deploy output, not a hardcoded URL", () => {
    expect(workflow).toContain('"operation":"interpret_turn"');
    expect(workflow).toContain('"operation":"generate_npc_line"');
    expect(workflow).toContain("steps.deploy.outputs.uri");
  });

  it("labels smoke-test fixtures as non-production and never sends real player data", () => {
    const smokeBodies = [...workflow.matchAll(/body='(\{.*?\})'/g)].map((m) => m[1]);
    expect(smokeBodies.length).toBeGreaterThanOrEqual(2);
    for (const body of smokeBodies) {
      expect(body).toMatch(/Smoke test fixture/);
    }
  });

  it("never writes the deployed endpoint into product config", () => {
    // The workflow's own comments deliberately *mention* config.ts (to
    // explain why activation is a separate step) -- what must never appear
    // is the actual constant it would need to assign to wire the endpoint in.
    expect(workflow).not.toContain("NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL");
    expect(workflow).not.toMatch(/>\s*src\/newlife\/refoundation\/config\.ts/);
  });

  it("never prints a credential, token, or key to logs", () => {
    expect(workflow).not.toMatch(/echo.*\$\{\{\s*steps\..*token/i);
    expect(workflow).not.toMatch(/access_token/i);
  });
});

describe("bootstrap-refoundation-wif.sh (one-time Owner-run GCP setup)", () => {
  it("is syntactically valid Bash", () => {
    expect(() => execFileSync("bash", ["-n", BOOTSTRAP_SCRIPT_PATH])).not.toThrow();
  });

  it("is never invoked automatically by any workflow or npm script", () => {
    const workflowFiles = ["deploy.yml", "newlife-ai-direct-dev.yml", "newlife-pr-ci.yml", "newlife-deploy-readiness-ci.yml", "newlife-phase33-auto-pr.yml", "claude.yml", "claude-code-review.yml"];
    for (const file of workflowFiles) {
      const content = readFileSync(path.join(REPO_ROOT, ".github/workflows", file), "utf8");
      expect(content).not.toContain("bootstrap-refoundation-wif.sh");
    }
    const packageJson = readFileSync(path.join(REPO_ROOT, "package.json"), "utf8");
    expect(packageJson).not.toContain("bootstrap-refoundation-wif.sh");
  });

  it("never creates or downloads a service-account JSON key", () => {
    expect(bootstrapScript).not.toMatch(/service-accounts keys create/);
    expect(bootstrapScript).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/);
  });

  it("restricts the WIF provider to this exact repository", () => {
    expect(bootstrapScript).toContain("REPO=\"fukuoka1980521-beep/thinking-game\"");
    expect(bootstrapScript).toContain("attribute-condition=\"assertion.repository == '${REPO}'\"");
  });

  it("checks for existing resources before creating them (idempotent create steps)", () => {
    const createSteps: Array<[string, string]> = [
      ["workload-identity-pools create", "workload-identity-pools describe"],
      ["providers create-oidc", "providers describe"],
      ["service-accounts create", "service-accounts describe"],
    ];
    for (const [createPattern, describePattern] of createSteps) {
      expect(bootstrapScript).toContain(createPattern);
      expect(bootstrapScript).toContain(describePattern);
    }
  });

  it("grants the deploy service account deploy-scoped roles, never owner/editor", () => {
    expect(bootstrapScript).toMatch(/roles\/cloudfunctions\.developer/);
    expect(bootstrapScript).toMatch(/roles\/run\.admin/);
    // Inspect actual --role assignments only; comments intentionally name
    // forbidden broad roles to explain the least-privilege boundary.
    expect(bootstrapScript).not.toMatch(/--role=["']?roles\/owner\b/);
    expect(bootstrapScript).not.toMatch(/--role=["']?roles\/editor\b/);
    expect(bootstrapScript).not.toMatch(/serviceusage\.services\.enable/);
  });

  it("requires PROJECT_ID to be set explicitly rather than defaulting silently", () => {
    expect(bootstrapScript).toMatch(/PROJECT_ID="\$\{PROJECT_ID:\?/);
  });

  it("prints the exact repository variable names the workflow reads", () => {
    expect(bootstrapScript).toContain("GCP_PROJECT_ID=");
    expect(bootstrapScript).toContain("GCP_WIF_PROVIDER=");
    expect(bootstrapScript).toContain("GCP_DEPLOY_SERVICE_ACCOUNT=");
  });
});
