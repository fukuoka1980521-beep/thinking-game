# NEW LIFE V15 — BLIND VALIDATION V4 + V13/V14 AUDIT RESULT V1

Date: 2026-09-24
Status: VALIDATION RESULT / NO PRODUCT CODE / READY_FOR_IMPLEMENTATION = NO

## 0. What this covers

Requested by the "NEXT BLIND VALIDATION — POST V14" task:

1. A new blind matrix (`BLIND_STATE_INTERPRETATION_MATRIX_V4.md`, 34 cases U01-U34) stress-testing the 8 areas V14 opened: DISCOVER vs SEEK_PERMISSION, repeated RECONSIDER without conversion to override, compound request+execution utterances, apology+insult same turn, identical public/private blame wording, threat vs neutral fallback, terse/dialectal paraphrase fairness, WITHDRAWN terminal behavior + event precedence.
2. A hidden oracle, not linked from the matrix.
3. 3 independent blind classification runs (A/B/C), each an isolated subagent instructed to read ONLY the matrix file.
4. Scoring against the V13 §10 acceptance gates.
5. A standalone blind design audit of V13-as-patched-by-V14, isolated to those two files only.

No product code, semantic/state types, or runtime logic was implemented. `chatgpt/newlife-phase34-human-playtest-repair` was not touched and is not part of this work.

---

## 1. Gate results

| Gate | Threshold | Result | Verdict |
|---|---|---|---|
| ACTION exact agreement | >=90% | 91/102 = 89.2% | **FAIL** (narrow) |
| BOUNDARY_MODE exact agreement | >=90% | 91/102 = 89.2% | **FAIL** (narrow) |
| Persistent-negative-event existence agreement | >=95% | 99/102 = 97.1% | PASS (numeric) — see finding F1 |
| Exact relational-event-set agreement | >=90% | 89/102 = 87.3% | **FAIL** |
| No systematic polished-vs-rough gap | >10pp difference disqualifies | 0pp on both tested pairs | PASS |
| RECONSIDER vs CROSS_WITHOUT_PERMISSION (13 targeted cases) | >=90% | 39/39 = 100% | PASS |
| Public/private PUBLIC_SHAMING (4 targeted cases) | >=95% | 12/12 = 100% | PASS |

**4 of 7 gates pass. 3 fail.** Per the task's own instruction ("do not implement ... unless ALL gates pass"), **implementation stays blocked.** This is the expected, requested outcome path when gates don't all clear — report the exact failing cases and propose the smallest fix, not a redesign.

All three failing gates trace to the *same handful of underspecified ontology pairs*, not to broad, scattered disagreement — see §3.

---

## 2. Oracle-authoring corrections (transparency)

While scoring, 6 of 34 cases showed all 3 independent runs unanimously disagreeing with the first-drafted oracle. Re-deriving each from the normative V13/V14 text confirmed the oracle (not the runs) was wrong in each case; these were corrected before final scoring (gate numbers above already reflect the corrected oracle):

