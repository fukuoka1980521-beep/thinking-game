# NEW LIFE V22 — CLASSIFIER CLARIFICATION PATCH V4

Date: 2026-09-24
Status: DESIGN CONTRACT PATCH / NO PRODUCT CODE
Normative over: V13, V14, V16, V18, and V20 where they conflict. Does not change the four-layer architecture, the ACTION/BOUNDARY_MODE/RELATIONAL_EVENTS/LANGUAGE_STYLE separation, the relationship-state machine's four values, or the event taxonomy. No new ACTION or BOUNDARY_MODE value is introduced. No additive scoring is introduced.

## 0. Why V22

V21's blind validation (matrix V7) found **7/7 classifier gates passing** for a third consecutive round. Implementation stayed blocked only on the standalone design audit of V13+V14+V16+V18+V20, which returned `MIXED_REVISE` with 2 blockers: V20's own attempted fixes for V19's B1 and B4 did not actually close them. This patch resolves exactly those two, plus the one narrow non-blocking ACTION-ontology question V21 flagged as cheap to close alongside them.

---

## 1. Closing B1 (properly): repairWindow consumption and transition eligibility

### 1.1 The two problems in V20 §1.3

1. V20 §1.3's WITHDRAWN bullet said completion does **not** touch `repairWindow`/`resolved` for a WITHDRAWN NPC — directly contradicting V16 §6.3, which states unconditionally that a completed corrective action consumes `repairWindow` "whether or not that completion actually results in a relationship-state transition," using the non-reversible-STRAIN case as its own paradigm example of exactly this shape (completes, consumes, no transition).
2. V20 §1.3 gated its no-transition behavior on "the NPC is currently WITHDRAWN." But V16 §6.4 already defines the actual, broader disqualifying condition as **"has this NPC ever had a SEVERE_RUPTURE-class event this case"** ("unresolved severe rupture... for the remainder of the case," unconditional on current state). Per V14 §3's own SEVERE_RUPTURE table, a first SEVERE_RUPTURE moves OPEN/NEUTRAL to GUARDED — not to WITHDRAWN; WITHDRAWN requires a second one while already GUARDED. So an NPC can be GUARDED, having had exactly one SEVERE_RUPTURE, without ever reaching WITHDRAWN. V20's "currently WITHDRAWN" gate would incorrectly permit a completion transition for such an NPC, contradicting V16 §6.4 as already written.

### 1.2 Rule (replaces V20 §1.2's WITHDRAWN-adjacent language and all of V20 §1.3's third bullet)

The completion pipeline for a corrective action's operational component (V16 §6.2's completion definition, unchanged) runs in this fixed order, for the specific `causalEventHistory` entry targeted by the NPC's current `repairWindow` (V16 §6.3):

1. **Validate** the corrective action's operational component as complete, per V16 §6.2 — no state changes yet.
2. **Record completion** — create the evidence entry this completion is grounded in (§2 below defines where this is logged depending on branch).
3. **Consume the repair window** — close `repairWindow` for this NPC unconditionally. This happens whether or not step 5 below ultimately produces a transition, exactly as V16 §6.3 already states; there is no exception for any relationship state, including WITHDRAWN.
4. **Test transition eligibility** using V16 §6.4's existing "unresolved severe rupture" test, unchanged and unmodified by this patch: has this NPC had **any** SEVERE_RUPTURE-class event logged this case, regardless of current `relationshipState`? If yes, the NPC is permanently ineligible for the REPAIR/RELIABILITY GUARDED→NEUTRAL transition for the rest of the case (V16 §6.4, unchanged) — this single test replaces V20's "is currently WITHDRAWN" gate and correctly also covers the GUARDED-but-never-reached-WITHDRAWN case described in §1.1(2) above, since "ever had SEVERE_RUPTURE" is true for that NPC regardless of whether they later reached WITHDRAWN.
5. **Emit the transition, only if eligible** — if step 4 found no SEVERE_RUPTURE-class event ever logged for this NPC, apply the transition already specified for the targeted entry's class in V14 §3/V16 §6.1 (STRAIN-class target: `GUARDED -> NEUTRAL`, or `NEUTRAL -> OPEN` if already NEUTRAL when completion occurs). If ineligible, no relationship-state transition occurs this step. Either way, the corrective action's operational component still executes as a world action (the plan/apology/fix is still adopted operationally) — eligibility here governs only the `relationshipState` field, not whether the player's operational move takes effect in the world.
6. **Mark resolved** — regardless of the step-5 outcome, set the targeted entry's `resolved = true` and populate its resolution-provenance fields (§2 below). This always happens once step 3 has consumed the window; a corrective action that completes but is transition-ineligible is still a resolved entry with no relationship effect, not an unresolved one.

