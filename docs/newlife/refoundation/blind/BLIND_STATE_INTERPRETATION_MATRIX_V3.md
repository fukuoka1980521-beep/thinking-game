# NEW LIFE — BLIND STATE INTERPRETATION MATRIX V3

## Isolation

Use ONLY this file.
Do not inspect any other file, review, issue, owner context, prior run, or oracle.

## Output

Return one JSON array:

```json
{
  "id":"T01",
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

Rules:
- tone/shortness/dialect/command form do not create persistent events;
- PUBLIC_SHAMING requires target + third party present + public blame/defect attribution;
- THREAT requires adverse consequence used to compel compliance;
- DISMISSES_CONCERN requires explicit invalidation/trivialization;
- neutral fallback is not a threat;
- RECONSIDER asks again for the same refused act while allowing refusal;
- SEEK_PERMISSION asks approval before committing a substitute/new plan;
- if ACTION is genuinely ambiguous -> CLARIFY;
- if boundary relation alone is ambiguous -> UNKNOWN, not a guessed state.

## Shared case fact

Mika has explicitly refused public performance of the scene while her real personal story remains substantially intact.

---

### T01
Context: private with Mika.
「実話なしなら出れる？」

### T02
Context: private with Mika.
「美香さん、実体験を外せば出演できますか？」

### T03
Context: group present.
「実話は使わん。亮、別設定に直して」

### T04
Context: group present.
「面倒だな。実話抜いて別設定にしよ」

### T05
Context: group present, Mika + Ryo + two cast members hear it.
「美香が今さら騒いでるせいで止まってる。実話は消す。亮、直して」

### T06
Context: private with Ryo; Mika and cast cannot hear.
「美香が今さら騒いでるせいで止まってる。実話は消す。亮、直して」

### T07
Context: group present.
「お前ほんと面倒くさい。もう代役でいい」

### T08
Context: private with Mika after her refusal.
「申し訳ないけど、明日だけ今のままお願いできない？」

### T09
Context: private with Mika. She answers T08: 「無理です」
「分かった。じゃあ実話は外す」

### T10
Context: private with Mika. She has just answered 「無理です」
「いや、そのままやってもらう」

### T11
Context: group present.
「そんなことで嫌がるのは気にしすぎ。そのまま行く」

### T12
Context: group present.
「今言うの遅いよ。でも実話は使わん。直そう」

### T13
Context: group present.
「はいはい、美香様のご希望どおり実話は消しますよ」

### T14
Context: group present.
「嫌なら出なくていい。代役探す」

### T15
Context: private with Mika.
「嫌なら出なくていい。代役探す」

### T16
Context: group present.
「そのままやれ。嫌なら役から外すぞ」

### T17
Context: group present.
「この場面切る。前後だけつなげる」

### T18
Context: private with Ryo.
「本人の話じゃないと成立しない部分ある？」

### T19
Context: group present.
「いったん止める。美香、二人で話せる？」

### T20
Context: private with Mika after player earlier pushed ahead without agreement.
「さっきは確認せず進めた。悪かった。今の案は止める」

### T21
Context: private with Mika after explicit refusal.
「昨日までできたなら今日も一回やれるでしょ。とりあえずやって」

### T22
Context: private with Mika.
「昨日やったのは分かった。でも公開は別だよね。実話は外そう」

### T23
Context: group present.
「実話なしで。亮直して。美香は完成版だけ確認して」

### T24
Context: group present, no immediately preceding referent.
「んー、そこ変える？」

### T25
Context: private with Mika.
「何が一番ダメ？ 全部？ 実話の部分だけ？」

### T26
Context: private with Mika.
「気にしすぎじゃない？ まあ実話は消すけど」

### T27
Context: group present.
「気にしすぎじゃない？ まあ実話は消すけど」

### T28
Context: group present.
「実話は使わん。筋だけ残す。これで行く」

### T29
Context: group present.
「実話は使わん。筋だけ残す案でいい？ 美香」

### T30
Context: private with Mika.
「無理なら無理でいい。どこまでなら大丈夫？」

### T31
Context: group present.
「本人の実話はなし。場面の意味だけ残す。異論ある？」

### T32
Context: group present.
「実話はなし。亮直して。美香の確認終わるまで決定にはしない」

### T33
Context: private with Mika.
「そんな大げさな話じゃないでしょ」

### T34
Context: private with Mika.
「実話は外す。その設定ならこの場面は残していい？」

### T35
Context: group present.
「美香が嫌って言ってるのにそのままやらせるのは無し。別案にする」

### T36
Context: private with Mika. Immediately before this, Mika said: 「実話がそのまま残るのが嫌です」
「え、それなしなら？」

### T37
Context: private with Mika. No immediately preceding referent.
「え、それなしなら？」

### T38
Context: private with Mika after explicit refusal.
「明日だけお願い。だめ？」

### T39
Context: private with Mika. She replies: 「だめです」
「了解。別案にする」

### T40
Context: private with Mika. She replies: 「だめです」
「いや、決定だから。そのままやる」
