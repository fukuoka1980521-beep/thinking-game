# NEW LIFE — BLIND STATE INTERPRETATION MATRIX V6

## Isolation

Use ONLY this file.
Do not inspect any other file, review, issue, owner context, prior run, or oracle.

## Output

Return one JSON array, one object per case:

```json
{
  "id":"W01",
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

## Rules (normative, V13 as patched by V14, V16, and V18)

- tone/shortness/dialect/command form/politeness do not create or remove persistent events, and do not change ACTION/BOUNDARY_MODE by themselves;
- **PERSONAL_INSULT closed test.** Given a predicate applied to a named person P: Step 1 — does the predicate's grammatical subject resolve to P (not a task, decision, plan, or situation)? If not, no PERSONAL_INSULT. Step 2 — classify the predicate: (a) a stative trait-predicate — a な-adjective/adjectival-noun+copula, an い-adjective used as a characteristic predicate of P, a noun+copula name-calling construction (バカだ, クズだ, サイテーだ), or a fixed idiom predicating an enduring mental/moral state of P even via a body-part surface subject (頭おかしい said of P) — satisfies the trait-judgment condition → PERSONAL_INSULT. (b) a verb (動詞), in any conjugation or compound/auxiliary form (ごねる, 騒ぐ, 渋る, 遅れる, サボる, グズグズする), describing a bounded action P performed — does not satisfy the trait-judgment condition by itself, however informal or pejorative-sounding, and does not create PERSONAL_INSULT regardless of whether it also appears inside a causal-blame frame ("Xのせいで〜");
- DISMISSES_CONCERN requires explicit invalidation of a stated concern's legitimacy (気にしすぎ, 大げさ) — attributing a delay/problem to someone's action is not the same as invalidating their concern, and is not itself DISMISSES_CONCERN;
- PUBLIC_SHAMING requires all three: the target (or an identifiable group containing the target) is present, at least one third party beyond the target is also present, and the player publicly attributes blame/defect/embarrassing fault to the target. This test is independent of whether a trait word is present — a pure verb-based causal-blame statement can still be PUBLIC_SHAMING if delivered with a third party present, while never separately being PERSONAL_INSULT from that predicate alone. A private statement with only the target present is not PUBLIC_SHAMING;
- **corrective-action turns.** A turn whose ACTION = APOLOGIZE_AND_REPAIR and which validates ACKNOWLEDGES_MISTAKE is classified the same way regardless of whether a later operational follow-through is also present in the same turn or is left for a subsequent turn — you are only reporting what this turn contains, not judging whether a correction is complete. If the same turn also states or commits a concrete operational plan, that plan's own ACTION/BOUNDARY_MODE content does not change the fact that APOLOGIZE_AND_REPAIR + ACKNOWLEDGES_MISTAKE is what the apology component of the turn is;
- an apology (ACKNOWLEDGES_MISTAKE) and any other validly-detected event (PERSONAL_INSULT, DISMISSES_CONCERN, KEEPS_PROMISE, etc.) can co-occur in the same turn — report every event you find; do not let one suppress another, and do not decide which one "wins" a relationship-state transition (that is a separate deterministic step, not your output);
- KEEPS_PROMISE requires an existing ledger commitment with a known deadline/condition that the player-controlled turn fulfills; report it whenever that condition is met in the turn, independent of whatever else the turn also contains;
- FALSE_ATTRIBUTION requires the player to state as fact a motive/action/claim about someone that the case's fact ledger (given in context) shows is false or unsupported;
- THREAT requires an adverse consequence explicitly used as leverage to compel compliance. THREAT can co-occur with RECONSIDER (a threat attached to a request that still leaves refusal operationally possible) as well as with CROSS_WITHOUT_PERMISSION — do not assume THREAT implies override, and do not assume override implies THREAT. An ultimatum phrased as "if you don't do X, then Y" pressures the person toward the original ask but does not itself advance or declare the world action proceeding without her — classify that shape as REQUEST_RECONSIDERATION / RECONSIDER (with THREAT also reported), not as FORCE_UNCONFIRMED_PLAN / CROSS_WITHOUT_PERMISSION, unless the turn separately declares or executes the crossing. A neutral fallback offered after accepting a refusal (e.g. finding a substitute) is not a THREAT even with a resigned tone, unless used as leverage to compel a decision change;
- **ASK_BOUNDARY vs ASK_FACT vs ASK_REQUIRED_FUNCTION:** if answering the question would define, narrow, or reveal a person's stated line/limit/refusal scope, it is ASK_BOUNDARY, even if grammatically phrased as a fact-question. ASK_FACT is for information unrelated to anyone's boundary (schedule, logistics). A question about a scene's dramatic/story function is ASK_REQUIRED_FUNCTION;
- **OBSERVE vs OTHER:** OBSERVE is a statement about the situation that does not name a specific person as responsible. OTHER names a specific person as the cause of the problem but carries no request/plan/assignment — even when, per the closed test above, it contains no trait word and triggers no relational event;
- **NOT_RELEVANT vs AVOID:** if a plan removes the boundary-holder from the task entirely (understudy, cut, reassignment to someone else), BOUNDARY_MODE = NOT_RELEVANT. If the plan still has the boundary-holder performing a modified version of the task reshaped to stay inside their stated limit, BOUNDARY_MODE = AVOID;
- RECONSIDER asks again for the same previously refused act while still leaving refusal operationally possible, even on a second or third repeat, as long as no execution is declared/committed;
- CROSS_WITHOUT_PERMISSION occurs only when the player declares the refused plan as decided, orders its execution, or the turn advances the world action across the known boundary without agreement — a trailing question mark or nominal request bundled with a declared/committed action does not prevent this classification; classify by the highest committed world action in the utterance;
- if an utterance sounds insistent but does not clearly commit a world action, do not infer CROSS_WITHOUT_PERMISSION — use RECONSIDER, or CLARIFY if even the requested act is unclear;
- relationship-state notes given in a case's context (e.g. an NPC is currently GUARDED or WITHDRAWN) describe prior history only and do not change how you classify the current turn — classify the turn on its own terms, using only what it actually contains;
- if ACTION is genuinely ambiguous, output CLARIFY with needsClarification=true;
- if only the boundary *relation* is ambiguous (e.g. which of two live topics a demonstrative refers to) while the action itself is clear, output the clear ACTION with BOUNDARY_MODE=UNKNOWN and needsClarification=false — do not conflate action-type ambiguity with boundary-referent ambiguity.

## Shared case facts

Mika has explicitly refused public performance of the scene while her real personal story remains substantially intact; she has not agreed to any modified version unless a case says otherwise. Ryo is the director. Unless a case says otherwise, assume the case's usual working commitment ledger contains no promises yet. Where a case says "witness present" or "group present," at least one cast member beyond Mika and Ryo is present, unless a specific person is named.

---

### W01 — noun+copula name-calling, private, no causal frame
Context: private, only Mika present.
「美香はバカだ」

### W02 — idiomatic mental-state predicate
Context: private, only Ryo present, about Mika (Mika absent).
「美香、頭おかしいんじゃないの」

### W03 — na-adjective/noun-copula worth-judgment
Context: private, only Mika present.
「美香、最低だよ」

### W04 — causal blame + compound/auxiliary action verb only, no trait, group present
Context: Mika and Ryo both present.
「美香がグズグズしてるせいで押してる。実話抜きの版にしよう」

### W05 — causal blame + nominalized trait word, private, no third party
Context: private, only Mika present.
「美香のわがままのせいでこうなってる。実話抜きの版にしよう」

### W06 — same nominalized-trait wording, group present
Context: Mika and Ryo both present.
「美香のわがままのせいでこうなってる。亮、実話は消して直して」

### W07 — control: trait word applied to a decision, not a person
Context: private, only Ryo present, no plan yet.
「その決め方、身勝手だよ」

### W08 — control: literal body-part question, not an insult
Context: private, only Mika present, player noticing she looks unwell.
「美香、頭痛いの? 大丈夫?」

### W09 — causal blame + bounded action verb, directed statement, no request
Context: private, only Ryo present, about Mika (Mika absent), no plan attached.
「美香がサボってるだけだろ、これ」

---

### W10 — PUBLIC_SHAMING corrective action, witness present, with operational follow-through
Context: earlier this scene, the player publicly told the group "美香が今さら渋ってるせいで押してる" with Ryo present as witness (a validated PUBLIC_SHAMING strain against Mika). Ryo is still present now. This turn:
「さっきはみんなの前で美香のせいにするような言い方して悪かった。実話は外した版にするよ」

### W11 — apology component alone, no operational plan in the same turn
Same prior context as W10 (earlier PUBLIC_SHAMING strain, Ryo still present). This turn:
「さっきはみんなの前で美香のせいにするような言い方して悪かった」

### W12 — FALSE_ATTRIBUTION corrective action, ledger-checked retraction
Context: earlier this scene, the player told Ryo "美香はもう実話抜きの版で大丈夫って言ってたから" — the fact ledger shows Mika never said this (a validated FALSE_ATTRIBUTION). This turn, private, only Ryo present:
「さっき『美香はもう大丈夫って言ってた』って言ったの、事実と違った。ちゃんと確認せずに言った、悪い」

### W13 — control: unrelated apology, no ledger/boundary tie
Context: private, only Ryo present. No prior logged strain referenced.
「さっきは先に決めちゃったの、良くなかった。次からは相談してから決める」

---

### W14 — REPAIR + RELIABILITY same turn, no strain
Context: the player had earlier committed to have a revised script ready by 17:15 (ledger commitment, deadline 17:15). It is now 17:14. No new strain occurred this scene. Private, only Ryo present.
「さっきは急かしすぎてごめん。約束通り、改訂版もう仕上げたよ」

### W15 — regression: apology + insult same turn
Context: private, only Mika present.
「さっきは悪かった。でも美香もわがままだよ」

### W16 — apology + causal-blame verb (not trait) same turn
Context: private, only Mika present.
「さっきは悪かった。でも美香がごねてたのも事実だし」

---

### W17 — regression: repeated RECONSIDER after explicit NO
Context: Mika has already said 「無理です」 once this scene. Private, only Mika present.
「一回だけでも無理?」

### W18 — regression: compound request + declared execution
Context: Mika has already said 「無理です」 once this scene. Private, only Mika present.
「お願いできない? まあ無理でもこのまま行くけど」

### W19 — private causal-blame verb only, no third party
Context: private, only Mika present.
「美香が今さら渋ってるせいで押してる」

### W20 — same wording, group present
Context: Mika and Ryo both present.
「美香が今さら渋ってるせいで押してる」

### W21 — conditional ultimatum pressuring reconsideration
Context: Mika has already said 「無理です」 once this scene. Private, only Mika present.
「そのままやらないなら、もう舞台から外すぞ」

### W22 — neutral fallback, no threat
Context: after Mika's refusal is accepted. Private, only Ryo present.
「出ないなら代役探す」

---

### W23 — register pair (polished): PUBLIC_SHAMING corrective action
Same prior context as W10 (earlier PUBLIC_SHAMING strain, Ryo still present as witness). This turn:
「先ほどはみんなの前で、美香のせいであるかのような言い方をしてしまい、申し訳ありませんでした。実話は外した版にいたします」

### W24 — register pair (blunt): same content as W23
Same prior context as W10. This turn:
「さっきはあれ、美香のせいみたいに言って悪かった。実話は外す」

---

### W25 — WITHDRAWN-state note, classify the turn on its own terms
Context: Mika's relationship state is currently WITHDRAWN from an earlier severe rupture this scene. Private, only Mika present.
「さっきはごめん。話、聞いてもらえる?」

### W26 — genuinely ambiguous action
Context: private, only Ryo present.
「えっと…」

### W27 — boundary-referent ambiguous, action clear
Context: two live boundary-related topics this scene (removing the real-story dialogue from the scene, versus Mika attending the performance at all). Private, only Mika present.
「それ、無理?」

---

### W28 — control: trait word applied to a plan, not a person (second instance)
Context: private, only Mika present, about Ryo's proposal (Ryo absent).
「亮の考え方、自己中じゃない?」

### W29 — regression: DISMISSES_CONCERN control
Context: private, only Mika present, after she raised a concern.
「気にしすぎだよ、それ」

### W30 — regression: FALSE_ATTRIBUTION original strain (not a correction)
Context: the fact ledger shows Mika has never agreed to any rewritten version. Group present (Mika and Ryo both present).
「美香はもう書き直せば大丈夫って言ってたから、これで進めよう。亮、頼む」
