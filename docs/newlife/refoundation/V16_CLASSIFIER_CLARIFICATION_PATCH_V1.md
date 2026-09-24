# NEW LIFE V16 — CLASSIFIER CLARIFICATION PATCH V1

Date: 2026-09-24
Status: DESIGN CONTRACT PATCH / NO PRODUCT CODE
Normative over: V13 (state interpretation contract) and V14 (relationship transition closure) where they conflict. Does not change the four-layer architecture, the ACTION/BOUNDARY_MODE/RELATIONAL_EVENTS/LANGUAGE_STYLE separation, or the relationship-state machine's four values.

## 0. Why V16

V15's blind validation (matrix V4, 3 independent runs + hidden oracle) found 4/7 gates passing and 3/7 failing, all traceable to a small, named set of underspecified ontology pairs plus 6 undefined recovery-mechanics terms in V13/V14 (audit blockers B1-B6). This patch resolves exactly those items. It adds no new event types, no new ACTION/BOUNDARY_MODE values, and no additive scoring.

---

## 1. PERSONAL_INSULT / DISMISSES_CONCERN: causal blame vs. actual insult

**Rule.** A causal-blame construction ("Xのせいで〜") that names a person as the cause of a problem is, by itself, a causal claim — not an insult and not a dismissal. It does not trigger PERSONAL_INSULT or DISMISSES_CONCERN on its own, regardless of how blunt, irritated, or public the delivery is.

PERSONAL_INSULT requires an explicit **trait or character judgment word** applied to the person (e.g. わがまま, 面倒くさい, 身勝手, ずるい, 自己中) — a claim about who they *are*, not what they *did*. A verb that describes a specific, bounded action or behavior (ごねる, 騒ぐ, 渋る, 遅れる) — even an informal or mildly pejorative one — is a description of an event, not a trait judgment, and does not by itself satisfy PERSONAL_INSULT.

DISMISSES_CONCERN still requires explicit invalidation of the stated concern's legitimacy (気にしすぎ, 大げさ). Attributing a delay or problem to someone's action is not the same as telling them their concern doesn't matter, and does not by itself satisfy DISMISSES_CONCERN.

This is a structural (lexical-category) test, not a tone judgment: does the utterance contain a trait-judgment word about the person, yes or no.

**Contrastive examples (supersede/extend the V13 §2 pair):**

| Utterance | Trait word present? | Event |
|---|---|---|
| 「美香が今さら騒いでるせいで止まってる」 | No — 騒ぐ describes an action | none (PUBLIC_SHAMING may still apply per its own presence test, independently) |
| 「美香がごねてるせいで稽古が進まない」 | No — ごねる describes an action | none (independently, PUBLIC_SHAMING per presence test) |
| 「美香がわがままなせいで止まってる」 | Yes — わがまま | PERSONAL_INSULT |
| 「お前ほんと面倒くさい」 | Yes — 面倒くさい applied to the person | PERSONAL_INSULT (unchanged from V13) |
| 「面倒だな、この修正」 | No — applies to the task, not the person | none (unchanged from V13) |
| 「美香はわがままだ」 | Yes | PERSONAL_INSULT (unchanged from V13) |

PUBLIC_SHAMING's own three-part presence test (target present, third party present, public blame/defect attribution) is unaffected by this rule and continues to apply independently — a causal-blame utterance with no trait word can still be PUBLIC_SHAMING if delivered publicly, while never separately being PERSONAL_INSULT.

If a causal-blame utterance combines a causal claim with a trait word in the same turn ("美香のわがままのせいでこうなってる"), both PUBLIC_SHAMING (if presence conditions are met) and PERSONAL_INSULT apply, exactly as V13 §6's explicit severe-rupture combo already describes.

---

## 2. ASK_FACT vs. ASK_BOUNDARY when the requested fact is the boundary's scope

