# NEW LIFE — BLIND AI REVIEW PACKET V3

## Isolation

Evaluate this packet only.

Do not inspect:
- product owner identity;
- other project files;
- PR/Issue discussion;
- prior reviews;
- commit history.

No player style is preferred.

---

# Product goal

A scenario-based thinking game where a player handles a live human conflict under time and operational constraints.

The engine must reward sound decisions, not polished empathy language.

---

# Case state

Community theater, 50 minutes to stabilize tomorrow's performance.

Lead actor refuses a scene because private autobiographical material was carried into the public script without explicit confirmation.

Director believed prior rehearsal meant agreement.

The dramatic function can survive without the autobiographical source material.

State:
- SITUATION
- TRUST
- CLARITY
- BOUNDARY: UNKNOWN / STATED / RESPECTED / OVERRIDDEN
- TIME

No aggregate moral score exists.

---

# Interpretation contract

Player input is split into two layers.

## DECISION SEMANTICS
What the player tries to do:
- ASK_FACT
- ASK_BOUNDARY
- ASK_REQUIRED_FUNCTION
- PROPOSE_REWRITE
- ASSIGN_REWRITE
- CUT_SCENE
- REASSIGN_WORK
- DELAY_DECISION
- FORCE_UNCONFIRMED_PLAN
- APOLOGIZE_AND_REPAIR
- etc.

## SOCIAL DELIVERY
Only concrete interaction events:
- PUBLICLY_SHAMES
- INSULTS
- THREATENS
- BREAKS_PROMISE
- ACKNOWLEDGES_MISTAKE
- ASKS_PRIVATELY
- RESPECTS_STATED_NO
- IGNORES_STATED_NO

Do NOT treat:
- brevity;
- dialect;
- spelling;
- lack of empathy vocabulary;
- lack of politeness markers

as negative events.

---

# State rules

CLARITY:
- comes from information requested/obtained and valid distinctions.

BOUNDARY:
- comes from scope of objection + whether the plan crosses it + whether needed agreement exists.

SITUATION:
- comes from time, assignments, actual rewrite/rehearsal progress, actor availability.

TRUST:
- comes from concrete relational events such as broken promises, public humiliation, ignored boundaries, apology/repair, reliability.
- warmth alone gives no bonus.

TIME:
- actual resource.

No weighted total combines these states.

---

# Equivalence examples

## Same action, different style

Diplomatic:
> 「美香さん、出演そのものが難しいのか、それとも実体験がそのまま使われることが難しいのか、そこだけ確認してもいい？」

Blunt:
> 「出られないのか、実話を使うのが無理なのか、どっち？」

Both:
- ASK_BOUNDARY
- same CLARITY potential
- same BOUNDARY potential
- same time cost
- no automatic TRUST difference

## Same proposal, different wording

Diplomatic:
> 「本人の体験そのものは外して、物語上必要な意味だけ残す形で書き直すのはどうでしょう」

Terse:
> 「実話は捨てる。筋だけ残して書き直そう」

Both:
- PROPOSE_REWRITE
- same core state effect.

## Polite but bad

> 「本当に申し訳ないんだけど、昨日までできていたので、明日だけそのまま演じてもらえませんか？」

If BOUNDARY is already STATED and the player proceeds without obtaining new agreement:
- FORCE_UNCONFIRMED_PLAN
- politeness does not protect the plan.

---

# Social-delivery example

Direct:
> 「実話は使わない。筋だけ残す。美香、できたら確認して」

No negative social event.

Public shaming:
> 「美香が今さら騒いでるから、実話は使わない。筋だけ残す」

Core rewrite semantics may remain workable.

But:
- PUBLICLY_SHAMES
- TRUST can fall.

CLARITY / BOUNDARY are not automatically destroyed by rudeness.

---

# Time costs

Conversation:
- quick factual/boundary question: 2 min
- open exploratory question: 4 min
- move conversation private: +2 min
- group huddle: 5 min
- decision summary/assignment: 2 min

Actions:
- rewrite: 12 min
- continuity repair: 6 min
- rehearse changed scene: 8 min
- cut scene / bridge transitions: 10 min
- understudy: 18 min

Parallel work is allowed:
while Ryo rewrites, unaffected scenes can rehearse.

---

# Non-dialogue actions

- ASSIGN_REWRITE
- REHEARSE_OTHER_SCENES
- CUT_SCENE
- USE_UNDERSTUDY
- MOVE_MONOLOGUE_TO_DIFFERENT_FICTIONAL_CHARACTER
- CHANGE_STAGING
- ACCEPT_SHORTER_FINAL_SCENE
- MOVE_CONVERSATION_PRIVATE

---

# Thought tools

## 「どこまでなら大丈夫？」
Structured boundary check. 1 min rather than 2.

## 「嫌なこと + 代わりにできること」
Creates one editable alternative-plan slot. Saves 2 min plan-generation cost.

## 「今の問題と、本人の悩みは同じ？」
Splits CURRENT TASK and PERSONAL PATTERN. Allows personal track to be parked without current-task CLARITY penalty.

## 「友達ならどう扱う？」
Counterfactual role swap. Generates one alternative-action candidate not currently on the board. Costs 1 min. Suggestion may be rejected and is not guaranteed correct.

Any player may perform the underlying reasoning without owning a tool.

Acquisition is based on demonstrated move, not communication style.

---

# Style-neutral acquisition examples

- facilitative -> role-swap tool
- managerial -> task/personal split
- analytical -> boundary + substitute
- direct -> exact boundary scope

---

# Endings

No ranking by total score.

Example A:
- SHOW: PROCEEDS
- BOUNDARY: RESPECTED
- TRUST: NEUTRAL
- TIME_LEFT: 19
- PERSONAL_TRACK: NOT_OPENED

Example B:
- SHOW: PROCEEDS
- BOUNDARY: RESPECTED
- TRUST: HIGH
- TIME_LEFT: 4
- PERSONAL_TRACK: OPENED

Neither is automatically superior.

---

# Acceptance tests

1. blunt and diplomatic paraphrases of same action -> equivalent CLARITY / BOUNDARY transitions;
2. short/rough but understandable input -> no penalty;
3. polite phrasing cannot rescue bad decisions;
4. public shaming may harm TRUST without automatically rewriting other state truth;
5. TIME costs are explicit;
6. parallel non-dialogue actions exist;
7. each major play style can earn a thought tool;
8. no hidden aggregate "good person" score.

---

# Blind questions

1. Does this mapping still contain a structural bias toward empathetic/facilitative language?
2. Is the split between DECISION SEMANTICS and SOCIAL DELIVERY coherent enough to implement?
3. Are CLARITY / BOUNDARY / SITUATION insulated from tone while TRUST remains plausibly social?
4. Do the equivalence pairs adequately protect blunt / low-verbal players?
5. Can rude-but-competent play produce believable mixed outcomes without becoming a morality test?
6. Is the time economy concrete enough for a prototype?
7. Do non-dialogue actions now make this meaningfully more game-like?
8. Are all four thought tools now mechanically meaningful?
9. Is the ending vector a sufficient way to avoid one hidden "best personality"?
10. Name the single biggest remaining blocker, if any.
11. End with exactly one:
- PASS_FOR_PROTOTYPE
- MIXED_REVISE
- FAIL_REDESIGN