This removes the contradiction: `repairWindow` consumption and `resolved` marking are now unconditional (matching V16 §6.3 as originally written), and transition eligibility is now tested with V16 §6.4's actual, broader rule rather than a narrower "currently WITHDRAWN" proxy.

### 1.3 Interaction with a fresh relational event on the same completing turn (unchanged from V20 §1.3, bullets 1–2 only)

The first two bullets of V20 §1.3 are retained without change:

- If the completing turn also validates a fresh SEVERE_RUPTURE-class or STRAIN-class event for the same NPC, the fresh negative event takes precedence: the corrective action does not complete this turn (`repairWindow` remains open, the targeted entry remains `resolved = false`), and the fresh event's own transition applies per V14 §2's pipeline, unchanged.
- If the completing turn also validates a fresh REPAIR-class or RELIABILITY-class event for the same NPC, or validates no fresh relational event at all, both effects apply independently in the same turn (the §1.2 completion pipeline above, plus the fresh event's own effect per V14 §3/§6.5) — these operate on different targets (a specific already-logged entry vs. the NPC's current-state-going-forward) and so do not conflict, exactly as V20 §1.3 already explained. This remains the one documented exception to V14 §2's "at most one relationship-state transition per NPC per turn."

V20's third bullet (the WITHDRAWN-specific carve-out) is deleted; its intended behavior is now fully subsumed by §1.2 steps 3–6 above, uniformly, without a state-specific special case.

### 1.4 Consistency check against BREAKS_PROMISE/KEEPS_PROMISE (unchanged from V20 §1.4)

Unaffected by this patch. KEEPS_PROMISE is itself a RELATIONAL_EVENT reaching V14 §2's pipeline directly as a RELIABILITY-class event; that pipeline already applies V16 §6.4's "ever had SEVERE_RUPTURE" test as part of V14 §3's own RELIABILITY conditions ("if no unresolved severe rupture... GUARDED -> NEUTRAL"). The §1.2 completion pipeline above and the fresh-RELIABILITY-event pipeline are two routes to the identical test and the identical transition on the identical field; per V20 §1.3's "same target" reasoning, this remains one write, not two, and BREAKS_PROMISE/KEEPS_PROMISE semantics are unchanged by this patch.

---

## 2. Closing B4 (properly): typed provenance without inventing fake relational events

### 2.1 The gap

V20 §4 added `resolvingEntryId` as a pointer into `causalEventHistory`. But `causalEventHistory` (V16 §6.6) is scoped as a log of accepted **relational events** only. Two of the four corrective-action branches (PERSONAL_INSULT/DISMISSES_CONCERN, PUBLIC_SHAMING) complete via an **ACTION**-layer entry (COMMIT_PLAN / ASSIGN_REWRITE / executed PROPOSE_REWRITE, or a witnessed APOLOGIZE_AND_REPAIR carrying the operational component) that is not itself a relational event and has nowhere to be logged — so `resolvingEntryId` stays null for exactly those two branches even after `resolved` flips true.

The fix is **not** to log ordinary ACTIONs into `causalEventHistory` (that would misrepresent operational moves as relational events, and would require logging far more than the narrow set of moments this schema needs). The fix is a small, separately-typed reference mechanism scoped to exactly the moments already deterministically defined as "corrective action completions" — nothing broader.

### 2.2 Rule

**Replace `resolvingEntryId` (V20 §4) with a typed reference, `resolvingReference`, plus one new narrowly-scoped log:**

- `resolvingReference`: nullable, populated only when `resolved` flips `false -> true` (§1.2 step 6 above). It is a tagged reference with exactly one of two shapes:
  - `{ layer: "RELATIONAL_EVENT", entryId: <pointer into causalEventHistory> }` — used when the corrective action's completion **is itself** a validated relational event already logged there (the BREAKS_PROMISE→KEEPS_PROMISE branch, and the FALSE_ATTRIBUTION branch, whose correction is itself a logged ACKNOWLEDGES_MISTAKE/REPAIR-class event per V16 §6.2's third bullet);
  - `{ layer: "CORRECTIVE_ACTION_COMPLETION", entryId: <pointer into correctiveActionLog> }` — used when the corrective action's completion is a pure operational move that is not itself a relational event (the PERSONAL_INSULT/DISMISSES_CONCERN branch and the PUBLIC_SHAMING branch).