**Rule.** If answering the question would define, narrow, or reveal a person's stated line/limit/refusal scope, classify ASK_BOUNDARY — even if the utterance is syntactically a fact-question ("どの部分が", "何が"). ASK_FACT is reserved for information requests that are not about a person's boundary (schedule, logistics, who is available, what a scene requires dramatically).

Test: *does the answer to this question define the boundary itself?* Yes → ASK_BOUNDARY. No → ASK_FACT (or ASK_REQUIRED_FUNCTION if it's about a scene's dramatic necessity rather than either).

Examples:
- 「実話のどの部分が嫌なんですか?」— asks which part of the real story she objects to → **ASK_BOUNDARY** (this directly asks for the boundary's scope; grammatically a fact-question, semantically a boundary probe).
- 「リハーサルは何時から?」— schedule fact, unconnected to any refusal → **ASK_FACT**.
- 「この場面が本番で果たしている役割は何ですか?」— asks about dramatic function, not about anyone's limit → **ASK_REQUIRED_FUNCTION**.

---

## 3. OBSERVE vs. OTHER for pure reactive/blame statements with no actionable request

**Rule.** OBSERVE is a statement that reports or comments on the current situation **without naming a person as responsible** for it — purely descriptive of state (time, progress, mood of the room). OTHER is used when the statement **names a specific person as the cause** of the problem but carries no request, plan, or assignment — it is a directed claim, not a neutral status report, even when (per §1 above) it contains no trait word and therefore triggers no relational event.

Test: does the statement point at a specific person as the reason things are stuck? Yes → OTHER. No named party → OBSERVE.

Examples:
- 「時間がなくなってきたな」— no named party → **OBSERVE**.
- 「美香の返事がまだだから、亮も先に進められない」— names Mika as the reason, no request attached, no trait word (so no relational event per §1) → **OTHER**.

---

## 4. NOT_RELEVANT vs. AVOID for understudy / cast-substitution plans

**Rule (carries the V13 §9 worked example forward explicitly).** When a plan routes around a stated boundary by **removing the boundary-holder from the task** entirely — understudy substitution, cutting the scene, reassigning the affected work to someone else — the boundary is not being approached, tested, or stayed-within; it is sidestepped because the refused person is no longer asked to do the refused thing. BOUNDARY_MODE = **NOT_RELEVANT**.

AVOID applies specifically when the plan **still involves the boundary-holder performing a modified version of the task** that has been reshaped to stay inside their stated limit (e.g., a rewritten scene they will still perform themselves).

Test: after this plan, is the refused person still the one doing the (modified) thing? Yes → AVOID. No, someone/nothing else is doing it instead → NOT_RELEVANT.

Examples:
- 「出ないなら代役を探す」→ Mika removed from the task → **NOT_RELEVANT** (verbatim V13 §9 example, now stated as a rule, not only an example).
- 「この場面ごとカットしよう」→ task removed entirely → **NOT_RELEVANT**.
- 「実話を外した版で、美香にはそのままこの場面をやってもらう」→ Mika still performs, reshaped to stay inside her limit → **AVOID**.

---

## 5. DISCOVER vs. SEEK_PERMISSION when a boundary question bundles a concrete mitigation candidate

**Rule.** If the utterance both **names a specific candidate condition** and asks whether that specific condition would resolve the refusal ("Xを外せば大丈夫ですか?" / "Xを外せば出演していただけますか?"), classify BOUNDARY_MODE = **SEEK_PERMISSION** — the player has already formed a concrete plan and is asking for confirmation of that plan's boundary-safety, not open-endedly exploring where the line is.

DISCOVER remains reserved for questions that propose **no specific resolving condition**, only probing the shape or extent of the boundary itself ("どこまでなら大丈夫?", "どの部分が嫌?" — the latter is ASK_BOUNDARY/DISCOVER per §2 above, since it asks the NPC to define the scope rather than proposing one).

Examples:
- 「実話の部分を外せば出演していただけますか?」/ 「実話抜きなら出れる?」/ 「この場面、実話部分だけ変えたら出てもらえますか?」— all name the same specific candidate (remove the real-story content) and ask if it resolves the refusal → **SEEK_PERMISSION**, regardless of polished/blunt register.
- 「どこまでなら大丈夫?」— no candidate proposed → **DISCOVER**.

---

## 6. Recovery mechanics (closes V15 audit blockers B1–B6)

None of the following introduce additive scoring. All are state-machine fields or pointers, not point totals.

### 6.1 RELIABILITY's WITHDRAWN row (closes B1)

The RELIABILITY transition table is missing a WITHDRAWN row in V13/V14. It is added here, consistent with the other three event classes:

```
RELIABILITY:
  OPEN      -> OPEN
  NEUTRAL   -> OPEN        (when two separate reliability observations exist after the last strain)
  GUARDED   -> NEUTRAL     (only under the conditions in §6.2/§6.3 below)
  WITHDRAWN -> WITHDRAWN   (KEEPS_PROMISE cannot exit WITHDRAWN this case, matching SEVERE_RUPTURE/STRAIN/REPAIR)
```

### 6.2 "Corrective action" — definition and completion (closes B2)

A **corrective action** is a later, separately validated turn whose ACTION value is an operational move (not merely a statement) that concretely addresses the substance of the specific STRAIN event it targets:

- if the targeted STRAIN came from DISMISSES_CONCERN or PERSONAL_INSULT: a corrective action is a turn where ACKNOWLEDGES_MISTAKE is validated *and* a subsequent operationally-validated ACTION (PROPOSE_REWRITE/ASSIGN_REWRITE/COMMIT_PLAN, etc.) demonstrates the concern was taken seriously (e.g., BOUNDARY_MODE=AVOID on the resulting plan);
- if the targeted STRAIN came from BREAKS_PROMISE: a corrective action is a subsequent KEEPS_PROMISE on a new, explicit commitment;
- if the targeted STRAIN came from FALSE_ATTRIBUTION: a corrective action is an explicit correction of the false claim, validated against the world-fact ledger.

**Completion** = the operational component of the corrective action actually executes and is validated (e.g., the COMMIT_PLAN/KEEPS_PROMISE is accepted), not merely proposed or stated as intent. A proposal alone (PROPOSE_REWRITE without a subsequent COMMIT_PLAN/validated execution) does not complete a corrective action.

### 6.3 REPAIR_WINDOW: target, expiry, consumption (closes B3)

- **Target:** REPAIR_WINDOW targets exactly one specific unresolved STRAIN instance for that NPC — the most recently logged unresolved STRAIN at the moment ACKNOWLEDGES_MISTAKE is validated (tracked via `lastStrainEventId`, §6.6). If multiple STRAINs are unresolved, only the most recent is targeted; clearing an older one requires its own later ACKNOWLEDGES_MISTAKE + corrective-action cycle.
- **Expiry:** REPAIR_WINDOW closes without effect if no corrective action completes before the case's decision deadline (17:30 in the vertical-slice case), whichever comes first for a given case. It does not persist across cases.
- **Consumption:** REPAIR_WINDOW closes the moment a corrective action *completes* (§6.2), whether or not that completion actually results in a relationship-state transition (see §6.4 — a completed corrective action targeting a STRAIN that turns out non-reversible per §6.4 still consumes the window; it simply produces no transition).

### 6.4 "Reversible STRAIN" and "unresolved severe rupture" (closes B4)

- **Reversible STRAIN:** a GUARDED state is a "reversible STRAIN" case if the most recent negative event in that NPC's `causalEventHistory` (§6.6) prior to the current turn is STRAIN-class (not SEVERE_RUPTURE-class). If the NPC's GUARDED state's history includes no SEVERE_RUPTURE-class event since the case began, it is reversible by definition.
- **Unresolved severe rupture:** an NPC has an unresolved severe rupture for the remainder of the case once a SEVERE_RUPTURE-class event has been logged for them, because SEVERE_RUPTURE transitions GUARDED->WITHDRAWN and WITHDRAWN cannot be exited this case (V14 §1). Consequence: REPAIR (§6.2/§6.3) and RELIABILITY GUARDED->NEUTRAL (§6.1) are reachable only for NPCs who have never had a SEVERE_RUPTURE-class event this case — once WITHDRAWN, those two transitions are permanently unreachable for the rest of the case, by construction, not as a separately-checked condition.

### 6.5 REPAIR + RELIABILITY in the same turn (closes B5)

If a single turn validates both ACKNOWLEDGES_MISTAKE and KEEPS_PROMISE, with no STRAIN/SEVERE_RUPTURE-class event also present that turn:

- by V14 §2 precedence, REPAIR is the highest-precedence class present;
- REPAIR's own immediate effect is "none" (it only opens/refreshes REPAIR_WINDOW, per V14 §3);
- because REPAIR's effect is null rather than blocking, the turn's actual relationship-state transition is computed using the **next-highest-precedence class with a non-null effect present that turn** — here, RELIABILITY — instead of applying no transition;
- the KEEPS_PROMISE observation still counts toward the two-observation NEUTRAL->OPEN threshold (§6.1), and REPAIR_WINDOW still opens/refreshes from the ACKNOWLEDGES_MISTAKE in the same turn.

This rule is general, not special-cased to REPAIR+RELIABILITY: whenever the highest-precedence validated class in a turn has a null immediate effect, evaluate the next-highest-precedence class with a non-null effect that turn, rather than defaulting to no transition.

### 6.6 Per-NPC recovery schema (closes B6)

Enumerated persistent fields, per NPC, for the vertical slice:

| Field | Type | Purpose |
|---|---|---|
| `relationshipState` | enum: OPEN \| NEUTRAL \| GUARDED \| WITHDRAWN | current relationship state |
| `repairWindow` | CLOSED \| OPEN(targetStrainId) | §6.3 |
| `reliabilityObservationCount` | int, resets to 0 on any GUARDED->NEUTRAL or NEUTRAL->OPEN transition it contributes to | §6.1 threshold tracking |
| `promiseBreakCount` | int, resets to 0 when a promise-break-caused STRAIN is cleared via corrective action | feeds the "third confirmed BREAKS_PROMISE" SEVERE_RUPTURE trigger (V14 §3) |
| `pressureAfterNoCount` | int, per unresolved refusal topic; world-interaction flag only (V13 §7), never feeds relationship state | tracks repeated RECONSIDER pressure |
| `causalEventHistory` | append-only log of accepted relational events with turn reference | source of truth for §6.4's reversible/unresolved determinations |
| `lastStrainEventId` | pointer into `causalEventHistory` | §6.3's REPAIR_WINDOW target |

No field is a point total, and none are combined into a weighted or additive score. `relationshipState` is the only field that gates player-visible outcomes; the rest are bookkeeping that make `relationshipState`'s transitions well-defined and reproducible.

---

## 7. Next validation

The next blind matrix (V5) must target: the §1 causal-blame/trait-word contrast (both audience variants), the §2 ASK_FACT/ASK_BOUNDARY/ASK_REQUIRED_FUNCTION triad, the §3 OBSERVE/OTHER pair, the §4 NOT_RELEVANT/AVOID triad, the §5 DISCOVER/SEEK_PERMISSION pair including a register (polished/blunt) check, plus regression probes for the V14 items that already passed cleanly in V15 (RECONSIDER vs CROSS_WITHOUT_PERMISSION repetition/compound/near-miss, apology+insult/dismissal same turn, public/private PUBLIC_SHAMING, threat vs neutral fallback, WITHDRAWN terminal behavior, ambiguity defaults).

Implementation remains blocked until the classifier and design-audit gates in V13 §10 pass.

READY_FOR_IMPLEMENTATION = NO
