# NEW LIFE V24 — CLASSIFIER CLARIFICATION PATCH V5

Date: 2026-09-24
Status: DESIGN CONTRACT PATCH / NO PRODUCT CODE
Normative over: V13, V14, V16, V18, V20, and V22 where they conflict. Does not change the four-layer architecture, the ACTION/BOUNDARY_MODE/RELATIONAL_EVENTS/LANGUAGE_STYLE separation, the relationship-state machine's four values, or the event taxonomy. No new ACTION or BOUNDARY_MODE value is introduced. No additive scoring is introduced.

## 0. Why V24

V23's blind validation (matrix V8) found **7/7 classifier gates passing with zero divergence** across 3 independent runs. Implementation stayed blocked only on the standalone design audit of V13+V14+V16+V18+V20+V22, which returned `MIXED_REVISE` with exactly 1 blocker and 3 non-blocking risks. The blocker is a pre-existing internal contradiction in V16 §6.4 that V22 relies on (and reads correctly for its own new pipeline) but never edits. This patch resolves exactly that blocker, plus two of the three non-blocking risks the audit flagged as cheap to close alongside it.

---

## 1. Closing the blocker: V16 §6.4's "Reversible STRAIN" — one test, not two

### 1.1 The contradiction

V16 §6.4 gave two different tests for the same concept in adjacent sentences:

- **First sentence (literal, "most recent event" framing):** a GUARDED state is a "reversible STRAIN" case if the *most recent* negative event in `causalEventHistory` prior to the current turn is STRAIN-class (not SEVERE_RUPTURE-class).
- **"Consequence" sentence (broader, "ever had" framing):** REPAIR (§6.2/§6.3) and RELIABILITY GUARDED→NEUTRAL (§6.1) are reachable only for NPCs who have **never** had a SEVERE_RUPTURE-class event this case.

These disagree for exactly one scenario: an NPC who had an earlier SEVERE_RUPTURE (moving them to GUARDED, not WITHDRAWN — a second SEVERE_RUPTURE while already GUARDED is required to reach WITHDRAWN, per V14 §3) followed by a later STRAIN. Under the first sentence, this NPC's GUARDED state reads as reversible (most recent event is STRAIN). Under the Consequence sentence, this NPC is permanently ineligible (a SEVERE_RUPTURE was logged this case, full stop). V22 §1.2 step 4 already adopts the second, broader reading as ground truth for its own completion pipeline — this patch makes that the *only* reading V16 §6.4 states, rather than leaving the first sentence in place as unflagged dead text.

### 1.2 Rule (replaces V16 §6.4's "Reversible STRAIN" bullet in full; the "Unresolved severe rupture" bullet is unchanged and is now the sole authority)

**"Reversible STRAIN" is defined exclusively in terms of "unresolved severe rupture":** a GUARDED state is a "reversible STRAIN" case **if and only if** the NPC has never had a SEVERE_RUPTURE-class event logged this case. There is no separate "most recent event" test. The "most recent event" framing is removed entirely, not narrowed — it named a condition (recency) that plays no role in eligibility once "ever had a SEVERE_RUPTURE" is the test.

This does not change any transition, precedence rule, or field already specified in V14 or V16 — it removes a redundant, disagreeing restatement of a definition V16 §6.4's own Consequence sentence, and V22 §1.2 step 4, already treat as settled. No document in the chain relied on the deleted "most recent event" reading for any transition that actually fires: V14 §3's RELIABILITY rule short-circuits on "no unresolved severe rupture" before "reversible STRAIN" would ever be separately consulted, and V22 §1.2 step 4 already tests "ever had SEVERE_RUPTURE" directly. Removing the redundant sentence changes no runtime behavior; it removes the only passage that could have caused two implementations of this contract to disagree.

---

## 2. Non-blocking risk (1 of 3): `promiseBreakCount` reset scoped to transition-eligible completions

V16 §6.6 defined `promiseBreakCount` as resetting "when a promise-break-caused STRAIN is cleared via corrective action." V22 §1.2 step 6 marks an entry `resolved = true` regardless of transition eligibility (§1.2 step 4/5) — so, as written, a permanently SEVERE_RUPTURE-marked NPC whose corrective action produces no relationship benefit could still have this counter silently reset, weakening the "third confirmed BREAKS_PROMISE" SEVERE_RUPTURE trigger (V14 §3) exactly where it is meant to matter most.

