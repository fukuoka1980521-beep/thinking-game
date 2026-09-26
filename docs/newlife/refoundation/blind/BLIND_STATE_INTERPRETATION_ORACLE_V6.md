# HIDDEN ORACLE — BLIND STATE INTERPRETATION MATRIX V6

Not linked from the matrix file. Not read by any blind run. Author-derived from V13 + V14 + V16 + V18 only.

```json
[
{"id":"W01","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"W02","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"W03","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"W04","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":["PUBLIC_SHAMING"],"needsClarification":false},
{"id":"W05","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"W06","action":"ASSIGN_REWRITE","boundaryMode":"AVOID","relationalEvents":["PERSONAL_INSULT","PUBLIC_SHAMING"],"needsClarification":false},
{"id":"W07","action":"OBSERVE","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"W08","action":"ASK_FACT","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"W09","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"W10","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W11","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W12","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W13","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W14","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE","KEEPS_PROMISE"],"needsClarification":false},
{"id":"W15","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE","PERSONAL_INSULT"],"needsClarification":false},
{"id":"W16","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W17","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":[],"needsClarification":false},
{"id":"W18","action":"FORCE_UNCONFIRMED_PLAN","boundaryMode":"CROSS_WITHOUT_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"W19","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"W20","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PUBLIC_SHAMING"],"needsClarification":false},
{"id":"W21","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":["THREAT"],"needsClarification":false},
{"id":"W22","action":"USE_UNDERSTUDY","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"W23","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W24","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W25","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"W26","action":"CLARIFY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":true},
{"id":"W27","action":"ASK_BOUNDARY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":false},
{"id":"W28","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"W29","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["DISMISSES_CONCERN"],"needsClarification":false},
{"id":"W30","action":"ASSIGN_REWRITE","boundaryMode":"AVOID","relationalEvents":["FALSE_ATTRIBUTION"],"needsClarification":false}
]
```

## Rationale notes (author-only, not shown to blind runs)

- **W01-W03** test the V18 §1.1 Step-2(a) categories not in V16's original six examples: noun+copula name-calling (バカだ), fixed idiom (頭おかしい), na-adjective/noun-copula worth-judgment (最低だ). All three satisfy Step 1 (subject = named person) and Step 2(a) → PERSONAL_INSULT. ACTION=OTHER by elimination (directed statement about a named person, no request/plan, doesn't fit ASK/PROPOSE/OBSERVE).
- **W02** additionally checks that PERSONAL_INSULT does not require the target's physical presence (V13 §2 says "directed at or clearly referring to," not "said to their face"), while PUBLIC_SHAMING would still fail here since Mika (the target) is absent — only Ryo is present.
- **W04/W09/W19/W20** test Step-2(b): compound/auxiliary verbs (グズグズしてる) and plain action verbs (サボってる, 渋ってる) never satisfy PERSONAL_INSULT regardless of causal-blame framing, delivery publicness, or register. W19/W20 is the public/private minimal pair proving PUBLIC_SHAMING's presence test is trait-independent (identical wording, only third-party presence differs the outcome).
- **W05/W06** carry forward V16 §1's own explicit combo example ("美香のわがままのせいで…") verbatim to confirm V18 didn't regress it: nominalizing a trait noun as the stated cause still satisfies Step 2(a) because わがまま is itself a personal-trait noun, distinct from W07/W28's "way of deciding/thinking" (方-suffixed method nouns), which fail Step 1 because the predicate's subject is the abstract approach, not the person.
- **W07/W28** are the closed-rule's key negative-control pair: a trait word (身勝手, 自己中) grammatically predicated of a method/approach noun (決め方, 考え方) rather than directly of the person. This is the sharpest edge of the Step-1 subject test and the case most likely to produce real (non-register-biased) classifier disagreement — that is expected and acceptable; it is not a register-fairness violation if both W07 and W28 land the same way.
- **W08** is a deliberate near-miss for the idiom rule: 頭痛い ("head hurts," literal) is lexically and semantically distinct from the idiom 頭がおかしい ("out of one's mind"). A classifier that over-generalizes "頭 + adjective near a person" into an automatic insult trigger will fail this case; a classifier applying the actual idiom (not a keyword match) will not.
- **W10-W13** test the V18 §2.1/§2.2 corrective-action ACTION mapping (APOLOGIZE_AND_REPAIR) for PUBLIC_SHAMING and FALSE_ATTRIBUTION strains specifically, including W11 as the "apology component alone, no operational follow-through in the same turn" case — per the matrix's explicit instruction, this must classify identically to W10 on ACTION and relationalEvents (both APOLOGIZE_AND_REPAIR / [ACKNOWLEDGES_MISTAKE]); only BOUNDARY_MODE differs (W10=AVOID from its stated plan, W11=NOT_RELEVANT with no plan stated). A run that tries to withhold ACKNOWLEDGES_MISTAKE from W11 because "it wasn't completed" is conflating detection with the downstream completion judgment the matrix instructions explicitly rule out of scope.
- **W14** tests V16 §6.5's REPAIR+RELIABILITY same-turn case at the classification layer: both ACKNOWLEDGES_MISTAKE and KEEPS_PROMISE must be reported; which one "wins" a relationship-state transition is explicitly not the classifier's job.
- **W15/W16** regress V14 §4 (apology+insult, STRAIN wins downstream but both events reported) and the causal-blame-verb protection under an apology frame — confirming V18 §1 didn't narrow the verb exemption when paired with an apology.
- **W17/W18/W21/W22** regress the V14 §5 RECONSIDER/CROSS_WITHOUT_PERMISSION distinction and THREAT-vs-neutral-fallback, unchanged by V18 (V18 does not touch these definitions) — included as a control that the successor patch has no unintended spillover into V14's mechanics.
- **W23/W24** is the register-fairness pair (gate 5) for the new §2.1 corrective-action path specifically — polished vs. blunt phrasing of the identical PUBLIC_SHAMING correction must produce identical output.
- **W25** regresses V13 §9/V14's relationship-state-note isolation rule under V18: a WITHDRAWN context note must not change how the turn itself is classified.
- **W26/W27** regress the V13 §4 / V17 S40-precedent distinction between ACTION-ambiguity (→ CLARIFY) and BOUNDARY_MODE-referent-ambiguity with a clear ACTION (→ UNKNOWN, needsClarification=false).
- **W30** is the one case testing that BOUNDARY_MODE and RELATIONAL_EVENTS remain independent outputs (V13 §1) even when a plan's *justification* is a false claim about consent: the plan's content (removing the real-story material) is boundary-safe on its face, so BOUNDARY_MODE=AVOID, while the fabricated-consent claim is captured entirely by FALSE_ATTRIBUTION rather than being smuggled into a CROSS_WITHOUT_PERMISSION reading. This is the least certain oracle entry (a defensible alternate reading exists) and is called out here in case a run's disagreement here should be treated as an open ontology question rather than a miss, matching the disclosure standard from V15/V17.
