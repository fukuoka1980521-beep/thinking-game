# NEW LIFE V20 — CLASSIFIER CLARIFICATION PATCH V3

Date: 2026-09-24
Status: DESIGN CONTRACT PATCH / NO PRODUCT CODE
Normative over: V13 (state interpretation contract), V14 (relationship transition closure), V16 (classifier clarification patch V1), and V18 (classifier clarification patch V2) where they conflict. Does not change the four-layer architecture, the ACTION/BOUNDARY_MODE/RELATIONAL_EVENTS/LANGUAGE_STYLE separation, the relationship-state machine's four values, or the event taxonomy. No new ACTION or BOUNDARY_MODE value is introduced. No additive scoring is introduced.

## 0. Why V20

V19's blind validation (matrix V6, 3 independent runs + hidden oracle) found **7/7 classifier gates passing** for a second consecutive round. Implementation stayed blocked only on the standalone design audit of V13+V14+V16+V18, which returned `MIXED_REVISE` with 4 blockers (B1–B4). This patch closes exactly those four, plus the two non-blocking ontology questions V19 flagged as cheap to close alongside them. No new event types, no new ACTION/BOUNDARY_MODE values, no additive scoring, no change to the four-layer architecture or the relationship-state machine's four values.

---

## 1. Closing B1: corrective-action completion is its own deterministic transition trigger

### 1.1 The gap

V14 §2's per-turn pipeline (`SEVERE_RUPTURE > STRAIN > REPAIR > RELIABILITY > NONE`) only fires a relationship-state transition off a turn that validates a **RELATIONAL_EVENT** from V13 §2's list. But V16 §6.2 / V18 §2.1 / §2.2 define a corrective action's *completion* as a later turn whose **ACTION** is an operational move (COMMIT_PLAN, PROPOSE_REWRITE→executed, or an APOLOGIZE_AND_REPAIR turn satisfying a witness/ledger condition) — none of which is itself a RELATIONAL_EVENT. Only the BREAKS_PROMISE branch completes via an actual KEEPS_PROMISE event, so only that branch cleanly reaches the pipeline. This section gives the other three branches (PERSONAL_INSULT/DISMISSES_CONCERN, PUBLIC_SHAMING, FALSE_ATTRIBUTION) their own explicit, deterministic firing mechanism.

### 1.2 Rule

**A corrective action's completion (as defined in V16 §6.2 and V18 §2.1/§2.2) is itself a deterministic trigger, independent of V13 §2's RELATIONAL_EVENT list and independent of V14 §2's per-turn precedence pipeline.** It is not a new relational event a model detects; it is a state-machine condition the deterministic validator checks directly, exactly as REPAIR_WINDOW opening/closing is already a deterministic condition, not a detected event.

The moment a corrective action's operational component is validated as complete (V16 §6.2's completion definition, unchanged):

1. identify the specific `causalEventHistory` entry targeted by the NPC's current `repairWindow` (V16 §6.3/§6.6);
2. apply the transition already specified for that entry's originating class in V14 §3/V16 §6.1:
   - if the targeted entry's class is STRAIN: `GUARDED -> NEUTRAL`, or `NEUTRAL -> OPEN` if the NPC is already NEUTRAL when completion occurs;
   - this is the same transition V14 §3 ("REPAIR... after subsequent corrective action, one reversible strain may clear") and V16 §6.1 already name — this section only supplies the missing *trigger*, not a new transition;
3. mark the targeted entry `resolved = true` (V18 §3.2, unchanged) and close `repairWindow` (consumed).

### 1.3 Interaction with a fresh relational event on the same completing turn

The completing turn may *also* independently validate a fresh RELATIONAL_EVENT for the same NPC (e.g., the operational fix is proposed in a turn that also contains a new dismissive remark). To keep this a single, well-ordered mechanism per NPC per turn:

