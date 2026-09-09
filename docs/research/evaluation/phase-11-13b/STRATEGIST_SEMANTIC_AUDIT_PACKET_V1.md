# Strategist Semantic Audit Packet V1 — PHASE 11.13B

Evidence-packaging document for independent Strategist review, on top of the still-uncommitted
PHASE 11.13/11.13A product repair (root-fix checkpoint `f43d5345ef856ece5cb56c496ff515696514c6fc`
unchanged). No self-judgment about fun/UX anywhere in this packet.

## Exact prior defect

PHASE 11.13A's `targetFactKnown` check used the ask-only `experienceLog` entry
("運んだ箱が祭りの残りかどうか、洋平に尋ねた") as proof the target was known. Traced precisely: this
entry is written unconditionally by `engine.ts`'s `resolveAction`, before the language adapter is
ever called — it proves only `QUESTION_ASKED`, not `TARGET_FACT_KNOWN`.

## Actual current event order

`resolveAction` (stateDelta → State Admission → experienceLog write) completes entirely BEFORE
`buildYoheiPacket`/`languageAdapter` are even called. The display string is structurally incapable
of influencing state. Full trace: `LEFTOVER_ANSWER_AUTHORITY_TRACE_V1.md`.

## Asked/answered/known representation

`ASK_ABOUT_LEFTOVER_STOCK` now has a real `stateDelta` creating `leftover_question_answered` (a
`LifeMaterial`, State Admission-admitted) — the authoritative answer record.
`evaluateLeftoverQuestionPrerequisite` now returns `{prerequisiteSatisfied, questionAsked,
answerReceived, targetFactKnown, eligible, reason}` — four genuinely distinct, separately-sourced
booleans (Actor Experience for `questionAsked`; State Admission for `answerReceived`/
`targetFactKnown`).

## Confirm/unknown/no-response variants

All 3 dispatched through the real, unmodified engine, using test-only synthetic contracts (no
real Product content changed, no new LLM calls):

| Variant | questionAsked | answerReceived | targetFactKnown |
|---|---|---|---|
| Real confirming answer | true | true | true |
| Synthetic "don't know" answer | true | true | **false** |
| Synthetic no response at all | true | **false** | false |

Full detail: `ANSWER_VARIANT_FALSIFICATION_V1.md`.

## Real leftover sequence

State 0 (before reveal) → all false. State 1 (after reveal) → prerequisite true, rest false.
State 2 (after the real ASK dispatch) → all true, atomically (single real answer path; synthetic
variants above prove the underlying logic does not assume this coincidence). Full table:
`LEFTOVER_ANSWER_AUTHORITY_TRACE_V1.md`.

## Other contextual-question audit result

`ASK_FESTIVAL`/`ASK_SALES` create no material from asking and infer no target-fact knowledge from
their own or each other's ask-records — their eligibility gates are ordinary conversational
sequencing, not epistemic claims. No change needed. `CONTEXTUAL_ANSWER_AUTHORITY_AUDIT_V1.md`.

## Test totals

`tsc --noEmit` clean. **101/101 test files, 1488/1488 tests.** `npm run build` clean, dev-only
marker re-confirmed absent from `dist/`.

## Playwright result

`answer_authority_regression_script.mjs` against a real dev server: **9/9 checks PASS** — no
rendering change; debug evidence correctly transitions all three booleans exactly across the real
ASK dispatch; no state-label leakage onto the primary player surface.

## Unresolved Product-only issues

`ASK_SALES`/`ASK_FESTIVAL` content redundancy (recorded, not fixed — out of mandate); the real
scene's three booleans remain atomically coupled in the one real dialogue path (by design — no
alternate branch was added, per directive's explicit prohibition on Product content changes).

## Final verdicts (directive Section 18)

| Verdict | Value |
|---|---|
| QUESTION_ASKED / ANSWER_RECEIVED SEPARATION | **PASS** |
| ANSWER_RECEIVED / FACT_KNOWN SEPARATION | **PASS** |
| LEFTOVER TARGET-FACT AUTHORITY | **PASS** |
| ACTOR EXPERIENCE SEMANTICS | **PASS** |
| SYSTEMIC CONTAMINATION BOUNDARIES | **PASS** |
| SMALL PLAYABLE SCENE | **OWNER_PLAY_CANDIDATE** |

## Owner gate (directive Section 19)

QUESTION_PREREQUISITE, QUESTION_ASKED, ANSWER_RECEIVED, and TARGET_FACT_KNOWN are no longer
semantically conflated anywhere in the tested scene (proven via real dispatch + synthetic
falsification, not merely renamed), and every prior systemic/product boundary remains intact,
re-confirmed without modification this phase. Owner human play is a reasonable next step, subject
to the Strategist's own confirmation of this packet, not self-declared as final here.
