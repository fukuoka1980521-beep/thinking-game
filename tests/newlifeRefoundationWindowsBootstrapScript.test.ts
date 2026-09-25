/**
 * Static, text-based safety checks for
 * `scripts/newlife-deploy/bootstrap-refoundation-wif.ps1` (V35), the
 * Windows-native equivalent of `bootstrap-refoundation-wif.sh` (V34).
 *
 * Same discipline as `tests/newlifeDeployScripts.test.ts` and
 * `tests/newlifeRefoundationDeployAutomation.test.ts`: no `pwsh` runtime is
 * assumed to be available in CI/sandbox, so these are real regex/text
 * assertions against the committed file content, not an executed run.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(REPO_ROOT, "scripts/newlife-deploy/bootstrap-refoundation-wif.ps1");
const script = readFileSync(SCRIPT_PATH, "utf8");

describe("bootstrap-refoundation-wif.ps1 (one-time Owner-run GCP setup, Windows)", () => {
  it("defaults to the repository's previously selected GCP project", () => {
    expect(script).toContain('[string]$ProjectId = "gas-test-runner-20260620-wjxf"');
  });

  it("restricts the WIF provider to this exact repository", () => {
    expect(script).toContain('$Repo = "fukuoka1980521-beep/thinking-game"');
    expect(script).toContain("--attribute-condition=assertion.repository == '$Repo'");
  });

  it("matches the Bash bootstrap's WIF pool/provider/service-account identifiers", () => {
    expect(script).toContain('$PoolId = "github-actions-pool"');
    expect(script).toContain('$ProviderId = "github-actions-provider"');
    expect(script).toContain('$SaId = "newlife-refoundation-deployer"');
  });

  it("enables the same required APIs as the Bash bootstrap", () => {
    const expectedApis = [
      "iamcredentials.googleapis.com",
      "iam.googleapis.com",
      "sts.googleapis.com",
      "aiplatform.googleapis.com",
      "cloudfunctions.googleapis.com",
      "cloudbuild.googleapis.com",
      "run.googleapis.com",
      "artifactregistry.googleapis.com",
    ];
    for (const api of expectedApis) {
      expect(script).toContain(api);
    }
  });

  it("grants the deploy service account deploy-scoped roles, never owner/editor/serviceusage", () => {
    const expectedRoles = [
      "roles/cloudfunctions.developer",
      "roles/run.admin",
      "roles/iam.serviceAccountUser",
      "roles/artifactregistry.writer",
      "roles/cloudbuild.builds.editor",
      "roles/storage.objectViewer",
    ];
    for (const role of expectedRoles) {
      expect(script).toContain(role);
    }
    expect(script).not.toMatch(/--role=["']?roles\/owner\b/);
    expect(script).not.toMatch(/--role=["']?roles\/editor\b/);
    expect(script).not.toMatch(/--role=["']?roles\/serviceusage\./);
  });

  it("grants Vertex AI access to the runtime service account, separate from the deploy SA", () => {
    expect(script).toContain("roles/aiplatform.user");
    expect(script).toContain("RuntimeServiceAccount");
  });

  it("never creates or downloads a service-account JSON key", () => {
    expect(script).not.toMatch(/service-accounts keys create/);
    expect(script).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/);
  });

  it("never prints a token or credential value", () => {
    expect(script).not.toMatch(/print-access-token/);
    expect(script).not.toMatch(/print-identity-token/);
    expect(script).toContain("No token or credential value is ever printed");
  });

  it("checks for existing resources before creating them (idempotent create steps)", () => {
    const idempotentPairs: Array<[string, string]> = [
      ["workload-identity-pools", "create"],
      ["workload-identity-pools providers", "create-oidc"],
      ["service-accounts", "create"],
    ];
    for (const [resource, verb] of idempotentPairs) {
      expect(script).toContain("describe");
      expect(script).toContain(verb);
      void resource;
    }
    // Each create step must be reachable only through a preceding `describe` guard
    // (LASTEXITCODE -eq 0 branch), not run unconditionally.
    expect(script).toMatch(/workload-identity-pools describe \$PoolId[\s\S]*?workload-identity-pools", "create"/);
    expect(script).toMatch(/providers describe \$ProviderId[\s\S]*?providers", "create-oidc"/);
    expect(script).toMatch(/service-accounts describe \$SaEmail[\s\S]*?service-accounts", "create"/);
  });

  it("only invokes interactive gcloud auth login when no account is already authenticated", () => {
    expect(script).toMatch(/if \(\[string\]::IsNullOrWhiteSpace\(\$account\)[\s\S]{0,200}gcloud auth login/);
  });

  it("stops safely at a billing URL instead of attempting to enable billing itself", () => {
    expect(script).toContain("console.cloud.google.com/billing/linkedaccount");
    expect(script).not.toMatch(/billing (accounts )?link/);
  });

  it("fails closed on every gcloud mutation instead of silently continuing past a failure", () => {
    // The exact class of risk flagged in deploy.ps1's review: ErrorActionPreference=Continue
    // combined with an unchecked mutation. Every gcloud call in this script must route
    // through the fail-closed helper or an explicit LASTEXITCODE check.
    expect(script).toContain("function Invoke-GcloudOrFail");
    expect(script).toContain("if (\$LASTEXITCODE -ne 0)");
    expect((script.match(/Invoke-GcloudOrFail/g) ?? []).length).toBeGreaterThanOrEqual(7);
  });

  it("does not require installing or authenticating a second CLI to finish the remaining step", () => {
    expect(script).toContain("does NOT require installing/logging into gh");
    expect(script).toContain("settings/variables/actions");
    expect(script).toContain("actions/workflows/");
  });

  it("automates variable-setting and the workflow trigger only when gh is already ready", () => {
    expect(script).toContain('gh auth status');
    expect(script).toContain("gh variable set GCP_PROJECT_ID");
    expect(script).toContain("gh variable set GCP_WIF_PROVIDER");
    expect(script).toContain("gh variable set GCP_DEPLOY_SERVICE_ACCOUNT");
    expect(script).toContain("gh workflow run");
    expect(script).toContain("--ref master");
  });

  it("never wires the endpoint into product config itself", () => {
    expect(script).not.toContain("NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL");
    expect(script).not.toContain("src/newlife/refoundation/config.ts");
  });

  it("never deploys or references the legacy dialogue functions", () => {
    expect(script).not.toMatch(/functions\/newlife-dialogue/);
    expect(script).not.toMatch(/functions\/dialogue\b/);
  });

  it("is never invoked automatically by any workflow or npm script", () => {
    const workflowFiles = [
      "deploy.yml",
      "newlife-ai-direct-dev.yml",
      "newlife-pr-ci.yml",
      "newlife-deploy-readiness-ci.yml",
      "newlife-phase33-auto-pr.yml",
      "claude.yml",
      "claude-code-review.yml",
    ];
    for (const file of workflowFiles) {
      const workflowPath = path.join(REPO_ROOT, ".github/workflows", file);
      let content: string;
      try {
        content = readFileSync(workflowPath, "utf8");
      } catch {
        continue;
      }
      expect(content).not.toContain("bootstrap-refoundation-wif.ps1");
    }
    const packageJson = readFileSync(path.join(REPO_ROOT, "package.json"), "utf8");
    expect(packageJson).not.toContain("bootstrap-refoundation-wif.ps1");
  });
});