- `resolvedAtTurn` (V20 §4, unchanged): the turn reference at which `resolved` flipped to `true`.
- **`correctiveActionLog`** (new, per-NPC, append-only): logs **only** the moment a corrective action's operational component is validated as complete per V16 §6.2 — not general dialogue, not every ACTION the player takes, not proposals that never complete. Each entry: `{ id, turnRef, targetedEntryId (the causalEventHistory entry this completion resolves) }`. This is deliberately narrower than `causalEventHistory`: it exists solely so a `CORRECTIVE_ACTION_COMPLETION`-layer `resolvingReference` has a real, stable, append-only-logged target to point to, without relabeling an operational move as a relational event.

Both new/changed fields are write-once at the moment `resolved` flips true (§1.2 step 6) and are never modified again, preserving append-only auditability for both logs.

### 2.3 End-to-end auditability, all four branches

- **PERSONAL_INSULT/DISMISSES_CONCERN:** the targeted STRAIN entry's `resolvingReference` = `{ layer: "CORRECTIVE_ACTION_COMPLETION", entryId: <correctiveActionLog entry> }`. The full chain (original STRAIN entry → its `correctiveActionLog` completion entry → that entry's `targetedEntryId` confirming the link back) is reconstructable from the two logs together, without touching any current-state (non-append-only) field.
- **PUBLIC_SHAMING:** same shape as above — `resolvingReference` points to a `correctiveActionLog` entry recording the witness-sensitive acknowledgement (V20 §3, unchanged) completing.
- **FALSE_ATTRIBUTION:** `resolvingReference` = `{ layer: "RELATIONAL_EVENT", entryId: <causalEventHistory entry for the logged correction> }`, since the correction is itself a relational event (V16 §6.2 third bullet, unchanged).
- **BREAKS_PROMISE:** `resolvingReference` = `{ layer: "RELATIONAL_EVENT", entryId: <causalEventHistory entry for the KEEPS_PROMISE event> }`, unchanged in substance from V20 §1.4's reasoning.

All four branches now have a populatable, typed, append-only-logged pointer once `resolved = true`, and no ACTION is duplicated into `causalEventHistory` to manufacture one.

---

## 3. Non-blocking X17 ontology question (resolved, one sentence, per V21 §2's scoping)

**Rule:** a plain declarative rewrite statement that has not yet been confirmed by the boundary-holder or explicitly assigned/committed remains `PROPOSE_REWRITE` regardless of hedging particles (だよ/それ/けど and similar register markers do not upgrade it to `COMMIT_PLAN`); `ACTION = COMMIT_PLAN` requires an explicit assignment, confirmation, or decision-as-settled marker distinct from the proposal itself. This does not broaden or otherwise change the ASK_FACT/ASK_BOUNDARY/ASK_REQUIRED_FUNCTION triad, the OBSERVE/OTHER pair, the NOT_RELEVANT/AVOID triad, or the DISCOVER/SEEK_PERMISSION pair (V16 §§2–5, V20 §5, all unchanged).

---

## 4. Next validation

The next blind matrix (V8) must target, narrowly: §1's corrective-action-completion pipeline (a completing turn free of fresh negative events, transition-eligible; a completing turn for an NPC who had exactly one earlier SEVERE_RUPTURE event and is currently GUARDED but never reached WITHDRAWN — must consume the window, mark resolved, and NOT transition; a completing turn for a currently-WITHDRAWN NPC — same non-transition outcome, now reached via the same uniform test; a completing turn that also contains a fresh STRAIN/SEVERE_RUPTURE for the same NPC, which must NOT complete; a completing turn that also contains a fresh REPAIR/RELIABILITY event, which must complete AND apply the fresh event independently), §2's typed-reference behavior (probed indirectly via whether a scenario's resolution is traceable end-to-end for all four branches, not by asking the classifier to emit schema fields directly — these remain deterministic-layer fields, not model output, per V20 §6's own scoping note), §3's PROPOSE_REWRITE-vs-COMMIT_PLAN distinction, plus regression probes for everything V14/V16/V18/V20 already passed cleanly in V17/V19/V21 (RECONSIDER vs CROSS_WITHOUT_PERMISSION, public/private PUBLIC_SHAMING, apology+insult same turn, register fairness, resultative-idiom/copula-ellipsis PERSONAL_INSULT coverage, WITHDRAWN terminal behavior).

Implementation remains blocked until the classifier gates (V13 §10) and a design audit of V13+V14+V16+V18+V20+V22 both pass without blockers.

READY_FOR_IMPLEMENTATION = NO
