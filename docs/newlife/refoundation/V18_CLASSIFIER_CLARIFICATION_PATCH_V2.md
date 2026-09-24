# NEW LIFE V18 — CLASSIFIER CLARIFICATION PATCH V2

Date: 2026-09-24
Status: DESIGN CONTRACT PATCH / NO PRODUCT CODE
Normative over: V13 (state interpretation contract), V14 (relationship transition closure), and V16 (classifier clarification patch V1) where they conflict. Does not change the four-layer architecture, the ACTION/BOUNDARY_MODE/RELATIONAL_EVENTS/LANGUAGE_STYLE separation, the relationship-state machine's four values, or the event taxonomy.

## 0. Why V18

V17's blind validation (matrix V5, 3 independent runs + hidden oracle) found **7/7 classifier gates passing** — the ontology itself is empirically clean. Implementation stayed blocked only on the standalone design audit of V13+V14+V16, which returned `MIXED_REVISE` with 3 blockers (B-a, B-b, B-c). This patch closes exactly those three, and only those three plus the ACTION-ontology questions V17 flagged as blocking (none were — both were explicitly non-blocking). No new event types, no new ACTION/BOUNDARY_MODE values, no additive scoring.

---

## 1. Closed trait-judgment rule for PERSONAL_INSULT (closes B-a)

V16 §1 illustrated the causal-blame vs. trait-judgment distinction with an "e.g." example list on each side. That is not a closed rule: a word outside the six examples had no defined resolution path, which reopens the exact tone-leakage risk the distinction exists to close. This section replaces the example list with a closed, two-step grammatical test. A deterministic validator runs this test; it never needs an open lexicon and never expands by adding new example words.

### 1.1 The test

Given a candidate predicate applied to a named person P in the utterance:

**Step 1 — Subject test.** Does the predicate's grammatical subject resolve to a specific person (P), rather than to a task, decision, situation, or event? If the subject is not a person, PERSONAL_INSULT does not apply (unchanged from V13 — e.g. 「面倒だな、この修正」, subject = 「この修正」).

**Step 2 — Predicate-category test.** Classify the predicate applied to P into exactly one of two closed categories:

- **(a) Stative trait-predicate.** The predicate is:
  - a な-adjective / adjectival noun (形容動詞) used with a copula (だ/です/な), asserting an enduring characteristic of P (「Pはわがまま**だ**」「P、身勝手**だな**」); or
  - an い-adjective (形容詞) used as a stative characteristic predicate directly of P, not of an action P performed (「P、うざ**い**」); or
  - a noun-plus-copula construction that functions as a categorical name-calling label for P as a person (「Pはバカ**だ**」「クズ**だ**」「サイテー**だ**」) — the noun denotes a category of person/worth, not a bounded action; or
  - a fixed idiomatic phrase that predicates an enduring mental/moral state of P even when its surface subject is a body part or attribute standing in for P (「頭おかしい」said of P, 「性格悪い」said of P) — these resolve to P under Step 1 because the idiom's referent is P, not the body part literally.
  - **Result:** trait-judgment condition satisfied → PERSONAL_INSULT (subject to the same "directed at P" requirement V13 §2 already states).

- **(b) Event predicate.** The predicate is a verb (動詞) — plain, conjugated, or in a compound/auxiliary form (〜てる/〜すぎ/〜がち etc.) — describing a specific, time-bounded action or behavior P performed or is performing (ごねる, 騒ぐ, 渋る, 遅れる, サボる, グズグズする, 邪魔する). This holds regardless of how informal, irritated, or pejorative-sounding the verb is.
  - **Result:** trait-judgment condition not satisfied by this predicate alone → no PERSONAL_INSULT from this predicate (PUBLIC_SHAMING and DISMISSES_CONCERN remain independently available per their own tests).

**Decision procedure, restated as one line:** *is the predicate applied to P a stative characteristic-copula construction (category a), or a bounded-action verb (category b)?* This is answerable from the sentence's grammar alone (predicate part-of-speech + copula presence vs. verb conjugation), not from a word list, and covers every predicate a Japanese sentence can form — there is no third case a future word could fall into.

### 1.2 Worked examples (illustrative, not exhaustive — the rule in 1.1 is what is normative)

