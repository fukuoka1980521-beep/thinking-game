# Reveal Prose Mutation Test V1 — PHASE 11.13E

Directive Section 3: with structured reveal semantics unchanged, vary `concreteContent`; result
must remain identical. Then vary ONLY the structured registry with prose held constant; result
must change correctly. All tests in `tests/zeroProseAuthorityAudit.test.ts`.

## Prose held varied, structured facts fixed (registry says "does not leak")

| `concreteContent` variant | `evaluateLeftoverQuestionPrerequisite.targetFactKnown` | `evaluateRealLeftoverStockCausalClaim.novelFacts` |
|---|---|---|
| Real narration text (contains "祭り") | false | `["IS_FESTIVAL_LEFTOVER"]` |
| Contains the exact substring "祭りの残り" | false | `["IS_FESTIVAL_LEFTOVER"]` |
| Unrelated text | false | `["IS_FESTIVAL_LEFTOVER"]` |
| Empty string `""` | false | `["IS_FESTIVAL_LEFTOVER"]` |

**8/8 PASS** (2 evaluators × 4 variants) — all identical, including the variant containing the
literal historically-dangerous substring, proving prose no longer has any effect.

## Structured registry varied, prose held constant

`structuredFactsAssertedByRevealMaterial("leftover_stock_moved")` (the real, registered id) → does
NOT include `IS_FESTIVAL_LEFTOVER`. `structuredFactsAssertedByRevealMaterial("some_hypothetical_
other_reveal_id")` (unregistered, same hypothetical prose) → fail-closed, INCLUDES both facts. Same
underlying text content is irrelevant to either result — only the id (and its registry entry, or
lack of one) determines the outcome. **PASS.**

## Conclusion

Meaning follows the structured registry entry keyed by material id, in both directions
(prose-invariant-under-fixed-registry, and registry-changes-produce-correct-different-result) —
exactly the same invariant PHASE 11.13D proved for NPC responses, now also proven for the physical
reveal.
