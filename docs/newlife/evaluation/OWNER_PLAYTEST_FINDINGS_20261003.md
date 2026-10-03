# NEW LIFE Owner Playtest Findings — 2026-10-03

Status: direct owner play evidence. Product PASS not claimed.

## Positive observations

The owner reported these exchanges as natural or good:
- Hina answered ordinary product/start-time questions smoothly.
- Miyoko handled a contradiction about where Hina would sell by acknowledging the new information and suggesting confirmation.
- Jin's short exchange about chair repair and declining help felt natural.
- The chair-repair conversation helped the owner understand why Jin was present in the cafe.

## Human-naturalness issue: overly compressed ordinary reply

Yohei answered a question about today's plans with:
> いつものことだ。

Owner preference:
> いつも通りの予定だけだな

Finding:
Character brevity should not turn an ordinary question into an unnecessarily cryptic line. Small talk should answer the literal everyday question first.

## Human-naturalness issue: Day 2 scene prose

The original scene compressed several ordinary actions into design-like prose:
- Jin repairing a chair;
- Miyoko thanking him;
- normal customer farewell;
- Hina's trial sale being mentioned;
- Miyoko noticing the seats.

Owner preferred ordinary causal narration, not symbolic shorthand.

Repair direction:
- make the chair repair physically clear;
- use coffee as the visible thank-you;
- make Hina's sale only a mentioned topic, not an implied cafe sale;
- keep seat concern separate from sale-location fact.

## Logic issue: Fumiko became procedurally stubborn

In a dispute about using Miyoko's commercial seats as a waiting area, the owner argued that imposing possible customer displacement on the cafe was unreasonable and suggested removing the cafe from the waiting plan.

Fumiko repeatedly converted the objection back into:
- define numbers;
- define roles;
- define the waiting place;
- clarify responsibility.

Owner interpretation:
> 文子が話の通らない頑固婆にみえる。こんなNPCもいてもよいが。

Finding:
A stubborn NPC is acceptable; a logically non-updating NPC is different. If the player offers a workable alternative that removes a burden on another person's property/business, the NPC should evaluate that alternative rather than mechanically defend the old process.

## Severe comprehension / grounding failure: Day 4

Original scene:
- Daisuke is repairing a chair.
- Fumiko asks whether the workshop can also be used as a pickup place.

Because the target object of "pickup" was not stated, the model later inferred:
- chairs were being sold at Hina's trial sale;
- the workshop was a chair-pickup location.

The owner correctly challenged this and eventually ended the conversation because the causal explanation remained incoherent.

Root cause:
**referent/object binding failure**.
Two simultaneous topics — chair repair and baked-goods pickup logistics — were compressed into one scene without explicit object labels.

Repair:
- explicitly state that Hina's baked goods are the pickup object;
- explicitly state that Daisuke's chair is a repair job, not a trial-sale product;
- add a sceneFocus with issue / decision / authority;
- add a general dialogue rule not to merge nearby nouns or infer a shared object without evidence.

## Reliability issue

The final long conversation ended with:
> 返事の途中で通信が途切れました。

The exact provider-side cause was not established from the transcript alone. A resilience repair separates background reflection calls from foreground dialogue rate limiting and raises the foreground local budget, so background cognition cannot consume the player's conversation allowance.

## Product consequence

The current target is no longer merely "natural wording."

A valid NEW LIFE turn must preserve all four:
1. ordinary-human phrasing;
2. correct object/reference binding;
3. logical update when the player's argument changes the workable plan;
4. character individuality without turning personality into irrational repetition.


## Isolated-backend regression probe after repairs

Build under test:
`1366c2517417ba2f61034b2af1c3772b095940c7`

### Yohei — ordinary schedule question

Player:
> 今日何か予定あるのですか

Yohei:
> 今日はいつも通りだ。

Result:
The reply is now ordinary and literal rather than the more cryptic `いつものことだ`.

### Fumiko — remove cafe dependency

Player proposal:
> 迷惑をかけるかもしれないので、喫茶を待機場所から外して会館側だけで考えた方がよいですよ

Fumiko:
> 喫茶を待機場所から外すなら、会館側で待機場所を確保する必要がありますね。

Result:
Fumiko accepts the structural change instead of mechanically insisting on defining cafe-seat conditions. She can remain procedural in personality while still updating the plan.

### Day 4 — object/reference grounding

Player:
> 椅子を売るのですか？焼き菓子の受け取り場所の話とは別ですよね

Fumiko:
> 椅子は修理品ですよ。焼き菓子の受け取り場所とは別の話です。

Result:
The model now separates chair repair from baked-goods pickup and does not invent chair sales.

These are targeted live regressions, not a full human-product PASS.
