# Strategist Semantic Root Audit Packet V1 — PHASE 11.13D

Evidence-packaging document for independent Strategist review, on top of the still-uncommitted
PHASE 11.13/A/B/C product repair (root-fix checkpoint
`f43d5345ef856ece5cb56c496ff515696514c6fc` unchanged). No self-judgment about fun/UX anywhere.

## Exact substring defect

PHASE 11.13C's UNKNOWN response text ("洋平は、これが祭りの残りかどうか分からないと答えた")
contained "祭りの残り" inside a negated clause; the evaluator's substring check misread it as
CONFIRM. The fix applied at the time (rewording the sentence) was itself rejected as insufficient
— authoritative truth must never depend on which words a human happened to choose.

## Selected structured representation

Three structurally distinct `LifeMaterial` ids (`LEFTOVER_RESPONSE_MATERIAL_IDS`), one per outcome
(`CONFIRM`/`DENY`/`UNKNOWN`), defined in `playableSceneContracts.ts`. The material's own `id` —
fixed at commit time, authored, never re-derived — is the sole authoritative signal.
`concreteContent` is now purely display/audit prose, free to say anything in any outcome. Full
rationale for choosing this over the two other candidates: `STRUCTURED_RESPONSE_SEMANTICS_V1.md`.

## Old vs. new authority path

Old: `targetFactKnown = concreteContent.includes("IS_FESTIVAL_LEFTOVER")` (substring search on the
committed material's own text). New: `targetStatus` derived purely from WHICH of three fixed
material ids is present in `state.materials` — zero text inspection of any response material.
Full trace: `PROSE_AUTHORITY_DECOUPLING_TRACE_V1.md`.

## CONFIRM/DENY/UNKNOWN/NO_RESPONSE truth table

| Outcome | answerReceived | targetStatus | targetFactKnown |
|---|---|---|---|
| NO_RESPONSE | false | UNRESOLVED | false |
| CONFIRM | true | KNOWN_TRUE | true |
| DENY | true | **KNOWN_FALSE** | false |
| UNKNOWN | true | UNRESOLVED | false |

`KNOWN_FALSE` is mechanically distinct from `UNRESOLVED` (different `targetStatus` value,
different `reason` string) — never collapsed. Full table: `RESPONSE_TRUTH_TABLE_V1.md`.

## Adversarial wording results

DENY committed with text literally containing "祭りの残り" ("いや、これは祭りの残りじゃないよ。")
→ `targetStatus: KNOWN_FALSE`, not `KNOWN_TRUE` — the exact adversarial shape directive Section 10
requires, passing. 4 UNKNOWN prose variants (one containing the historically-failing substring) all
→ `UNRESOLVED`. 3 CONFIRM paraphrases (none sharing the old exact substring) all → `KNOWN_TRUE`.
Formalized invariant: fixed-semantic/varied-prose → identical result; varied-semantic/near-identical-
prose → correct opposite result. 18/18 tests passing. Full detail:
`PROSE_MUTATION_ADVERSARIAL_TEST_V1.md`.

## Remaining prose-parsing authority risks

Exactly one accepted residual: `evaluateRealLeftoverStockCausalClaim`/
`evaluateLeftoverQuestionPrerequisite`'s reveal-leak check still substring-searches
`leftover_stock_moved`'s STATIC, author-controlled text — explicitly permitted by directive Section
13 (distinct from dynamic response resolution), never demonstrated unsafe, left unchanged. One
structural (non-prose) check in `languageAdapter.ts` classified SAFE_DISPLAY_ONLY. Full audit:
`AUTHORITATIVE_PROSE_PARSING_AUDIT_V1.md`.

## Real Product trace

The real, live scene reaches only the CONFIRM outcome (its one real captured line). Rendering is
byte-identical to PHASE 11.13C's own screenshots; debug evidence now shows `targetStatus:
"UNRESOLVED"` before asking and `"KNOWN_TRUE"` after, via the real commit seam, confirmed by a real
Playwright browser run.

## Full test totals

`tsc --noEmit` clean. **103/103 test files, 1512/1512 tests.** `npm run build` clean, dev-only
marker re-confirmed absent.

## Playwright result

`structured_response_regression_script.mjs` against a real dev server: **6/6 checks PASS**.

## Unresolved Product-only defects

`ASK_SALES`/`ASK_FESTIVAL` content redundancy (still unfixed, out of mandate); DENY/UNKNOWN remain
proven-but-unreached by any live dialogue branch (no branch was added, per scope limit); no
NPC-claim-vs-world-truth belief engine (documented simplification, not built).

## Final verdicts (directive Section 21)

| Verdict | Value |
|---|---|
| STRUCTURED RESPONSE AUTHORITY | **PASS** |
| PROSE / AUTHORITY DECOUPLING | **PASS** |
| KNOWN_TRUE / KNOWN_FALSE / UNKNOWN | **PASS** |
| DENY CASE | **PASS** |
| REAL EVENT ORDER | **PASS** (PHASE 11.13C's event order re-confirmed intact this phase) |
| SYSTEMIC CONTAMINATION BOUNDARIES | **PASS** |
| SMALL PLAYABLE SCENE | **OWNER_PLAY_CANDIDATE** |

## Owner gate (directive Section 22)

Changing Japanese prose cannot change authoritative meaning (proven: 3 CONFIRM paraphrases, 4
UNKNOWN variants, all stable; DENY with the literal target phrase still resolves KNOWN_FALSE). All
four outcomes (CONFIRM/DENY/UNKNOWN/NO_RESPONSE) are mechanically distinct through the real
Product response-commit seam, not only in isolated helpers. Both required conditions are met.
Owner human play is a reasonable next step, subject to the Strategist's own confirmation of this
packet, not self-declared as final here.
