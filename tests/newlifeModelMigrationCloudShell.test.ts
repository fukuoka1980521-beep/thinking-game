import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const probe = fs.readFileSync(path.join(root, "scripts/newlife-model-migration/probe-model-location-availability.cjs"), "utf8");
const cloud = fs.readFileSync(path.join(root, "scripts/newlife-deploy/pde008-cloud-shell-model-migration-compare.sh"), "utf8");

describe("PDE-008 model migration Cloud Shell probe", () => {
  it("probes both current and common locations with all three explicit model ids", () => {
    for (const source of [probe, cloud]) {
      expect(source).toContain("asia-northeast1");
      expect(source).toContain("global");
      expect(source).toContain("gemini-2.5-flash");
      expect(source).toContain("gemini-3.5-flash");
      expect(source).toContain("gemini-3.5-flash-lite");
    }
  });

  it("never enables APIs, deploys functions, or mutates production model/endpoint config", () => {
    for (const source of [probe, cloud]) {
      expect(source).not.toContain("gcloud services enable");
      expect(source).not.toContain("gcloud functions deploy");
      expect(source).not.toContain("wire-endpoint");
    }
    expect(cloud).not.toContain("NEWLIFE_DIALOGUE_MODEL=");
    expect(cloud).not.toContain("NEWLIFE_REFOUNDATION_AI_MODEL=");
  });

  it("fails closed when billing or Vertex API readiness is absent", () => {
    expect(cloud).toContain("billing projects describe");
    expect(cloud).toContain("aiplatform.googleapis.com");
    expect(cloud).toContain("This script will NOT enable it");
  });

  it("installs function dependencies without requiring absent lockfiles", () => {
    expect(cloud).not.toContain("npm ci --silent --prefix functions/newlife-dialogue");
    expect(cloud).toContain("npm install --silent --omit=dev --no-audit --no-fund --package-lock=false --prefix functions/newlife-dialogue");
    expect(cloud).toContain("npm install --silent --omit=dev --no-audit --no-fund --package-lock=false --prefix functions/newlife-refoundation-ai");
  });

  it("uses the accepted comparison harnesses on global with two runs by default", () => {
    expect(cloud).toContain("compare-legacy-models.mjs");
    expect(cloud).toContain("compare-refoundation-models.cjs");
    expect(cloud).toContain("--location global");
    expect(cloud).toContain('RUNS="');
    expect(cloud).toContain("RUNS:-2");
  });

  it("separates blind evidence from withheld raw/mapping evidence", () => {
    expect(cloud).toContain("NEW_LIFE_MODEL_MIGRATION_BLIND_");
    expect(cloud).toContain("NEW_LIFE_MODEL_MIGRATION_RAW_");
    expect(cloud).toContain("blind-results-");
    expect(cloud).toContain("blind-map-");
    expect(cloud).toContain("keep RAW_BUNDLE withheld");
    expect(cloud).toContain("randomized independently by each backend harness");
    expect(cloud).toContain('MODEL_LOCATION_COMPATIBILITY_V1.md "$FINAL_DIR/unblind/"');
    expect(cloud).not.toContain('MODEL_LOCATION_COMPATIBILITY_V1.md "$FINAL_DIR/blind/"');
  });

  it("uses ADC and never creates/downloads a service-account key", () => {
    expect(cloud).toContain("auth application-default");
    expect(cloud).not.toContain("service-accounts keys create");
    expect(cloud).not.toContain("GOOGLE_APPLICATION_CREDENTIALS=");
  });

  it("records availability separately from quality", () => {
    expect(probe).toContain("Operational availability probe only");
    expect(cloud).toContain("LANE A");
    expect(cloud).toContain("LANE B1");
    expect(cloud).toContain("LANE B2");
  });
});
