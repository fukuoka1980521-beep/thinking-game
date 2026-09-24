# NEW LIFE V21 — BLIND VALIDATION V7 + V20 AUDIT RESULT V1

Date: 2026-09-24
Status: VALIDATION RESULT / NO PRODUCT CODE / READY_FOR_IMPLEMENTATION = NO

## 0. What this covers

Requested by "CONTINUE REFOUNDATION — CLOSE V19 AUDIT BLOCKERS, THEN REVALIDATE," following directly from V19 (7/7 classifier gates passed, design audit `MIXED_REVISE` with 4 blockers B1-B4, `READY_FOR_IMPLEMENTATION=NO`):

1. `V20_CLASSIFIER_CLARIFICATION_PATCH_V3.md` — the smallest normative successor patch attempting to close exactly B1 (corrective-action completion has no deterministic transition trigger), B2 (PERSONAL_INSULT coverage for resultative -てる character idioms and copula-ellipsis name-calling), B3 (PUBLIC_SHAMING corrective action's witness-identity requirement), and B4 (`causalEventHistory` auditability overstatement) — plus the two non-blocking ontology questions V19 flagged as cheap to close alongside them. No new ACTION/BOUNDARY_MODE/event-taxonomy values were introduced; the four-layer architecture and relationship-state machine are unchanged.
2. `blind/BLIND_STATE_INTERPRETATION_MATRIX_V7.md` (30 cases, X01-X30) — a narrow regression matrix targeting the classifier-facing semantics V20 changed (resultative-idiom PERSONAL_INSULT coverage, copula ellipsis, APOLOGIZE_AND_REPAIR+restated-plan BOUNDARY_MODE, second-person OBSERVE/OTHER, witness-identity-insensitive classification) plus regression probes for everything V14/V16/V18 already passed cleanly in V17/V19. (B1 and B4 are deterministic-layer mechanisms, not classifier output, and are validated by the design audit below, not by this matrix — per V20 §6's own scoping note.)
3. A hidden oracle, not linked from the matrix.
4. 3 independent blind classification runs (A/B/C), each an isolated subagent instructed to read ONLY the matrix file.
5. Scoring against the V13 §10 acceptance gates (unchanged thresholds, per instruction).
6. A standalone blind design audit of V13+V14+V16+V18 as patched by V20, isolated to those five files only.

No product code, semantic/state types, or runtime logic was implemented. `chatgpt/newlife-phase34-human-playtest-repair` was not touched and is not part of this work. Regex was not used or proposed as the semantic engine anywhere in this validation.

---

## 1. Gate results — 7 of 7 pass

| Gate | Threshold | Result | Verdict |
|---|---|---|---|
| ACTION exact agreement | ≥90% | 87/90 = 96.7% | **PASS** |
| BOUNDARY_MODE exact agreement | ≥90% | 90/90 = 100% | **PASS** |
| Persistent-negative-event existence agreement | ≥95% | 90/90 = 100% | **PASS** |
| Exact relational-event-set agreement | ≥90% | 90/90 = 100% | **PASS** |
| No systematic polished-vs-rough gap | >10pp difference disqualifies | 0pp (X12/X13, X25/X26 pairs) | **PASS** |
| RECONSIDER vs CROSS_WITHOUT_PERMISSION (X18/X19/X20 × 3 runs = 9 checks) | ≥90% | 9/9 = 100% | **PASS** |
| Public/private PUBLIC_SHAMING (X05/X08/X21/X22 × 3 runs = 12 checks) | ≥95% | 12/12 = 100% | **PASS** |

All 3 independent runs produced **byte-for-byte identical output** across all 30 cases and all 4 fields — the only divergence from the oracle, in all 3 runs alike, was a single field on a single case (X17's ACTION value). This is the narrowest spread of any round to date.

**However, per this task's own instruction ("If any gate fails or audit still has a blocker, stop before implementation"), the standalone V20 design audit (§3 below) returned `MIXED_REVISE` with 2 blockers — and both are V20's own attempted fixes for V19's B1 and B4 failing to actually close them. Implementation stays blocked on the audit, not on the classifier gates.**

---

## 2. Oracle disagreement — unanimous 3/3, not corrected, flagged as open ontology question

**X17** — all 3 runs unanimously classified ACTION as `COMMIT_PLAN`; the drafted oracle read `PROPOSE_REWRITE`. Unlike prior rounds' unanimous-disagreement cases (e.g. V19 §2's W30), re-deriving from the normative text here does **not** favor the runs: X17's utterance («気にしすぎだよ、それ。まあ実話は外すけど») is a close paraphrase of V13 §9's own canonical worked example («気にしすぎ。まあ実話は外す»), which V13 §9 explicitly labels `ACTION: PROPOSE_REWRITE`. The added hedging (だよ、それ / けど) is exactly the kind of tone/register variation V13/V16/V18/V20 all state must not change ACTION classification. The oracle is kept as `PROPOSE_REWRITE`, and this is scored as a genuine (if narrow) 3/3 miss, not corrected.

At the same time, this is flagged as an **open, non-blocking ACTION-ontology question** for a future patch: the 3 isolated runs — which saw only the V7 matrix's restated rules, not V13 itself — had no access to that specific worked example and no stated rule distinguishing `PROPOSE_REWRITE` (a suggestion pitched for agreement) from `COMMIT_PLAN` (a decision the player treats as settled) for a plain declarative rewrite statement that has not yet been confirmed by the boundary-holder. This gap does not affect any gate (87/90 = 96.7% still clears the 90% ACTION threshold) and is independent of B1-B4; it is noted here for a future patch's scope, not acted on now.

---

## 3. Standalone blind design audit — V13 + V14 + V16 + V18 as patched by V20

Run in isolation (only V13 + V14 + V16 + V18 + V20 in context, in that order, treating each later document as normative over earlier ones on conflict). Verdict: **MIXED_REVISE**.

### Blockers

- **B1 is not closed — V20 §1.3 directly contradicts V16 §6.3.** V16 §6.3 states unconditionally that REPAIR_WINDOW consumption happens "whether or not that completion actually results in a relationship-state transition," using the non-reversible-STRAIN case as its own paradigm example of "completes, consumes the window, produces no transition." V20 §1.3's WITHDRAWN bullet says the opposite for the same shape of case: completion occurs but `repairWindow`/`resolved` are explicitly **not** touched. A deterministic validator cannot satisfy both instructions as written. Separately, V20 §1.3 gates its no-transition behavior on "is currently WITHDRAWN," but V16 §6.4 defines the actual disqualifying condition more broadly as "has ever had a SEVERE_RUPTURE-class event this case" — an NPC can have exactly one SEVERE_RUPTURE event while OPEN/NEUTRAL (transitioning only to GUARDED, never WITHDRAWN, per V14 §3's own SEVERE_RUPTURE table) and, per V16 §6.4, should be permanently barred from REPAIR/RELIABILITY GUARDED→NEUTRAL — but V20 §1.2's completion algorithm, as written, would fire that transition anyway for such an NPC, since it never checks "ever had SEVERE_RUPTURE," only current WITHDRAWN status.
- **B4 is not closed for 2 of its 4 branches.** `causalEventHistory` (V16 §6.6, unchanged) is scoped as "an append-only log of accepted **relational events**" — only V13 §2 RELATIONAL_EVENT entries are logged there. But the PERSONAL_INSULT/DISMISSES_CONCERN and PUBLIC_SHAMING corrective-action branches (V16 §6.2, V18 §2.1) complete via a subsequent **ACTION**-layer entry (COMMIT_PLAN / ASSIGN_REWRITE / executed PROPOSE_REWRITE) that is never logged as a `causalEventHistory` entry at all. V20 §4's `resolvingEntryId` has no real entry to point to for these two branches and stays null even after `resolved` flips true — reproducing, one level down, the exact "auditability claim overstates what the schema stores" problem V20 §4 was written to close. Only the BREAKS_PROMISE→KEEPS_PROMISE branch (a logged RELIABILITY event) and the FALSE_ATTRIBUTION branch (the correction is itself a logged ACKNOWLEDGES_MISTAKE/REPAIR event) get a genuinely populated pointer.

### Non-blocking risks

V20 §1.3's "independent effects" bullet (a corrective-action completion and a fresh REPAIR/RELIABILITY event both applying in the same turn) doesn't state evaluation order or a tie-break rule if the two computed target states ever diverge — the one worked example (§1.4) happens to converge, but convergence isn't proven in general, and this is adjacent to the B1 fix once made. V20 §2.1's "closed grammatical-aspect test" is a usable heuristic but slightly overstates its own closure claim — progressive-vs-resultative reading is a lexical property that a genuinely novel change-of-state verb (beyond the four named) would still need judgment to classify, similar in kind to (though narrower than) the gap V18 §1.1 was built to eliminate. V20 §3's relaxation is a self-acknowledged, explicitly scoped simplification for a 2-NPC cast — not a hidden gap.

### On fairness and architecture

The audit found B2 essentially closed (the resultative-idiom and copula-ellipsis extensions are sound, modulo the closure-claim nuance above) and B3 cleanly closed. No new inconsistency was found with the four-layer architecture, the event taxonomy, the relationship-state machine's four values, or the no-additive-score rule — B1/B4's problems are internal-consistency and schema-completeness gaps in the recovery mechanics specifically, not architecture or scoring regressions.

---

## 4. Overall verdict

**GATES: 7/7 PASS (narrowest spread yet — all 3 runs identical to each other on every field, 1 field miss out of 120 total data points). Design audit: MIXED_REVISE (2 blockers: B1 and B4 both still open, in a refined/narrower form than V19's originals).**

`READY_FOR_IMPLEMENTATION = NO`, per this task's own conjunctive condition. The classifier ontology continues to be empirically robust — three consecutive rounds (V17, V19, V21) at 7/7 gates, with this round's disagreement rate the lowest yet. What remains open is, for a third consecutive round, the specification's own internal completeness in the recovery mechanics rather than whether real classification runs can follow it. Both B1 and B4 are precise, citable textual contradictions/gaps this round's fresh audit surfaced in V20 itself — not vague concerns — which is the intended function of running the audit as a truly isolated fresh read rather than trusting the patch author's own closure claims.

**Proposed smallest V22-successor patch scope (not yet written, no product code):**
1. Close B1 properly: replace V20 §1.3's WITHDRAWN-specific bullet with a rule consistent with V16 §6.3's existing unconditional consumption behavior — completion always consumes `repairWindow` and sets the targeted entry's `resolved = true`, exactly as V16 §6.3 already states for the "non-reversible" case, regardless of whether a transition results. Separately, replace the "is currently WITHDRAWN" gate in V20 §1.2/§1.3 with V16 §6.4's actual, broader "has this NPC ever had a SEVERE_RUPTURE-class event this case" test, so an NPC who is GUARDED-but-post-SEVERE_RUPTURE (never reached WITHDRAWN) is correctly, permanently excluded from the completion transition, matching V16 §6.4 as already written.
2. Close B4 properly: extend V16 §6.6's `causalEventHistory` to also log a turn reference for a validated corrective-action operational-component completion (COMMIT_PLAN / ASSIGN_REWRITE / executed PROPOSE_REWRITE), not only V13 §2 relational events, so `resolvingEntryId` has a real, always-populatable target for all four corrective-action branches, not just the two that happen to complete via an already-logged relational event.
3. Optionally resolve the newly-flagged non-blocking ontology question from §2 above (PROPOSE_REWRITE vs. COMMIT_PLAN for an unconfirmed, hedged, first-person declarative rewrite statement) — cheap to close alongside 1-2, not gate-blocking.

None of these require touching the four-layer architecture, the event taxonomy, or the relationship-state machine's four values, and none introduce additive scoring. Per this task's instruction, the next blind validation round should be scoped once that successor patch exists rather than run speculatively now.

Implementation (semantic/state types, deterministic reducer, interpreter, NPC generation, thought tools, UI, replay — the V11 ordering) remains blocked. `chatgpt/newlife-phase34-human-playtest-repair` remains unmerged. No Owner input is required at this stage — every open item above is derivable from existing docs by a future validation round, not a product decision.