| Utterance | Step 2 category | Result |
|---|---|---|
| 「美香が今さら騒いでるせいで止まってる」 | (b) 騒ぐ, verb | no PERSONAL_INSULT |
| 「美香がごねてるせいで稽古が進まない」 | (b) ごねる, verb | no PERSONAL_INSULT |
| 「美香がわがままなせいで止まってる」 | (a) わがまま+な, na-adjective | PERSONAL_INSULT |
| 「お前ほんと面倒くさい」 | (a) 面倒くさい, i-adjective/na-adj predicated of the person | PERSONAL_INSULT |
| 「面倒だな、この修正」 | fails Step 1 — subject is the task | no PERSONAL_INSULT |
| 「お前はバカだ」 | (a) noun+copula name-calling | PERSONAL_INSULT |
| 「頭おかしいんじゃないの」 (said of P) | (a) idiomatic mental-state predicate resolving to P | PERSONAL_INSULT |
| 「美香、最低だよ」 | (a) na-adjective/noun-copula worth-judgment | PERSONAL_INSULT |
| 「美香がグズグズしてるせいで押してる」 | (b) グズグズする, verb (compound but still an action description) | no PERSONAL_INSULT |
| 「美香のわがままのせいでこうなってる」 | (a) わがまま as the stated cause, applied to P as a nominalized trait | PERSONAL_INSULT (and PUBLIC_SHAMING independently, if presence conditions met — V14 §3's explicit combo rule) |

DISMISSES_CONCERN is unaffected by this section and keeps its own V13 §2 / V16 §1 test (explicit invalidation of the concern's legitimacy — 気にしすぎ, 大げさ — distinct from either category above).

---

## 2. PUBLIC_SHAMING and FALSE_ATTRIBUTION corrective actions (closes B-b)

V16 §6.2 defined a corrective action for DISMISSES_CONCERN/PERSONAL_INSULT and for BREAKS_PROMISE, but left PUBLIC_SHAMING with no corrective-action path at all and did not map FALSE_ATTRIBUTION's correction to a concrete ACTION value. Both are added below, following the same shape as the existing two branches and using only ACTION values already in the V13 §1.A allowed list — no new ACTION value is introduced.

### 2.1 PUBLIC_SHAMING corrective action

A corrective action for a PUBLIC_SHAMING-caused STRAIN is a later, separately validated turn whose ACTION = **APOLOGIZE_AND_REPAIR**, where:

- the turn validates the relational event ACKNOWLEDGES_MISTAKE, addressed to the target (P), retracting the public blame attribution; and
- if at least one of the original third-party witnesses is still present, the acknowledgement is made with that witness present (matching the original harm's audience — a private-only retraction of a public attribution does not complete this branch, since the false public framing would otherwise stand uncorrected in front of the same witness). If no original witness remains present in the scene, a private acknowledgement to P satisfies this condition (there is no one left to retract the framing in front of); and
- a subsequent operationally-validated ACTION (PROPOSE_REWRITE, ASSIGN_REWRITE, COMMIT_PLAN, etc.) demonstrates the underlying concern was taken seriously — the same "operational component" requirement V16 §6.2's other branches already use.

This is the same shape as the DISMISSES_CONCERN/PERSONAL_INSULT branch, with one addition specific to PUBLIC_SHAMING's own definition (V13 §2): because the triggering harm required a witness present, the correction's acknowledgement component is witness-sensitive in the same way, using only the "is a third party present" fact the interpreter already tracks per V13 §8 — no new context requirement is added.

### 2.2 FALSE_ATTRIBUTION corrective action, mapped to a concrete ACTION value

A corrective action for a FALSE_ATTRIBUTION-caused STRAIN is a later turn whose ACTION = **APOLOGIZE_AND_REPAIR**, where:

- the turn validates ACKNOWLEDGES_MISTAKE; and
- the turn's content explicitly retracts or corrects the specific false claim, checked against the same world-fact ledger that validated the original FALSE_ATTRIBUTION event (V13 §2's existing ledger requirement — no new ledger field is introduced).

This closes the mapping gap the audit found: V16 §6.2's FALSE_ATTRIBUTION branch said "an explicit correction of the false claim, validated against the world-fact ledger" without stating which ACTION value that correction carries. It carries ACTION = APOLOGIZE_AND_REPAIR, identically to §2.1 and to V16's existing DISMISSES_CONCERN/PERSONAL_INSULT branch — all three corrective-action branches now use the same single ACTION value, differing only in what the validator checks the turn's content against (a stated boundary/plan, a ledger fact, or a witness-presence condition).

### 2.3 Completion (unchanged from V16 §6.2)

Completion still requires the operational component to actually execute and be validated, not merely be proposed. A turn with ACTION=APOLOGIZE_AND_REPAIR alone, with no subsequent validated operational action (§2.1) or no ledger-checked retraction (§2.2), opens/refreshes REPAIR_WINDOW (V14 §3) but does not by itself complete a corrective action.

---

## 3. Per-event resolved/unresolved tracking (closes B-c)

V16 §6.6's `causalEventHistory` is an append-only log with no per-entry status field, while §6.3 describes REPAIR_WINDOW as targeting "the most recently logged **unresolved** STRAIN" — presupposing a status the schema did not provide. This section adds exactly that field and its lifecycle. No entry is ever deleted; the log remains append-only and fully auditable.

### 3.1 Schema addition

Each entry in `causalEventHistory` gains one field:

| Field | Type | Purpose |
|---|---|---|
| `resolved` | bool, default `false` at creation | whether this specific logged event has since been cleared via a completed corrective action |

This is the only addition. `causalEventHistory` remains append-only; `resolved` is the one field on an existing entry that may change after creation, and it changes in one direction only (`false` → `true`), never back.

### 3.2 When an entry becomes resolved

An entry with event class STRAIN becomes `resolved = true` at the moment a corrective action targeting it **completes** (V16 §6.2/§2.1/§2.2's completion definition), which is also the moment REPAIR_WINDOW is consumed for that target (V16 §6.3). Concretely:

1. ACKNOWLEDGES_MISTAKE is validated → `lastStrainEventId` (V16 §6.6) identifies the target entry → REPAIR_WINDOW opens targeting that entry.
2. The corrective action's operational component (§2.1/§2.2/V16 §6.2) later completes → the targeted entry's `resolved` flips to `true` → REPAIR_WINDOW closes (consumed) → the relationship-state transition rules in V16 §6.1/§6.4 that key off "reversible STRAIN" and "no unresolved severe rupture" read `resolved` on the relevant entries to determine eligibility.

Entries with event class SEVERE_RUPTURE are never marked `resolved` in the current case (V14 §1: WITHDRAWN is intentionally terminal for the case; V16 §6.4: SEVERE_RUPTURE-class events are permanently unresolved for the rest of the case, by construction). REPAIR/RELIABILITY entries have no `resolved` field semantics of their own — they are not targets of correction, only sources of it — and are logged with `resolved` fixed at `true` on creation (there is nothing to resolve).

### 3.3 Which entry a REPAIR_WINDOW targets, restated precisely

V16 §6.3 already states REPAIR_WINDOW targets "the most recently logged unresolved STRAIN." With `resolved` now defined: the target is the most recent entry, for that NPC, where `eventClass = STRAIN` and `resolved = false` at the moment ACKNOWLEDGES_MISTAKE is validated. If no such entry exists (every prior STRAIN is already `resolved = true`, or none has been logged), REPAIR_WINDOW still opens per V14 §3 but has no target and cannot be consumed by a later corrective action — an apology with nothing outstanding to correct opens a window that simply expires unused (V16 §6.3's expiry rule already covers this case; it now applies cleanly to a target-less window too).

### 3.4 Auditability

`causalEventHistory` is never rewritten or pruned. `resolved` transitions are themselves visible in the same log by cross-referencing the corrective-action turn's own entry (REPAIR/RELIABILITY class, logged per V16 §6.6 unchanged) against the STRAIN entry's `resolved` flip — both events are present in the append-only history, so the full causal chain (original STRAIN → later correction → resolution) remains reconstructable from `causalEventHistory` alone. This directly answers the audit's "whether history remains auditable" question: yes, by construction, since nothing is ever removed and every state change has a corresponding logged cause.

---

## 4. ACTION-ontology questions from V17 §3 (left non-blocking, per scope)

V17 §3 flagged two open ACTION-label questions (ASK_BOUNDARY vs. PROPOSE_REWRITE for a bundled-candidate boundary question; DELAY_DECISION vs. REQUEST_RECONSIDERATION for a reconsideration request bundled with a contingency plan). Both were explicitly non-blocking in V17 — neither affected any of the 7 gates, and both showed internally consistent (non-register-biased) disagreement. Per this patch's scope (close B-a/B-b/B-c and only genuinely blocking ACTION-ontology questions), these remain open and undecided here. They do not gate implementation.

---

## 5. Next validation

The next blind matrix (V6) must target, narrowly: the §1 closed trait-judgment rule against predicate shapes not in V16's original six-example list (noun+copula name-calling, idiomatic mental-state phrases, compound/auxiliary action verbs, a trait-word-plus-causal-blame combination), the §2.1/§2.2 corrective-action ACTION-value mapping (APOLOGIZE_AND_REPAIR turns following a PUBLIC_SHAMING or FALSE_ATTRIBUTION strain, including a proposal-only turn that should not read as a completed correction), and regression probes for V14 §2's REPAIR+RELIABILITY same-turn ordering (§6.5) plus the items V17 confirmed already pass cleanly (RECONSIDER vs CROSS_WITHOUT_PERMISSION, public/private PUBLIC_SHAMING, apology+insult same turn, threat vs neutral fallback, register fairness).

Implementation remains blocked until the classifier gates (V13 §10) and a design audit of V13+V14+V16+V18 both pass without blockers.

READY_FOR_IMPLEMENTATION = NO
