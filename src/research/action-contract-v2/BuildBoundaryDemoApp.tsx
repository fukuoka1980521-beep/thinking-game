/**
 * PHASE 11.12: isolated demonstration route for the build/mode boundary (Section 13/19C/27).
 *
 * Additive only -- a new route, following the exact same convention as every other `?newlife*=1`
 * / `?newlifeplayable11=1` route in `src/App.tsx`. Does not modify `NewlifePlayable11App.tsx` or
 * any PHASE 11.11 file. Its only purpose is to give `getDevOnlyDisclosureText`'s real call site
 * (via `import.meta.env.DEV`, not the injected-parameter override) a place in the actual build
 * graph, so a real `vite build` can be grepped to prove the marker string is compiled out of a
 * production bundle and present in a development-mode bundle -- see
 * SYSTEMIC_GATES_IMPLEMENTATION_V1.md's build-verification section for the recorded grep results.
 */

import { getDevOnlyDisclosureText } from "./devOnlyDisclosure";

export function BuildBoundaryDemoApp({ onExit }: { onExit: () => void }) {
  // Literal `if (import.meta.env.DEV)` at the call site -- required for Rollup to actually strip
  // this call (and therefore the marker string) from a production bundle. See devOnlyDisclosure.ts.
  let devText: string | null = null;
  if (import.meta.env.DEV) {
    devText = getDevOnlyDisclosureText(true);
  }
  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <button onClick={onExit}>ホームへ戻る</button>
      <h2>PHASE 11.12 — build/mode boundary demo</h2>
      <p data-testid="boundary-demo-dev-text">
        {devText ?? "(production build: no research/debug disclosure text is compiled into this bundle)"}
      </p>
    </div>
  );
}
