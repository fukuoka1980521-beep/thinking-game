# NEW LIFE — BLIND STATE INTERPRETATION ORACLE V5

Do not give to blind reviewers. Not referenced by `BLIND_STATE_INTERPRETATION_MATRIX_V5.md`.

Format: id  action | boundaryMode | [relationalEvents] | needsClarification — then, where relevant, a rationale tied to V16.

S01 PROPOSE_REWRITE | AVOID | [] | false — causal blame ("騒いでる") has no trait word; private, no third party, so PUBLIC_SHAMING presence test also fails. [corrected post-scoring: ASSIGN_REWRITE -> PROPOSE_REWRITE, unanimous 3/3 — "書くよ" is first-person, not delegation to Ryo; see V17 §2]
S02 ASSIGN_REWRITE | AVOID | [PUBLIC_SHAMING] | false — same wording, target+1 third party present; no trait word so no PERSONAL_INSULT
S03 PROPOSE_REWRITE | AVOID | [PERSONAL_INSULT] | false — trait word わがまま present; private, no third party, so no PUBLIC_SHAMING
S04 ASSIGN_REWRITE | AVOID | [PUBLIC_SHAMING,PERSONAL_INSULT] | false — trait word + target/third-party present; downstream this is the explicit V13 §6 severe-rupture combo only when paired with PERSONAL_INSULT in the same public turn (V16 §1 last paragraph)
S05 OBSERVE | NOT_RELEVANT | [] | false — complaint targets the task ("この修正"), not a person; V13 control example, unchanged
S06 OTHER | NOT_RELEVANT | [PERSONAL_INSULT] | false — trait word わがまま, no causal-blame frame, no plan attached
S07 ASK_BOUNDARY | DISCOVER | [] | false — the fact requested (which part) directly defines the boundary's scope (V16 §2)
S08 ASK_FACT | NOT_RELEVANT | [] | false — schedule fact, unconnected to any refusal
S09 ASK_REQUIRED_FUNCTION | NOT_RELEVANT | [] | false — asks about dramatic function, not a person's limit
S10 OBSERVE | NOT_RELEVANT | [] | false — no named responsible party
S11 OTHER | NOT_RELEVANT | [] | false — names Mika as the cause, no request/plan, no trait word so no event
S12 USE_UNDERSTUDY | NOT_RELEVANT | [] | false — plan removes Mika from the task entirely (V16 §4, V13 §9 worked example)
S13 CUT_SCENE | NOT_RELEVANT | [] | false — task removed entirely
S14 PROPOSE_REWRITE | AVOID | [] | false — Mika still performs, reshaped to stay inside her stated limit. [corrected post-scoring: ASSIGN_REWRITE -> PROPOSE_REWRITE, unanimous 3/3 — Mika performs, not rewrites; no delegation language; see V17 §2]
S15 ASK_BOUNDARY | SEEK_PERMISSION | [] | false — names a specific candidate (change the real-story part) and asks if it resolves the refusal (V16 §5)
S16 ASK_BOUNDARY | DISCOVER | [] | false — no candidate proposed, pure probe
S17 REQUEST_RECONSIDERATION | RECONSIDER | [] | false
S18 REQUEST_RECONSIDERATION | RECONSIDER | [] | false
S19 REQUEST_RECONSIDERATION | RECONSIDER | [] | false — downstream: PRESSURE_AFTER_NO=2 world flag, not an override
S20 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
S21 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
S22 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
S23 REQUEST_RECONSIDERATION | RECONSIDER | [] | false
S24 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false
S25 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE,PERSONAL_INSULT] | false — downstream: STRAIN wins over REPAIR (V14 §2/§4); no REPAIR_WINDOW opens this turn
S26 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE,DISMISSES_CONCERN] | false — downstream: STRAIN wins
S27 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE] | false — downstream: REPAIR_WINDOW=OPEN (V16 §6.3)
S28 OTHER | NOT_RELEVANT | [PUBLIC_SHAMING] | false — target present + 1 third party (Ryo); no trait word so no PERSONAL_INSULT
S29 OTHER | NOT_RELEVANT | [] | false — target present, no third party: PUBLIC_SHAMING presence test fails; no trait word so no PERSONAL_INSULT either
S30 OTHER | NOT_RELEVANT | [PUBLIC_SHAMING] | false — target + 2 third parties present
S31 OTHER | NOT_RELEVANT | [] | false — target absent so PUBLIC_SHAMING fails; no trait word so no PERSONAL_INSULT (this resolves the V4/V15 U18-U19 inconsistency: causal-blame-only wording never creates PERSONAL_INSULT regardless of target presence, per V16 §1)
S32 REQUEST_RECONSIDERATION | RECONSIDER | [THREAT] | false — conditional threat ("if you don't, then X"), not a declared/executed override; THREAT co-occurring with RECONSIDER per V13 §9/V14 §5. [corrected post-scoring: originally mis-oracled as FORCE_UNCONFIRMED_PLAN/CROSS_WITHOUT_PERMISSION by reusing the pre-correction reading of this identical sentence from V4's U20, which V15 had already corrected the same way; unanimous 3/3; see V17 §2]
S33 USE_UNDERSTUDY | NOT_RELEVANT | [] | false — resigned/sarcastic tone alone is not THREAT; refusal already accepted
S34 REQUEST_RECONSIDERATION | RECONSIDER | [THREAT] | false — THREAT co-occurring with RECONSIDER, not override
S35 APOLOGIZE_AND_REPAIR | NOT_RELEVANT | [ACKNOWLEDGES_MISTAKE] | false — downstream: cannot repair WITHDRAWN this case (V14 §1); REPAIR_WINDOW opens but relationship stays WITHDRAWN
S36 FORCE_UNCONFIRMED_PLAN | CROSS_WITHOUT_PERMISSION | [] | false — downstream: SEVERE_RUPTURE table says WITHDRAWN -> WITHDRAWN; still correctly detected as an override attempt
S37 ASK_BOUNDARY | SEEK_PERMISSION | [] | false — bundled candidate, polished register
S38 ASK_BOUNDARY | SEEK_PERMISSION | [] | false — must match S37 despite blunt/dialectal register
S39 CLARIFY | UNKNOWN | [] | true — two live referents for "そこ," genuinely ambiguous
S40 ASK_BOUNDARY | UNKNOWN | [] | false — the referent of "それ" is ambiguous (boundary-mode ambiguity), but the ACTION type itself (asking about a conditional exception) is not ambiguous — this is a BOUNDARY_MODE-only ambiguity, not an ACTION ambiguity, per V13 §4's separate defaults. [corrected post-scoring: CLARIFY/needsClarification=true -> ASK_BOUNDARY/false, unanimous 3/3 on ACTION; matrix-design conflated referent-ambiguity with ACTION-ambiguity; see V17 §2]

---

## Gate-relevant groupings (for scoring, not for blind reviewers)

- Causal-blame/trait-word contrast (V16 §1): S01-S06
- ASK_BOUNDARY/ASK_FACT/ASK_REQUIRED_FUNCTION (V16 §2): S07-S09
- OBSERVE vs OTHER (V16 §3): S10-S11
- NOT_RELEVANT vs AVOID (V16 §4): S12-S14
- DISCOVER vs SEEK_PERMISSION (V16 §5): S15-S16, S37-S38
- Repeated RECONSIDER + conversion: S17-S20
- Compound request+execution utterances: S21-S24
- Apology+insult / apology+dismissal / clean apology: S25-S27
- Public/private identical blame wording (4-way): S28-S31
- Threat vs neutral fallback: S32-S34
- WITHDRAWN terminal behavior: S35-S36
- Register (polished/blunt) fairness pair: S37/S38
- Ambiguity defaults: S39-S40

RECONSIDER vs CROSS_WITHOUT_PERMISSION targeted cases: S17,S18,S19,S20,S21,S22,S23,S24,S32,S34,S36 (11 cases)
Public/private PUBLIC_SHAMING targeted cases: S28,S29,S30,S31 (4 cases)
Terse/dialectal vs polished pair for the >10pp fairness check: (S37,S38)
Persistent-negative-event existence targeted cases (does at least one negative event exist, y/n — independent of which specific event): S01-S06, S25-S32, S34, S36 (18 cases)
Exact relational-event-set agreement is scored across all 40 cases.

---

## Errata (post-scoring corrections and flags, dated 2026-09-24)

Corrected (unanimous 3/3, oracle-author error — see V17 §2 for full reasoning): S01, S14, S32, S40 (all four edited in place above).

Flagged, oracle NOT changed (non-unanimous 2/3 disagreement, open ontology question — see V17 §3):
- S15/S37/S38: ASK_BOUNDARY vs PROPOSE_REWRITE when a boundary question names a specific candidate condition. 2/3 runs match the oracle (ASK_BOUNDARY); 1/3 consistently prefers PROPOSE_REWRITE across the register pair (no register bias). boundaryMode=SEEK_PERMISSION was unanimous.
- S23: DELAY_DECISION vs REQUEST_RECONSIDERATION when a reconsideration request is bundled with a contingency plan. 2/3 runs prefer DELAY_DECISION; 1/3 matches the oracle (REQUEST_RECONSIDERATION). boundaryMode=RECONSIDER was unanimous.
