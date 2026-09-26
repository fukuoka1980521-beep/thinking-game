# HIDDEN ORACLE — BLIND STATE INTERPRETATION MATRIX V9

Not linked from the matrix file. Not read by any blind run. Author-derived from V13 + V14 + V16 + V18 + V20 + V22 + V24 only.

```json
[
{"id":"Z01","action":"COMMIT_PLAN","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Z02","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"Z03","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"Z04","action":"FORCE_UNCONFIRMED_PLAN","boundaryMode":"CROSS_WITHOUT_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"Z05","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"Z06","action":"SUMMARIZE","boundaryMode":"NOT_RELEVANT","relationalEvents":["KEEPS_PROMISE"],"needsClarification":false},
{"id":"Z07","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"AVOID","relationalEvents":["ACKNOWLEDGES_MISTAKE"],"needsClarification":false},
{"id":"Z08","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Z09","action":"COMMIT_PLAN","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Z10","action":"ASSIGN_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Z11","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Z12","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Z13","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PERSONAL_INSULT"],"needsClarification":false},
{"id":"Z14","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Z15","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Z16","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":["PUBLIC_SHAMING"],"needsClarification":false},
{"id":"Z17","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":[],"needsClarification":false},
{"id":"Z18","action":"FORCE_UNCONFIRMED_PLAN","boundaryMode":"CROSS_WITHOUT_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"Z19","action":"REQUEST_RECONSIDERATION","boundaryMode":"RECONSIDER","relationalEvents":["THREAT"],"needsClarification":false},
{"id":"Z20","action":"APOLOGIZE_AND_REPAIR","boundaryMode":"NOT_RELEVANT","relationalEvents":["ACKNOWLEDGES_MISTAKE","PERSONAL_INSULT"],"needsClarification":false},
{"id":"Z21","action":"CUT_SCENE","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Z22","action":"PROPOSE_REWRITE","boundaryMode":"AVOID","relationalEvents":[],"needsClarification":false},
{"id":"Z23","action":"ASK_BOUNDARY","boundaryMode":"SEEK_PERMISSION","relationalEvents":[],"needsClarification":false},
{"id":"Z24","action":"ASK_BOUNDARY","boundaryMode":"DISCOVER","relationalEvents":[],"needsClarification":false},
{"id":"Z25","action":"CLARIFY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":true},
{"id":"Z26","action":"ASK_BOUNDARY","boundaryMode":"UNKNOWN","relationalEvents":[],"needsClarification":false},
{"id":"Z27","action":"OBSERVE","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false},
{"id":"Z28","action":"OTHER","boundaryMode":"NOT_RELEVANT","relationalEvents":[],"needsClarification":false}
]
```

## Errata (disclosed pre-scoring correction)

The first-drafted oracle for **Z06** was `{"action":"COMMIT_PLAN","boundaryMode":"AVOID",...}`, reasoning that a delivered revision "stays inside a known limit" the way a stated plan does. All 3 independent runs unanimously disagreed on `boundaryMode` (all three: `NOT_RELEVANT`), and 2 of 3 unanimously disagreed on `action` (`SUMMARIZE`, `SUMMARIZE`, `OBSERVE`). Re-deriving from the matrix's own rules confirms the runs: the corrective-action-turn rule ties `BOUNDARY_MODE=AVOID` to a turn that *states* plan content reshaped to stay inside a limit; Z06 states no new plan content at all, only that previously-committed work was delivered — the boundary content (if any) was fixed in an earlier, different turn, not this one. Per that rule's own fallback ("if the turn contains no plan/boundary-relevant content beyond [reporting completion], BOUNDARY_MODE = NOT_RELEVANT"), `NOT_RELEVANT` is correct. `SUMMARIZE` (2/3 majority) is adopted over `OBSERVE` (1/3) for `action`, since `OBSERVE` is reserved for a situational statement not naming a responsible party, whereas this turn reports the *player's own* completed, previously-committed action — a recap/status report, i.e. `SUMMARIZE`. Oracle corrected before scoring; scoring below uses the corrected value.

## Rationale notes (author-only, not shown to blind runs)

