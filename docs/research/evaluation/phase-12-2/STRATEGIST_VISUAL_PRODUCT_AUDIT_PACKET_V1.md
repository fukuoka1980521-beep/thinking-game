# Strategist Visual Product Audit Packet V1 — PHASE 12.2

Evidence-packaging document for independent Strategist review. This phase built the visual Product
surface over PHASE 12.1's already-accepted generative core, which remains frozen and unmodified.
No commit was made this phase beyond none — the PHASE 12.1 checkpoint is the last commit.

## PHASE 12.1 checkpoint commit hash

`5cf68ef60b39c0e9e24460b850a8c659a5c1f3df`. Current HEAD: unchanged (no commit made this phase;
all PHASE 12.2 work sits uncommitted).

## Exact Product route

`?newlifebgw121=1` — same route, same underlying state/adapters/pipeline as PHASE 12.1; only
`NewlifeBgw121App.tsx`'s rendering and 2 new presentation-only files changed.

## Opening UI

Full-viewport scene (`.bgw-opening`): title + already-approved canonical prose (57歳/長く勤めた仕事
を辞めた/次はまだ決めていない/30日間の試住/チャレンジ町/仮住まいの鍵/DAY30鍵返却, all unchanged and
re-verified present) + one primary "町を歩き始める" button. No spec-panel appearance, no anomaly
reference, no prescribed emotion. `screenshots/00_opening.png`.

## Map layout

Hub-and-spoke spatial composition, 4:5 canvas, 5 location markers positioned at normalized
coordinates (`mapLayout.ts`), current-location and consequence-badge states visually distinguished.
Map logic (`TRAVEL_EDGES`) unchanged. `screenshots/01_first_map.png`.

## Five location presentation

Each location shows WHERE (name + description) → WHO (a full card per present NPC: portrait slot +
name) → WHAT (real runtime activity text) before any conversation begins — never a bare floating
NPC name. `NPC_VISUAL_PRESENTATION_V1.md`.

## Character slot dimensions

1024 × 1536 px master canvas, 2:3 portrait, transparent PNG background, half-body/standing
framing, identical contract for Yohei/Miyoko/Jin. Display sizes: 64×96 CSS px (location card),
48×72 CSS px (conversation header). `ART_ASSET_MANIFEST_V1.md` / `NPC_VISUAL_PRESENTATION_V1.md`.

## Map asset dimensions

1536 × 1920 px master canvas, 4:5 portrait, mobile safe area 1536 × 1728 px, no baked text
(HTML overlay labels), normalized marker coordinates. `MAP_VISUAL_SYSTEM_V1.md`.

## Exact final image asset manifest

4 required: `NEW_LIFE_MAP_V1`, `YOHEI_CHARACTER_V1`, `MIYOKO_CHARACTER_V1`, `JIN_CHARACTER_V1`. 1
optional evaluated and explicitly NOT requested this phase: `OPENING_CHALLENGE_TOWN_V1`. Full
specs: `ART_ASSET_MANIFEST_V1.md`.

## Conversation layout

Character portrait + name persistent header; distinct speech-bubble styling for player vs. NPC
lines; single icon send button; always-available "地図に戻る" leave control. No chatbot-log
appearance. `CONVERSATION_PRODUCT_UI_V1.md`.

## Waiting-state behavior

A pulsing「・・・」-style bubble replaces the NPC's next line while `pending` is true; environment
stays fully visible; no "Loading AI"/model-name text anywhere. Captured with one real live Vertex
call (frozen pipeline, unmodified) at `screenshots/06_conversation_waiting_for_live_ai.png`.
`LIVE_RESPONSE_WAIT_UX_V1.md`.

## Persistent consequence presentation

A single natural-language note (「何かが、今日の記憶に残ったようだ。」) appears once, above the log,
after a real commit — no material id, type name, or JSON ever shown on the primary surface.
`LIFE_MATERIAL_PRODUCT_VISIBILITY_V1.md`.

## Mobile QA result

`devices["iPhone 13"]` viewport, all 10 required screenshots captured (1 pair — Yohei/Jin —
honestly noted as the same real screen at that world-tick, not staged separately), 11/11
mechanical checks PASS, human-eye review confirms the map and conversation both read as intended.
Mobile scroll fix applied and re-verified. Real on-device keyboard behavior remains unverified
(tooling limitation). `MOBILE_VISUAL_QA_V1.md`.

## Test totals

`tsc --noEmit` clean. `npm run build` clean, credential/endpoint absence re-confirmed. **Full
suite: 107/107 test files, 1574/1574 tests passing** (one environment-load-caused flaky run
explained and superseded by a clean re-run, matching the exact pattern already documented in PHASE
12.1). `tests/boundedGenerativeWorld.test.ts`'s 17 tests required zero changes and all pass,
directly confirming the generative core was not touched.

## What is still placeholder (directive Section 18's explicit non-negotiable)

Every visual element a player would see — the map canvas, all 5 location markers, all 3 character
portraits — is an engineering placeholder (flat colors, CSS gradients, single-kanji boxes). **None
of it is final art. VISUAL PRODUCT = TEMPORARY**, not PASS, regardless of how functionally correct
the layout is. Full inventory: `ART_ASSET_MANIFEST_V1.md`, `CODE_SELF_AUDIT_V1.md`.

## Whether real art generation can begin

**Yes.** `ART_ASSET_MANIFEST_V1.md`'s 4 required assets are fully specified (dimensions, aspect
ratio, background treatment, framing, text-baking policy) and each character brief
(`NPC_VISUAL_PRESENTATION_V1.md`) is sourced only from existing canon, with explicit "not
specified, use a plain default" markers where canon is silent — no further Code-side design work
blocks starting the image-generation step.

## Verdicts

| Verdict | Value |
|---|---|
| OPENING PRESENTATION | **PASS** (visual treatment); art status: N/A (no dedicated opening image requested) |
| MAP VISUAL SYSTEM | **PASS** (layout/contract); **TEMPORARY** (art) |
| CHARACTER PRESENTATION | **PASS** (layout/contract); **TEMPORARY** (art) |
| CONVERSATION UI | **PASS** |
| LIVE RESPONSE WAIT UX | **PASS** |
| LIFE MATERIAL VISIBILITY | **PASS** |
| NO DEV CONTAMINATION | **PASS** |
| MOBILE VISUAL QA | **PASS** (layout/legibility); keyboard behavior **UNVERIFIED** |
| VISUAL PRODUCT (overall, directive Section 18's rule) | **TEMPORARY** — cannot be PASS while all art is placeholder, regardless of layout correctness |
| REAL ART GENERATION READY TO BEGIN | **YES** |
| OWNER PLAY | **NOT RECOMMENDED THIS PHASE** — per directive Section 22, explicitly deferred until real assets are installed and Strategist separately decides readiness |

## Scope discipline

No commit was made this phase. No push, no deploy, no Owner Play conducted or recommended. No AI
architecture change, no prompt tuning — confirmed by an unmodified, fully-passing generative-core
test suite.