**Rule (replaces V16 §6.6's `promiseBreakCount` reset condition):** `promiseBreakCount` resets to 0 only when a promise-break-caused STRAIN is cleared via a corrective action **and** that completion was transition-eligible under §1.2 above (i.e., the NPC has never had a SEVERE_RUPTURE-class event this case). A completion that consumes the repair window and marks the entry resolved without eligibility (§1.2 step 5's ineligible branch) does not reset `promiseBreakCount`. This does not change `resolved`, `repairWindow`, or `resolvingReference` behavior (V22 §1.2/§2, unchanged) — only the counter's own reset condition.

## 3. Non-blocking risk (2 of 3): FALSE_ATTRIBUTION same-turn open/consume ordering

V16 §6.2's third bullet already defines FALSE_ATTRIBUTION's corrective action as "an explicit correction of the false claim, validated against the world-fact ledger" — and, unlike the other three branches, this correction can itself be the same validated relational event that would otherwise open a `repairWindow` for the FALSE_ATTRIBUTION STRAIN it is correcting, within a single turn.

**Rule (clarifies V16 §6.2/§6.3; changes no field or transition):** when a single turn both validates the FALSE_ATTRIBUTION correction as a relational event and that correction is itself the corrective action for the FALSE_ATTRIBUTION STRAIN it targets, the two steps are treated as sequential within that turn's processing — `repairWindow` opens (targeting the FALSE_ATTRIBUTION entry) and is immediately consumed by the same turn's completion (§1.2 above) — rather than as a same-turn race or conflict. This is the same "open-then-consume-in-one-turn" shape already implicit in V16 §6.3's consumption rule; this section only states explicitly that FALSE_ATTRIBUTION is the one branch where it can occur, so it is not mistaken for an unspecified edge case.

Non-blocking risk 3 of 3 from V23 (the undefined canonical per-turn record/transcript store underlying `correctiveActionLog`/`resolvedAtTurn`) remains intentionally unscoped, per V23's own reasoning: closing it would require specifying a turn/transcript store the vertical slice hasn't otherwise needed, which is disproportionate to spend before it is actually needed.

---

## 4. Next validation

The next blind matrix (V9) must target, narrowly:
- regression probes confirming §1's definition change produces no classifier-visible difference (the "one earlier SEVERE_RUPTURE, currently GUARDED, never WITHDRAWN, later STRAIN" scenario, framed as a case/history note, must still not leak into or distort ACTION/BOUNDARY_MODE/relational-event classification for that turn — this is a deterministic-layer computation, not model output, exactly as V22 §4/V23 §0 already scope it);
- one case/history-note isolation probe for the same scenario now reaching a later corrective-action completion (still ineligible, per §1, unchanged outcome from V22/V23);
- regression probes for everything V14/V16/V18/V20/V22 already passed cleanly in V17/V19/V21/V23 (RECONSIDER vs CROSS_WITHOUT_PERMISSION, public/private PUBLIC_SHAMING, apology+insult same turn, register fairness, resultative-idiom/copula-ellipsis PERSONAL_INSULT coverage, causal-blame vs. trait-judgment, ASK_FACT/ASK_BOUNDARY/ASK_REQUIRED_FUNCTION, OBSERVE/OTHER, NOT_RELEVANT/AVOID, DISCOVER/SEEK_PERMISSION, PROPOSE_REWRITE/COMMIT_PLAN/ASSIGN_REWRITE, WITHDRAWN terminal behavior).

§2 and §3 above change only deterministic-layer counter/sequencing behavior with no classifier-facing surface, so they do not require dedicated blind-matrix cases beyond the isolation-note regression checks already listed; they are re-checked in the design audit instead.

Implementation remains blocked until the classifier gates (V13 §10) and a design audit of V13+V14+V16+V18+V20+V22+V24 both pass without blockers.

READY_FOR_IMPLEMENTATION = NO