- **Z01-Z04** are the core V24 §1 closure probes. Z01-Z03 give Ryo a history note constructed exactly as the pre-V24 contradiction's disputed scenario: one earlier SEVERE_RUPTURE followed by a later STRAIN, currently GUARDED, never WITHDRAWN, with the note explicitly stating "most recent logged event is the STRAIN, not the SEVERE_RUPTURE" — the precise fact pattern where V16 §6.4's deleted first sentence and its Consequence sentence used to disagree. Since V24 §1 changes only which deterministic-layer eligibility test applies (a computation the classifier never performs — see V20 §6/V22 §4's scoping note, restated in this matrix's own rules), the classifier's job on Z01-Z03 is unaffected: each turn must classify purely on its own content, identically to how an otherwise-identical turn with no such note (or a simpler single-SEVERE_RUPTURE note, as in V8's Y01-Y03) would classify. Z01 (settle-marker plan) → COMMIT_PLAN/AVOID; Z02 (bare apology) → APOLOGIZE_AND_REPAIR/NOT_RELEVANT/[ACKNOWLEDGES_MISTAKE]; Z03 (fresh idiom insult, directed, no plan) → OTHER/NOT_RELEVANT/[PERSONAL_INSULT]. Z04 checks that this elaborate Ryo-side history note has zero bearing on an unrelated Mika turn (CROSS_WITHOUT_PERMISSION via the unambiguous 「このまま続けるよ」 override).
- **Z05** regresses V8's Y01 turn verbatim under an explicit "consumes window without transition" framing note (the literal V24 §1.2 step 3/5 outcome for an ineligible NPC) — must still classify as plain APOLOGIZE_AND_REPAIR/AVOID/[ACKNOWLEDGES_MISTAKE], proving the eligibility outcome itself (transition or no transition) never leaks into turn classification either.
- **Z06** targets V24 §2 (promiseBreakCount reset scoping) indirectly: the turn is a genuine KEEPS_PROMISE (existing ledger commitment, known deadline, fulfilled), framed explicitly as feeding a downstream reset decision. The classifier's task is unchanged by that framing — it must report KEEPS_PROMISE and classify the turn's own content (a settled/delivered revision, addressed to Ryo, staying within Mika's known limit) as COMMIT_PLAN/AVOID — and must not itself decide or hint at whether any counter resets, which is deterministic-layer-only per V24 §2.
- **Z07** targets V24 §1 for the WITHDRAWN-terminal case specifically: Mika has the same "earlier SEVERE_RUPTURE then later STRAIN" history shape as Z01-Z03, but is currently WITHDRAWN rather than GUARDED — the scenario closest to V16 §6.4's original deleted first sentence, which (read literally, most-recent-event-is-STRAIN) could have suggested "reversible." V24 removes that reading entirely; the NPC's WITHDRAWN/ineligible status is unaffected, and — regardless — this is a deterministic-layer fact the classifier does not compute. The turn itself (apology + boundary-safe plan) classifies identically to V8's Y04: APOLOGIZE_AND_REPAIR/AVOID/[ACKNOWLEDGES_MISTAKE].
- **Z08-Z12** regress V22 §3 (PROPOSE_REWRITE vs. COMMIT_PLAN vs. ASSIGN_REWRITE) with fresh wording, unaffected by V24, including the Z11/Z12 register-fairness pair (gate 5): both a highly polite hedge and a blunt hedge with no settle marker must resolve to PROPOSE_REWRITE at the same rate.
- **Z13/Z14** regress the closed PERSONAL_INSULT test with a fresh stative-resultative idiom (ひねくれてる, category a) against a fresh progressive causal-blame verb (渋ってる, category b), unaffected by V24.
- **Z15/Z16** regress the public/private PUBLIC_SHAMING minimal pair (gate 7) with fresh wording, unaffected by V24.
- **Z17-Z19** regress V14 §5/§6 (RECONSIDER vs CROSS_WITHOUT_PERMISSION, conditional-threat-as-pressure-not-override; gate 6) with fresh wording, as a control that V24 has no unintended spillover — none of V24's sections touch this distinction.
- **Z20** regresses V14 §4 (apology+insult, both events reported, no plan present → NOT_RELEVANT) with a fresh idiom, unaffected by V24.
- **Z21/Z22** regress the NOT_RELEVANT/AVOID triad with fresh wording, unaffected by V24.
- **Z23/Z24** regress the DISCOVER/SEEK_PERMISSION pair with fresh wording, unaffected by V24.
- **Z25/Z26** regress the ACTION-ambiguity-vs-boundary-referent-ambiguity distinction with fresh wording, unaffected by V24.
- **Z27/Z28** regress the OBSERVE/OTHER pair with fresh wording, unaffected by V24.
