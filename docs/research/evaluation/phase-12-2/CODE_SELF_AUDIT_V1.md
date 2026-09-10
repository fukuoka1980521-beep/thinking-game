# Code Self-Audit V1 — PHASE 12.2

## Scope discipline

New files:
- `src/newlifebgw121/newlifebgw121.css` — presentation only.
- `src/newlifebgw121/mapLayout.ts` — map marker coordinates, presentation only, explicitly outside
  `src/research/bounded-generative-world/` (kept frozen).
- `tests/newlifeBgw121VisualProduct.test.tsx` — 9 new mechanically-provable UI tests.
- `docs/research/evaluation/phase-12-2/*` — this phase's artifacts.

Modified files:
- `src/newlifebgw121/NewlifeBgw121App.tsx` — full visual rewrite; every call into
  `src/research/bounded-generative-world/*` is byte-identical to PHASE 12.1 (same function names,
  same arguments, same call order) — verified by diff review, not merely asserted.

**Not modified** (directive Section 1's freeze, verified by `git diff` review before any edit and
confirmed by the unmodified PHASE 12.1 test suite still passing without a single edit):
`types.ts`, `canonData.ts`, `worldState.ts`, `packet.ts`, `envelope.ts`, `testAdapter.ts`,
`liveAdapterClient.ts`, `devtools/bgwVertexLiveAdapterCore.mjs`, `devtools/bgwVertexDevPlugin.mjs`.

Also not modified: `?newlifeplayable11=1` (the fixed-dialogue baseline) — unaffected by this
phase's work, not re-verified separately since PHASE 12.1 already established a dedicated
regression test for it and this phase touched none of its files.

## A real UX defect found and fixed during this phase's own work

Initial mobile QA (`mobile_visual_qa_script.mjs`'s first run) showed the stacked map + location +
conversation sections producing a page requiring vertical scroll to see an open conversation in
full — undermining the mobile-first goal (directive Section 19). Fixed by conditionally hiding the
map and pre-conversation location panel while a conversation is active
(`CONVERSATION_PRODUCT_UI_V1.md`'s "mobile scroll fix" section) — a presentation-only visibility
change, re-verified by re-running the full mobile QA script and confirming the conversation now
fits one viewport.

## Verification totals

- `npx tsc --noEmit`: clean.
- Targeted tests: `newlifeBgw121RenderedUI.test.tsx` (5/5, PHASE 12.1's own tests, unmodified and
  still passing against the new UI), `newlifeBgw121VisualProduct.test.tsx` (9/9, new this phase),
  `boundedGenerativeWorld.test.ts` (17/17, unmodified), `safety.test.ts` (8/8, unmodified).
- Full suite: **107/107 test files, 1574/1574 tests passing.** (One earlier run showed 6
  failed files/12 failed tests over an elevated ~99s duration; traced to this session's own
  leftover PHASE 12.1 dev server plus the same unrelated `gyosei-support-navi` background load
  documented in PHASE 12.1's own `CODE_SELF_AUDIT_V1.md`. Stopped the leftover dev server,
  confirmed zero stray Playwright/chrome processes, and re-ran clean: 107/107 files, 1574/1574
  tests, 75.25s — the expected duration. The specific failures observed (`newlifePurposeRenderedUI
  .test.tsx`/`newlifeVerticalRenderedUI.test.tsx`, long multi-day walkthrough simulations timing
  out at their internal 5000ms test timeout) are in files this phase never touched and match the
  resource-starvation symptom pattern already documented in PHASE 12.1, not a new regression.)
- `npm run build`: clean; production bundle re-grepped for `aiplatform.googleapis.com`,
  `print-access-token`, `Bearer ` — absent, confirming no credential/endpoint leak through the new
  UI code either.

## No AI architecture change, no prompt tuning (directive Section 1's explicit prohibition)

Confirmed by the fact that zero files under `src/research/bounded-generative-world/` or
`devtools/` were touched this phase, and by `tests/boundedGenerativeWorld.test.ts`'s 17 tests
passing completely unmodified — the strongest available evidence that generative behavior did not
shift underneath the new visual layer.

## Unresolved, stated honestly

- All character/map art remains `TEMPORARY` (engineering placeholders) — see
  `STRATEGIST_VISUAL_PRODUCT_AUDIT_PACKET_V1.md`'s explicit verdict, not silently implied as done.
- Real on-device mobile keyboard behavior (viewport resize while typing, etc.) was not verified —
  Playwright's `fill`/`tap` helpers do not exercise this realistically.
- Jin's "location" screenshot is honestly the same real screen as Yohei's at this world-tick
  (`MOBILE_VISUAL_QA_V1.md`'s note) — not a defect, but worth knowing before assuming three visually
  distinct location shots exist.
- The consequence note's wording is generic (not per-consequence-specific) — a deliberate minimal
  choice for a single-consequence slice, flagged as a future extension point, not a gap hidden as
  finished.
