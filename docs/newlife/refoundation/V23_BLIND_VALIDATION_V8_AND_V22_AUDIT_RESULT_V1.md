# NEW LIFE V23 — BLIND VALIDATION V8 + V22 AUDIT RESULT V1

Date: 2026-09-24
Status: VALIDATION RESULT / NO PRODUCT CODE / READY_FOR_IMPLEMENTATION = NO

## 0. What this covers

Requested by "CONTINUE REFOUNDATION — CLOSE V21 B1/B4 ONLY, THEN REVALIDATE," following directly from V21 (7/7 classifier gates passed, design audit `MIXED_REVISE` with 2 blockers — B1 and B4 both still open, in a narrower form than V19's originals — `READY_FOR_IMPLEMENTATION=NO`):

1. `V22_CLASSIFIER_CLARIFICATION_PATCH_V4.md` — the smallest normative successor patch attempting to close exactly V21's B1 (repairWindow-consumption/eligibility-gate contradiction) and B4 (auditability of two of the four corrective-action branches), plus the one narrow non-blocking ACTION-ontology question V21 flagged as cheap to close alongside them (PROPOSE_REWRITE vs. COMMIT_PLAN for an unconfirmed, hedged rewrite statement). No new ACTION/BOUNDARY_MODE/event-taxonomy values were introduced; the four-layer architecture and relationship-state machine are unchanged.
2. `blind/BLIND_STATE_INTERPRETATION_MATRIX_V8.md` (30 cases, Y01-Y30) — a narrow regression matrix targeting the classifier-facing surface of V22 (state/history-note isolation for a GUARDED-but-never-WITHDRAWN NPC with an earlier SEVERE_RUPTURE; cross-NPC state-note isolation; WITHDRAWN-note isolation; the new PROPOSE_REWRITE/COMMIT_PLAN/ASSIGN_REWRITE triad including a register-fairness pair; a "completion framing" isolation probe for both ACTION-layer corrective-action branches) plus regression probes for everything V14/V16/V18/V20 already passed cleanly. B1's eligibility pipeline and B4's typed-reference mechanism are deterministic-layer computations, not classifier output (per V20 §6/V22 §4's own scoping note), so this matrix validates only that case/history-framing notes about those mechanisms do not leak into or distort turn classification — it does not itself validate the deterministic pipeline, which is the design audit's job.
3. A hidden oracle, not linked from the matrix.
4. 3 independent blind classification runs (A/B/C), each an isolated subagent instructed to read ONLY the matrix file.
5. Scoring against the V13 §10 acceptance gates (unchanged thresholds, per instruction).
6. A standalone blind design audit of V13+V14+V16+V18+V20 as patched by V22, isolated to those six files only.

No product code, semantic/state types, or runtime logic was implemented. `chatgpt/newlife-phase34-human-playtest-repair` was not touched and is not part of this work. Regex was not used or proposed as the semantic engine anywhere in this validation.

---

## 1. Gate results — 7 of 7 pass, perfect agreement

| Gate | Threshold | Result | Verdict |
|---|---|---|---|
| ACTION exact agreement | ≥90% | 90/90 = 100% | **PASS** |
| BOUNDARY_MODE exact agreement | ≥90% | 90/90 = 100% | **PASS** |
| Persistent-negative-event existence agreement | ≥95% | 90/90 = 100% | **PASS** |
| Exact relational-event-set agreement | ≥90% | 90/90 = 100% | **PASS** |
| No systematic polished-vs-rough gap | >10pp difference disqualifies | 0pp (Y11/Y12) | **PASS** |
| RECONSIDER vs CROSS_WITHOUT_PERMISSION (Y17/Y18/Y19 × 3 runs = 9 checks) | ≥90% | 9/9 = 100% | **PASS** |
| Public/private PUBLIC_SHAMING (Y15/Y16 × 3 runs = 6 checks) | ≥95% | 6/6 = 100% | **PASS** |

All 3 independent runs produced **byte-for-byte identical output**, matching the hidden oracle exactly on all 30 cases and all 4 fields — zero disagreement, zero oracle corrections needed, the first round with no divergence at all. This includes the new §3 (PROPOSE_REWRITE vs. COMMIT_PLAN vs. ASSIGN_REWRITE) test cases (Y06-Y12) and both state/history-note isolation groups (Y01-Y05, Y21-Y22), none of which produced any drift.

**However, per this task's own instruction ("If any gate fails or audit still has a blocker, stop before implementation"), the standalone design audit (§2 below) returned `MIXED_REVISE` with 1 new blocker plus 3 non-blocking risks. Implementation stays blocked on the audit, not on the classifier gates — for a fourth consecutive round.**

---

## 2. Standalone blind design audit — V13 + V14 + V16 + V18 + V20 as patched by V22

Run in isolation (only V13 + V14 + V16 + V18 + V20 + V22 in context, in that order, treating each later document as normative over earlier ones on conflict, with no knowledge of any prior audit's specific findings). Verdict: **MIXED_REVISE**.

### What V22 got right (confirmed independently)

- **B1's specific target scenario is correctly closed by the new pipeline.** The audit walked through a concrete case (NPC gets one SEVERE_RUPTURE → GUARDED, then a separate STRAIN, then a completed corrective action) against V22 §1.2's six-step pipeline and confirmed: `repairWindow` consumes unconditionally, the "ever had SEVERE_RUPTURE" test correctly finds the NPC ineligible even though they're GUARDED (never WITHDRAWN), no transition is emitted, and `resolved`/`resolvingReference` are still populated. This is the exact gap V21 found in V20 and it no longer reproduces.
- **B4's typed-reference split is coherent across all four branches.** BREAKS_PROMISE and FALSE_ATTRIBUTION correctly point into `causalEventHistory` (their completions genuinely are logged relational events); PERSONAL_INSULT/DISMISSES_CONCERN and PUBLIC_SHAMING correctly point into the new `correctiveActionLog` instead (their completions are pure operational moves that are not relational events). No branch mislabels an ACTION as a relational event to manufacture a pointer.
- No additive/point-total scoring was introduced anywhere in the chain, and WITHDRAWN remains terminal for the case consistently across all six documents (including via V22's new uniform eligibility test, which necessarily catches a WITHDRAWN NPC as a subset of "ever had SEVERE_RUPTURE").

### Blocker

**A genuine, pre-existing internal contradiction in V16 §6.4 was found, which V22 relies on but does not fix.** V16 §6.4 defines "reversible STRAIN" two ways in adjacent bullets:
- its own first sentence: a GUARDED state is reversible if the **most recent** logged negative event is STRAIN-class (not SEVERE_RUPTURE-class) — read literally, this is satisfied by an NPC whose *most recent* event is STRAIN even if an earlier SEVERE_RUPTURE was logged before it;
- its "Consequence" sentence for "unresolved severe rupture": REPAIR/RELIABILITY GUARDED→NEUTRAL are reachable only for NPCs who have **never** had a SEVERE_RUPTURE-class event this case — flatly contradicting the first sentence for exactly that scenario.

V22 §1.1(2)/§1.2 step 4 explicitly adopts the second, broader reading for its own new completion pipeline and cites V16 §6.4 as unmodified, correct, settled ground truth — but never edits or reconciles the first sentence, which is the literal definition `V14 §3`'s RELIABILITY rule points to via the term "reversible STRAIN." The audit traced the fresh-KEEPS_PROMISE-event pathway and found it does not actually misfire today, because V14 §3's own leading clause ("if no unresolved severe rupture...") independently short-circuits before "reversible STRAIN" is consulted — but that makes the first sentence dead/vestigial text that nothing flags as such, sitting one document away from a section V22 just spent a full patch proving must read the other way. This is the same class of defect (two normative passages giving incompatible instructions for the same deterministic step) this entire patch series exists to close, and it survived V22 unflagged.

**Proposed fix (smallest form):** replace V16 §6.4's "Reversible STRAIN" first sentence with a definition stated in terms of "unresolved severe rupture" directly (e.g., "a GUARDED state is a 'reversible STRAIN' case if and only if the NPC has never had a SEVERE_RUPTURE-class event this case"), removing the "most recent event" framing entirely so there is exactly one test, not two that happen to agree only when a different section's outer gate is also applied first.

### Non-blocking risks

- `promiseBreakCount` (V16 §6.6) resets "when a promise-break-caused STRAIN is cleared via corrective action" — but V22 §1.2 step 6 marks an entry `resolved = true` regardless of transition eligibility, so an NPC who is permanently SEVERE_RUPTURE-marked (and gains no relationship benefit from the correction) could still have this counter silently reset, weakening the "third confirmed BREAKS_PROMISE" escalation exactly where it matters most.
- `correctiveActionLog`'s schema (`{id, turnRef, targetedEntryId}`) and `resolvedAtTurn` both lean on an undefined canonical per-turn record/transcript store that no document in the chain specifies — a pre-existing gap (also present in V18/V20's auditability claims), not new to V22, but not yet closed either.
- FALSE_ATTRIBUTION's correction can complete within the same turn that opens its own `repairWindow` (unlike the other three branches, which require a later, separate turn) — the open-then-immediately-consume sequence within one turn's processing is never explicitly addressed, though almost certainly benign.

None of these three require touching the four-layer architecture, event taxonomy, or relationship-state machine.

---

## 3. Overall verdict

**GATES: 7/7 PASS (perfect agreement — zero divergence across 3 independent runs and 30 cases, the narrowest spread of any round to date). Design audit: MIXED_REVISE (1 new blocker: a pre-existing V16 §6.4 internal contradiction that V22 relies on but never fixes; 3 non-blocking risks).**

`READY_FOR_IMPLEMENTATION = NO`, per this task's own conjunctive condition. V22 correctly closed both scenarios V21's B1/B4 were scoped around — a fresh, independent audit confirmed this by concrete walk-through rather than taking V22's own closure claim on faith. What blocks a clean pass is not a new defect V22 introduced, but a real, previously-unflagged contradiction in a document V22 treats as settled (V16 §6.4) that happens to sit directly beside the mechanism V22 just fixed — exactly the kind of thing a genuinely independent, isolated re-audit exists to catch rather than a patch author's own read of their own prior work.

**Proposed smallest V24-successor patch scope (not yet written, no product code):**
1. Fix V16 §6.4's "Reversible STRAIN" definition to match its own "unresolved severe rupture" Consequence sentence exactly (one test, not two), as specified above — this closes the blocker.
2. Optionally close the `promiseBreakCount`-reset-on-ineligible-completion gap by scoping V16 §6.6's reset condition to "cleared via corrective action **and** the completion was transition-eligible" — cheap to add alongside item 1, not gate-blocking.
3. Optionally note the FALSE_ATTRIBUTION same-turn open/consume sequence explicitly as intended — one sentence, not gate-blocking.

Item 2's undefined-turn-record gap is left undocumented as an open, non-blocking item rather than scoped for the next patch, since closing it would require specifying a turn/transcript store the vertical slice hasn't otherwise needed yet — disproportionate to spend now, consistent with this series' repeated practice of not solving speculative generality before it is needed.

Implementation (semantic/state types, deterministic reducer, interpreter, NPC generation, thought tools, UI, replay — the V11 ordering) remains blocked. `chatgpt/newlife-phase34-human-playtest-repair` remains unmerged and untouched. No Owner input is required at this stage — the remaining item is a textual definition fix derivable entirely from the existing documents, not a product decision.

READY_FOR_IMPLEMENTATION = NO
