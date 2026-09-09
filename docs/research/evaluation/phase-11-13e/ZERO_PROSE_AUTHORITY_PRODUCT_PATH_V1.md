# Zero Prose-Authority Product Path V1 — PHASE 11.13E

## The residual risk PHASE 11.13D left in place

`evaluateLeftoverQuestionPrerequisite`'s `revealAlreadyLeaksTarget` check, and
`evaluateRealLeftoverStockCausalClaim`'s `novelFacts` computation, both still called
`factsAssertedByMaterialConcreteContent(material.concreteContent)` — substring-searching
`leftover_stock_moved`'s human-readable narration text to decide a real Product-authoritative
outcome (whether `ASK_ABOUT_LEFTOVER_STOCK` is offered as a "genuine new possibility" at all).
PHASE 11.13D explicitly scoped this out as an accepted, lower-risk residual (static,
author-controlled text, never demonstrated unsafe). This phase removes it anyway, closing the
`PRODUCT_AUTHORITATIVE` prose-parser count to exactly 0.

## The fix

`REVEAL_MATERIAL_ASSERTED_FACTS: Record<string, string[]>` — a new registry in
`playableSceneContracts.ts`, authored once (`{ leftover_stock_moved: ["GOING_TO_DISCOUNT_SHELF"] }`
— deliberately omitting `IS_FESTIVAL_LEFTOVER`), keyed by material id, exactly the same pattern
PHASE 11.13D established for response outcomes (`LEFTOVER_RESPONSE_MATERIAL_IDS`). Both
`evaluateRealLeftoverStockCausalClaim` and `evaluateLeftoverQuestionPrerequisite` now call
`structuredFactsAssertedByRevealMaterial(material.id)` (structural lookup, zero text inspection)
instead of the old substring function.

## Fail-closed default

An unregistered material id resolves to `ALL_KNOWN_REVEAL_FACTS` (both facts, maximally leaky) —
an unaudited reveal can never be silently granted a causal unlock it was never verified to
deserve. Recorded honestly: this default is not reachable through either real evaluator's current
call site (both look up the material by a single fixed id first, so `material.id` is always that
same registered id if `material` is found at all) — it is defensive code, directly unit-tested in
isolation (`structuredFactsAssertedByRevealMaterial("some_hypothetical_other_reveal_id")`), not a
mechanism exercised by the live scene today.

## The deprecated function

`factsAssertedByMaterialConcreteContent` is NOT deleted (directive Section 1's "do not delete
globally" instruction, and this repo's standing practice of preserving defect evidence) — it
remains, unused, with a `@deprecated` doc comment explaining exactly why, and a regression test
(`tests/zeroProseAuthorityAudit.test.ts`) that fails if any call site to it ever reappears anywhere
under `src/`.

## Result

Zero Product-authoritative decisions in this scene now depend on parsing any material's
`concreteContent`, any NPC dialogue string, or any Actor Experience prose. Full grep audit:
this phase's `AUTHORITATIVE_PROSE_PARSING_AUDIT_V1.md` equivalent is folded into
`CODE_SELF_AUDIT_V1.md`'s verification section (re-run, confirmed 0 remaining authoritative call
sites).
