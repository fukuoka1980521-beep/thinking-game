# Strategist Semantic Audit Packet V1 — PHASE 11.13A

Evidence-packaging document for independent Strategist review of the question-prerequisite-vs-
answer semantic correction, performed entirely on top of the still-uncommitted PHASE 11.13 product
repair (root-fix checkpoint `f43d5345ef856ece5cb56c496ff515696514c6fc` unchanged). No self-judgment
about fun/UX is made anywhere in this packet.

## Exact prior semantic contradiction

PHASE 11.13's own audit packet described the causal-unlock result as "the newly learned fact:
IS_FESTIVAL_LEFTOVER" at the moment immediately after ACCEPT — before the player had ever asked or
been answered. Read literally, this claims the player already knew the target fact at that point,
which would make the subsequent question 「これ、祭りの残り？」 not genuine information-seeking —
directly contradicting the scene's own design (the reveal deliberately withholds "leftover"
status). Full detail: `QUESTION_PREREQUISITE_ANSWER_BOUNDARY_V1.md`.

## Exact corrected fact distinction

- **QUESTION_PREREQUISITE (OBSERVED_EVIDENCE):** player has observed the opened box; festival-
  patterned towels are visible. Source: State Admission (`leftover_stock_moved` material).
- **QUESTION_TARGET_FACT:** the towels are specifically the festival's leftover/unsold stock.
  Source: Actor Experience (`experienceLog`, checked for the answer-dispatch's own write).

## Before/reveal/ask/answer state sequence (mechanically proven)

| State | Evidence | Target known | Eligible |
|---|---|---|---|
| Before ACCEPT | NO | NO | NO |
| After reveal, before asking | YES | NO | YES |
| After asking (dispatch), before reply renders | YES | NO (flips on the same event) | YES |
| After Yohei answers | YES | **YES** | YES (re-askable, explicitly marked "not a new discovery") |

## Real eligibility predicate

`evaluateLeftoverQuestionPrerequisite(state)` → `{ prerequisiteSatisfied, targetFactKnown, eligible,
reason }`. Does NOT change what renders (`applyCausalityGate` unchanged) — dev/debug evidence and
transcript/test infrastructure only, per directive Section 14's explicit "product scene should
remain simple."

## Counterfactual result

`CAUSAL_UNLOCK_VALID` (unchanged verdict, `evaluateRealLeftoverStockCausalClaim`, its comment
corrected) + the new prerequisite/target split now proves the SAME conclusion through an explicit,
separately-testable, dual-source model rather than a single ambiguously-named field.

## Other contextual-question audit result

Only `ASK_ABOUT_LEFTOVER_STOCK` required correction. `ASK_FESTIVAL`/`ASK_SALES` do not carry any
PREREQUISITE/TARGET claim (ordinary conversational sequencing, not evidence-gated hidden facts) —
left unchanged. One adjacent finding recorded, not acted on: `ASK_SALES`'s content, once unlocked,
is largely redundant with `ASK_FESTIVAL`'s answer (`CONTEXTUAL_QUESTION_AUDIT_V1.md`).

## Adversarial test result

6/6 (`tests/questionPrerequisiteBoundary.test.ts`) — cases A-F all pass, including F (a mislabeled/
leaked reveal correctly FAILS the invariant rather than silently passing).

## Full test totals

`tsc --noEmit` clean. **100/100 test files, 1480/1480 tests.** `npm run build` clean, dev-only
marker re-confirmed absent from `dist/`.

## Playwright result

`semantic_boundary_regression_script.mjs` against a real dev server: **8/8 checks PASS** — rendering
unchanged, new debug evidence present and correct, no knowledge-badge/evidence-label leakage onto
the primary player surface.

## Unresolved defects

`ASK_SALES`/`ASK_FESTIVAL` content redundancy (recorded, not fixed, out of mandate); leftover
question remains permanently re-askable (deliberate, matches sibling questions' design).

## Final verdicts (directive Section 18)

| Verdict | Value |
|---|---|
| QUESTION PREREQUISITE / ANSWER SEPARATION | **PASS** |
| LEFTOVER QUESTION CAUSALITY | **PASS** |
| PLAYER EXPERIENCE GROUNDING | **PASS** |
| CONTEXTUAL QUESTION AUDIT | **PASS** |
| SYSTEMIC CONTAMINATION BOUNDARIES | **PASS** |
| SMALL PLAYABLE SCENE | **OWNER_PLAY_CANDIDATE** |

## Owner gate (directive Section 19)

Conditions: (1) the question becomes available because the player gained a genuine clue/context
while the target answer remains unknown — **met**, mechanically proven above; (2) all systemic
contamination boundaries remain intact — **met**, re-confirmed this phase without modification.
Both conditions hold; Owner human play is now a reasonable next step, subject to the Strategist's
own confirmation of this packet's evidence, not self-declared as final here.
