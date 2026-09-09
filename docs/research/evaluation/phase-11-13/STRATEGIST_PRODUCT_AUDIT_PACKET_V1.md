# Strategist Product Audit Packet V1 — PHASE 11.13

Evidence-packaging document for independent Strategist review of the product repair, performed
entirely through the PHASE 11.12/11.12R systemic gates (root-fix checkpoint `f43d534`). No
self-judgment about fun/UX quality is made anywhere in this packet (directive Section 26).

## Root-fix checkpoint

Commit `f43d5345ef856ece5cb56c496ff515696514c6fc` (short `f43d534`), "research: contain QA and
debug product contamination" — created in the prior (PHASE 11.13's own Section 0) step of this Run,
before any product-behavior change. 42 files, scoped precisely to PHASE 11.12/11.12R work plus the
minimum PHASE 11.11 dependencies needed for buildability; `src/App.tsx` and all unrelated dirty
files excluded (see that commit's own message for the full rationale).

## Exact initial visible actions

手伝う ／ 今日はやめておく ／ 何を手伝えばいい？ ／ 祭りどうだった？ ／ その場を離れる — **5 buttons**
(directive Section 9's expected maximum), confirmed by real-DOM test and real-browser screenshot.

## ASK_WHAT result

Reply (now `SYSTEM_AUTHORED_PRODUCT_FIXTURE`): 「店先の箱を、値引き用の棚まで運んでくれるか。」— no
festival/towel mention. Disappears from the action list once answered (one-shot), and independently
once the request resolves via accept or decline.

## Causal physical reveal

ACCEPT narration (`NON_LLM_SYSTEM_NARRATION`): 「分かった、運ぶよ」と答えた。洋平と二人で、箱を値引
き用の棚まで運んだ。／棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。 — the
towels become visible; their status as leftover/unsold is deliberately not yet confirmed.

## Counterfactual before/after result

`evaluateRealLeftoverStockCausalClaim` (unchanged function, re-evaluated against the repaired
content): **`CAUSAL_UNLOCK_VALID`**, `novelFacts: ["IS_FESTIVAL_LEFTOVER"]`. Before the reveal, no
authoritative source states the box is festival leftover; after, the follow-up question's answer
(real captured Vertex line, unchanged) confirms it — a genuinely novel fact, not a state-gated
rehash.

## Contextual SALES flow

`ASK_SALES_SCENE` is absent from the initial action list; becomes eligible only after `ASK_FESTIVAL`
is asked (`HAS_ASKED_FESTIVAL` precondition, reusing `experienceLog`). Confirmed via real-DOM test
and real-browser screenshot (absent → present after ASK_FESTIVAL).

## Decline dialogue + continuation

SOCIAL RESPONSE (two distinct lines, both rendered): 「ごめん、今日はちょっと」と、答えた。／「ああ、
分かった。じゃあ俺でやるよ」と、洋平は言った。 NPC INDEPENDENT CONTINUATION (separate `<div>`,
unaffected by the decline specifically): 洋平は、一人で値引き用の棚の準備を続けている。 — the two are
never merged into one narration entry.

## Post-resolution action lists

| State | Ask-actions rendered |
|---|---|
| Initial | 何を手伝えばいい？, 祭りどうだった？ |
| After ASK_FESTIVAL | 何を手伝えばいい？, 祭りどうだった？, 売れ行きどうだった？ |
| After ASK_WHAT | 祭りどうだった？ (+ 売れ行きどうだった？ if festival already asked) |
| After ACCEPT | 祭りどうだった？, (売れ行きどうだった？ if asked,) これ、祭りの残り？ |
| After DECLINE | 祭りどうだった？, (売れ行きどうだった？ if asked) |

`ASK_WHAT` and `ASK_WEATHER` never appear once resolved/excluded, in any state, in any order.

## ProductSurface / QA / debug regression results

- **ProductSurface:** PASS — real weather probe still rejected by ownership; synthetic
  `QA_UNKNOWN_MEMORY_PROBE` still rejected via the generic fail-closed default.
- **QA coverage:** PRESERVED — `testProbes.ts`/`invokeTestProbe` unaffected, unchanged, still
  passing.
- **Debug boundary:** PASS — dev-only disclosure absent from the primary surface and from the
  production bundle (`npm run build` re-grepped, marker not found), present in the dev/debug
  evidence surface.

## Full test/build totals

`tsc --noEmit`: clean. `npx vitest run`: **99/99 files, 1474/1474 tests**. `npm run build`: clean.
Real-browser Playwright visual QA: **17/17 checks PASS**.

## Unresolved product defects

See `CODE_SELF_AUDIT_V1.md`'s "Unresolved product defects" section — CSS-only visual hierarchy
(no icon system), `ASK_FESTIVAL`/`ASK_SALES` remain infinitely re-askable with identical verbatim
answers (directive-sanctioned, not fixed), and one interpretive judgment call on how literally to
read directive Section 6/8's reveal-content wording (documented in `CODE_SELF_AUDIT_V1.md`).

## Final verdicts (directive Section 26)

| Verdict | Value |
|---|---|
| SYSTEMIC BOUNDARIES | **PASS** |
| CAUSAL NEW POSSIBILITY | **PASS** |
| PLAYER KNOWLEDGE CAUSALITY | **PASS** |
| DECLINE SOCIAL COMPLETENESS | **PASS** |
| POST-RESOLUTION UI CONSISTENCY | **PASS** |
| CONTEXTUAL CONVERSATION | **PASS** |
| STATIC MENU REDUCTION | **PASS** (7 → 5 initial actions; the underlying QA-only action stays systemically excluded, not manually removed) |
| RESEARCH / DEBUG SEPARATION | **PASS** |
| SMALL PLAYABLE SCENE | **STRATEGIST_AUDIT_READY** |

No FUN PASS is claimed anywhere in this packet.

## Whether Owner human play is recommended next

Per directive Section 24, this packet returns evidence to the Strategist first; it does not itself
recommend Owner play. If the Strategist's own read of the linked evidence (this packet,
`PRODUCT_SCENE_REPAIR_SPEC_V1.md`, `PRODUCT_SEMANTIC_TRANSCRIPTS_V1.md`, `PRODUCT_VISUAL_QA_V1.md`,
`SYSTEMIC_BOUNDARY_REGRESSION_V1.md`, `CODE_SELF_AUDIT_V1.md`) confirms the 4 conditions directive
Section 24 lists (systemic boundaries intact, causal new possibility real, decline feels socially
complete, static-menu behavior materially reduced, no QA/debug contamination reappeared), Owner
play would be the natural next step — that confirmation is the Strategist's to make, not
self-declared here.
