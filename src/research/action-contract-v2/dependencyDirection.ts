/**
 * PHASE 11.12: dependency-direction scanner (directive Section 12/19B).
 *
 * Rule enforced: files under a player-facing UI route (`src/newlifeplayable11/**`, the one
 * PHASE-11.11-era route this phase concerns) must not import `testProbes.ts` directly. Test
 * probes are reached only through a test/harness context, never composed into product UI.
 *
 * Deliberately simple and repository-native (directive Section 12: "prefer simple repository-
 * native enforcement before adding tooling") -- a regex import-scan over file contents, in the
 * same spirit as the existing `tests/newlifePlayableScene11.test.ts` describe block "Q: scope
 * discipline" (lines 232-245), which already reads file contents with `fs.readFileSync` and
 * asserts a forbidden pattern is absent. This module factors that pattern into a reusable, pure
 * function so it can be unit-tested against synthetic fixtures (proving detection) as well as run
 * against the real tree (proving the real tree is currently clean).
 */

export interface SourceFile {
  path: string;
  content: string;
}

export interface DependencyViolation {
  file: string;
  rule: string;
  reason: string;
}

interface ForbiddenImportRule {
  rule: string;
  /** Only files whose path matches this are checked against `importPattern`. */
  scopePattern: RegExp;
  /** Files whose path matches this are exempt even if `scopePattern` matches (tests/harnesses). */
  exemptPattern: RegExp;
  importPattern: RegExp;
  reason: string;
}

const RULES: ForbiddenImportRule[] = [
  {
    rule: "PRODUCT_UI_MUST_NOT_IMPORT_TEST_PROBES",
    scopePattern: /[\\/]newlifeplayable11[\\/]/,
    exemptPattern: /(^|[\\/])tests?[\\/]/,
    importPattern: /from\s+["'][^"']*action-contract-v2\/testProbes["']/,
    reason: 'player-facing UI must not import "testProbes" -- QA probes are invoked only from a test/harness context (see testProbes.ts)',
  },
];

export function scanForProductSurfaceViolations(files: SourceFile[]): DependencyViolation[] {
  const violations: DependencyViolation[] = [];
  for (const file of files) {
    for (const rule of RULES) {
      if (!rule.scopePattern.test(file.path)) continue;
      if (rule.exemptPattern.test(file.path)) continue;
      if (rule.importPattern.test(file.content)) {
        violations.push({ file: file.path, rule: rule.rule, reason: rule.reason });
      }
    }
  }
  return violations;
}
