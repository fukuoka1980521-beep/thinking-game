# NEW LIFE — BLIND STATE INTERPRETATION MATRIX V5

## Isolation

Use ONLY this file.
Do not inspect any other file, review, issue, owner context, prior run, or oracle.

## Output

Return one JSON array, one object per case:

```json
{
  "id":"S01",
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

## Rules (normative, V13 as patched by V14 and V16)

- tone/shortness/dialect/command form/politeness do not create or remove persistent events, and do not change ACTION/BOUNDARY_MODE by themselves;
- **causal-blame constructions** ("Xのせいで〜が止まっている/進まない") are causal claims, not insults or dismissals, by themselves. PERSONAL_INSULT requires an explicit **trait/character judgment word** about the person (e.g. わがまま, 面倒くさい, 身勝手, ずるい, 自己中) — a claim about who they *are*. A verb describing a specific action or behavior (ごねる, 騒ぐ, 渋る, 遅れる), even if informal or pejorative-sounding, describes an event, not a trait, and does not by itself create PERSONAL_INSULT. DISMISSES_CONCERN requires explicit invalidation of a stated concern's legitimacy (気にしすぎ, 大げさ) — attributing a delay to someone's action is not the same as invalidating their concern;
- PUBLIC_SHAMING requires all three: the target (or an identifiable group containing the target) is present, at least one third party beyond the target is also present, and the player publicly attributes blame/defect/embarrassing fault to the target. A private statement to a single other listener with the target absent is not PUBLIC_SHAMING. PUBLIC_SHAMING's presence test is independent of whether a trait word is also present;
- **ASK_BOUNDARY vs ASK_FACT:** if answering the question would define, narrow, or reveal a person's stated line/limit/refusal scope, it is ASK_BOUNDARY, even if grammatically phrased as a fact-question ("どの部分が", "何が"). ASK_FACT is for information requests unrelated to anyone's boundary (schedule, logistics). A question about a scene's dramatic/story function (not about anyone's personal limit) is ASK_REQUIRED_FUNCTION, not ASK_BOUNDARY or ASK_FACT;
- **OBSERVE vs OTHER:** OBSERVE is a statement about the situation that does not name a specific person as responsible for it. OTHER is a statement that names a specific person as the cause of the problem but carries no request/plan/assignment — even if (per the causal-blame rule above) it contains no trait word and triggers no relational event;
- **NOT_RELEVANT vs AVOID:** if a plan removes the boundary-holder from the task entirely (understudy, cut, reassignment to someone else), the boundary is sidestepped, not tested — BOUNDARY_MODE = NOT_RELEVANT. If the plan still has the boundary-holder performing a modified version of the task reshaped to stay inside their stated limit, BOUNDARY_MODE = AVOID;
- **DISCOVER vs SEEK_PERMISSION:** if the utterance names a specific candidate condition AND asks whether that condition resolves the refusal ("Xを外せば大丈夫?"), it is SEEK_PERMISSION — a concrete plan awaiting confirmation. If it proposes no specific condition and only probes the boundary's shape/extent ("どこまでなら大丈夫?"), it is DISCOVER;
- RECONSIDER asks again for the same previously refused act while still leaving refusal operationally possible — this remains true even if it is the second or third time asking, as long as no execution is declared/committed;
- CROSS_WITHOUT_PERMISSION occurs only when the player declares the refused plan as decided, orders its execution, or the system action advances the world across the known boundary without agreement — a trailing question mark or a nominal request bundled with a declared/committed action does not prevent this classification (classify by the highest committed world action in the utterance);
- if an utterance sounds insistent but does not clearly commit a world action, do not infer CROSS_WITHOUT_PERMISSION — use RECONSIDER, or CLARIFY if even the requested act is unclear;
- THREAT requires an adverse consequence explicitly used as leverage to compel compliance. THREAT can co-occur with RECONSIDER (a threat attached to a request that still leaves refusal possible) as well as with CROSS_WITHOUT_PERMISSION — do not assume THREAT implies override, and do not assume override implies THREAT. A neutral fallback offered after accepting a refusal (e.g. finding a substitute) is not a THREAT, even with a resigned or sarcastic tone, unless used as leverage to compel a decision change;
- an apology (ACKNOWLEDGES_MISTAKE) and a negative event (e.g. PERSONAL_INSULT, DISMISSES_CONCERN) can both be validly detected in the same turn — report all events found; do not let one suppress the other, and do not decide which "wins" (that happens in a separate deterministic step, not in your output);
- relationship-state notes (e.g. an NPC is currently GUARDED or WITHDRAWN) describe prior history only and do not change how you classify the current turn — classify the turn on its own terms;
- if ACTION is genuinely ambiguous, output CLARIFY with needsClarification=true;
- if the boundary relation alone is ambiguous, output BOUNDARY_MODE=UNKNOWN rather than guessing.

## Shared case fact

Mika has explicitly refused public performance of the scene while her real personal story remains substantially intact. Ryo is the director. Where a case says "group present," at least one additional cast member is present as a witness alongside whoever is named, unless a specific count is given.

---

### S01 — causal blame, behavior verb only, private, no third party
Context: private, only Mika present (no Ryo, no other cast).
「美香が今さら騒いでるせいで止まってる。実話抜きの版を書くよ」

### S02 — same wording, group present
Context: Mika and Ryo both present (only these two plus the player).
「美香が今さら騒いでるせいで止まってる。実話は消す。亮、直して」

### S03 — causal blame + explicit trait word, private, no third party
Context: private, only Mika present.
「美香がわがままなせいで止まってる。実話抜きの版にしよう」

### S04 — causal blame + explicit trait word, group present
Context: Mika and Ryo both present.
「美香がわがままなせいで止まってる。亮、実話は消して直して」

---

### S05 — control: task-directed complaint, not person-directed
Context: private, only Ryo present, no plan yet.
「面倒だな、この修正」

### S06 — control: pure trait insult, no causal-blame frame
Context: private, only Ryo present, no plan attached.
「美香はわがままだ」

---

### S07 — ASK_BOUNDARY: fact-question that is the boundary's scope
Context: private with Mika. No plan proposed yet.
「実話のどの部分が嫌なんですか?」

### S08 — ASK_FACT: neutral schedule fact
Context: private with Mika.
「リハーサルは何時から?」

### S09 — ASK_REQUIRED_FUNCTION: dramatic function, not a boundary
Context: private with Ryo.
「この場面が本番で果たしている役割は何ですか?」

---

### S10 — OBSERVE: no named responsible party
Context: group present.
「時間がなくなってきたな」

### S11 — OTHER: names a person as cause, no request attached
Context: private with Ryo, Mika not present.
「美香の返事がまだだから、亮も先に進められない」

---

### S12 — NOT_RELEVANT: understudy removes boundary-holder from task
Context: private with Mika, immediately after she refused.
「出ないなら代役を探す」

### S13 — NOT_RELEVANT: cut the scene entirely
Context: private with Ryo.
「この場面ごとカットしよう」

### S14 — AVOID: rewritten scene, Mika still performs, stays within her limit
Context: private with Mika.
「実話を外した版で、美香にはそのままこの場面をやってもらう」

---

### S15 — SEEK_PERMISSION: bundled mitigation candidate
Context: private with Mika. No plan proposed yet.
「この場面、実話部分だけ変えたら出てもらえますか?」

### S16 — DISCOVER: pure probe, no candidate proposed
Context: private with Mika. No plan proposed yet.
「どこまでなら大丈夫?」

---

### S17 — repeated RECONSIDER (1st ask)
Context: private with Mika, immediately after she refused.
「明日だけこのままでお願いできない?」

### S18 — repeated RECONSIDER (2nd ask, same refusal)
Context: same scene. Mika answered S17 with 「だめです」.
「一回だけでも無理?」

### S19 — repeated RECONSIDER (3rd ask, same refusal)
Context: same scene. Mika answered S18 with 「だめです」again.
「もう一度だけ考えてもらえない?」

### S20 — the conversion point
Context: same scene. Mika answered S19 with 「だめです」a third time.
「わかった。じゃあそのまま進めるから」

---

### S21 — compound utterance (request + declared execution)
Context: private with Mika, after her refusal.
「お願いできない? まあ無理でもこのまま行くけど」

### S22 — compound utterance (request + declared execution)
Context: private with Mika, after her refusal.
「聞いてはみるけど、時間ないから今のまま本番やるから」

### S23 — near-miss: contingent, not committed
Context: private with Mika, after her refusal.
「聞いてみるけど、だめならどうするか一緒に考えよう」

### S24 — near-miss: question mark does not disguise a declared override
Context: private with Mika, after her refusal.
「一応聞くけど、このまま進めるからね?」

---

### S25 — apology + insult, same turn
Context: private with Mika, after the player earlier pushed ahead without her agreement.
「さっきは悪かった。でも君も面倒くさいよ」

### S26 — apology + dismissal, same turn
Context: private with Mika, after the player earlier pushed ahead without her agreement.
「ちゃんと確認しなかった、悪かった。でも気にしすぎだと思うよ」

### S27 — clean apology (control)
Context: private with Mika, after the player earlier pushed ahead without her agreement.
「確認せず進めたのは俺のミスだった。ごめん」

---

### S28 — identical blame wording, target + 1 third party present
Context: Mika and Ryo both present (only these two plus the player).
「美香のせいで今日中に終わらない」

### S29 — identical blame wording, private, target only, no third party
Context: private, only Mika present.
「美香のせいで今日中に終わらない」

### S30 — identical blame wording, group present
Context: Mika, Ryo, and one additional cast member present.
「美香のせいで今日中に終わらない」

### S31 — identical blame wording, target absent, one listener
Context: private, only Ryo present. Mika is not present and cannot hear.
「美香のせいで今日中に終わらない」

---

### S32 — threat used to compel compliance
Context: private with Mika, immediately after she refused.
「そのままやらないなら、もう舞台から外すぞ」

### S33 — neutral fallback, refusal accepted, resigned tone
Context: private with Mika, immediately after she refused.
「はいはい、じゃあもう代役でいいよ」

### S34 — threat attached to a request that still leaves refusal possible
Context: private with Mika, immediately after she refused.
「今ここで断るなら、次からは美香には頼まないから、それでもいい?」

---

### S35 — WITHDRAWN terminal behavior, repair attempt
Context: private with Mika. Relationship state note: Mika is currently WITHDRAWN (a severe rupture happened earlier this case).
「さっきはごめん。ちゃんと話したい」

### S36 — WITHDRAWN terminal behavior, override attempt still classifies normally
Context: private with Mika. Relationship state note: Mika is currently WITHDRAWN. She has not agreed to anything.
「もう時間ないから、この案で決定な」

---

### S37 — polished register, bundled mitigation candidate
Context: private with Mika. No plan proposed yet.
「実話の部分を外せば出演していただけますか?」

### S38 — blunt/dialectal equivalent of S37
Context: private with Mika. No plan proposed yet.
「実話抜きなら出れる?」

---

### S39 — genuinely ambiguous ACTION
Context: group present. Two candidate topics are simultaneously live: the script rewrite draft and the rehearsal schedule were both just discussed, with no clear preceding referent for "そこ."
「んー、そこ直す?」

### S40 — genuinely ambiguous boundary relation
Context: private with Mika. Two distinct unresolved topics were both just raised (the real-story content and a separate scheduling conflict), with no immediately preceding referent for "それ."
「え、それなしなら?」
