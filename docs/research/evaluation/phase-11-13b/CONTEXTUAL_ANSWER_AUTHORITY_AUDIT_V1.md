# Contextual Answer Authority Audit V1 — PHASE 11.13B

Directive Section 13: recheck `ASK_FESTIVAL`, `ASK_SALES`, `ASK_ABOUT_LEFTOVER_STOCK` — does any
state get inferred from the player ASKING rather than from a legitimate authoritative answer?

## ASK_ABOUT_LEFTOVER_STOCK

**Corrected this phase.** Previously inferred `targetFactKnown` from the ask-only experience
record. Now uses a real authoritative answer material (`leftover_question_answered`), created by
the contract's own `stateDelta`. See `LEFTOVER_ANSWER_AUTHORITY_TRACE_V1.md`.

## ASK_FESTIVAL

`stateDelta: () => []` — no material of any kind is ever created. `eligibility: [ALWAYS]`. No
downstream logic anywhere in the codebase treats "player asked about the festival" as proof of any
fact beyond "the topic has come up" (used only to gate `ASK_SALES`'s eligibility — a conversational
sequencing check, not a knowledge claim). Confirmed by grep: `HAS_ASKED_FESTIVAL` is the only
consumer of `ASK_FESTIVAL_SCENE`'s experience-write string, and it only gates a DIFFERENT action's
availability, never claims a target fact is thereby known. **No state is inferred from asking
alone; no change needed.**

## ASK_SALES

`stateDelta: () => []` — same as `ASK_FESTIVAL`, no material ever created.
`eligibility: [HAS_ASKED_FESTIVAL]` gates on the ask-experience of a DIFFERENT question
(`ASK_FESTIVAL`), for the sole purpose of sequencing when `ASK_SALES` itself becomes offerable —
this is not a claim that asking about the festival taught the player the sales figures; it is
ordinary conversational unlocking, explicitly sanctioned by PHASE 11.13's own product design and
re-confirmed clean by PHASE 11.13A's `CONTEXTUAL_QUESTION_AUDIT_V1.md`. **No state is inferred from
asking alone; no change needed.**

## Conclusion

Only `ASK_ABOUT_LEFTOVER_STOCK` conflated "asked" with "answer authoritatively confirmed" —
because it is the only question in the scene that claims to reveal a genuinely new, previously-
unknown target fact. `ASK_FESTIVAL`/`ASK_SALES` make no such claim (they are ordinary,
always-truthful small talk; their eligibility gates are about conversational sequencing, not
epistemic discovery), so the QUESTION_ASKED/ANSWER_RECEIVED/TARGET_FACT_KNOWN distinction this
phase introduces does not apply to them, and they were correctly left unchanged.
