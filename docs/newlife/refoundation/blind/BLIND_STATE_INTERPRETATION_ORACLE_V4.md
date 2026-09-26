# NEW LIFE — BLIND STATE INTERPRETATION ORACLE V4

Do not give to blind reviewers. Not referenced by `BLIND_STATE_INTERPRETATION_MATRIX_V4.md`.

Format: id  action | boundaryMode | [relationalEvents] | needsClarification  — then, where relevant, a downstream-only annotation (event class / relationship transition) that is NOT part of what a blind classifier is expected to output (per V13 §5, detection and state update are separate).

U01 ASK_BOUNDARY | DISCOVER | [] | false
U02 ASK_BOUNDARY | DISCOVER | [] | false
U03 PROPOSE_REWRITE | SEEK_PERMISSION | [] | false
U04 ASSIGN_REWRITE | SEEK_PERMISSION | [] | false
U05 REQUEST_RECONSIDERATION | RECONSIDER | [] | false
U06 REQUEST_RECONSIDERATION | RECONSIDER | [] | false
U07 REQUEST_RECONSIDERATION | RECONSIDER | [] | false  — downstream: PRESSURE_AFTER_NO=2 world flag, not a relational event, not an override
U08 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
U09 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
U10 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
U11 REQUEST_RECONSIDERATION | RECONSIDER | [] | false
U12 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
U13 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE,PERSONAL_INSULT] | false  — downstream: event class STRAIN wins over REPAIR (V14 §2/§4); no REPAIR_WINDOW opens this turn
U14 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE,DISMISSES_CONCERN] | false  — downstream: STRAIN wins
U15 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE] | false  — downstream: REPAIR_WINDOW=OPEN
U16 ASSIGN_REWRITE | AVOID | [PUBLIC_SHAMING] | false  — target present + 1 third party (Ryo) present
U17 PROPOSE_REWRITE | AVOID | [] | false  — target present, no third party: PUBLIC_SHAMING fails presence test; wording alone is not PERSONAL_INSULT (no negative character judgment, just a causal claim) and not DISMISSES_CONCERN (no explicit invalidation)
U18 OTHER | NOT_RELEVANT | [PUBLIC_SHAMING] | false  — target present + 2+ third parties
U19 OTHER | NOT_RELEVANT | [PERSONAL_INSULT] | false  — target absent so PUBLIC_SHAMING fails; "ごねてる" is a negative character judgment referring to Mika, so PERSONAL_INSULT applies regardless of her presence
U20 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [THREAT] | false  — downstream: SEVERE_RUPTURE (explicit THREAT used to compel a known refusal)
U21 USE_UNDERSTUDY | NOT_RELEVANT | [] | false
U22 REQUEST_RECONSIDERATION | RECONSIDER | [THREAT] | false  — THREAT co-occurring with RECONSIDER, not override; downstream STRAIN-class triggers on THREAT only via the explicit-THREAT severe-rupture rule regardless of boundary mode
U23 USE_UNDERSTUDY | NOT_RELEVANT | [] | false  — resigned/sarcastic tone alone is not DISMISSES_CONCERN or THREAT
U24 ASK_BOUNDARY | DISCOVER | [] | false
U25 ASK_BOUNDARY | DISCOVER | [] | false  — must match U24 despite terse/dialectal register
U26 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
U27 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false  — must match U26 despite blunt register
U28 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE] | false  — downstream: cannot repair WITHDRAWN this case (V14 §1); REPAIR_WINDOW opens but relationship stays WITHDRAWN
U29 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false  — downstream: SEVERE_RUPTURE transition table says WITHDRAWN -> WITHDRAWN; still correctly detected as an override attempt
U30 ASSIGN_REWRITE | AVOID | [KEEPS_PROMISE,PUBLIC_SHAMING] | false  — downstream: STRAIN wins over RELIABILITY (V14 §4 worked example); KEEPS_PROMISE logged as fact only
U31 OTHER | NOT_RELEVANT | [PUBLIC_SHAMING,PERSONAL_INSULT] | false  — downstream: explicit SEVERE_RUPTURE combo (PUBLIC_SHAMING + PERSONAL_INSULT same public turn)
U32 OTHER | NOT_RELEVANT | [THREAT] | false  — downstream: SEVERE_RUPTURE (explicit THREAT); WITHDRAWN -> WITHDRAWN
U33 CLARIFY | UNKNOWN | [] | true
U34 CLARIFY | UNKNOWN | [] | true