- **U03, U04** — action corrected to `COMMIT_PLAN` (the scene context already establishes the rewrite proposal; the utterance itself is the commit-confirmation step, which is a different ACTION than proposing/assigning).
- **U17** — corrected to `PROPOSE_REWRITE` / `SEEK_PERMISSION` (the turn explicitly asks "それでいい?" before committing — textbook SEEK_PERMISSION, not AVOID).
- **U20** — corrected to `REQUEST_RECONSIDERATION` / `RECONSIDER` (the utterance is a conditional threat — "if you don't, then X" — not a declared/executed override; it was originally oracled as CROSS_WITHOUT_PERMISSION by over-anchoring on V13's THREAT-definition example text rather than re-deriving the ACTION/BOUNDARY_MODE from the compound-utterance/declaration rule).
- **U30** — corrected to `SUMMARIZE` / `NOT_RELEVANT` (the turn reports already-completed work; it does not assign or negotiate anything).
- **U34** — corrected to `ASK_BOUNDARY` / `needsClarification=false` (the case's single ongoing topic makes "それ" inferable without an explicit preceding referent; true ACTION-ambiguity needs multiple live referents in play, which only U33 actually has).

This is disclosed because it matters for how much weight to put on the gate numbers: the corrections went *toward* the runs' answers, not away from them, so this is not a case of discarding inconvenient data — it's the oracle catching up to a better reading. Full errata: `blind/BLIND_STATE_INTERPRETATION_ORACLE_V4.md`.

---

## 3. Findings and proposed clarifications (smallest fix, no product code)

### F1 — Highest priority: causal-blame phrasing is inconsistently triggering PERSONAL_INSULT / DISMISSES_CONCERN (drives the exact-event-agreement FAIL)

Cases U16-U19 and U30-U31 all contain a causal-blame construction — 「美香が今さら騒いでるせいで止まってる」, 「美香がごねてるせいで稽古が進まない」, 「美香が変に騒がなければもっと早かった」. All three blind runs added a *secondary* relational event (PERSONAL_INSULT in 2/3 runs, DISMISSES_CONCERN in the third) on top of the structurally-correct primary read (PUBLIC_SHAMING presence/absence, which all 3 runs got 100% right — see F3). This happened even in **U17, the one-on-one private case where the oracle (following the project's own V3 precedent for this exact sentence) recorded no event at all** — a reproducible 3/3 false positive.

This is exactly the failure mode the V7-through-V14 iteration exists to prevent: content that reads as "critical in tone" quietly acquiring a relational-event tag even where V13's own examples (「面倒だな、この修正」= not insult) suggest it shouldn't. It is not proof that tone is leaking back in — PUBLIC_SHAMING's *presence-based* logic held perfectly (100%, see F3) — but the PERSONAL_INSULT/DISMISSES_CONCERN *line* for causal-blame ("〜のせいで") and behavior-labeling ("ごねてる"/"騒いでる") phrasing is not yet pinned down precisely enough to get 3 independent readers to agree, or to agree with the project's own prior precedent.

**Proposed clarification (smallest fix):** add 2 contrastive worked examples to V13 §2 / V14's PERSONAL_INSULT and DISMISSES_CONCERN definitions, specifically for causal-blame constructions ("X のせいで〜") and behavior-labeling verbs ("ごねる", "騒ぐ") — stating explicitly whether attributing a delay to a named person, without a trait-label, counts as PERSONAL_INSULT. No ontology change, no new event type — just two more contrast pairs alongside the existing 「お前ほんと面倒くさい」/「面倒だな、この修正」pair.

### F2 — ACTION/BOUNDARY_MODE FAIL is concentrated in 3 identifiable pairs, not broad drift

- **`ASK_FACT` vs `ASK_BOUNDARY`** (U02, 2/3 runs): when the fact requested *is* the boundary's scope ("which part of the real story do you dislike?"), is that ASK_FACT or ASK_BOUNDARY? V13 says DISCOVER is "only about a person's boundary, not any generic information request" but doesn't resolve the case where the requested fact and the boundary are the same thing.
- **`OBSERVE` vs `OTHER`** (U18/U19, 2/3 runs): a pure reactive/blame statement with no actionable plan or request has no assigned home in V13's ACTION list description. Both values are defensible; the list just doesn't say which to prefer.
- **`NOT_RELEVANT` vs `AVOID`** for understudy/cast-substitution plans (U21/U23, 3/3 runs): V13 §9 has a literal worked example for this exact case ("出ないなら代役探す" -> NOT_RELEVANT), but that example did not make it into the V4 matrix's rule text, so all 3 isolated runs independently (and reasonably) inferred AVOID instead. This reads as a matrix-authoring gap more than a V13 spec gap — but it also shows V13's NOT_RELEVANT/AVOID definitions alone, without the worked example, are not sufficient to reproduce the intended classification.
- **`DISCOVER` vs `SEEK_PERMISSION`** when a boundary question names a specific candidate mitigation in the same breath (U24/U25, 2/3 runs): "実話を外せば出演していただけますか?" proposes a concrete condition and asks about it in one utterance — genuinely on the line between "still exploring the boundary" and "seeking permission for an implicit proposal."

**Proposed clarification (smallest fix):** one short disambiguating rule + one worked example for each of the 3 pairs above, added to V13 §1. No structural change.

### F3 — Clean passes worth stating plainly, not just the failures

- **RECONSIDER vs CROSS_WITHOUT_PERMISSION: 100% (39/39).** This is the exact distinction V14 was written to close (repetition, compound utterances, question-mark-disguised declarations, threat-attached requests), and it held perfectly across all 3 independent runs and every sub-variant tested (U05-U12, U20, U22, U26, U27, U29). This is the strongest evidence in this round that V14's compound-utterance rule (§6) and ambiguity-protection rule (§7) are actually implementable as written, not just well-intentioned.
- **Public/private PUBLIC_SHAMING: 100% (12/12).** The three-part presence test (target present + third party present + public blame) was applied correctly in every case, including the two "identical wording, different audience" pairs (U16/U17, U18/U19) — the audience variable alone correctly flipped the classification every time.
- **Apology+insult / apology+dismissal same turn: 100% exact match (U13-U15, 9/9).** All 3 runs correctly reported *both* events in the same turn without letting either suppress the other — matching V13 §5's "detection and state update are separate" requirement exactly (the runs did not attempt to resolve which event "wins"; that's correctly left to the downstream deterministic step per V14 §2/§4).
- **No polished-vs-rough gap: 0pp on both tested pairs.** Wherever a run disagreed with the oracle on the polished member of a pair, it disagreed identically on the blunt/terse member, and vice versa. No run classified the same underlying content differently based on register. This directly answers the fairness question this round was scoped to check.
- **WITHDRAWN terminal behavior (U28, U29, U32): 3/3 correct on all three.** Repair attempts under WITHDRAWN still register ACKNOWLEDGES_MISTAKE; override attempts under WITHDRAWN still register CROSS_WITHOUT_PERMISSION; a new threat under WITHDRAWN still registers THREAT. None of the 3 runs let the relationship-state note itself change how the turn was classified, consistent with V13 §5's detection/state-update separation.

---

## 4. Standalone blind design audit — V13 as patched by V14

Run in isolation (only V13 + V14 in context). Full report below; verdict: **MIXED_REVISE**.

**Blockers**
- **B1.** RELIABILITY's transition table has no `WITHDRAWN` row, unlike SEVERE_RUPTURE, STRAIN, and REPAIR (which all explicitly state WITHDRAWN cannot be exited this case). An implementer following only the RELIABILITY block has no stated default and could code an unintended exit from WITHDRAWN via KEEPS_PROMISE.
- **B2.** "Corrective action" gates two recovery transitions (REPAIR clearing a STRAIN; RELIABILITY's GUARDED->NEUTRAL) but is never mapped to a concrete ACTION value or defined as "completed."
- **B3.** `REPAIR_WINDOW` has no target, expiry, or consumption rule — if more than one STRAIN is unresolved, which one clears is unspecified, and whether the window expires or is reusable is unstated.
- **B4.** "Reversible STRAIN" and "unresolved severe rupture" are used as gating conditions but never defined, and there's no ledger field tracking which state a GUARDED NPC's history actually came from.
- **B5.** The REPAIR-vs-RELIABILITY same-turn interaction (both triggers, no negative event) is untested — precedence says REPAIR wins, but REPAIR's effect is "none," and it's unstated whether the co-occurring KEEPS_PROMISE still counts toward the two-observation threshold the way §4 explicitly allows for the STRAIN-wins case.
- **B6.** No schema section enumerates the new per-NPC persistent fields V14 introduces (`REPAIR_WINDOW`, `PRESSURE_AFTER_NO` as a count, reliability-observation count, promise-break count for the "third confirmed BREAKS_PROMISE" trigger).

**Non-blocking risks:** V13's "four independent outputs" are only labeled A/B, not C/D (cosmetic); "new information" (for the PRESSURE_AFTER_NO escalation test) isn't defined but is low-risk since that flag explicitly never feeds relationship state; the RELIABILITY baseline for a never-strained NPC isn't stated; GUARDED->NEUTRAL and NEUTRAL->OPEN are two different thresholds worth keeping distinct during implementation; the BREAKS_PROMISE counter's reset condition after a cleared STRAIN isn't spelled out.

**On tone-blindness specifically:** the audit found the RECONSIDER/CROSS_WITHOUT_PERMISSION design "well-designed," citing the compound-utterance rule, the explicit non-state-factors list, and the "operational commitment, not politeness" statement — consistent with what the blind classification runs independently confirmed empirically (F3 above, 100% agreement).

This lines up with our own classifier findings: the *conceptual* architecture (four-layer separation, deterministic validator, no additive score, tone-blind boundary classification) checks out from both the design-audit side and the empirical blind-run side. What's still missing on both sides is precise operational definition at the edges — undefined recovery-gating terms in the design contract, and under-specified secondary-event boundaries in the classifier ontology.

---

## 5. Overall verdict

**GATES: 4/7 PASS, 3/7 FAIL — implementation stays blocked (`READY_FOR_IMPLEMENTATION = NO`), as required by both V13 §10 and V14 §8.**

**Design audit: MIXED_REVISE.**

None of the failures found in this round require touching the four-layer architecture, the event taxonomy, or the relationship-state machine. Every failing gate traces to a small, named set of definitional gaps (2 relational-event contrast pairs, 3 ACTION/BOUNDARY_MODE disambiguation pairs, 6 undefined/underspecified terms in the V13/V14 recovery mechanics) — all fixable as targeted clarifications to existing documents, consistent with this task's instruction to propose only the smallest ontology/spec/matrix clarification needed. No product code, semantic/state types, or scoring logic should be implemented until a V5 matrix re-tests these specific points and a V15-successor design patch closes B1-B6.
