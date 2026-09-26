# NEW LIFE V17 — BLIND VALIDATION V5 + V16 AUDIT RESULT V1

Date: 2026-09-24
Status: VALIDATION RESULT / NO PRODUCT CODE / READY_FOR_IMPLEMENTATION = NO

## 0. What this covers

Requested by the "NEXT BLIND VALIDATION — V16 SPEC PATCH + V5" task, following directly from V15 (4/7 gates passed, `READY_FOR_IMPLEMENTATION=NO`):

1. `V16_CLASSIFIER_CLARIFICATION_PATCH_V1.md` — the smallest normative patch resolving V15's 6 named ambiguities (causal-blame vs trait-judgment PERSONAL_INSULT/DISMISSES_CONCERN; ASK_FACT vs ASK_BOUNDARY; OBSERVE vs OTHER; NOT_RELEVANT vs AVOID for understudy/substitution; DISCOVER vs SEEK_PERMISSION with a bundled mitigation candidate; the six undefined V13/V14 recovery-mechanics terms B1-B6).
2. `BLIND_STATE_INTERPRETATION_MATRIX_V5.md` (40 cases, S01-S40) targeting the repaired ambiguities plus regression probes for everything V14 already passed cleanly in V15.
3. A hidden oracle, not linked from the matrix.
4. 3 independent blind classification runs (A/B/C), each an isolated subagent instructed to read ONLY the matrix file.
5. Scoring against the V13 §10 acceptance gates.
6. A standalone blind design audit of V13+V14 as patched by V16, isolated to those three files only.

No product code, semantic/state types, or runtime logic was implemented. `chatgpt/newlife-phase34-human-playtest-repair` was not touched and is not part of this work. Regex was not used or proposed as the semantic engine anywhere in this validation.

---

## 1. Gate results

| Gate | Threshold | Result | Verdict |
|---|---|---|---|
| ACTION exact agreement | >=90% | 115/120 = 95.8% | **PASS** |
| BOUNDARY_MODE exact agreement | >=90% | 120/120 = 100% | **PASS** |
| Persistent-negative-event existence agreement | >=95% | 120/120 = 100% | **PASS** |
| Exact relational-event-set agreement | >=90% | 120/120 = 100% | **PASS** |
| No systematic polished-vs-rough gap | >10pp difference disqualifies | 0pp (S37/S38 pair) | **PASS** |
| RECONSIDER vs CROSS_WITHOUT_PERMISSION (11 targeted cases) | >=90% | 33/33 = 100% | **PASS** |
| Public/private PUBLIC_SHAMING (4 targeted cases) | >=95% | 12/12 = 100% | **PASS** |

**All 7 gates pass.** This is a substantial jump from V15 (4/7, ACTION 89.2%, BOUNDARY_MODE 89.2%, exact relational-event-set 87.3%). Every one of V15's 3 failing dimensions clears the threshold this round, and BOUNDARY_MODE / exact-event-set / existence-agreement all landed at a clean 100%.

**However, per this task's own instruction ("If ANY gate or design audit blocker fails, stop before implementation"), the standalone V16 design audit (§4 below) returned `MIXED_REVISE` with 3 blockers. Implementation stays blocked on the audit, not on the classifier gates.**

---

## 2. Oracle-authoring corrections (transparency)

Following the same disclosure standard as V15: while scoring, 4 of 40 cases showed all 3 independent runs unanimously disagreeing with the first-drafted oracle. Re-deriving each from V13/V14/V16 confirmed the oracle (not the runs) was wrong; these were corrected before final scoring (gate numbers above already reflect the corrected oracle):

