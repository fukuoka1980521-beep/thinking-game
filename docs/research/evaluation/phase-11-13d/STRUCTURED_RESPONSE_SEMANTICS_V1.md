# Structured Response Semantics V1 — PHASE 11.13D

## The defect PHASE 11.13C left in place

The UNKNOWN response's first-drafted text ("洋平は、これが祭りの残りかどうか分からないと答えた")
contained the substring "祭りの残り" even though it denies/withholds confirmation — the naive
substring check (`factsAssertedByMaterialConcreteContent`) misread it as confirming. The "fix" at
the time was to reword the Japanese prose to avoid the substring. **This is not a root fix** — it
means authoritative truth still depended on which words a human happened to choose, and any future
rewording (including a genuinely correct one) could silently reintroduce the same failure.

## Central principle

**SEMANTIC AUTHORITY != DISPLAY/AUDIT PROSE.** The machine must already know the response's
semantics structurally, at commit time — human-readable text may describe that event for
audit/history purposes, but must never be parsed at read time to recover meaning.

## Response outcomes selected

`CONFIRM | DENY | UNKNOWN` (directive's own vocabulary, adopted verbatim — reusing, not renaming,
the concept `npcResponseCommit.ts` already had, per directive Section 6). `NO_RESPONSE` is
represented by ABSENCE of any response material at all, not a fourth enum value — matches the
existing, already-correct PHASE 11.13C design where "no entry in the semantics registry" already
meant "nothing gets committed."

## Target status: KNOWN_FALSE kept distinct from UNRESOLVED

`TargetFactStatus = "UNRESOLVED" | "KNOWN_TRUE" | "KNOWN_FALSE"`, added to
`QuestionPrerequisiteEvaluation` as `targetStatus`. `targetFactKnown: boolean` is kept for
backward compatibility, redefined precisely as `targetStatus === "KNOWN_TRUE"` — it does NOT mean
"the player knows something definitive" in general (a `KNOWN_FALSE` response is equally
definitive but leaves `targetFactKnown` false). Existing/earlier-phase callers that only ever
checked `targetFactKnown` for the CONFIRM case remain correct; anything needing to distinguish
DENY from "no answer yet" should read `targetStatus`.

## Selected structural representation (directive Section 7)

**Candidate B — distinct typed response-event IDs**, chosen over: (A) a structured field on the
material — rejected because `LifeMaterial` (`life-material-7day/types.ts`) is a SHARED, tracked
type used by other research modules; adding a scene-specific semantic field to it would be an
invasive, global change for a single scene's need. (C) existing structured event/result
metadata — no existing State Admission trace field is currently read back by scene logic after
commit; inventing a new read path for one would be less minimal than reusing the field every
material already has for identity: `id`.

`LEFTOVER_RESPONSE_MATERIAL_IDS: Record<StructuredResponseOutcome, string>` — three fixed,
mutually-exclusive material ids (`leftover_question_response_confirm/_deny/_unknown`), defined in
`playableSceneContracts.ts` (the natural shared home both the committer and the evaluator already
import from). The material's OWN `id` — a structural fact fixed at commit time, authored by
`npcResponseCommit.ts`, never re-derived — IS the authoritative signal.
`concreteContent` remains, for audit/history display only, and is now free to contain the literal
target phrase in EVERY outcome's text (including DENY/UNKNOWN) without risk, since nothing reads it
for authority anymore.

## World truth vs. NPC claim (directive Section 8)

Documented, not built: `NPC_RESPONSE = CONFIRM(X)` does not universally imply `WORLD_TRUTH = X` —
NPCs can be mistaken or lie. For THIS isolated scene, Yohei is the box's own owner and a legitimate
firsthand source about his own stock, so Product logic treats his CONFIRM as sufficient PLAYER
knowledge (`targetStatus = KNOWN_TRUE`) — a scene-specific, documented simplification, not a
general claim that NPC assertions are always world-true. No belief-tracking engine (separating
"what Yohei claimed" from "what is actually true") was built — out of scope, and this scene has no
demonstrated need for the distinction (nothing in the scene ever contradicts Yohei's claim).

## Reuse audit (directive Section 13)

`factsAssertedByMaterialConcreteContent` (substring-based) is NOT deleted. It remains the
evaluation method for `evaluateRealLeftoverStockCausalClaim`'s reveal-leak check and
`evaluateLeftoverQuestionPrerequisite`'s `revealAlreadyLeaksTarget` check — BOTH operate on
`leftover_stock_moved` (the physical reveal's own STATIC, author-controlled narrative), never on a
dynamic, multi-outcome NPC response material. This is the directive's own explicit distinction
(Section 13: "Question prerequisite / causal reveal may use structured observed facts. Response
target resolution must use structured response semantics.") Full call-site audit:
`AUTHORITATIVE_PROSE_PARSING_AUDIT_V1.md`.
