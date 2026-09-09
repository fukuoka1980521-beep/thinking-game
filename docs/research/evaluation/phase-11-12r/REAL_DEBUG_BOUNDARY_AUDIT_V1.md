# Real Debug Boundary Audit V1 — PHASE 11.12R

## What moved

`NewlifePlayable11App.tsx` previously rendered this unconditionally, inside `{started && (...)}`,
on every screen once the scene began:

```tsx
<p style={{ fontSize: "11px", opacity: 0.7 }}>
  （洋平のセリフは、実際にVertex AIで生成・記録された発話の再生です...）
</p>
```

This paragraph is now **deleted from the primary render path entirely** — not hidden by CSS, not
moved into a collapsed-by-default section of the same always-rendered tree; the JSX node no longer
exists on that path. In its place, the SAME provenance information (now with the specific capture
provenance detail: project id, location, model, capture date — nothing was dropped) is rendered
only inside the existing `showDebug`-gated panel, AND only when `import.meta.env.DEV` is true at
that call site:

```tsx
let devOnlyVertexDisclosure: string | null = null;
if (import.meta.env.DEV) {
  devOnlyVertexDisclosure = getDevOnlyDisclosureText(true, "<the same provenance detail as before>");
}
// ... later, inside the showDebug-gated <div> ...
{devOnlyVertexDisclosure && <p data-testid="playable11-debug-dev-only-disclosure">{devOnlyVertexDisclosure}</p>}
```

## Verified: DEV path — evidence accessible

`tests/newlifePlayable11RenderedUI.test.tsx`, "dev-only disclosure IS accessible through the
dev/debug boundary in this (DEV) test environment" — renders the real component, toggles the debug
panel, and finds `playable11-debug-dev-only-disclosure` containing both the PHASE-11-12 marker
string and the real capture provenance (`gas-test-runner-20260620-wjxf`) — PASSING. Confirmed a
second time against a real running dev server (Playwright, `real_path_visual_verify.mjs`):
"dev-only disclosure IS present inside the debug/evidence surface (this is a dev build)" — PASS,
screenshot `screenshots/04_real_path_debug_panel_open.png`.

## Verified: PLAYER primary surface — not rendered

Same test file, two checks: (1) the disclosure sentence is absent from the page both before and
after asking a question, with the debug panel closed; (2) with the debug panel OPEN, the sentence
is present inside `playable11-debug-panel` but explicitly absent from `playable11-actions` (the
primary player action surface), checked with `within()` scoping so "present somewhere on the page"
cannot be mistaken for "present in the debug panel only" — both PASSING. Real-browser confirmation:
`real_path_visual_verify.mjs` — "primary player action surface itself contains no Vertex AI text
even with debug panel open" — PASS.

## Verified: production-style bundle — marker absent where compile-time exclusion is intended

```
$ npm run build
$ grep -rl "PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a" dist/
NOT FOUND
```

Re-run against the REAL wired-in call site in `NewlifePlayable11App.tsx` (not only the standalone
`BuildBoundaryDemoApp.tsx` PHASE 11.12 used) — confirms the fix generalizes to the actual scene,
not only to the isolated demo route.

## Section 7's build lesson, re-verified, not regressed

The call site uses the corrected pattern from PHASE 11.12
(`if (import.meta.env.DEV) { devOnlyVertexDisclosure = getDevOnlyDisclosureText(true, ...); }`),
NOT the earlier, disproven default-parameter form (`isDev: boolean = import.meta.env.DEV`).
`getDevOnlyDisclosureText`'s signature still requires `isDev` as a mandatory first argument —
confirmed by reading `devOnlyDisclosure.ts` (unchanged this phase except for an additive, optional
second `provenanceDetail` parameter, default `undefined`, which does not reintroduce a default for
`isDev`). The actual artifact was re-grepped this phase (above), not assumed correct from PHASE
11.12's prior finding alone.

## Note on what was intentionally NOT compile-time-excluded

The debug panel's `PendingReply`/`Materials`/`Product Surface gate evidence`/`Traces` JSON dumps
remain gated only by the `showDebug` toggle (React state), not by `import.meta.env.DEV` — this is
unchanged from PHASE 11.11's own correctly-contained pattern (see PHASE 11.12's
`RESEARCH_PRODUCT_CONTAMINATION_TRACE_V1.md` item 5) and was never part of the demonstrated
DEBUG_UI_LEAK. Only the specific Vertex/replay provenance sentence (the demonstrated leak instance)
received the additional build-time boundary, per directive Section 6's "where appropriate."
