# Prose Authority Decoupling Trace V1 — PHASE 11.13D

## Old authority path (PHASE 11.13C, rejected)

```
commitLeftoverQuestionResponse(state, semantic)
  -> creates ONE material, id = "leftover_question_answered" (same id regardless of outcome)
  -> concreteContent = semantic === "CONFIRM_FESTIVAL_LEFTOVER" ? <confirm text> : <unknown text>

evaluateLeftoverQuestionPrerequisite(state)
  -> finds material by the SINGLE id
  -> targetFactKnown = factsAssertedByMaterialConcreteContent(material.concreteContent)
                          .includes("IS_FESTIVAL_LEFTOVER")
  -> i.e. re-derives the semantic by SUBSTRING-SEARCHING the material's own display text
```

**Failure mode, demonstrated:** the UNKNOWN branch's first-drafted text happened to contain the
substring "祭りの残り" (inside a negated clause), and the evaluator misread it as CONFIRM. Wording
determined authority.

## New authority path (PHASE 11.13D)

```
commitLeftoverQuestionResponse(state, outcome: "CONFIRM"|"DENY"|"UNKNOWN")
  -> creates a material whose id is CHOSEN FROM outcome via LEFTOVER_RESPONSE_MATERIAL_IDS
     (leftover_question_response_confirm / _deny / _unknown -- three distinct, fixed ids)
  -> concreteContent = display/audit prose ONLY, may say anything, including the literal target
     phrase, in ANY outcome

evaluateLeftoverQuestionPrerequisite(state)
  -> checks WHICH of the three fixed ids is present in state.materials (structural equality only)
  -> targetStatus = confirmed ? "KNOWN_TRUE" : denied ? "KNOWN_FALSE" : "UNRESOLVED"
  -> NEVER reads concreteContent of any response material
```

## Mechanical proof this is not a rename-only fix

- `tests/structuredResponseSemantics.test.ts`, "DENY with the literal target phrase MUST NOT be
  read as CONFIRM" — commits a DENY material whose `concreteContent` literally contains
  "祭りの残り" (the exact adversarial condition that broke the old path) and confirms
  `targetStatus === "KNOWN_FALSE"`, not `"KNOWN_TRUE"`. **PASS.**
- Same file, "prose mutation invariant" tests — CONFIRM with 3 different paraphrases (none
  containing the historically-failing substring in the SAME shape) all produce `KNOWN_TRUE`;
  changing ONLY the outcome (CONFIRM vs. DENY) with deliberately similar prose ("祭りの残りだ" vs.
  "祭りの残りじゃない") produces the correct opposite `targetStatus` each time. **10/10 PASS.**

## What remains text-based, and why (not a gap, a documented boundary)

`evaluateRealLeftoverStockCausalClaim`'s reveal-leak check and
`evaluateLeftoverQuestionPrerequisite`'s `revealAlreadyLeaksTarget` check still call
`factsAssertedByMaterialConcreteContent` — but only against `leftover_stock_moved`, the physical
reveal's own STATIC, author-controlled narrative (fixed once at authoring time, never a dynamic,
multi-outcome runtime response). No adversarial failure has ever been demonstrated for this
specific check; directive Section 13 explicitly permits it to remain. Full audit:
`AUTHORITATIVE_PROSE_PARSING_AUDIT_V1.md`.
