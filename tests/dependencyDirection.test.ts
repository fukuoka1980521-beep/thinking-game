import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { scanForProductSurfaceViolations } from "../src/research/action-contract-v2/dependencyDirection";

function readRealNewlifePlayable11Files() {
  const dir = path.resolve(__dirname, "../src/newlifeplayable11");
  return fs.readdirSync(dir).map((name) => ({
    path: path.join("src/newlifeplayable11", name),
    content: fs.readFileSync(path.join(dir, name), "utf8"),
  }));
}

describe("PHASE 11.12: dependency-direction scanner", () => {
  it("the REAL src/newlifeplayable11 tree currently imports no test probe (clean today)", () => {
    const violations = scanForProductSurfaceViolations(readRealNewlifePlayable11Files());
    expect(violations).toEqual([]);
  });

  it("adversarial: a synthetic file importing testProbes into product UI IS detected -- no real file was written to prove this", () => {
    const synthetic = [
      {
        path: "src/newlifeplayable11/HypotheticalFutureComponent.tsx",
        content: 'import { WEATHER_EPISTEMIC_PROBE } from "../research/action-contract-v2/testProbes";\nexport const x = WEATHER_EPISTEMIC_PROBE;\n',
      },
    ];
    const violations = scanForProductSurfaceViolations(synthetic);
    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe("PRODUCT_UI_MUST_NOT_IMPORT_TEST_PROBES");
    expect(violations[0].file).toBe("src/newlifeplayable11/HypotheticalFutureComponent.tsx");
  });

  it("a test file importing testProbes is exempt (tests are the intended consumer)", () => {
    const synthetic = [
      {
        path: "tests/newlifeplayable11/someTest.test.ts",
        content: 'import { WEATHER_EPISTEMIC_PROBE } from "../../src/research/action-contract-v2/testProbes";\n',
      },
    ];
    expect(scanForProductSurfaceViolations(synthetic)).toEqual([]);
  });

  it("a file outside the scoped product-UI directory is not checked at all", () => {
    const synthetic = [
      {
        path: "src/research/action-contract-v2/someOtherResearchFile.ts",
        content: 'import { WEATHER_EPISTEMIC_PROBE } from "./testProbes";\n',
      },
    ];
    expect(scanForProductSurfaceViolations(synthetic)).toEqual([]);
  });
});
