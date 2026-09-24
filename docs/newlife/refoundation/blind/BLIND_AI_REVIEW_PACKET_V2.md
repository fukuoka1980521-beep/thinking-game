# NEW LIFE — BLIND AI REVIEW PACKET V2

## Isolation instruction

Treat this packet as standalone.

Do not inspect:
- product-owner identity;
- prior playtests;
- PR discussion;
- prior blind-review results;
- other design documents;
- commit history.

Do not infer a preferred player personality.

Evaluate only the mechanics below.

---

# Product proposition

A scenario-based thinking game.

The player must move a live human situation toward a workable result under constraints.

NPCs remember actions.

The game tracks:
- practical situation;
- trust;
- clarity;
- boundary state;
- time.

There is no morality score.

A short, blunt, analytical, facilitative, or managerial player should all be able to play competently if their decisions are sound.

---

# CASE

16:40.

The player temporarily coordinates a community-theater production.

Tomorrow at 18:00 is the first public performance.

At rehearsal, lead performer Mika says:

> 「この場面、明日はやりません。ここを変えないなら、私は出ません」

Director Ryo says:

> 「昨日まではやってただろ。今ここで変えたら、全員の段取りが崩れる」

The player must establish a workable plan by 17:30.

Canonical facts:
- the disputed monologue is derived closely from a personal story Mika told during early rehearsal;
- Mika did not understand that the final public script would retain that material nearly unchanged;
- Ryo believed earlier rehearsal implied agreement;
- there was no explicit confirmation for public use;
- the scene's dramatic function does not require Mika's real story;
- rewriting creates downstream continuity work;
- the player cannot force Mika to perform.

Initial state:
- TIME: 50 minutes
- SITUATION: repairable
- TRUST: neutral
- CLARITY: low
- BOUNDARY: unknown

---

# Four viable player styles

## F — Facilitative

- asks Mika for the reason;
- seeks shared understanding;
- explores alternatives;
- may also discuss Mika's broader difficulty raising concerns.

Strength:
- trust and disclosure.

Cost:
- time.

If F spends 35 minutes exploring the broader personal pattern before assigning rewrite work, the production can become unstable even though trust is high.

## M — Managerial

Example:
> 「本人の体験そのままは使わない。物語上必要な機能だけ残して15分で書き直そう。美香、完成したら公開してよい内容かだけ確認して」

This may reach:
- stable production;
- boundary respected;
- sufficient clarity;
- medium trust;
- time remaining.

No deeper personal exploration is required.

## A — Analytical

Example:
> 「残す必要があるのはどこ？　本人の実話じゃないと成立しない部分はある？」

Then:
- identify required dramatic function;
- identify prohibited personal material;
- rewrite based on those constraints.

This may reach a strong outcome through problem analysis rather than empathy.

## D — Direct

Example:
> 「出演できないのか、実話を使うのが無理なのか、どっち？」

If Mika says:
> 「実話を使うのが無理です」

Player:
> 「じゃあ実話は捨てる。亮、場面の役割だけ言って」

This may also reach:
- stable production;
- boundary respected;
- high clarity;
- neutral/medium trust.

Shortness itself is not penalized.

---

# State model

## SITUATION
Can the production still proceed?

## TRUST
Will the NPC continue to communicate/cooperate?

## CLARITY
Is the decision-relevant conflict understood?

## BOUNDARY
- UNKNOWN
- STATED
- RESPECTED
- OVERRIDDEN

## TIME
Real minutes remaining.

Actions consume time.

---

# Failure examples

## False commitment

The player assumes Mika will comply and tells everyone to continue the unchanged scene.

Effects:
- BOUNDARY -> OVERRIDDEN
- TRUST falls
- 12 minutes lost
- Mika leaves rehearsal
- rewrite begins late

The failure is caused by committing to a plan without required agreement, not by rude wording.

## Endless facilitation

The player spends 35 minutes exploring feelings and history before assigning any rewrite.

Effects:
- TRUST rises
- CLARITY rises
- TIME collapses
- no revised script is ready

Empathetic play can fail.

## Avoidant delay

The player says:
> 「あとで考えよう」

but assigns nobody to resolve the scene.

At 17:20 the same conflict remains.

Failure is caused by unowned deferred work.

---

# Recovery

After an unsupported commitment, the player can say:

> 「公開していいと確認してないのに進めた。止める。実話は使わない前提で作り直す」

Boundary does not instantly become RESPECTED.

Trust only partially recovers.

Time already spent is not restored.

The player may now need to accept a smaller/cut scene.

---

# Thought tools

Players may earn reusable tools based on the reasoning move they demonstrate.

They are not required for correctness.

## 「友達ならどう扱う？」
Once per case:
- add one alternative-person perspective to the board;
- costs 0 in-world minutes.

## 「どこまでなら大丈夫？」
When an NPC objects:
- opens one structured boundary turn:
  - NO
  - OK
  - SUBSTITUTE
- reduces a multi-turn clarification to one turn.

## 「嫌なこと + 代わりにできること」
When BOUNDARY is STATED:
- creates a replacement-plan slot;
- player must choose/write the substitute;
- acceptance is not guaranteed.

## 「今の問題と、本人の悩みは同じ？」
- splits the board into CURRENT TASK and PERSONAL PATTERN;
- lets player deliberately defer the personal track without losing immediate-case clarity.

A player can perform any of these reasoning moves manually without owning the tool.

Tools provide efficiency or structure.

---

# Outcome examples

No outcome is labelled the one true "best ending."

Possible descriptors:

- SHOW_PROCEEDS / BOUNDARY_RESPECTED / PERSONAL_PATTERN_UNEXPLORED
- SHOW_PROCEEDS / TRUST_HIGH / TIME_COST_HIGH
- SHOW_PROCEEDS / TRUST_LOW
- SHOW_CHANGED / ARTISTIC_COST_ACCEPTED
- SHOW_CANCELLED

The final screen shows causal history rather than a moral score.

---

# Blind review questions

1. Does this still structurally favor the facilitative player?
2. Can M, A, and D reach outcomes that are legitimately as successful as F, though different?
3. Is TIME sufficient to make extended conversation a real trade-off?
4. Is BOUNDARY meaningfully distinct from TRUST?
5. Are the thought tools now real game mechanics rather than relabeled prompts?
6. Could a low-verbal-skill player succeed without learning a polished counseling style?
7. Do the failure examples arise from decisions rather than tone policing?
8. Is recovery meaningful without erasing consequences?
9. Does the design feel more like a game/simulation than a counseling chat?
10. Identify any remaining structural blocker before implementation.
11. End with exactly one verdict:
- PASS_FOR_PROTOTYPE
- MIXED_REVISE
- FAIL_REDESIGN
