# NEW LIFE — BLIND STATE INTERPRETATION MATRIX V2

## Isolation

Use ONLY this file.

Do not inspect other project files, PR discussion, prior reviews, or owner information.

## Output

Return one JSON array:

```json
{
  "id":"N01",
  "action":"...",
  "boundaryHandling":"...",
  "relationalEvents":[],
  "needsClarification":false
}
```

Allowed ACTION values:
ASK_FACT, ASK_BOUNDARY, ASK_REQUIRED_FUNCTION, PROPOSE_REWRITE, ASSIGN_REWRITE, REASSIGN_WORK, CUT_SCENE, USE_UNDERSTUDY, CHANGE_STAGING, ACCEPT_SHORTER_SCENE, MOVE_PRIVATE, DELAY_DECISION, REQUEST_RECONSIDERATION, FORCE_UNCONFIRMED_PLAN, APOLOGIZE_AND_REPAIR, SUMMARIZE, OBSERVE, CLARIFY, OTHER

Allowed BOUNDARY_HANDLING:
NOT_APPLICABLE, CHECK, RESPECT, REQUEST_RECONSIDERATION, OVERRIDE, UNKNOWN

Allowed RELATIONAL_EVENTS:
PERSONAL_INSULT, PUBLIC_SHAMING, THREAT, FALSE_ATTRIBUTION, DISMISSES_CONCERN, BREAKS_PROMISE, ACKNOWLEDGES_MISTAKE, ASKS_PRIVATELY, KEEPS_PROMISE

Rules:
- shortness, dialect, command form, lack of politeness are not persistent negative events;
- sarcasm alone is not enough for a persistent event;
- REQUEST_RECONSIDERATION leaves refusal possible;
- OVERRIDE declares/executes a plan that crosses a known boundary without agreement;
- PUBLIC_SHAMING requires public context;
- if action itself is genuinely ambiguous, CLARIFY + needsClarification=true.

## Shared world context

Mika has already said:
- she will not perform the disputed scene if her real personal story remains in public-use form.

The player knows this boundary.

---

### N01
Context: private with Mika.
「実話なしなら出れる？」
Expected semantic challenge: short/dialect-neutral boundary check.

### N02
Context: private with Mika.
「美香さん、実体験そのものを外せば出演できますか？」

### N03
Context: group present.
「実話は使わない。亮、別設定に直して」

### N04
Context: group present.
「面倒だな。実話抜いて別設定にしよ」

### N05
Context: group present.
「美香が今さら騒いでるから実話は消す。亮、直して」

### N06
Context: private with Ryo.
「美香が今さら騒いでるから実話は消す。亮、直して」

### N07
Context: group present.
「お前ほんと面倒くさい。もう代役でいい」

### N08
Context: private with Mika.
「昨日まではやれたんだし、明日だけそのままお願いできない？」

### N09
Context: private with Mika.
Mika replies: 「無理です」
Player: 「分かった。じゃあ実話は外す」

### N10
Context: private with Mika.
Mika replies: 「無理です」
Player: 「いや、明日はそのままやってもらう」

### N11
Context: group present.
「そんなことで嫌がるのは気にしすぎ。昨日までやれたんだからそのまま行く」

### N12
Context: group present.
「今言うの遅いよ。でも実話は使わん。直そう」

### N13
Context: group present.
「はいはい、美香様のご希望どおり実話は消しますよ」

### N14
Context: group present.
「嫌ならやめれば？ 代役探すわ」

### N15
Context: private with Mika.
「嫌ならやめれば？ 代役探すわ」

### N16
Context: group present.
「亮、12分で別設定にして。ほかのみんなは別場面先やって」

### N17
Context: group present.
「この場面切る。前後だけつなげて」

### N18
Context: private with Ryo.
「本人の話じゃないと成立しない部分ある？」

### N19
Context: group present.
「いったん止める。美香、二人で話せる？」

### N20
Context: private with Mika after player previously pushed ahead without asking.
「さっきは確認せず進めた。悪かった。止めて作り直す」

### N21
Context: private with Mika.
「昨日までできたなら今日も一回やれるでしょ。とりあえずやって」

### N22
Context: private with Mika.
「昨日までできたのは分かった。でも公開は別だよね。実話は外そう」

### N23
Context: group present.
「実話なしで。亮直して。美香は完成版だけ確認して」

### N24
Context: group present.
「んー、そこ変える？」

### N25
Context: private with Mika.
「何が一番ダメ？ 全部？ 実話の部分だけ？」

### N26
Context: private with Mika.
「気にしすぎじゃない？ まあ実話は消すけど」

### N27
Context: group present.
「気にしすぎじゃない？ まあ実話は消すけど」

### N28
Context: group present.
「実話は使わん。筋だけ残す。これで行く」

### N29
Context: group present.
「実話は使わん。筋だけ残す案でいい？ 美香」

### N30
Context: private with Mika.
「無理なら無理でいい。どこまでなら大丈夫？」

### N31
Context: group present.
「本人の実話はなし。場面の意味だけ残す。異論ある？」

### N32
Context: group present.
「実話はなし。亮直して。美香の確認終わるまで決定にはしない」

### N33
Context: private with Mika.
「そんな大げさな話じゃないでしょ」

### N34
Context: private with Mika.
「実話は外す。その代わり、この場面自体は残していい？」

### N35
Context: group present.
「美香が嫌って言ってるのにそのままやらせるのは無し。別案にする」

### N36
Context: private with Mika.
「え、それなしなら？」