---

## Gate-relevant groupings (for scoring, not for blind reviewers)

- DISCOVER vs SEEK_PERMISSION: U01-U04
- Repeated RECONSIDER without conversion + the conversion point: U05-U08
- Compound request+execution utterances: U09-U12
- Apology+insult / apology+dismissal / clean apology: U13-U15
- Public/private identical blame wording: U16-U19
- Threat vs neutral fallback: U20-U23
- Terse/dialectal vs polished paraphrase pairs: U24/U25, U26/U27
- WITHDRAWN terminal behavior + event precedence: U28-U32
- Ambiguity defaults: U33-U34

RECONSIDER vs CROSS_WITHOUT_PERMISSION targeted cases: U05,U06,U07,U08,U09,U10,U11,U12,U20,U22,U26,U27,U29 (13 cases)
Public/private PUBLIC_SHAMING targeted cases: U16,U17,U18,U19 (4 cases)
Terse/dialectal vs polished pairs for the >10pp fairness check: (U24,U25), (U26,U27)

---

## Errata (post-scoring corrections, dated 2026-09-24)

Three independent blind runs (A/B/C) unanimously disagreed with the original oracle on several cases. Where all 3 runs agreed and the disagreement traces to a defensible re-reading of V13/V14 rather than a run error, the oracle below is corrected. Where the disagreement instead exposes a genuine open ontology question, the original oracle is kept and the case is flagged instead of silently changed. See the V15 result doc for full reasoning per case.

Corrected (unanimous 3/3, oracle-author error):
- U03: action corrected PROPOSE_REWRITE -> COMMIT_PLAN (the context already establishes the rewrite was proposed; this utterance is the commit-confirmation step)
- U04: action corrected ASSIGN_REWRITE -> COMMIT_PLAN (same reasoning)
- U17: action corrected COMMIT_PLAN(draft) -> PROPOSE_REWRITE; boundaryMode corrected AVOID -> SEEK_PERMISSION (the turn explicitly asks "それでいい?" before committing, which is SEEK_PERMISSION by definition, not AVOID)
- U20: action corrected FORCE_UNCONFIRMED_PLAN -> REQUEST_RECONSIDERATION; boundaryMode corrected CROSS_WITHOUT_PERMISSION -> RECONSIDER (the utterance is a conditional threat, not a declared/executed override — it does not state "we are proceeding as-is," only what happens if she refuses; V13's own THREAT example was cross-referenced too literally when this oracle was first drafted)
- U30: action corrected ASSIGN_REWRITE -> SUMMARIZE; boundaryMode corrected AVOID -> NOT_RELEVANT (the turn reports completed work, it does not assign or negotiate a boundary)
- U34: action corrected CLARIFY -> ASK_BOUNDARY; needsClarification corrected true -> false (the single-topic scene makes "それ" inferable as "the real story" even without an immediately preceding line; a true ambiguity case needs multiple live referents, as U33 has)

Flagged, oracle NOT changed (open ontology questions, see V15 result doc §"Findings"):
- U02: ASK_BOUNDARY vs ASK_FACT when the fact requested directly defines a stated boundary's scope
- U16/U17/U18/U19: whether causal-blame constructions ("~のせいで止まってる", "~がごねてるせいで") cross into PERSONAL_INSULT/DISMISSES_CONCERN — oracle keeps the V3-precedent reading (PUBLIC_SHAMING-only where presence conditions are met, no event otherwise) despite 3/3 runs adding a secondary event
- U18/U19: OBSERVE vs OTHER for pure reactive/blame statements with no actionable request
- U21/U23: oracle keeps NOT_RELEVANT per V13 §9's literal "neutral fallback" example, despite 3/3 runs independently preferring AVOID — the matrix file did not carry that worked example forward
- U24/U25: DISCOVER vs SEEK_PERMISSION when a boundary question names a specific candidate mitigation ("if we remove X, would that work?")
