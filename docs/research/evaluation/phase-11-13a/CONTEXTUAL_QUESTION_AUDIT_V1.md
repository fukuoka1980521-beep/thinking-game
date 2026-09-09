# Contextual Question Audit V1 — PHASE 11.13A

Directive Section 11: inspect `ASK_SALES`, `ASK_ABOUT_LEFTOVER_STOCK`, and any other contextual
question in the repaired scene for the same PREREQUISITE-vs-TARGET conflation. Change only what
evidence supports; do not touch clean cases.

## ASK_ABOUT_LEFTOVER_STOCK

**Audited and corrected this phase.** See `QUESTION_PREREQUISITE_ANSWER_BOUNDARY_V1.md` and
`LEFTOVER_QUESTION_SEMANTIC_TRACE_V1.md`. This is the only contextual question in the scene that
carries an explicit "new possibility unlocked by a physical reveal" claim — the only one where a
PREREQUISITE/TARGET split is structurally meaningful, because it is the only one gated by *observed
evidence* rather than by *conversational context already exchanged*.

## ASK_FESTIVAL

**Not a PREREQUISITE/TARGET case — no change.** `eligibility: [ALWAYS]`, no hidden target fact is
ever claimed for it; it is presented as ordinary small talk from the first screen. Its answer
("8割くらいは売れたよ。残りは今値引きして出す準備してるところだ。") is not gated behind any prior
evidence or claimed as a "new discovery" — nothing here conflates having-context with
already-knowing-the-answer, because no claim of newness is made at all.

## ASK_SALES

**Not a PREREQUISITE/TARGET violation in the strict sense — eligibility is correctly modeled as
conversational context, not evidence-for-a-hidden-target.** `eligibility: [HAS_ASKED_FESTIVAL]`
gates on "has the topic come up in conversation," which is exactly what directive Section 11 itself
sanctions ("a legitimate contextual follow-up once the festival has come up in conversation") —
this is not a claim that the player has evidence for some still-secret fact; it is ordinary
conversational sequencing, the same category as "you can't ask a follow-up question about a topic
that hasn't come up yet." No PREREQUISITE/TARGET confusion applies because `ASK_SALES` was never
classified as revealing a "new possibility" (see `ACTION_OWNERSHIP_REGISTRY` in `productSurface.ts`
— only `ASK_ABOUT_LEFTOVER_STOCK` carries a causal-unlock claim at all).

**A separate, honestly-recorded finding, NOT a prerequisite/target violation:** `ASK_FESTIVAL`'s
real captured reply already states the ~80%-sold figure ("8割くらいは売れたよ。残りは今値引きして出
す準備してるところだ。"), and `ASK_SALES`'s real captured reply restates essentially the same figure
("8割ほどは売れたよ。残りの2割は、今から値引きして棚に並べるところだ。") — verified by direct read
of `capturedYoheiLines.ts` (lines with "8割"). So while `ASK_SALES`'s *eligibility* correctly models
conversational context (not a hidden-target claim), its *content*, once unlocked, is largely
redundant with what `ASK_FESTIVAL` already told the player. This is a **content-repetition
observation**, structurally different from the leftover-question's causality bug (no false "new
discovery" claim is made about `ASK_SALES` anywhere in the codebase or docs), and is explicitly
out of this phase's scope (directive's mandate is the PREREQUISITE/TARGET semantic boundary, not
general dialogue-content deduplication) — recorded here for a future product-repair phase, not
acted on now, per directive's own "do not change clean cases unnecessarily."

## Conclusion

Only `ASK_ABOUT_LEFTOVER_STOCK` required correction. `ASK_FESTIVAL` and `ASK_SALES` were left
unchanged — both are legitimately "conversation that remains independently valid," not evidence-
gated claims about hidden facts, and therefore the PREREQUISITE/TARGET invariant this phase exists
to fix does not apply to them. One adjacent, distinct finding (ASK_SALES content redundancy with
ASK_FESTIVAL) is recorded as a non-blocking observation for future work.
