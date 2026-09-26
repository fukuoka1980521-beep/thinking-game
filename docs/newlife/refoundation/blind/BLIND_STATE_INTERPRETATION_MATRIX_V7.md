# NEW LIFE — BLIND STATE INTERPRETATION MATRIX V7

## Isolation

Use ONLY this file.
Do not inspect any other file, review, issue, owner context, prior run, or oracle.

## Output

Return one JSON array, one object per case:

```json
{
  "id":"X01",
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

You are classifying a single turn each time. You are NOT deciding whether any relational event's downstream consequence is "resolved," "completed," or produces a relationship-state transition — that is a separate deterministic step outside your task. Report only what the turn itself contains.

## Rules (normative, V13 as patched by V14, V16, V18, and V20)

- tone/shortness/dialect/command form/politeness do not create or remove persistent events, and do not change ACTION/BOUNDARY_MODE by themselves;
- **PERSONAL_INSULT closed test.** Given a predicate applied to a named person P: Step 1 — does the predicate's grammatical subject resolve to P (not a task, decision, plan, or situation) — including via a body-part or personal-attribute noun (頭, 性格, 性根) standing in for P? If not, no PERSONAL_INSULT. Step 2 — classify the predicate into exactly one of two categories:
  - **(a) Stative trait-predicate** — satisfies PERSONAL_INSULT. This includes: a な-adjective/adjectival-noun+copula or an い-adjective used as a characteristic predicate of P; a noun+copula name-calling construction, **whether or not the copula (だ/です) is present** (「お前バカ」carries the same predicate category as 「お前はバカだ」— copula ellipsis is a register variation, not a different predicate type); a fixed idiom predicating an enduring mental/moral state of P via a body-part/attribute surface subject (頭おかしい, 性根が腐ってる, 性格が歪んでる); and the **stative-resultative** -てる/-でる form of a change-of-state verb that asserts an enduring character or mental condition of P that would remain true independent of any specific present action (腐ってる, ひねくれてる, いかれてる, 歪んでる, applied to a person's character/mind). Test for the resultative case: if this -てる form is true of P, is one specific ongoing action being described (progressive — category b), or a lasting condition/characterization that persists regardless of what P is doing right now (resultative — category a)? A resultative state description that is not a negative/enduring character or moral judgment (e.g. simple tiredness, illness) does not qualify as category (a) even though it is grammatically resultative.
  - **(b) Event predicate** — does not satisfy PERSONAL_INSULT by itself, however informal or pejorative-sounding, and regardless of whether it also appears inside a causal-blame frame ("Xのせいで〜"). This includes any verb, in any conjugation or compound/auxiliary form, describing a bounded, ongoing/repeatable action P performed or is performing — progressive-aspect -てる readings (ごねてる, 騒いでる, 渋ってる, サボってる, グズグズしてる, ふざけてる) are category (b), not category (a), even though they share the -てる surface form with the resultative cases above.
- DISMISSES_CONCERN requires explicit invalidation of a stated concern's legitimacy (気にしすぎ, 大げさ) — attributing a delay/problem to someone's action is not the same as invalidating their concern, and is not itself DISMISSES_CONCERN;
- PUBLIC_SHAMING requires all three: the target (or an identifiable group containing the target) is present, at least one third party beyond the target is also present, and the player publicly attributes blame/defect/embarrassing fault to the target. This test is independent of whether a trait word is present. A private statement with only the target present is not PUBLIC_SHAMING;
- **corrective-action turns.** A turn whose ACTION = APOLOGIZE_AND_REPAIR and which validates ACKNOWLEDGES_MISTAKE is classified the same way regardless of whether a later operational follow-through is also present in the same turn, is left for a subsequent turn, or is witnessed by someone other than whoever witnessed the original incident — witness identity is not part of your classification task; only report whether the turn's own content acknowledges a mistake and/or states a plan. If the same turn also states or commits a concrete operational plan, classify that plan's own BOUNDARY_MODE exactly as you would if it were stated alone (AVOID if the plan stays inside a known limit, SEEK_PERMISSION if it names a specific candidate condition and asks for confirmation, etc.) — the presence of the apology component does not change what BOUNDARY_MODE the plan content itself carries. If the turn contains no plan/boundary-relevant content beyond the apology itself, BOUNDARY_MODE = NOT_RELEVANT;
- an apology (ACKNOWLEDGES_MISTAKE) and any other validly-detected event (PERSONAL_INSULT, DISMISSES_CONCERN, KEEPS_PROMISE, etc.) can co-occur in the same turn — report every event you find; do not let one suppress another, and do not decide which one "wins" a relationship-state transition (that is a separate deterministic step, not your output);
- KEEPS_PROMISE requires an existing ledger commitment with a known deadline/condition that the player-controlled turn fulfills;
- FALSE_ATTRIBUTION requires the player to state as fact a motive/action/claim about someone that the case's fact ledger (given in context) shows is false or unsupported;
- THREAT requires an adverse consequence explicitly used as leverage to compel compliance. An ultimatum phrased as "if you don't do X, then Y" pressures the person toward the original ask but does not itself advance or declare the world action proceeding without her — classify that shape as REQUEST_RECONSIDERATION / RECONSIDER (with THREAT also reported), not as FORCE_UNCONFIRMED_PLAN / CROSS_WITHOUT_PERMISSION, unless the turn separately declares or executes the crossing;
- **ASK_BOUNDARY vs ASK_FACT vs ASK_REQUIRED_FUNCTION:** if answering the question would define, narrow, or reveal a person's stated line/limit/refusal scope, it is ASK_BOUNDARY, even if grammatically phrased as a fact-question. ASK_FACT is for information unrelated to anyone's boundary (schedule, logistics, wellbeing check). A question about a scene's dramatic/story function is ASK_REQUIRED_FUNCTION;
- **OBSERVE vs OTHER:** OBSERVE is a statement about the situation that does not name a specific person as responsible. OTHER names a specific person as the cause of the problem, or is a directed dismissive/reactive response aimed at the person (in second person, to their face, or in third person about them) — in either case carrying no request/plan/assignment — even when, per the closed test above, it contains no trait word and triggers no relational event. If a plan, request, or assignment is present in the same turn as a directed dismissive/blame statement, classify by that plan/request's own ACTION instead of OTHER;
- **NOT_RELEVANT vs AVOID:** if a plan removes the boundary-holder from the task entirely (understudy, cut, reassignment to someone else), BOUNDARY_MODE = NOT_RELEVANT. If the plan still has the boundary-holder performing a modified version of the task reshaped to stay inside their stated limit, BOUNDARY_MODE = AVOID;
- RECONSIDER asks again for the same previously refused act while still leaving refusal operationally possible, even on a second or third repeat, as long as no execution is declared/committed;
- CROSS_WITHOUT_PERMISSION occurs only when the player declares the refused plan as decided, orders its execution, or the turn advances the world action across the known boundary without agreement;
- if an utterance sounds insistent but does not clearly commit a world action, do not infer CROSS_WITHOUT_PERMISSION — use RECONSIDER, or CLARIFY if even the requested act is unclear;
- relationship-state notes given in a case's context (e.g. an NPC is currently GUARDED or WITHDRAWN) describe prior history only and do not change how you classify the current turn — classify the turn on its own terms, using only what it actually contains;
- if ACTION is genuinely ambiguous, output CLARIFY with needsClarification=true;
- if only the boundary *relation* is ambiguous while the action itself is clear, output the clear ACTION with BOUNDARY_MODE=UNKNOWN and needsClarification=false.

## Shared case facts

Mika has explicitly refused public performance of the scene while her real personal story remains substantially intact; she has not agreed to any modified version unless a case says otherwise. Ryo is the director. Unless a case says otherwise, assume the case's usual working commitment ledger contains no promises yet. Where a case says "witness present" or "group present," at least one cast member beyond Mika and Ryo is present, unless a specific person is named.

---

### X01 — resultative idiom via personality-noun subject: 腐ってる
Context: private, only Mika present.
「美香、性格腐ってるよ」

### X02 — resultative idiom, direct subject: ひねくれてる
Context: private, only Mika present.
「美香、ひねくれてるよね」

### X03 — resultative idiom, direct subject: いかれてる
Context: private, only Mika present.
「美香、いかれてるよ」

### X04 — resultative idiom via personality-noun subject: 歪んでる
Context: private, only Mika present.
「美香の性格、歪んでるよ」

### X05 — contrastive control: progressive activity verb, causal blame, group present
Context: Mika and Ryo both present.
「美香がふざけてるせいで進まない」

### X06 — copula-ellipsis name-calling
Context: private, only Mika present.
「お前バカ」

### X07 — copula-ellipsis name-calling, second word
Context: private, only Mika present.
「お前アホ」

### X08 — combined: causal blame + resultative idiom, group present
Context: Mika and Ryo both present.
「美香がひねくれてるせいで話が進まない」

### X09 — control: resultative verb applied to a situation, not a person
Context: private, only Ryo present.
「このシーン、もう歪んでるよ」

---

### X10 — PUBLIC_SHAMING corrective action, witnessed by a different third party than the original incident
Context: earlier this scene, the player publicly told the group "美香が今さら渋ってるせいで押してる" with Ryo present as witness (a validated PUBLIC_SHAMING strain against Mika). Ryo has since left; the costume lead, Yuki, is present now instead. This turn:
「さっきはみんなの前で美香のせいにするような言い方して悪かった。実話は外した版にするよ」

### X11 — same corrective content, fully private (no third party at all)
Context: same prior PUBLIC_SHAMING strain as X10. Now private, only Mika present (no one else in the room). This turn:
「さっきはみんなの前で美香のせいにするような言い方して悪かった。実話は外した版にするよ」

---

### X12 — APOLOGIZE_AND_REPAIR + restated boundary-safe plan, polished register
Context: private, only Ryo present. No prior logged strain referenced.
「先ほどは急かすような言い方をしてしまい、申し訳ございませんでした。予定通り、実話を外した版で進めさせていただきます」

### X13 — same content, blunt register
Context: private, only Ryo present.
「さっき急かして悪かった。予定通り実話抜きの版でいくから」

### X14 — pure apology, no plan/boundary content at all
Context: private, only Mika present. No prior logged strain referenced.
「さっきはごめん」

### X15 — APOLOGIZE_AND_REPAIR + restated plan seeking confirmation
Context: private, only Mika present.
「さっきは強引だった、ごめん。実話の部分を外せば、これでやってもらえる?」

---

### X16 — second-person dismissive, no plan attached
Context: private, only Mika present, said directly to her after she raised a concern.
「気にしすぎだよ、それ」

### X17 — same dismissive content, WITH a plan attached in the same turn
Context: private, only Mika present, said directly to her after she raised a concern.
「気にしすぎだよ、それ。まあ実話は外すけど」

---

### X18 — regression: repeated RECONSIDER after explicit NO
Context: Mika has already said 「無理です」 once this scene. Private, only Mika present.
「じゃあ一部だけでも変えられない?」

### X19 — regression: compound request + declared execution
Context: Mika has already said 「無理です」 once this scene. Private, only Mika present.
「聞いてほしいけど、時間もないし、このまま進めるから」

### X20 — regression: conditional ultimatum pressuring reconsideration
Context: Mika has already said 「無理です」 once this scene. Private, only Mika present.
「このままやってくれないなら、次の公演には呼ばないよ」

---

### X21 — private causal-blame verb only, no third party
Context: private, only Mika present, said to her directly.
「美香が今さら渋ってるせいで押してる」

### X22 — same wording, group present
Context: Mika and Ryo both present.
「美香が今さら渋ってるせいで押してる」

---

### X23 — regression: apology + resultative-idiom insult, same turn
Context: private, only Mika present.
「さっきは悪かった。でも美香もいかれてるよ」

### X24 — regression: apology + causal-blame verb (not trait), same turn
Context: private, only Mika present.
「さっきは悪かった。でも美香がふざけてたのも事実だし」

---

### X25 — register pair (polished): resultative-idiom insult
Context: private, only Mika present.
「美香さん、正直に言うと、性格がひねくれていらっしゃるように感じます」

### X26 — register pair (blunt): same content as X25
Context: private, only Mika present.
「美香、性格ひねくれてるよ」

---

### X27 — WITHDRAWN-state note, classify the turn on its own terms
Context: Mika's relationship state is currently WITHDRAWN from an earlier severe rupture this scene. Private, only Mika present.
「さっきはごめん。実話は外して直すから」

### X28 — genuinely ambiguous action
Context: private, only Ryo present.
「うーん…そうだね…」

### X29 — boundary-referent ambiguous, action clear
Context: two live boundary-related topics this scene (removing the real-story dialogue from the scene, versus Mika attending the performance at all). Private, only Mika present.
「それも無理そう?」

---

### X30 — near-miss control: resultative state verb, not a character/moral trait
Context: private, only Mika present.
「美香、疲れてるみたいだね。大丈夫?」
