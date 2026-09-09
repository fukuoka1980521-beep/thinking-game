import { describe, expect, it } from "vitest";
import { getDevOnlyDisclosureText, DEV_ONLY_DISCLOSURE_MARKER } from "../src/research/action-contract-v2/devOnlyDisclosure";

describe("PHASE 11.12: dev-only disclosure logic (compile-time boundary's runtime-equivalent logic)", () => {
  it("returns the marked disclosure text when isDev=true", () => {
    const text = getDevOnlyDisclosureText(true);
    expect(text).toContain(DEV_ONLY_DISCLOSURE_MARKER);
  });

  it("returns null when isDev=false -- this is the branch Vite's compile-time replacement resolves to `if (false)` in a production build, which tree-shaking then removes entirely (verified separately by grepping the real dist/ output -- see SYSTEMIC_GATES_IMPLEMENTATION_V1.md)", () => {
    expect(getDevOnlyDisclosureText(false)).toBeNull();
  });
});