- **S01** — action corrected `ASSIGN_REWRITE` -> `PROPOSE_REWRITE`. The utterance ("実話抜きの版を書くよ" — "I'll write a version without the real story") is first-person; the player is proposing to do it themself, not delegating to Ryo. Contrast with S02/S04, which explicitly name and instruct Ryo ("亮、直して") and correctly remain `ASSIGN_REWRITE` in the oracle — all 3 runs agreed with that distinction unprompted, which is good independent evidence the ASSIGN vs PROPOSE line tracks explicit third-party delegation language, not just rewrite-related content.
- **S14** — action corrected `ASSIGN_REWRITE` -> `PROPOSE_REWRITE`. Same reasoning: "美香にはそのままこの場面をやってもらう" keeps Mika performing (not rewriting), and the utterance is the player stating a plan, not delegating rewrite work to a third party.
- **S32** — action corrected `FORCE_UNCONFIRMED_PLAN` -> `REQUEST_RECONSIDERATION`; boundaryMode corrected `CROSS_WITHOUT_PERMISSION` -> `RECONSIDER`. This is the exact same sentence as V4's U20 ("そのままやらないなら、もう舞台から外すぞ"), which V15 already corrected for the identical reason: it is a conditional threat ("if you don't, then X"), not a declaration that the plan is proceeding as-is. I mis-transcribed the pre-correction (wrong) reading from V13's THREAT-definition example into the V5 oracle instead of carrying forward V15's own correction. All 3 runs independently reproduced V15's correct reading.
- **S40** — action corrected `CLARIFY` -> `ASK_BOUNDARY`; needsClarification corrected `true` -> `false`. S40 was designed to test genuine boundary-*referent* ambiguity (which of two live topics "それ" refers to), but all 3 runs correctly distinguished this from ACTION-*type* ambiguity: the utterance is unambiguously a boundary/condition question ("without that, then?") even though which boundary is referenced is unclear. V13 §4 treats ACTION-ambiguity and BOUNDARY_MODE-ambiguity as separate defaults; this case only has the latter. `boundaryMode=UNKNOWN` (unchanged, all 3 runs agreed) already captures the referent ambiguity; forcing `ACTION=CLARIFY` on top of that conflated the two ambiguity types, which was a matrix-design error, not a genuine second ambiguity.

This is disclosed because it matters for how much weight to put on the gate numbers, exactly as in V15: the corrections moved *toward* the runs' answers, not away from them.

---

## 3. Remaining disagreements — not corrected, flagged as open ontology questions

Two case groups had non-unanimous (2/3) disagreement with the oracle. Per the same standard V15 used, non-unanimous disagreement is scored as a real miss, not silently corrected:

- **S15 / S37 / S38 — ASK_BOUNDARY vs PROPOSE_REWRITE for "bundled mitigation candidate" boundary questions.** Runs A and C classified all three as `ASK_BOUNDARY` (matching the oracle); run B classified all three as `PROPOSE_REWRITE`. `boundaryMode=SEEK_PERMISSION` was unanimous across all 3 runs and all 3 cases — V16 §5's core fix (recognizing a bundled candidate as SEEK_PERMISSION rather than DISCOVER) held perfectly. What's still open is only the ACTION label for that boundary-question shape: is naming a candidate condition inside a question still an ASK, or does naming the candidate itself make it a PROPOSE? Run B's answer was internally consistent across the register pair (S37 polished / S38 blunt), so this is a genuine ACTION-ontology question, not a register-bias symptom.
- **S23 — DELAY_DECISION vs REQUEST_RECONSIDERATION when a reconsideration request is bundled with a contingency plan.** ("聞いてみるけど、だめならどうするか一緒に考えよう" — "I'll ask, but if it doesn't work, we'll figure out what to do together.") Runs A and C read the contingency clause as dominant (`DELAY_DECISION`); run B read the "I'll ask" clause as dominant (`REQUEST_RECONSIDERATION`, matching the oracle). `boundaryMode=RECONSIDER` was unanimous across all 3 runs — this utterance never risked being misread as an override, which is what the RECONSIDER/CROSS_WITHOUT_PERMISSION gate (§1, gate 6) actually tracks, and that gate is unaffected.

Neither open question affects BOUNDARY_MODE, relational events, or the RECONSIDER/CROSS_WITHOUT_PERMISSION or PUBLIC_SHAMING gates — both are narrow ACTION-label questions confined to specific utterance shapes. Proposed smallest fix for a future patch: one disambiguating sentence each in V13 §1.A (does naming a candidate inside a boundary-question make it PROPOSE_REWRITE instead of ASK_BOUNDARY; does a bundled contingency plan make a reconsideration request DELAY_DECISION instead of REQUEST_RECONSIDERATION). Not required to close before the current gates are considered passed — they did not block any gate.

---

## 4. Standalone blind design audit — V13 + V14 as patched by V16

Run in isolation (only V13 + V14 + V16 in context, in that order). Verdict: **MIXED_REVISE**.

### Blockers

