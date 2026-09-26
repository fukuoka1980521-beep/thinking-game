# HIDDEN ORACLE — BLIND STATE INTERPRETATION MATRIX V7

Not linked from the matrix file. Not read by any blind run. Author-derived from V13 + V14 + V16 + V18 + V20 only.

```json
[
{"id":"X01","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X02","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X03","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X04","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X05","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PUBLIC_SHAMING"],"needsClarification":false},
{"id":"X06","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X07","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X08","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT","PUBLIC_SHAMING"],"needsClarification":false},
{"id":"X09","action":"OBSERVE","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"X10","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X11","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X12","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X13","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X14","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X15","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"SEEK_PERMISSION","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X16","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["DISMISSES_CONCERN"],"needsClarification":false},
{"id":"X17","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":["DISMISSES_CONCERN"],"needsClarification":false},
{"id":"X18","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":[],"needsClarification":false},
{"id":"X19","action":"FORCE_UNCONFIRMED_PLAN","boundaryMode":"CROSS_WITHOUT_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"X20","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":["THREAT"],"needsClarification":false},
{"id":"X21","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"X22","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PUBLIC_SHAMING"],"needsClarification":false},
{"id":"X23","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE","PERSONAL_INSULT"],"needsClarification":false},
{"id":"X24","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X25","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X26","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"X27","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"X28","action":"CLARIFY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":true},
{"id":"X29","action":"ASK_BOUNDARY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":false},
{"id":"X30","action":"ASK_FACT","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false}
]
```

## Rationale notes (author-only, not shown to blind runs)

- **X01-X04** are the core V20 §2.1 test: resultative-aspect change-of-state verbs (腐る/ひねくれる/いかれる/歪む) predicated of a person's enduring character, either directly (X02/X03: 「美香、〜てるよ」) or via a personality-noun attribute standing in for P (X01/X04: 性格が〜), all satisfying Step 1 (subject resolves to Mika, directly or via the attribute carve-out already established for 頭おかしい in V6) and the newly-extended Step 2(a). All four → PERSONAL_INSULT.
- **X05** is the key contrastive control: ふざけてる is a progressive-aspect activity verb (an ongoing bounded behavior), grammatically parallel in surface form (-てる) to X01-X04 but aspectually distinct — this is the sharpest test of whether a classifier is doing the progressive/resultative distinction V20 §2.1 requires, or just pattern-matching "verb+てる, applied to person, negative connotation" as an insult trigger. Delivered with Ryo present, it still independently satisfies PUBLIC_SHAMING's presence test.
- **X06/X07** test V20 §2.2's copula-ellipsis rule: casual name-calling without だ carries the same category (a) status as the copula-explicit form already tested in V6 (バカだ). A classifier requiring an explicit copula token will fail these two and only these two.
- **X08** combines X02's resultative idiom with PUBLIC_SHAMING's presence test in one turn — both events must be reported together, exactly as V16 §1's original combo example (わがまま + public) already established for na-adjective trait words; this confirms the same combo behavior extends to the newly-added resultative-idiom category.
- **X09** is the Step-1 negative control for the resultative extension specifically: 歪んでる predicated of a scene (a situation, not a person) fails Step 1 regardless of Step 2, so PERSONAL_INSULT does not apply — a classifier over-generalizing "腐ってる/歪んでる = always an insult" regardless of subject will fail this case. No person is named as the cause of a problem (it's a scene critique, not blame), so ACTION=OBSERVE.
- **X10/X11** are the V20 §3 (closes B3) test: identical apology+plan content, differing only in who (if anyone) is present as a witness at the time of the acknowledgement — a different third party (X10) versus nobody at all (X11). Per the matrix's explicit instruction that witness identity is out of scope for classification, both must produce **identical** ACTION/BOUNDARY_MODE/relationalEvents output (APOLOGIZE_AND_REPAIR / AVOID / [ACKNOWLEDGES_MISTAKE]). The witness-presence distinction V20 §3 actually resolves lives entirely in the deterministic completion layer (whether this turn's corrective action is eligible to complete), which is out of scope for this matrix by design — see V20 §6's note that this mechanism is not tested via classifier output. A run that produces different output between X10 and X11 has smuggled a deterministic-layer judgment into the detection layer.
- **X12-X15** are the V20 §5.1 test (BOUNDARY_MODE for an APOLOGIZE_AND_REPAIR turn that also restates a plan): X12/X13 is a register pair (polished/blunt) for a boundary-safe restated plan → AVOID; X14 is the pure-apology-only control → NOT_RELEVANT; X15 restates a plan that names a specific candidate condition and asks for confirmation → SEEK_PERMISSION. All four confirm BOUNDARY_MODE tracks the plan's own content, not a blanket NOT_RELEVANT triggered by ACTION=APOLOGIZE_AND_REPAIR (the reading V19's Run B took and V20 §5.1 explicitly did not adopt).
- **X16/X17** are the V20 §5.2 test (OBSERVE vs OTHER for a second-person dismissive): X16 (no plan) → OTHER, extending V16 §3's third-party-blame framing to a direct second-person dismissal, per V20 §5.2. X17 adds a plan in the same turn — per the OBSERVE/OTHER rule's own carve-out ("if a plan/request/assignment is present... classify by that plan's own ACTION instead of OTHER"), this reverts to PROPOSE_REWRITE/AVOID, exactly matching V13 §9's original 「気にしすぎ。まあ実話は外す」example. Both cases carry DISMISSES_CONCERN regardless of the ACTION-label outcome.
- **X18/X19/X20** regress V14 §5/§6 (RECONSIDER vs CROSS_WITHOUT_PERMISSION, conditional-threat-as-pressure-not-override) unchanged by V20, as a control that the successor patch has no unintended spillover into V14's mechanics — none of V20's four sections touch this distinction.
- **X21/X22** regress the public/private PUBLIC_SHAMING minimal pair (gate 7) with fresh wording, unaffected by V20.
- **X23/X24** regress V14 §4 (apology+insult, both events reported, STRAIN wins downstream but that is not the classifier's job) using the new resultative-idiom insult (X23) and a causal-blame-but-not-trait verb (X24, ふざけてた) under an apology frame, confirming V20 §2 did not narrow or widen the verb exemption when paired with an apology.
- **X25/X26** is the register-fairness pair (gate 5) for the new resultative-idiom category specifically: a highly polite/formal delivery of the same 性格がひねくれている judgment must still register as PERSONAL_INSULT, at the same rate as the blunt delivery — confirming register-neutrality extends to the newly-added predicate category, not only to the categories V16/V18 already covered.
- **X27** regresses the WITHDRAWN-state-note isolation rule (V13 §9/V14) under V20: a WITHDRAWN context note must not change how the turn itself is classified, and the apology+boundary-safe-plan combination still resolves via V20 §5.1 to AVOID regardless of the relationship-state note.
- **X28/X29** regress the V13 §4 ACTION-ambiguity-vs-boundary-referent-ambiguity distinction, unaffected by V20.
- **X30** is a near-miss control for the resultative-aspect extension itself: 疲れてる is grammatically resultative (a change-of-state verb's -てる form describing a persisting state) but is not a negative enduring character/moral judgment — it is a sympathetic physical-state observation, structurally analogous to V6's W08 (頭痛い) near-miss for the idiom test. A classifier that over-generalizes "any resultative -てる form applied to a person is category (a)" will incorrectly flag this as PERSONAL_INSULT; a classifier applying V20 §2.1's actual test (does the state assert an enduring *character or mental* condition, not merely persist) will not.
