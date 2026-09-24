# NEW LIFE V19 — BLIND VALIDATION V6 + V18 AUDIT RESULT V1

Date: 2026-09-24
Status: VALIDATION RESULT / NO PRODUCT CODE / READY_FOR_IMPLEMENTATION = NO

## 0. What this covers

Requested by "CONTINUE REFOUNDATION — CLOSE V17 DESIGN BLOCKERS, THEN REVALIDATE," following directly from V17 (7/7 classifier gates passed, design audit `MIXED_REVISE` with 3 blockers B-a/B-b/B-c, `READY_FOR_IMPLEMENTATION=NO`):

1. `V18_CLASSIFIER_CLARIFICATION_PATCH_V2.md` — the smallest normative successor patch closing exactly B-a (closed two-step grammatical trait-judgment test for PERSONAL_INSULT), B-b (PUBLIC_SHAMING and FALSE_ATTRIBUTION corrective-action definitions, both mapped to the existing `APOLOGIZE_AND_REPAIR` ACTION value), and B-c (a `resolved` field + lifecycle added to `causalEventHistory`). No new ACTION/BOUNDARY_MODE/event-taxonomy values were introduced; the four-layer architecture and relationship-state machine are unchanged.
2. `blind/BLIND_STATE_INTERPRETATION_MATRIX_V6.md` (30 cases, W01-W30) — a narrow regression matrix targeting only the semantics V18 changed (trait-judgment edge cases beyond V16's original six examples, corrective-action ACTION-value mapping for PUBLIC_SHAMING/FALSE_ATTRIBUTION, REPAIR+RELIABILITY same-turn detection) plus regression probes for everything V14/V16 already passed cleanly in V17.
3. A hidden oracle, not linked from the matrix.
4. 3 independent blind classification runs (A/B/C), each an isolated subagent instructed to read ONLY the matrix file.
5. Scoring against the V13 §10 acceptance gates (unchanged thresholds, per instruction).
6. A standalone blind design audit of V13+V14+V16 as patched by V18, isolated to those four files only.

No product code, semantic/state types, or runtime logic was implemented. `chatgpt/newlife-phase34-human-playtest-repair` was not touched and is not part of this work. Regex was not used or proposed as the semantic engine anywhere in this validation.

---

## 1. Gate results

| Gate | Threshold | Result | Verdict |
|---|---|---|---|
| ACTION exact agreement | ≥90% | 88/90 = 97.8% | **PASS** |
| BOUNDARY_MODE exact agreement | ≥90% | 87/90 = 96.7% | **PASS** |
| Persistent-negative-event existence agreement | ≥95% | 90/90 = 100% | **PASS** |
| Exact relational-event-set agreement | ≥90% | 90/90 = 100% | **PASS** |
| No systematic polished-vs-rough gap | >10pp difference disqualifies | 0pp (W23/W24 pair) | **PASS** |
| RECONSIDER vs CROSS_WITHOUT_PERMISSION (9 targeted checks: W17/W18/W21 × 3 runs) | ≥90% | 9/9 = 100% | **PASS** |
| Public/private PUBLIC_SHAMING (12 targeted checks: W05/W06/W19/W20 × 3 runs) | ≥95% | 12/12 = 100% | **PASS** |

**All 7 gates pass.** All 30 cases were classified identically by all 3 independent runs except for a small, concentrated set of 6 individual-field divergences across 5 cases (out of 90 × 4 fields = 360 total data points) — see §3.

**However, per this task's own instruction ("If any gate fails or audit still has a blocker, stop before implementation"), the standalone V18 design audit (§4 below) returned `MIXED_REVISE` with 4 blockers. Implementation stays blocked on the audit, not on the classifier gates — the same shape of result as V17.**

---

## 2. Oracle correction (transparency)

Following the same disclosure standard as V15/V17: while scoring, **W30** showed all 3 independent runs unanimously disagreeing with the first-drafted oracle on BOUNDARY_MODE (all three: `CROSS_WITHOUT_PERMISSION`; oracle draft: `AVOID`), and 2 of 3 runs additionally read ACTION as `FORCE_UNCONFIRMED_PLAN` rather than the drafted `ASSIGN_REWRITE`.

W30's utterance: 「美香はもう書き直せば大丈夫って言ってたから、これで進めよう。亮、頼む」, where the case's fact ledger establishes Mika never said this. My first-drafted oracle reasoned that since the *resulting plan content* (a rewrite without the real-story material) is boundary-safe on its face, BOUNDARY_MODE should track only that content (`AVOID`), with the fabrication captured separately as `FALSE_ATTRIBUTION`. All 3 independent runs rejected this: since the claimed agreement is fabricated, no genuine permission was ever obtained for proceeding — including for the modified plan — and the turn declares proceeding as decided ("これで進めよう"). That is a `CROSS_WITHOUT_PERMISSION` reading, not `AVOID`, and it matches V14 §6's own explicit compound-utterance precedent (a turn combining a request-shaped or plan-shaped clause with a declared/committed world action is classified by the highest committed action — `FORCE_UNCONFIRMED_PLAN` / `CROSS_WITHOUT_PERMISSION` — exactly the pairing the runs converged on). Re-deriving from V13/V14 confirms the runs, not the original oracle draft, applied the existing compound-utterance precedent correctly. **Corrected:** W30 action `ASSIGN_REWRITE` → `FORCE_UNCONFIRMED_PLAN`; boundaryMode `AVOID` → `CROSS_WITHOUT_PERMISSION`. Gate numbers above already reflect the corrected oracle. This was flagged in advance as the least-certain oracle entry in the oracle file's own authoring notes, precisely because a defensible alternate reading existed.

This matters for how much weight to put on the gate numbers, same as V15/V17: the correction moved *toward* the runs' unanimous answer, not away from it.

---

## 3. Remaining disagreements — not corrected, flagged as open ontology questions

Two case groups had non-unanimous (1-of-3) disagreement with the oracle. Per the same standard as prior rounds, non-unanimous disagreement is scored as a real miss, not silently corrected:

- **W10 / W23 / W24 — BOUNDARY_MODE for an APOLOGIZE_AND_REPAIR turn that also states or restates an operational plan.** Runs A and C classified all three `AVOID` (matching the oracle: the embedded plan stays inside Mika's stated limit). Run B classified all three `NOT_RELEVANT` (treating the turn's boundary relation as inapplicable because the turn's own ACTION is APOLOGIZE_AND_REPAIR, not a plan-type action). Run B was internally consistent across the register pair (W23 polished / W24 blunt) and consistent with V16 §6.2's own instruction that "the plan's own ACTION/BOUNDARY_MODE content does not change the fact that APOLOGIZE_AND_REPAIR + ACKNOWLEDGES_MISTAKE is what the apology component of the turn is" — which addresses what the *apology component's ACTION* is, but never actually states what BOUNDARY_MODE the *whole turn* carries when it does both. This is a genuine, matrix-instruction-level gap I introduced, not a register-bias symptom (2 runs read one way, 1 run read the other way for a structural reason, not a tone reason).
- **W29 — OBSERVE vs OTHER for a second-person dismissive response, not a third-person blame statement.** Runs A and C classified `OTHER` (matching the oracle). Run B classified `OBSERVE`. V16 §3's OBSERVE/OTHER rule was written for statements naming a third party as the cause of a problem; W29 (「気にしすぎだよ、それ」, said directly to the person whose concern is being dismissed) is a second-person reactive response, a shape the existing rule text doesn't clearly cover either way. `DISMISSES_CONCERN` was correctly detected by all 3 runs regardless of the ACTION disagreement, so the relational-event layer is unaffected.

Neither open question affects the relational-event layer, or any of the RECONSIDER/CROSS_WITHOUT_PERMISSION or PUBLIC_SHAMING gate's targeted cases — both gaps are confined to specific turn shapes outside those gates' own case sets, and neither pulled any gate below threshold. Proposed smallest fix for a future patch: one clarifying sentence each in V18 §2 (does BOUNDARY_MODE track a plan restated inside a corrective-action turn, or default to NOT_RELEVANT for any APOLOGIZE_AND_REPAIR-classified turn) and V16 §3 (does OBSERVE/OTHER's third-party-blame framing extend to second-person dismissive responses, or does a different action category apply). Not required to close before the current gates are considered passed — they did not block any gate.

---

## 4. Standalone blind design audit — V13 + V14 + V16 as patched by V18

Run in isolation (only V13 + V14 + V16 + V18 in context, in that order, treating each later document as normative over earlier ones on conflict). Verdict: **MIXED_REVISE**.

### Blockers

- **B1 (new, cross-cutting, highest priority).** V14 §2's per-turn precedence pipeline (`SEVERE_RUPTURE > STRAIN > REPAIR > RELIABILITY > NONE`, at most one transition per NPC per turn) is the *only* documented mechanism for applying a relationship-state transition. But three of V18's four corrective-action branches (PERSONAL_INSULT/DISMISSES_CONCERN, PUBLIC_SHAMING, FALSE_ATTRIBUTION) complete via a turn whose ACTION is `COMMIT_PLAN`/`PROPOSE_REWRITE`/`APOLOGIZE_AND_REPAIR` — none of which is a RELATIONAL_EVENT in V13 §2's taxonomy. Only the fourth branch (BREAKS_PROMISE) completes via an actual `KEEPS_PROMISE` event, so only that branch cleanly fires the RELIABILITY row through the documented pipeline. V18 §3.2 asserts the other three branches' completion flips `resolved` and makes the GUARDED→NEUTRAL transition "eligible," without ever specifying what event, on what turn, under which precedence class actually executes that transition. This is a real reducer-determinism gap: as written, an implementer cannot code "GUARDED → NEUTRAL" for an insult/dismissal/shaming/false-attribution-caused STRAIN once its (non-KEEPS_PROMISE) corrective action completes.
- **B2 (partial closure of B-a).** V18 §1.1's closed trait-judgment test correctly resolves every predicate shape in the V16/V18 worked examples, and its two-category (stative-predicate vs. bounded-action-verb) framing is genuinely POS-based rather than an open lexicon. But it does not address a large, productive class of Japanese verb-form idioms that predicate an *enduring character trait* via resultative/stative -てる aspect rather than a bounded action (腐ってる, ひねくれてる, いかれてる, 歪んでる) — these are morphologically verbs (category b by the letter of the rule) but function exactly like the na-adjective trait words category (a) is designed to catch, and the rule's idiom carve-out only gives adjective-based examples. Casual copula-ellipsis name-calling ("お前バカ" without だ) is also not addressed. B-a is substantially, not fully, closed.
- **B3 (new).** V18 §2.1's PUBLIC_SHAMING corrective action requires checking "if at least one of the **original** third-party witnesses is still present" — this needs witness-*identity* data, not merely the boolean "a third party is present" that V13 §8 and the `causalEventHistory` schema (V16 §6.6 / V18 §3.1) actually track. §2.1 claims "no new context requirement is added," but distinguishing "a third party is present now" from "one of the specific original witnesses is present now" is a stronger, undocumented requirement — the same failure mode that produced B-c in the first place.
- **B4 (partial closure of B-c).** V18 §3.1 adds exactly one field (`resolved: bool`) to `causalEventHistory` entries and §3.4 claims the full causal chain is "reconstructable from `causalEventHistory` alone." But no field records *when* an entry resolved or *which* corrective-action entry resolved it (no `resolvedAtTurn`/`resolvingEntryId`). The only linkage between a STRAIN and its correction is the NPC-level `repairWindow`/`lastStrainEventId` pair, which are mutable current-state fields, not part of the append-only log — once a later REPAIR_WINDOW opens, the earlier linkage is gone from persisted state. The auditability claim is an overstatement of what the defined schema supports.

### Non-blocking risks (audit's own list, abbreviated)

World-fact ledger schema remains unspecified (pre-existing, not introduced by V18); the deterministic validator's matching mechanism (semantic vs. keyword) is never committed to a specific approach, which is a fairness/consistency risk (missed detections on unusual phrasing) rather than a tone-leak risk; the `resolved` field is semantically overloaded between STRAIN entries (meaningful lifecycle) and REPAIR/RELIABILITY entries (fixed `true`, "nothing to resolve"); V16 §6.1's GUARDED→NEUTRAL gating condition is not re-stated in `resolved`-aware terms (related to, but narrower than, B1); the two ACTION-ontology questions V17 §3 left open remain open, as scoped.

### On fairness and architecture

The audit confirmed LANGUAGE_STYLE → persistent-state isolation holds across all four documents, no tone/politeness/register leak into state was found in the rules as written (consistent with this round's empirical 0pp register gap), the relationship-state model remains genuinely non-additive with no hidden morality score, and V18 §2.2 (FALSE_ATTRIBUTION's corrective action mapped to `APOLOGIZE_AND_REPAIR`) was confirmed internally consistent and cleanly closed on its own. WITHDRAWN-terminal design and its interaction with the other event-class tables remain internally consistent.

---

## 5. Overall verdict

**GATES: 7/7 PASS. Design audit: MIXED_REVISE (4 blockers: B1 new/cross-cutting, B2/B4 partial closures, B3 new).**

`READY_FOR_IMPLEMENTATION = NO`, per this task's own conjunctive condition. The classifier ontology is empirically robust for a second consecutive round — every gate clears threshold, with only 6 individual-field misses out of 360 data points, none of which are register-driven. What remains open is, again, the specification's own internal completeness rather than whether real classification runs can follow it — and this round surfaced one blocker (B1) that is more consequential than any single item in V17's list: it is not a missing definition at the edges of the taxonomy, but a gap in how the relationship-state machine's own core mechanism (V14 §2's per-turn precedence pipeline) is supposed to fire at all for three of the four corrective-action paths V16/V18 just spent two patches defining.

**Proposed smallest V20-successor patch scope (not yet written, no product code):**
1. Close B1: state explicitly that a turn on which a corrective action *completes* (per V16 §6.2/V18 §2.1/§2.2's completion definition) applies its targeted STRAIN's GUARDED→NEUTRAL / NEUTRAL→OPEN transition directly, as a dedicated resolution-triggered transition outside V14 §2's per-turn relational-event-class pipeline (which continues to govern *fresh* events on that same turn, including precedence if a new STRAIN/SEVERE_RUPTURE also occurs on the completing turn).
2. Narrow B2: add one sentence extending the trait-judgment test's category (a) to stative resultative -てる idioms describing an enduring characterization rather than a bounded action (with 2-3 named examples, not an expanding list — same "closed grammatical test" shape as the rest of §1.1), and confirm casual copula-ellipsis name-calling falls under the existing noun+copula branch.
3. Fix B3: relax V18 §2.1's PUBLIC_SHAMING corrective-action condition from "one of the original witnesses" to "at least one third party is present," matching what the schema actually tracks (no new witness-identity field needed for the vertical slice's small, fixed cast).
4. Close B4: add `resolvingEntryId` (pointer into `causalEventHistory`, nullable) and `resolvedAtTurn` fields alongside `resolved` in V18 §3.1's schema addition.
5. Optionally resolve the two flagged open ACTION/BOUNDARY_MODE questions from §3 above (not gate-blocking, but cheap to close alongside the above): whether an APOLOGIZE_AND_REPAIR turn's BOUNDARY_MODE should track a plan it restates, and whether OBSERVE/OTHER's third-party-blame framing extends to second-person dismissive responses.

None of these require touching the four-layer architecture, the event taxonomy, or the relationship-state machine's four values, and none introduce additive scoring. Per this task's instruction, the next blind validation round should be scoped once that successor patch exists rather than run speculatively now.

Implementation (semantic/state types, deterministic reducer, interpreter, NPC generation, thought tools, UI, replay — the V11 ordering) remains blocked. `chatgpt/newlife-phase34-human-playtest-repair` remains unmerged. No Owner input is required at this stage — every open item above is derivable from existing docs by a future validation round, not a product decision.
