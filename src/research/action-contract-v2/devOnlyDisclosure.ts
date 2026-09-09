/**
 * PHASE 11.12: build/mode boundary demonstration (directive Section 13/19C).
 *
 * Root cause item B: `NewlifePlayable11App.tsx` line 135-137 renders a Vertex/replay provenance
 * disclosure sentence unconditionally -- it is not gated by `showDebug`, so it is present on every
 * screen of the primary playable scene for every viewer, in every build, including a production
 * build. This module demonstrates the mechanism (Vite's compile-time `import.meta.env.DEV`
 * replacement, verified in EXTERNAL_ARCHITECTURE_RESEARCH_V1.md) that PHASE 11.11's actual repair
 * (deferred; Section 22/29) should use to fix that specific leak. It does not touch
 * `NewlifePlayable11App.tsx` -- see `BuildBoundaryDemoApp.tsx` for a separate, additive isolated
 * route that proves the mechanism works in this repository's real Vite build, without altering the
 * frozen PHASE 11.11 scene.
 *
 * IMPORTANT, recorded honestly (see SYSTEMIC_GATES_IMPLEMENTATION_V1.md's build-verification
 * section): an earlier version of this function took `isDev: boolean = import.meta.env.DEV` as a
 * DEFAULT PARAMETER and let the call site rely on the default. A real `vite build` proved that
 * wrong -- Vite correctly replaces `import.meta.env.DEV` with the literal `false` wherever it
 * textually appears, but a default parameter value is not itself a `if (import.meta.env.DEV)`
 * branch; Rollup's tree-shaking/DCE did not fold the call through the parameter default, and the
 * marker string was still found in the production bundle by direct grep. Fixed by requiring the
 * caller to pass `isDev` explicitly and by gating the CALL ITSELF at the call site with a literal
 * `if (import.meta.env.DEV) { ... }` (see `BuildBoundaryDemoApp.tsx`) -- the exact idiom Vite's own
 * docs use. Re-verified against a real production build after the fix; see that doc for the grep
 * evidence. This mistake and its correction are left in this comment as part of the phase-11-12
 * evidence trail, not smoothed over.
 */

export const DEV_ONLY_DISCLOSURE_MARKER = "PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a";

/** Pure text builder -- takes `isDev` as a required, explicit argument so both branches are
 *  unit-testable. Callers in real app code must gate the CALL ITSELF with a literal
 *  `if (import.meta.env.DEV)` at the call site (not pass `import.meta.env.DEV` through here) for
 *  Rollup's dead-code elimination to actually remove this function and the marker string from a
 *  production bundle. */
export function getDevOnlyDisclosureText(isDev: boolean, provenanceDetail?: string): string | null {
  if (!isDev) return null;
  const base = `[${DEV_ONLY_DISCLOSURE_MARKER}] このセリフは実測 Vertex AI 出力の再生です（研究/デバッグ専用表示 -- import.meta.env.DEV でのみ含まれ、本番ビルドからは除去される）。`;
  return provenanceDetail ? `${base} ${provenanceDetail}` : base;
}
