# HIDDEN ORACLE — BLIND STATE INTERPRETATION MATRIX V8

Not linked from the matrix file. Not read by any blind run. Author-derived from V13 + V14 + V16 + V18 + V20 + V22 only.

```json
[
{"id":"Y01","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"Y02","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"Y03","action":"FORCE_UNCONFIRMED_PLAN","boundaryMode":"CROSS_WITHOUT_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"Y04","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"Y05","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE","PERSONAL_INSULT"],"needsClarification":false},
{"id":"Y06","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y07","action":"COMMIT_PLAN","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y08","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y09","action":"PROPOSE_REWRITE","boundaryMode":"SEEK_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"Y10","action":"ASSIGN_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y11","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y12","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y13","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"Y14","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Y15","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Y16","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PUBLIC_SHAMING"],"needsClarification":false},
{"id":"Y17","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":[],"needsClarification":false},
{"id":"Y18","action":"FORCE_UNCONFIRMED_PLAN","boundaryMode":"CROSS_WITHOUT_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"Y19","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":["THREAT"],"needsClarification":false},
{"id":"Y20","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE","PERSONAL_INSULT"],"needsClarification":false},
{"id":"Y21","action":"COMMIT_PLAN","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y22","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"Y23","action":"USE_UNDERSTUDY","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Y24","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Y25","action":"ASK_BOUNDARY","boundaryMode":"SEEK_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"Y26","action":"ASK_BOUNDARY","boundaryMode":"DISCOVER","relationalEvents":[],"needsClarification":false},
{"id":"Y27","action":"CLARIFY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":true},
{"id":"Y28","action":"ASK_BOUNDARY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":false},
{"id":"Y29","action":"OBSERVE","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Y30","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false}
]
```

## Rationale notes (author-only, not shown to blind runs)

- **Y01-Y03** target V22 §1.2's eligibility test indirectly (state/history-note isolation, since eligibility itself is a deterministic-layer computation, not classifier output — per V20 §6/V22 §4's scoping note): Y01/Y02 give Ryo a "GUARDED, one earlier SEVERE_RUPTURE, never WITHDRAWN" history note (the exact case V21's audit found V20's "currently WITHDRAWN" gate would mishandle at the deterministic layer) and check that the *classifier* still reports the turn's own content correctly regardless — an apology+plan (Y01 → AVOID) and a fresh insult (Y02 → PERSONAL_INSULT) must classify identically to how they would with no history note at all. Y03 checks that a history note about Ryo has zero bearing on classifying an unrelated turn addressed to Mika (CROSS_WITHOUT_PERMISSION via the unambiguous 「そのままやってもらう」 override, per V14 §5).
- **Y04/Y05** regress the WITHDRAWN-note isolation control (V13 §9/V14, previously X27): Y04 mirrors X27 (apology+plan → AVOID); Y05 adds a fresh insult in the same turn with no plan content, which per the corrective-action-turn rule's own NOT_RELEVANT branch (no plan/boundary content beyond the apology) and the apology+insult co-occurrence rule (V14 §4, both events reported) must be `APOLOGIZE_AND_REPAIR` / `NOT_RELEVANT` / `[ACKNOWLEDGES_MISTAKE, PERSONAL_INSULT]` — matching the X23 pattern exactly (X23 also had apology+insult with no plan → NOT_RELEVANT, not AVOID). A run that outputs AVOID here has incorrectly carried Y04's plan content into Y05, which has none.
- **Y06-Y12** are the core V22 §3 test (PROPOSE_REWRITE vs. COMMIT_PLAN vs. ASSIGN_REWRITE): Y06 (hedged, けど) and Y08 (flat, no hedge at all) must both be PROPOSE_REWRITE — proving hedging particles are not what gates COMMIT_PLAN, absence of an explicit settle marker is. Y07 adds an explicit 決定 marker → COMMIT_PLAN, the direct contrast case. Y09 adds a confirmation-seeking question instead of a settle marker → stays PROPOSE_REWRITE, with BOUNDARY_MODE=SEEK_PERMISSION. Y10 delegates the rewriting work itself to Ryo by name → ASSIGN_REWRITE, distinguishing "settling what the plan is" from "assigning who writes it." Y11/Y12 is the register-fairness pair (gate 5) for this specific new distinction: a highly polite hedge and a blunt hedge, both lacking a settle marker, must both resolve to PROPOSE_REWRITE at the same rate — a run that reads Y11's politeness/formality as itself a "this is settled" signal and outputs COMMIT_PLAN would reintroduce exactly the tone-sensitivity this patch exists to prevent.
- **Y13/Y14** regress the closed PERSONAL_INSULT test with fresh wording: Y13 (頭おかしい, body-part-noun idiom, category a) → PERSONAL_INSULT; Y14 (ごねてる causal-blame, progressive/event predicate, category b) → no PERSONAL_INSULT, no DISMISSES_CONCERN (attributing delay to an action is not invalidating a stated concern).
- **Y15/Y16** regress the public/private PUBLIC_SHAMING minimal pair (gate 7) with fresh wording, unaffected by V22.
- **Y17-Y19** regress V14 §5/§6 (RECONSIDER vs CROSS_WITHOUT_PERMISSION, conditional-threat-as-pressure-not-override; gate 6), as a control that V22 has no unintended spillover into V14's mechanics — none of V22's sections touch this distinction.
- **Y20** regresses V14 §4 (apology+insult, both events reported, no plan present → NOT_RELEVANT), unaffected by V22.
- **Y21/Y22** are the indirect B4-adjacent probe: both give a context note framing the turn as "the operational completion of an earlier corrective action" for the PUBLIC_SHAMING branch (Y21) and the PERSONAL_INSULT/DISMISSES_CONCERN branch (Y22) respectively — the two branches V22 §2 gave a new `CORRECTIVE_ACTION_COMPLETION`-layer `resolvingReference` to, precisely because their completions are not themselves relational events. Per the matrix's explicit instruction, this framing note is deterministic-layer bookkeeping and must not add any relational event or change the turn's own classification: Y21 is a plain COMMIT_PLAN/AVOID turn (settle marker present, boundary-safe plan) with **no** relational event, and Y22 is a plain APOLOGIZE_AND_REPAIR/AVOID turn (apology + restated settled plan, inside boundary) with only ACKNOWLEDGES_MISTAKE — exactly as either would classify with no such framing note at all. A run that adds a synthetic relational event or changes ACTION/BOUNDARY_MODE because the note says "this completes a corrective action" has conflated the classification layer with the deterministic completion layer B4 exists to keep separate.
- **Y23/Y24** regress the NOT_RELEVANT/AVOID triad, unaffected by V22.
- **Y25/Y26** regress the DISCOVER/SEEK_PERMISSION pair, unaffected by V22.
- **Y27/Y28** regress the ACTION-ambiguity-vs-boundary-referent-ambiguity distinction, unaffected by V22.
- **Y29/Y30** regress the OBSERVE/OTHER pair with fresh wording, unaffected by V22.