- **If the completing turn also validates a fresh SEVERE_RUPTURE-class or STRAIN-class event for the same NPC:** the fresh negative event takes precedence. The corrective action does **not** complete this turn — `repairWindow` remains open (unconsumed) and the targeted entry remains `resolved = false`. The fresh event's own transition applies per V14 §2's existing pipeline, unchanged. Rationale: a corrective action's operational component must land clean of new harm to the same person; causing fresh STRAIN/SEVERE_RUPTURE in the same breath as the "fix" does not discharge the earlier one.
- **If the completing turn also validates a fresh REPAIR-class or RELIABILITY-class event for the same NPC, or validates no fresh relational event at all:** both effects apply independently in the same turn — the corrective-action completion transition (§1.2) for the entry it targets, and (if present) the fresh REPAIR/RELIABILITY event's own effect per V14 §3/§6.5 (REPAIR's own immediate effect remains "none, opens/refreshes window"; RELIABILITY's own effect remains gated by V14 §3's existing conditions). These do not conflict because they operate on different targets: the corrective-action completion resolves a *specific already-logged entry*; a fresh REPAIR/RELIABILITY event evaluates the NPC's *current* state going forward. This is the one documented exception to V14 §2's "at most one relationship-state transition per NPC per turn": that rule governs fresh events detected in a turn; a corrective-action completion is the delayed execution of a transition V14 §3 already promised on an earlier turn, not a second fresh transition.
- **If the NPC has an unresolved SEVERE_RUPTURE (i.e., is WITHDRAWN) at the moment the operational component would otherwise complete:** per V14 §1 and V16 §6.4, WITHDRAWN is terminal for the case. The corrective action's operational component may still execute as a world action (the plan can still be adopted operationally), but no relationship-state transition occurs and `repairWindow`/`resolved` are not touched — there is nothing to resolve into, since REPAIR/RELIABILITY transitions are permanently unreachable once WITHDRAWN (V16 §6.4, unchanged).

### 1.4 Consistency check against the BREAKS_PROMISE branch

The BREAKS_PROMISE→KEEPS_PROMISE branch already worked because KEEPS_PROMISE is itself a RELATIONAL_EVENT that reaches V14 §2's pipeline directly as a RELIABILITY-class event. Under this section, that branch is unchanged: RELIABILITY's fresh-event path (V14 §3, V16 §6.1) and the corrective-action-completion path (§1.2 above) are two different ways of reaching the same `GUARDED -> NEUTRAL` transition, and V16 §6.2's completion definition for the BREAKS_PROMISE branch ("a subsequent KEEPS_PROMISE on a new, explicit commitment") satisfies *both* — the KEEPS_PROMISE event fires RELIABILITY per the normal pipeline, and it also is the corrective action's completion, so §1.2 would compute the identical transition redundantly. No double transition results, since both paths converge on the same single relationship-state field and §1.3's "same target" language means this is one write, not two.

---

## 2. Closing B2: extending the closed trait-judgment test to resultative idioms and copula ellipsis

### 2.1 Resultative character-state verbs (腐ってる / ひねくれてる / いかれてる / 歪んでる)

V18 §1.1's category (b) (event predicate) covers verbs whose -てる form is **progressive aspect**: an ongoing, repeatable, bounded action (ごねてる = "is in the middle of being difficult right now," 騒いでる = "is currently making a fuss"). These verbs are *activity verbs* in the grammatical-aspect sense: their -てる form describes doing something.

腐る, ひねくれる, いかれる, 歪む belong to a different, closed grammatical class: **change-of-state (achievement) verbs**, whose -てる form is **resultative aspect**, not progressive — it describes the enduring state P is *in* as a result of a (usually unspecified, often gradual and non-punctual-in-real-time but grammatically punctual) change, not an action P is currently doing. Compare: 「窓が割れてる」("the window is [in a state of being] broken," resultative — nobody is currently breaking it) versus 「美香が騒いでる」("Mika is [in the process of] making a fuss," progressive). 腐ってる/ひねくれてる/いかれてる/歪んでる pattern grammatically with the resultative class, not the progressive class, and semantically assert an enduring characterization of P's personality/mind — functionally identical to a な-adjective trait predicate (category a), just verb-derived.

