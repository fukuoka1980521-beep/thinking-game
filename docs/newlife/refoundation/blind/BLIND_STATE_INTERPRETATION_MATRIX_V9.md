# NEW LIFE — BLIND STATE INTERPRETATION MATRIX V9

## Isolation

Use ONLY this file.
Do not inspect any other file, review, issue, owner context, prior run, or oracle.

## Output

Return one JSON array, one object per case:

```json
{
  "id":"Z01",
  "action":"...",
  "boundaryMode":"...",
  "relationalEvents":[],
  "needsClarification":false
}
```

Allowed ACTION:
ASK_FACT, ASK_BOUNDARY, ASK_REQUIRED_FUNCTION, PROPOSE_REWRITE, ASSIGN_REWRITE, COMMIT_PLAN, REASSIGN_WORK, CUT_SCENE, USE_UNDERSTUDY, CHANGE_STAGING, ACCEPT_SHORTER_SCENE, MOVE_PRIVATE, DELAY_DECISION, REQUEST_RECONSIDERATION, FORCE_UNCONFIRMED_PLAN, APOLOGIZE_AND_REPAIR, SUMMARIZE, OBSERVE, CLARIFY, OTHER

Allowed BOUNDARY_MODE:
NOT_RELEVANT, DISCOVER, AVOID, SEEK_PERMISSION, RECONSIDER, CROSS_WITHOUT_PERMISSION, UNKNOWN

Allowed RELATIONAL_EVENTS:
PERSONAL_INSULT, PUBLIC_SHAMING, THREAT, FALSE_ATTRIBUTION, DISMISSES_CONCERN, BREAKS_PROMISE, KEEPS_PROMISE, ACKNOWLEDGES_MISTAKE

You are classifying a single turn each time. You are NOT deciding whether any relational event's downstream consequence is "resolved," "completed," produces a relationship-state transition, resets any counter, or consumes any repair window — all of that is a separate deterministic step outside your task. Report only what the turn itself contains.

## Rules (normative, V13 as patched by V14, V16, V18, V20, V22, and V24)

