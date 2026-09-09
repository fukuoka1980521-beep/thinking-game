# Answer Variant Falsification V1 — PHASE 11.13B

Directive Sections 9/10/12: falsify `asked == known` and `answered == known` as general
properties, without changing real Product content. All variants below are TEST-ONLY
(`tests/questionAnswerKnowledgeBoundary.test.ts`), dispatched through the real, unmodified engine
(`resolveAction`), never wired into `playableSceneContracts.ts` or the real UI. No new LLM calls.

## Variant: confirming answer (the real production contract, unchanged)

`ASK_ABOUT_LEFTOVER_STOCK` dispatched for real → `leftover_question_answered` material created,
`concreteContent`: "洋平が、この手ぬぐいは祭りの残りだと答えた" → `questionAsked: true,
answerReceived: true, targetFactKnown: true`. **PASS.**

## Variant: unknown/non-confirming answer (synthetic, directive Section 9)

`SYNTHETIC_UNKNOWN_ANSWER_VARIANT` — same contract shape, `stateDelta` creates the SAME material
id but with content "洋平にもよく分からないと言われた" (Yohei said he doesn't know either) instead
of confirming text. Dispatched through the real engine → `questionAsked: true, answerReceived:
true, targetFactKnown: false`, `reason` matches `QUESTION_ANSWER_RECEIVED_BUT_TARGET_NOT_CONFIRMED`.
**This falsifies `answered == known`: an answer was legitimately received, but it does not
establish the target proposition.**

## Variant: no response produced (synthetic, directive Section 10)

`SYNTHETIC_NO_RESPONSE_VARIANT` — same contract shape, `stateDelta: () => []` (no material at
all). Dispatched through the real engine → `questionAsked: true, answerReceived: false,
targetFactKnown: false`. **This falsifies `asked == known` (and `asked == answered`): the ask-only
experienceLog entry is still written unconditionally (matching the real engine's actual, traced
behavior — see `LEFTOVER_ANSWER_AUTHORITY_TRACE_V1.md`), but no authoritative response record
exists, so neither answerReceived nor targetFactKnown may be true.**

## Direct construction: ASK-record alone

A state containing ONLY the ask-experience entry (no answer material at all, constructed directly
rather than via dispatch, to isolate the claim) → `targetFactKnown: false`. **Confirms the
ask-record, by itself, cannot make the target known — matches directive Section 7's explicit
requirement that an ASK record must never be used as an ANSWER record.**

## Direct construction: ANSWER-record alone

A state containing ONLY the confirming answer material (no ask-experience entry) →
`questionAsked: false, answerReceived: true, targetFactKnown: true`. Demonstrates the two sources
are genuinely independent, not merely two names for the same underlying flag.

## LLM string cannot mutate authority

`evaluateLeftoverQuestionPrerequisite`'s signature accepts only `ContractV2State` — there is no
parameter through which `languageAdapter`'s return string could reach it. Verified structurally
(the function's result object contains exactly the fields `{prerequisiteSatisfied, questionAsked,
answerReceived, targetFactKnown, eligible, reason}`, none derived from any string parameter).

## Summary

| Falsification target | Result |
|---|---|
| `asked == known` | FALSIFIED (no-response variant: asked=true, known=false) |
| `answered == known` | FALSIFIED (unknown-answer variant: answered=true, known=false) |
| ASK record alone establishes target | FALSIFIED (ask-only construction: known=false) |
| ANSWER record alone (no ask) still establishes target | CONFIRMED (answer-only construction: known=true — the two sources are independent, not order-dependent) |
| LLM display text can influence authority | FALSIFIED by construction (no code path exists) |

8/8 tests passing (`tests/questionAnswerKnowledgeBoundary.test.ts`).