**Rule (extends V18 §1.1 category (a); does not modify category (b)):** category (a) also includes a stative-resultative -てる/-でる form of a change-of-state verb that asserts an enduring character or mental condition of P, rather than reporting a specific bounded action P is performing. Test: *if this -てる form is true of P, is exactly one specific ongoing action being described (progressive — category b), or is a lasting condition/characterization being asserted that would remain true even if P is not doing anything at this moment (resultative — category a)?* 腐ってる/ひねくれてる/いかれてる/歪んでる, applied to a person's character or mind, are resultative by this test (the "state of being twisted/rotten/broken/warped" persists independent of any specific present action) and are category (a). This is a closed grammatical-aspect test (progressive vs. resultative reading of -てる), not a word list, and does not expand by adding new example verbs — the same non-expansion guarantee V18 §1.1 already states for its own test.

### 2.2 Copula ellipsis in casual name-calling

V18 §1.1 category (a)'s noun+copula name-calling branch is written with an explicit copula ("Pはバカ**だ**"). Casual/blunt Japanese frequently omits だ in direct address ("お前バカ", "お前アホ") without changing the sentence's grammatical function — this is copula ellipsis, a register variation, not a different predicate type. **Rule:** a bare noun functioning as a categorical name-calling label for P, in direct or clearly P-directed address, satisfies category (a) whether or not the copula だ/です is phonetically/orthographically present. This is the same register-neutrality principle already governing every other test in V13/V16/V18 (bluntness/terseness never changes classification by itself) applied to this one construction, not a new principle.

---

## 3. Closing B3: witness-identity minimum for PUBLIC_SHAMING repair

V18 §2.1 required "at least one of the original third-party witnesses" to still be present for a PUBLIC_SHAMING corrective action's acknowledgement component — a requirement needing witness-*identity* tracking the schema (V13 §8, V16 §6.6) does not provide (only a boolean "a third party is present").

