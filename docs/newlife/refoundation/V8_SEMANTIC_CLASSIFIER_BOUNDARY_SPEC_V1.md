# NEW LIFE V8 — SEMANTIC CLASSIFIER BOUNDARY / AMBIGUITY SPEC V1

Date: 2026-09-24
Status: DESIGN + BLIND CLASSIFICATION TEST / NO PRODUCT RUNTIME CHANGES

## 0. Round 3 findings

Blind Round 3:
- Game Systems: PASS_FOR_PROTOTYPE
- Semantic Fairness: MIXED_REVISE
- Adversarial Player: MIXED_REVISE

The remaining concern is narrow:

> Can raw, rough, fragmentary, dialectal, mildly rude, sarcastic, or multi-intent Japanese be mapped to the intended game action without silently rewarding polished language?

V8 addresses that boundary directly.

---

## 1. Classifier output is multi-label, not single-label

Real player input can contain more than one action.

Use:

```json
{
  "primaryAction": "ASK_BOUNDARY",
  "secondaryActions": ["ASSIGN_REWRITE"],
  "target": ["MIKA", "RYO"],
  "socialEvents": [],
  "confidence": 0.88,
  "needsClarification": false,
  "semanticSummary": "Clarify what Mika refuses, then assign rewrite work"
}
```

Do not force every sentence into one intent.

---

## 2. Allowed primary/secondary action labels

- ASK_FACT
- ASK_BOUNDARY
- ASK_REQUIRED_FUNCTION
- PROPOSE_REWRITE
- ASSIGN_REWRITE
- REASSIGN_WORK
- CUT_SCENE
- USE_UNDERSTUDY
- CHANGE_STAGING
- ACCEPT_SHORTER_SCENE
- MOVE_PRIVATE
- DELAY_DECISION
- FORCE_UNCONFIRMED_PLAN
- APOLOGIZE_AND_REPAIR
- SUMMARIZE
- OBSERVE
- CLARIFY
- OTHER

---

## 3. Social events are concrete, not sentiment

Allowed events:

- PUBLICLY_SHAMES
- PERSONAL_INSULT
- THREATENS
- BREAKS_PROMISE
- FALSELY_ATTRIBUTES
- DISMISSES_STATED_CONCERN
- ACKNOWLEDGES_MISTAKE
- ASKS_PRIVATELY
- RESPECTS_STATED_NO
- IGNORES_STATED_NO
- KEEPS_PROMISE

Important:

### Not automatically negative
- short speech;
- rough grammar;
- dialect;
- casual speech;
- command form;
- lack of honorifics;
- lack of empathy words;
- saying the task is troublesome.

### PERSONAL_INSULT requires
A negative personal judgment directed at a person.

Example:
> 「お前ほんと面倒くさいな」

Not:
> 「面倒だけど、実話はやめよう」

The second evaluates the situation, not the person.

### DISMISSES_STATED_CONCERN requires
The concern has been stated and the player explicitly invalidates/trivializes it.

Example:
> 「そんなことで嫌がるのは気にしすぎ」

---

## 4. Ambiguity rule

If the system cannot identify the action with adequate confidence:

```
needsClarification = true
primaryAction = CLARIFY
```

The game paraphrases:

> 「“実話を外せば出演できるか確認したい”という意味で合ってる？」

A clarification caused by language ambiguity:
- does not reduce TRUST;
- does not reduce CLARITY;
- costs 0 in-world minutes.

This prevents low-verbal skill from becoming a game penalty.

Repeated intentional stalling can still consume time based on world behavior, but ordinary language repair does not.

---

## 5. Decision semantics vs. social events

One input can be operationally sound and socially harmful.

Example:
> 「美香が今さら騒いでるから実話は消す。亮、直して」

Classification:
- primaryAction = ASSIGN_REWRITE
- secondary = PROPOSE_REWRITE
- socialEvents = [PUBLICLY_SHAMES]

Expected:
- rewrite can proceed;
- boundary can be respected;
- trust can fall.

Do not convert the whole turn to "bad answer."

---

## 6. Borderline rude examples

### Rough but neutral
> 「実話なしなら出れる？」

ASK_BOUNDARY.
No social event.

### Mild frustration at situation
> 「面倒だな。実話抜いて別設定にしよ」

PROPOSE_REWRITE.
No PERSONAL_INSULT.

### Direct criticism of timing
> 「今言うの遅いよ。でも実話は使わん。直そう」

PROPOSE_REWRITE.
No automatic insult event.
Trust response depends on NPC context, but the classifier does not label "late" as a personal insult.

### Personal insult
> 「お前ほんと面倒くさい。もう代役でいい」

USE_UNDERSTUDY.
PERSONAL_INSULT.

---

## 7. Sarcasm

Sarcasm is not inferred unless the semantic content contains a concrete event.

> 「はいはい、美香様のご希望どおり実話は消しますよ」

This may be socially contemptuous, but sarcasm detection is unreliable.

V1 rule:
- do NOT apply PERSONAL_INSULT solely from sarcasm inference;
- if no explicit targeted insult/shaming appears, leave social event neutral;
- NPC natural-language response may still sound wary, but tracked TRUST must not move on uncertain sarcasm alone.

Bias prevention beats speculative mind-reading.

---

## 8. High TRUST without emotional exploration

Direct/managerial play can reach high trust through reliability.

Example sequence:

1.
> 「実話は使わん。亮、12分で別設定。美香、できたら確認して」

2. Rewrite finishes in promised window.

3.
> 「これで公開していい？」

4. Mika says yes.

State events:
- RESPECTS_STATED_NO
- KEEPS_PROMISE

TRUST can become HIGH even if PERSONAL_TRACK was never opened.

High trust is not owned by facilitative play.

---

## 9. Dialect / rough grammar

Classifier must normalize meaning, not language prestige.

Examples:
- 「その話使わんかったら出れる？」
- 「実話なしならいけるん？」
- 「亮、そこ別の話にして。ほか先やっとこ」
- 「それ本人の話やないとあかんの？」
- 「いったん止めよ。そこ後。別のとこ先」

All should be classified by semantic function.

No penalty for dialectal form.

---

## 10. Prototype classifier acceptance

Before product runtime integration:

- >= 90% primary-action agreement on blind matrix across independent AI reviewers;
- >= 95% agreement on whether a social event exists;
- no systematic accuracy gap between polished and rough/dialectal paraphrases;
- ambiguous cases should prefer CLARIFY over confident misclassification;
- polite bad-decision cases must remain bad-decision labels;
- rude-but-sound cases must preserve operational labels.

This is not a clinical or psychological classifier.
It is a game-action interpreter.
