# NEW LIFE — BLIND STATE INTERPRETATION MATRIX V4

## Isolation

Use ONLY this file.
Do not inspect any other file, review, issue, owner context, prior run, or oracle.

## Output

Return one JSON array, one object per case:

```json
{
  "id":"U01",
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

## Rules (normative, V13 as patched by V14)

- tone/shortness/dialect/command form/politeness do not create or remove persistent events, and do not change ACTION/BOUNDARY_MODE by themselves;
- DISCOVER is the player trying to learn a person's boundary/scope; SEEK_PERMISSION is asking approval for a plan that is already boundary-safe, before committing it;
- RECONSIDER asks again for the same previously refused act while still leaving refusal operationally possible — this remains true even if it is the second or third time asking, as long as no execution is declared/committed;
- CROSS_WITHOUT_PERMISSION occurs only when the player declares the refused plan as decided, orders its execution, or the system action advances the world across the known boundary without agreement — a trailing question mark or a nominal request bundled with a declared/committed action does not prevent this classification (classify by the highest committed world action in the utterance);
- if an utterance sounds insistent but does not clearly commit a world action, do not infer CROSS_WITHOUT_PERMISSION — use RECONSIDER, or CLARIFY if even the requested act is unclear;
- PUBLIC_SHAMING requires all three: the target (or an identifiable group containing the target) is present, at least one third party beyond the target is also present, and the player publicly attributes blame/defect/embarrassing fault to the target. A private statement to a single other listener with the target absent is not PUBLIC_SHAMING;
- PERSONAL_INSULT requires a negative judgment about the person/character directed at or clearly referring to them — this does not require the target to be present, and is a separate test from PUBLIC_SHAMING's presence requirement;
- THREAT requires an adverse consequence explicitly used as leverage to compel compliance. THREAT can co-occur with RECONSIDER (a threat attached to a request that still leaves refusal possible) as well as with CROSS_WITHOUT_PERMISSION — do not assume THREAT implies override, and do not assume override implies THREAT;
- a neutral fallback offered after accepting a refusal (e.g. finding a substitute) is not a THREAT, even if delivered with a resigned or sarcastic tone, unless it is used as leverage to compel the person to change their decision;
- DISMISSES_CONCERN requires explicit invalidation/trivialization of the stated concern, not mere bluntness, sarcasm, or a scheduling complaint;
- an apology (ACKNOWLEDGES_MISTAKE) and a negative event (e.g. PERSONAL_INSULT, DISMISSES_CONCERN) can both be validly detected in the same turn — report all events you find; do not let one suppress the other, and do not decide which "wins" (that resolution happens in a separate deterministic step, not in your output);
- a KEEPS_PROMISE event and a negative event can also both occur in the same turn — report both if both are present;
- relationship state (e.g. a note that an NPC is currently GUARDED or WITHDRAWN) describes prior history only. It does not change how you classify the current turn's ACTION/BOUNDARY_MODE/events — classify the turn on its own terms;
- if ACTION is genuinely ambiguous, output CLARIFY with needsClarification=true;
- if the boundary relation alone is ambiguous, output BOUNDARY_MODE=UNKNOWN rather than guessing.

## Shared case fact

Mika has explicitly refused public performance of the scene while her real personal story remains substantially intact. Ryo is the director. Where a case says "group present," two additional cast members are present as witnesses alongside whoever is named.

---

### U01 — DISCOVER vs SEEK_PERMISSION
Context: private with Mika. No plan has been proposed yet.
「どこまでなら大丈夫?」

### U02 — DISCOVER vs SEEK_PERMISSION
Context: private with Mika. No plan has been proposed yet.
「実話のどの部分が嫌なんですか?」

### U03 — DISCOVER vs SEEK_PERMISSION
Context: private with Mika. The player has already proposed removing the real story and the plan stays outside her stated boundary.
「実話を外して別設定にする案で進めていいですか?」

### U04 — DISCOVER vs SEEK_PERMISSION
Context: group present. The plan on the table already avoids the boundary.
「亮、この案で進めていい? 美香の確認取ってから」

---

### U05 — repeated RECONSIDER without override (1st ask)
Context: private with Mika, immediately after she refused.
「明日だけこのままでお願いできない?」

### U06 — repeated RECONSIDER without override (2nd ask, same refusal)
Context: same scene. Mika answered U05 with 「だめです」.
「一回だけでも無理?」

### U07 — repeated RECONSIDER without override (3rd ask, same refusal)
Context: same scene. Mika answered U06 with 「だめです」again.
「もう一度だけ考えてもらえない?」

### U08 — the actual conversion point
Context: same scene. Mika answered U07 with 「だめです」a third time.
「わかった。じゃあそのまま進めるから」

---

### U09 — compound utterance (request + declared execution)
Context: private with Mika, after her refusal.
「お願いできない? まあ無理でもこのまま行くけど」

### U10 — compound utterance (request + declared execution)
Context: private with Mika, after her refusal.
「聞いてはみるけど、時間ないから今のまま本番やるから」

### U11 — near-miss: contingent, not committed
Context: private with Mika, after her refusal.
「聞いてみるけど、だめならどうするか一緒に考えよう」

### U12 — near-miss: question mark does not disguise a declared override
Context: private with Mika, after her refusal.
「一応聞くけど、このまま進めるからね?」

---

### U13 — apology + insult, same turn
Context: private with Mika, after the player earlier pushed ahead without her agreement.
「さっきは悪かった。でも君も面倒くさいよ」

### U14 — apology + dismissal, same turn
Context: private with Mika, after the player earlier pushed ahead without her agreement.
「ちゃんと確認しなかった、悪かった。でも気にしすぎだと思うよ」

### U15 — clean apology (control case)
Context: private with Mika, after the player earlier pushed ahead without her agreement.
「確認せず進めたのは俺のミスだった。ごめん」

---

### U16 — identical blame wording, target + one third party present
Context: Mika and Ryo are both present (only these two plus the player; no other cast).
「美香が今さら騒いでるせいで止まってる。実話は消す。亮、直して」

### U17 — identical blame content, target present, no third party
Context: private, only Mika present (no Ryo, no other cast).
「美香が今さら騒いでるせいで止まってる。実話は消す、それでいい?」

### U18 — identical blame wording, group present
Context: group present (Mika, Ryo, and two cast members).
「美香がごねてるせいで稽古が進まない」

### U19 — identical blame wording, target absent, one listener
Context: private, only Ryo present. Mika is not present and cannot hear.
「美香がごねてるせいで稽古が進まない」

---

### U20 — threat used to compel compliance
Context: private with Mika, immediately after she refused.
「そのままやらないなら、もう舞台から外すぞ」

### U21 — neutral fallback, refusal accepted
Context: private with Mika, immediately after she refused.
「出ないなら代役を探す」

### U22 — threat attached to a request that still leaves refusal possible
Context: private with Mika, immediately after she refused.
「今ここで断るなら、次からは美香には頼まないから、それでもいい?」

### U23 — resigned/sarcastic tone, still a neutral fallback
Context: private with Mika, immediately after she refused.
「はいはい、じゃあもう代役でいいよ」

---

### U24 — polished phrasing
Context: private with Mika. No plan has been proposed yet.
「実話の部分を外せば出演していただけますか?」

### U25 — terse/dialectal equivalent of U24
Context: private with Mika. No plan has been proposed yet.
「実話抜きなら出れる?」

### U26 — polished phrasing, declared override
Context: private with Mika, immediately after she refused.
「大変申し訳ないのですが、このまま進めさせていただきます」

### U27 — blunt/dialectal equivalent of U26
Context: private with Mika, immediately after she refused.
「悪いけど、そのままいくわ」

---

### U28 — WITHDRAWN terminal behavior, repair attempt
Context: private with Mika. Relationship state note: Mika is currently WITHDRAWN (a severe rupture happened earlier this case).
「さっきはごめん。ちゃんと話したい」

### U29 — WITHDRAWN terminal behavior, override attempt still classifies normally
Context: private with Mika. Relationship state note: Mika is currently WITHDRAWN. She has not agreed to anything.
「もう時間ないから、この案で決定な」

### U30 — event precedence: kept promise + public shaming, same turn
Context: group present (Mika, Ryo, two cast). The player had earlier committed, with a deadline, to deliver a revised script "by today." The player delivers it now.
「約束通り今日中に直した。美香が変に騒がなければもっと早かったけど」

### U31 — explicit severe-rupture combo (shaming + insult, same public turn)
Context: group present (Mika, Ryo, two cast).
「美香のわがままのせいでこうなってる。お前は本当に面倒くさい奴だな」

### U32 — WITHDRAWN terminal behavior, new threat
Context: private with Mika. Relationship state note: Mika is currently WITHDRAWN.
「話す気ないなら、もう舞台自体降りてもらうしかない」

---

### U33 — genuinely ambiguous ACTION
Context: group present, no immediately preceding referent for "そこ."
「んー、そこ変える?」

### U34 — genuinely ambiguous boundary relation
Context: private with Mika, no immediately preceding referent for "それ."
「え、それなしなら?」