**Rule (replaces V18 §2.1's second bullet):** the acknowledgement component is witness-sensitive using only the boolean the interpreter already tracks: **if a third party is present at the time of the acknowledgement, the acknowledgement is made with that third party present.** It does not need to be the same individual(s) who witnessed the original harm. If no third party is present at the time of the acknowledgement, a private acknowledgement to P satisfies this condition. Rationale: for this vertical slice's small, fixed cast (Mika, Ryo, the player), "a third party is present" and "an original witness is present" are almost always the same fact in practice, and requiring identity-tracked witness sets would add a schema field (a social/witness graph) disproportionate to what a two-NPC case needs. If a future case introduces a larger cast where this distinction becomes materially different, witness-identity tracking should be added then, scoped to that case — not spent here as speculative generality.

No other part of V18 §2.1 changes: the operational-component requirement (§2.1's third bullet) is unaffected.

---

## 4. Closing B4: auditable resolution pointers

V18 §3.1 added a `resolved` boolean to `causalEventHistory` entries but no pointer to *which* turn or entry resolved it, so the "reconstructable from `causalEventHistory` alone" claim (V18 §3.4) overstated what the schema stored — the only link was the mutable, non-append-only `repairWindow`/`lastStrainEventId` pair, which is overwritten by a later REPAIR_WINDOW.

**Rule:** each `causalEventHistory` entry gains two more fields, populated only at the moment `resolved` flips to `true` (§1.2/V18 §3.2, unchanged trigger):

| Field | Type | Purpose |
|---|---|---|
| `resolvingEntryId` | nullable pointer into `causalEventHistory` | the entry (if any) that logged the corrective action's operational component completing — e.g., the COMMIT_PLAN/executed-PROPOSE_REWRITE/witnessed-APOLOGIZE_AND_REPAIR entry. Null while `resolved = false`. |
| `resolvedAtTurn` | nullable turn reference | the turn number/id at which `resolved` flipped to `true`. Null while `resolved = false`. |

Both fields are write-once (set exactly when `resolved` flips `false -> true`, per §1.2's trigger) and never modified again, preserving append-only auditability. With these two fields, the full causal chain — original STRAIN entry → its `resolvingEntryId`/`resolvedAtTurn` → the resolving entry's own logged content — is reconstructable from `causalEventHistory` alone without cross-referencing any current-state (non-append-only) field. This makes V18 §3.4's auditability claim true as stated rather than an overstatement.

---

## 5. Non-blocking ontology questions from V19 §3 (resolved, minimal)

### 5.1 BOUNDARY_MODE for an APOLOGIZE_AND_REPAIR turn that also restates a plan

**Rule:** if a turn's ACTION is APOLOGIZE_AND_REPAIR and the same turn also restates or re-confirms an existing plan (without proposing a new one), BOUNDARY_MODE tracks that restated plan's relationship to the known boundary exactly as it would if stated alone (AVOID if the restated plan stays inside the stated limit, SEEK_PERMISSION if it asks for confirmation, etc.) — the presence of an apology component does not change BOUNDARY_MODE's evaluation target. BOUNDARY_MODE = NOT_RELEVANT only if the turn's content, apart from the apology itself, contains no plan/boundary-relevant content at all (a pure apology with nothing else). This directly resolves V19's W10/W23/W24 disagreement: Runs A/C's reading (AVOID, because a boundary-safe plan is restated) is confirmed correct; Run B's reading (NOT_RELEVANT whenever ACTION=APOLOGIZE_AND_REPAIR) is not adopted, since it discards boundary-relevant content the turn actually contains.

### 5.2 OBSERVE vs. OTHER for a second-person dismissive response

**Rule (extends V16 §3; does not change its third-person test):** V16 §3's OTHER test ("names a specific person as the cause") extends to a turn addressed directly, in the second person, to the person being blamed for the current friction — "気にしすぎだよ、それ" said to P about P's own stated concern is OTHER, on the same reasoning as the third-person case: it is a directed claim about a specific person's responsibility/reaction, not a neutral status report. (Separately, and unaffected by this ACTION-label question: DISMISSES_CONCERN's own V13 §2/V16 §1 test already independently detects the relational event in this example regardless of which ACTION label applies — this section only settles the ACTION field, not the relational-event field, which V19 confirmed all 3 runs already agreed on.)

---

## 6. Next validation

The next blind matrix (V7) must target, narrowly: §1's corrective-action-completion trigger (a completing turn free of fresh negative events; a completing turn that also contains a fresh STRAIN/SEVERE_RUPTURE for the same NPC, which must NOT complete; a completing turn that also contains a fresh REPAIR/RELIABILITY event, which must complete AND apply the fresh event independently; a WITHDRAWN NPC's corrective action, which must apply zero relationship transition), §2's resultative-idiom and copula-ellipsis PERSONAL_INSULT coverage (all four named verbs plus at least one contrastive progressive-aspect verb from V18's original list, plus one copula-ellipsis name-calling example), §3's relaxed witness-presence PUBLIC_SHAMING repair condition, §4's `resolvingEntryId`/`resolvedAtTurn` population (probed indirectly via whether a scenario's resolution is traceable, not by asking the classifier to emit schema fields directly — those are deterministic-layer fields, not model output), plus regression probes for everything V14/V16/V18 already passed cleanly in V17/V19 (RECONSIDER vs CROSS_WITHOUT_PERMISSION, public/private PUBLIC_SHAMING, apology+insult same turn, register fairness, WITHDRAWN terminal behavior).

Implementation remains blocked until the classifier gates (V13 §10) and a design audit of V13+V14+V16+V18+V20 both pass without blockers.

READY_FOR_IMPLEMENTATION = NO
