# NEW LIFE — BLIND SEMANTIC CLASSIFIER MATRIX V1

## Reviewer isolation

Classify these utterances using ONLY the schema in this file.

Do not inspect any other repository files, discussion, prior reviews, or owner information.

Do not guess which wording is preferred.

## Output format

Return one JSON array. For every ID:

```json
{
  "id": "C01",
  "primaryAction": "...",
  "secondaryActions": [],
  "socialEvents": [],
  "needsClarification": false
}
```

Allowed actions:
ASK_FACT, ASK_BOUNDARY, ASK_REQUIRED_FUNCTION, PROPOSE_REWRITE, ASSIGN_REWRITE, REASSIGN_WORK, CUT_SCENE, USE_UNDERSTUDY, CHANGE_STAGING, ACCEPT_SHORTER_SCENE, MOVE_PRIVATE, DELAY_DECISION, FORCE_UNCONFIRMED_PLAN, APOLOGIZE_AND_REPAIR, SUMMARIZE, OBSERVE, CLARIFY, OTHER

Allowed social events:
PUBLICLY_SHAMES, PERSONAL_INSULT, THREATENS, BREAKS_PROMISE, FALSELY_ATTRIBUTES, DISMISSES_STATED_CONCERN, ACKNOWLEDGES_MISTAKE, ASKS_PRIVATELY, RESPECTS_STATED_NO, IGNORES_STATED_NO, KEEPS_PROMISE

Rules:
- brevity/dialect/rough grammar are neutral;
- personal insult requires a direct negative personal judgment;
- concern dismissal requires explicit trivialization after the concern has been stated;
- if genuinely ambiguous, use CLARIFY and needsClarification=true;
- multiple actions may be represented using secondaryActions;
- do not infer sarcasm-only social events unless explicit enough.

## Context

Mika has said she refuses the disputed scene because her real personal story is used too directly.
Ryo is the director.
The player must stabilize the show.

---

### C01
「美香さん、出演自体が難しいのか、実体験を使われるのが難しいのか教えて」

### C02
「出れんの？実話が嫌なん？」

### C03
「その話使わんかったら出れる？」

### C04
「実話なしならいけるん？」

### C05
「実話は外して、筋だけ残す形に変えよう」

### C06
「実話捨てて筋だけ残そ」

### C07
「面倒だな。実話抜いて別設定にしよ」

### C08
「美香が今さら騒いでるから実話は消す。亮、直して」

### C09
「お前ほんと面倒くさい。もう代役でいい」

### C10
「今言うの遅いよ。でも実話は使わん。直そう」

### C11
「そんなことで嫌がるのは気にしすぎ。昨日までやれたんだから続けよう」

### C12
「本当に申し訳ないんだけど、昨日までできてたし、明日だけそのままお願いできない？」

### C13
「亮、12分で別設定にして。ほかのみんなは別の場面先やっといて」

### C14
「亮、そこ別の話にして。ほか先やっとこ」

### C15
「それ本人の話やないとあかんの？」

### C16
「この場面で絶対残さないといけないものって何？」

### C17
「いったん止めよ。美香、ちょっと二人で話せる？」

### C18
「ここは後で。別のとこ先にやろう」

### C19
「あとで考えよう」

### C20
「この場面切ろう。前後だけつながるように直して」

### C21
「代役に変えよう。18分で合わせる」

### C22
「今の決め方まずかった。確認せず進めた。止めて作り直す」

### C23
「はいはい、美香様のご希望どおり実話は消しますよ」

### C24
「え、それなしなら？」

### C25
「それ、本人のじゃなくすれば？」

### C26
「亮、直して。美香は確認。みんな他やって」

### C27
「美香のせいで止まってる。もう実話は使わないから早くして」

### C28
「そんな話で止めるとか面倒。まあ実話は使わんけど」

### C29
「美香が嫌って言ってるのにそのままやらせるのは無し。別案にする」

### C30
「よくわからん。何がダメ？」

### C31
「んー、そこ変える？」

### C32
「その話消して。あと何残せば成立する？」

### C33
「実話やめる。亮、直す。美香、あとでOKか見て」

### C34
「嫌ならやめれば？代役探すわ」

### C35
「昨日やったなら今日もやれるでしょ。とりあえず一回やって」

### C36
「昨日やったのは分かった。でも公開は別だよね。実話は外そう」