- **B-a.** The V16 §1 trait-word test (the core fix for causal-blame vs. PERSONAL_INSULT) is illustrated only with an "e.g." example list on both sides (trait words vs. action-verbs), not a closed lexicon or a formal grammatical rule. V13 §5 requires the model-proposed event to be checked by a *deterministic* validator; without a closed/exhaustive test, any word outside the six examples (バカ, 最低, 頭おかしい, a trait word applied to a decision rather than a person, etc.) has no defined resolution path, meaning the "deterministic" validator would still have to make an open-ended semantic call — the exact tone-leakage risk V16 §1 exists to close. (Note: the blind classification runs in this same round did not hit this gap empirically — all 3 runs agreed 100% on every relational-event case — but the audit is correct that the *rule as written* doesn't yet guarantee that outside this test set.)
- **B-b.** V16 §6.2's corrective-action taxonomy only covers 3 of V14 §3's 5 STRAIN triggers (DISMISSES_CONCERN+PERSONAL_INSULT, BREAKS_PROMISE, FALSE_ATTRIBUTION) — **PUBLIC_SHAMING has no defined corrective action at all**, and FALSE_ATTRIBUTION's branch is never mapped to a concrete ACTION value the way the other two are. This directly undercuts V16 §1's own flagship example (a STRAIN caused solely by PUBLIC_SHAMING, from causal-blame-with-a-third-party-present wording) — as written, a GUARDED state caused by exactly that example could never be cleared this case.
- **B-c.** The V16 §6.6 per-NPC schema's `causalEventHistory` has no resolved/cleared flag per logged event, but §6.3 describes REPAIR_WINDOW as targeting "the most recently logged **unresolved** STRAIN" and states that older unresolved STRAINs require their own separate clearing cycle — which presupposes a per-event resolved/unresolved status the schema doesn't actually provide a field for.

### Non-blocking risks (audit's own list, abbreviated)

Dialectal coverage of the eventual closed trait-word lexicon; no compound-utterance rule for OBSERVE/OTHER analogous to V14 §6's ACTION rule; hedged/tentative candidate proposals not distinguished from firm ones in §5; §6.4's reversible-STRAIN/unresolved-severe-rupture definitions are consistent only because no WITHDRAWN->GUARDED transition exists anywhere (should be commented, not just implied); §6.5's REPAIR+RELIABILITY worked example assumes a non-null RELIABILITY effect that V14 §3's own GUARDED->NEUTRAL precondition ("at least one corrective action has completed") may not yet satisfy in the same turn. The audit explicitly confirmed no new additive/combined scoring mechanic exists beyond two independent, non-interacting, reset-on-use counters — consistent with V16's no-morality-score claim.

### On fairness

The audit found V16 does not weaken V14 §7's tone/dialect/shortness-blindness and, if anything, reinforces it with structural (lexical-presence, candidate-naming) tests rather than tone inference — consistent with this round's empirical 0pp register gap (§1 gate 5) and 100% relational-event agreement (§1 gate 4).

---

## 5. Overall verdict

**GATES: 7/7 PASS. Design audit: MIXED_REVISE (3 blockers).**

`READY_FOR_IMPLEMENTATION = NO`, per this task's own conjunctive condition: implementation requires both all gates passing *and* the design audit having no blocker. The classifier ontology and matrix-authoring side is, for the first time in this iteration chain, fully clean — every gate that failed in V15 now passes, including two that went from a narrow miss to a clean 100%. What remains open is entirely on the V13/V14/V16 *specification's* own internal completeness, not on whether real classification runs can follow it: the recovery-mechanics patch (V16 §6) that was supposed to close B1-B6 leaves one STRAIN trigger (PUBLIC_SHAMING) with no path to recovery at all, and the trait-word test that empirically worked perfectly this round is not yet specified as a closed/deterministic rule.

**Proposed smallest V17-successor patch scope (not yet written, no product code):**
1. Close B-b: add a PUBLIC_SHAMING corrective-action definition to V16 §6.2 (e.g., a subsequent turn that both privately/publicly acknowledges the target was unfairly blamed in front of others and completes an operationally-validated action consistent with her stated boundary), and map FALSE_ATTRIBUTION's corrective action to a concrete ACTION value.
2. Close B-c: add a `resolved: bool` (or equivalent clearance pointer) per entry in `causalEventHistory`, or an explicit list of currently-unresolved STRAIN ids per NPC, to V16 §6.6.
3. Close B-a: either enumerate a closed trait-word lexicon for the vertical slice's cast, or state a POS/grammatical rule (e.g. "な-adjective/adjectival-noun predicate applied to the referent as a person" vs. "verb describing a bounded action") a deterministic validator can run without an open lexicon.
4. Optionally resolve the two flagged open ontology questions from §3 above (not gate-blocking, but cheap to close alongside the above).

None of these require touching the four-layer architecture, the event taxonomy, or the relationship-state machine, and none introduce additive scoring. Per this task's instruction, the next blind validation round (V6 matrix + fresh oracle + 3 isolated runs + a standalone audit of the successor patch) should be scoped once that patch exists, rather than executed speculatively against a patch that doesn't exist yet.

Implementation (semantic/state types, deterministic reducer, interpreter, NPC generation, thought tools, UI, replay — the V11 ordering) remains blocked. `chatgpt/newlife-phase34-human-playtest-repair` remains unmerged. No Owner input is required at this stage — every open item above is derivable from existing docs by a future validation round, not a product decision.