- tone/shortness/dialect/command form/politeness do not create or remove persistent events, and do not change ACTION/BOUNDARY_MODE by themselves;
- **PERSONAL_INSULT closed test.** Given a predicate applied to a named person P: Step 1 — does the predicate's grammatical subject resolve to P (not a task, decision, plan, or situation) — including via a body-part or personal-attribute noun (頭, 性格, 性根) standing in for P? If not, no PERSONAL_INSULT. Step 2 — classify the predicate into exactly one of two categories:
  - **(a) Stative trait-predicate** — satisfies PERSONAL_INSULT. This includes: a な-adjective/adjectival-noun+copula or an い-adjective used as a characteristic predicate of P; a noun+copula name-calling construction, whether or not the copula (だ/です) is present; a fixed idiom predicating an enduring mental/moral state of P via a body-part/attribute surface subject (頭おかしい, 性根が腐ってる, 性格が歪んでる); and the stative-resultative -てる/-でる form of a change-of-state verb that asserts an enduring character or mental condition of P (腐ってる, ひねくれてる, いかれてる, 歪んでる, applied to a person's character/mind).
  - **(b) Event predicate** — does not satisfy PERSONAL_INSULT by itself, however informal or pejorative-sounding, and regardless of whether it also appears inside a causal-blame frame ("Xのせいで〜"). This includes any verb, in any conjugation, describing a bounded, ongoing/repeatable action P performed or is performing — progressive-aspect -てる readings (ごねてる, 騒いでる, 渋ってる, ふざけてる) are category (b), not category (a);
- DISMISSES_CONCERN requires explicit invalidation of a stated concern's legitimacy (気にしすぎ, 大げさ) — attributing a delay/problem to someone's action is not the same as invalidating their concern, and is not itself DISMISSES_CONCERN;
- PUBLIC_SHAMING requires all three: the target is present, at least one third party beyond the target is also present, and the player publicly attributes blame/defect/embarrassing fault to the target. A private statement with only the target present is not PUBLIC_SHAMING;
- **corrective-action / apology turns.** A turn whose ACTION = APOLOGIZE_AND_REPAIR and which validates ACKNOWLEDGES_MISTAKE is classified the same way regardless of any later operational follow-through, regardless of who witnesses it, and regardless of any framing note in a case's context describing this turn as "the completion of an earlier corrective action" — that framing describes a separate deterministic bookkeeping step, not something you detect or report. If the same turn also states or commits a concrete operational plan, classify that plan's own BOUNDARY_MODE exactly as you would if it were stated alone (AVOID if the plan stays inside a known limit, SEEK_PERMISSION if it names a specific candidate condition and asks for confirmation, NOT_RELEVANT if the plan removes the boundary-holder from the task entirely). If the turn contains no plan/boundary-relevant content beyond the apology itself, BOUNDARY_MODE = NOT_RELEVANT;
- an apology (ACKNOWLEDGES_MISTAKE) and any other validly-detected event (PERSONAL_INSULT, DISMISSES_CONCERN, KEEPS_PROMISE, etc.) can co-occur in the same turn — report every event you find; do not let one suppress another, and do not decide which one "wins" a relationship-state transition (that is a separate deterministic step, not your output);
- **PROPOSE_REWRITE vs. COMMIT_PLAN vs. ASSIGN_REWRITE.** A declarative rewrite/plan statement remains ACTION=PROPOSE_REWRITE regardless of hedging particles (だよ, それ, けど, かな, と思う, and similar register markers) or of politeness register — neither hedging nor politeness upgrades or downgrades it. ACTION=COMMIT_PLAN requires the same turn to also contain an explicit decision-as-settled marker (決定, 確定, or an equivalent explicit statement that the matter is settled) applied to the plan itself, distinct from merely restating or proposing it. ACTION=ASSIGN_REWRITE requires the turn to delegate the rewriting work itself to a named person, rather than stating or settling what the plan will be. A turn that proposes a plan and also asks the boundary-holder to confirm it is PROPOSE_REWRITE with BOUNDARY_MODE=SEEK_PERMISSION, not COMMIT_PLAN;
- KEEPS_PROMISE requires an existing ledger commitment with a known deadline/condition that the player-controlled turn fulfills;
- FALSE_ATTRIBUTION requires the player to state as fact a motive/action/claim about someone that the case's fact ledger (given in context) shows is false or unsupported;
- THREAT requires an adverse consequence explicitly used as leverage to compel compliance. An ultimatum phrased as "if you don't do X, then Y" pressures the person toward the original ask but does not itself advance or declare the world action proceeding without her — classify that shape as REQUEST_RECONSIDERATION / RECONSIDER (with THREAT also reported), not as FORCE_UNCONFIRMED_PLAN / CROSS_WITHOUT_PERMISSION, unless the turn separately declares or executes the crossing;
- **ASK_BOUNDARY vs ASK_FACT vs ASK_REQUIRED_FUNCTION:** if answering the question would define, narrow, or reveal a person's stated line/limit/refusal scope, it is ASK_BOUNDARY, even if grammatically phrased as a fact-question. A boundary question that names a concrete mitigation candidate and asks for confirmation on it is still ASK_BOUNDARY, with BOUNDARY_MODE=SEEK_PERMISSION rather than DISCOVER, since it is narrowing toward a specific proposed line rather than asking the boundary-holder to state their limit in open terms;
- **OBSERVE vs OTHER:** OBSERVE is a statement about the situation that does not name a specific person as responsible. OTHER names a specific person as the cause of the problem, or is a directed dismissive/reactive response aimed at the person (in second person, to their face, or in third person about them) — in either case carrying no request/plan/assignment — even when it contains no trait word and triggers no relational event. If a plan, request, or assignment is present in the same turn as a directed dismissive/blame statement, classify by that plan/request's own ACTION instead of OTHER;
- **NOT_RELEVANT vs AVOID:** if a plan removes the boundary-holder from the task entirely (understudy, cut, reassignment to someone else), BOUNDARY_MODE = NOT_RELEVANT. If the plan still has the boundary-holder performing a modified version of the task reshaped to stay inside their stated limit, BOUNDARY_MODE = AVOID;
- RECONSIDER asks again for the same previously refused act while still leaving refusal operationally possible, even on a second or third repeat, as long as no execution is declared/committed;
- CROSS_WITHOUT_PERMISSION occurs only when the player declares the refused plan as decided, orders its execution, or the turn advances the world action across the known boundary without agreement;
- if an utterance sounds insistent but does not clearly commit a world action, do not infer CROSS_WITHOUT_PERMISSION — use RECONSIDER, or CLARIFY if even the requested act is unclear;
- **relationship-state and history notes given in a case's context (e.g. an NPC is currently GUARDED, NEUTRAL, or WITHDRAWN; an NPC had an earlier SEVERE_RUPTURE-class event this scene; an NPC had a later STRAIN-class event after an earlier SEVERE_RUPTURE this scene; a turn is framed as "completing" an earlier corrective action; a turn is framed as consuming or not consuming a repair window; a turn is framed as eligible or ineligible for a relationship-state transition, or as resetting or not resetting any counter) describe prior history/bookkeeping only and do not change how you classify the current turn, and do not themselves create or remove any event — classify the turn on its own terms, using only what it actually contains. A relationship-state or history note about one NPC also has no bearing on how you classify a turn addressed to a different NPC;**
- if ACTION is genuinely ambiguous, output CLARIFY with needsClarification=true (and BOUNDARY_MODE=UNKNOWN);
- if only the boundary *relation* is ambiguous while the action itself is clear, output the clear ACTION with BOUNDARY_MODE=UNKNOWN and needsClarification=false.

## Shared case facts

Mika has explicitly refused public performance of the scene while her real personal story remains substantially intact; she has not agreed to any modified version unless a case says otherwise. Ryo is the director. Unless a case says otherwise, assume the case's usual working commitment ledger contains no promises yet. Where a case says "group present" or "third party present," at least one cast member beyond the addressed person is present, unless a specific person is named.

---

### Z01 — earlier SEVERE_RUPTURE, later STRAIN, currently GUARDED (never WITHDRAWN): plain boundary-safe settle turn
Context: Ryo's relationship state is currently GUARDED. He has had exactly one SEVERE_RUPTURE-class event logged earlier this scene, and a separate STRAIN-class event logged after it (his most recent logged event is the STRAIN, not the SEVERE_RUPTURE). He has never reached WITHDRAWN this case. Private, only Ryo present.
「実話は外した版でいくよ。それで決定」

### Z02 — same history note as Z01: apology, no plan content
Context: same as Z01 (Ryo GUARDED; earlier SEVERE_RUPTURE, then a later STRAIN; most recent logged event is the STRAIN; never WITHDRAWN). Private, only Ryo present.
「さっきは言い過ぎた、ごめん」

### Z03 — same history note as Z01: fresh insult
Context: same as Z01. Private, only Ryo present.
「リョウ、いい加減にしてよ、性根が腐ってる」

### Z04 — cross-NPC isolation: Mika turn, Ryo's Z01-style history note is irrelevant
Context: same Ryo history note as Z01 still holds in the background. Separately, Mika has already said 「無理です」once this scene. Private, only Mika present.
「もう決めたから。このまま続けるよ」

### Z05 — explicit "consumes repair window without transition" framing note: turn content is a plain apology + boundary-safe plan
Context: this turn is described in context as one that will consume Ryo's repair window without producing a relationship-state transition, because Ryo has an earlier SEVERE_RUPTURE this scene. Private, only Ryo present.
「さっきは強く言い過ぎた、悪かった。予定通り、実話を外した版で進めるよ」

### Z06 — explicit "resets promiseBreakCount" framing note: turn content is KEEPS_PROMISE
Context: this turn is described in context as one the deterministic layer will use to decide whether the player's promiseBreakCount with Ryo resets. The player committed earlier this scene, to Ryo, to have a revised scene ready by 17:00; it is now 17:00. Private, only Ryo present.
「約束通り、17時までに直した版を用意したよ」

### Z07 — currently WITHDRAWN, most-recent-event-is-STRAIN framing (the old dead-text scenario, now for a terminal NPC): apology + plan
Context: Mika's relationship state is currently WITHDRAWN, from an earlier severe rupture this scene, followed by a later STRAIN-class event (her most recent logged event is the STRAIN). Private, only Mika present.
「さっきはごめん。実話は外して直すから」

---

### Z08 — hedged declarative rewrite, no settle/assign marker
Context: private, only Ryo present.
「まあ実話は外すけどさ、それで」

### Z09 — explicit decision-as-settled marker
Context: private, only Ryo present.
「じゃあこれで決定。実話は外した版で本番まで進める」

### Z10 — explicit delegation of the rewriting work itself
Context: private, only Ryo present.
「リョウ、この版に書き直して」

### Z11 — register pair (polished): hedged declarative rewrite
Context: private, only Ryo present.
「多少不安はございますが、実話は外す方向で進めさせていただければと存じます」

### Z12 — register pair (blunt): same content as Z11
Context: private, only Ryo present.
「まあ実話は外す感じでいくわ」

---

### Z13 — idiom via stative-resultative verb form: ひねくれてる
Context: private, only Mika present, said directly to her.
「美香、そういうとこ本当にひねくれてるよね」

### Z14 — control: progressive causal-blame verb, not a trait
Context: private, only Mika present, said directly to her.
「美香が渋ってるせいで押してる」

---

### Z15 — private causal-blame statement, no third party
Context: private, only Mika present.
「美香が今さらごねてるせいで押してる」

### Z16 — same wording, group present
Context: Mika and Ryo both present.
「美香が今さらごねてるせいで押してる」

---

### Z17 — regression: repeated RECONSIDER after explicit NO
Context: Mika has already said 「無理です」once this scene. Private, only Mika present.
「本当に一部も変えられない?」

### Z18 — regression: compound request + declared execution
Context: Mika has already said 「無理です」once this scene. Private, only Mika present.
「悪いけど、時間切れだからこのまま行くね」

### Z19 — regression: conditional ultimatum pressuring reconsideration
Context: Mika has already said 「無理です」once this scene. Private, only Mika present.
「協力してくれないなら、次からは声かけないよ」

---

### Z20 — regression: apology + resultative-idiom insult, same turn
Context: private, only Mika present.
「さっきは悪かった。でも美香もひねくれてるよ」

---

### Z21 — NOT_RELEVANT: plan removes boundary-holder from the task
Context: private, only Ryo present.
「美香の場面はカットしよう」

### Z22 — AVOID: boundary-holder still performs, modified to stay inside limit
Context: private, only Mika present.
「美香には演じてもらうけど、実話に触れる部分だけ変える」

---

### Z23 — SEEK_PERMISSION: boundary question naming a concrete mitigation candidate
Context: private, only Mika present.
「実話の部分を別の設定に変えれば大丈夫?」

### Z24 — DISCOVER: open-ended boundary question, no candidate named
Context: private, only Mika present.
「どの辺だったら平気?」

---

### Z25 — genuinely ambiguous action
Context: private, only Ryo present.
「うーん、どうかな…」

### Z26 — boundary-referent ambiguous, action clear
Context: two live boundary-related topics this scene (removing the real-story dialogue from the scene, versus Mika attending the after-party). Private, only Mika present.
「そっちも難しい?」

---

### Z27 — OBSERVE: situational statement, no named responsible person
Context: private, only Ryo present.
「もう時間がほとんどない」

### Z28 — OTHER: third-person-directed dismissive blame, no plan attached
Context: private, only Ryo present, said about Mika who is not present.
「また美香がああやってこじらせるんだから」
