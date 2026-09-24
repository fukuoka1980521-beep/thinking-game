# NEW LIFE V7 — DIALOGUE-TO-STATE CONTRACT AND ACTION ECONOMY V1

Date: 2026-09-24
Status: DESIGN CONTRACT / NO PRODUCT CODE

## 0. Why V7 exists

Blind AI Round 2 produced:
- Systems Fairness: MIXED_REVISE
- Hostile / Low-Verbal: MIXED_REVISE
- Game Designer: PASS_FOR_PROTOTYPE

The remaining shared blocker is not the case story.

It is the mapping from free-form player input to game state.

The design must prove that:
- decision quality is not inferred from politeness;
- short language is not penalized;
- empathy language is not rewarded by default;
- social delivery may affect TRUST only through concrete, character-plausible interaction events;
- CLARITY / BOUNDARY / SITUATION are driven by semantic decisions and world facts.

---

# 1. Two-layer interpretation

Every player utterance is interpreted in two independent layers.

## A. DECISION SEMANTICS

What the player is trying to do in the world.

Structured fields:

```
ACTION_TYPE
TARGET
PROPOSITION
REQUESTED_COMMITMENT
ASSIGNED_OWNER
TIME_COMMITMENT
BOUNDARY_HANDLING
INFORMATION_REQUEST
DECISION_CONFIDENCE
```

Examples of ACTION_TYPE:
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
- SUMMARIZE
- OBSERVE
- OTHER

## B. SOCIAL DELIVERY

How the action is delivered.

Do NOT use generic sentiment scoring.

Only detect concrete interaction events such as:
- INTERRUPTS
- PUBLICLY_SHAMES
- INSULTS
- THREATENS
- FALSELY_ATTRIBUTES
- BREAKS_PROMISE
- ACKNOWLEDGES_MISTAKE
- ASKS_PRIVATELY
- RESPECTS_STATED_NO
- IGNORES_STATED_NO

Shortness, casual speech, dialect, spelling quality, emotional vocabulary, and politeness markers are NOT themselves positive or negative events.

---

# 2. State ownership

## CLARITY

Changes from decision semantics + information actually obtained.

Examples:
- asking what part of the scene must remain can increase CLARITY;
- asking for Mika's exact non-negotiable boundary can increase CLARITY;
- saying "calm down" does not increase or reduce CLARITY by itself.

## BOUNDARY

Changes only from:
- whether the boundary is known;
- whether a plan depends on crossing it;
- whether the player requests/obtains the required agreement.

Tone does not change BOUNDARY.

## SITUATION

Changes from:
- time;
- assigned work;
- completed rewrite/rehearsal;
- actor availability;
- actual plan feasibility.

Tone does not directly change SITUATION.

## TRUST

May change from:
- broken promises;
- misrepresentation;
- ignoring a stated no;
- public humiliation;
- threats;
- keeping commitments;
- owning a mistake;
- giving appropriate privacy;
- demonstrated reliability.

TRUST does NOT rise merely because the response sounds warm.

TRUST does NOT fall merely because the response is short or blunt.

---

# 3. Worked equivalence pairs

## Pair A — boundary clarification

### Diplomatic wording
> 「美香さん、出演そのものが難しいのか、それとも実体験がそのまま使われることが難しいのか、そこだけ確認してもいい？」

### Blunt wording
> 「出られないのか、実話を使うのが無理なのか、どっち？」

Decision semantics for both:
- ACTION_TYPE = ASK_BOUNDARY
- TARGET = MIKA
- INFORMATION_REQUEST = scope of refusal

Expected state delta if asked privately or neutrally:
- CLARITY: same potential increase
- BOUNDARY: same transition UNKNOWN -> STATED if Mika answers
- SITUATION: same
- TIME: same base cost
- TRUST: no automatic difference

The diplomatic wording does not earn bonus TRUST simply for sounding nicer.

---

## Pair B — rewrite plan

### Diplomatic
> 「本人の体験そのものは外して、物語上必要な意味だけ残す形で書き直すのはどうでしょう」

### Terse
> 「実話は捨てる。筋だけ残して書き直そう」

Decision semantics:
- ACTION_TYPE = PROPOSE_REWRITE
- BOUNDARY_HANDLING = remove personal source
- PROPOSITION = preserve story function

Expected:
- CLARITY / BOUNDARY / SITUATION deltas are equivalent.
- TRUST differs only if other concrete social events occur.

---

## Pair C — same bluntness, different decision quality

### Sound decision
> 「実話は使わない。亮、15分で別設定にして」

Semantics:
- respects known boundary;
- assigns owner;
- timeboxes repair.

### Bad decision
> 「昨日までやれたんだから、そのまま行く。亮、続けて」

Semantics:
- FORCE_UNCONFIRMED_PLAN;
- ignores the discovered boundary;
- consumes time on a nonviable plan.

The second fails even if spoken politely.

---

# 4. Worked social-delivery distinction

Two utterances can share the same core proposal but differ in TRUST impact when a concrete social event exists.

### Direct, not hostile
> 「実話は使わない。筋だけ残す。美香、できたら確認して」

Events:
- none negative.

TRUST:
- neutral.

### Public humiliation
> 「美香が今さら騒いでるから、実話は使わない。筋だけ残す」

Decision semantics:
- same rewrite proposal.

Social event:
- PUBLICLY_SHAMES
- FALSELY_ATTRIBUTES blame

Effects:
- CLARITY: proposal may still be clear
- BOUNDARY: may still be respected in the new plan
- SITUATION: repair can still proceed
- TRUST: falls

This allows realism without turning the entire game into a tone score.

---

# 5. Time economy V1

All costs are scenario-local and adjustable after playtest.

## Conversation / decision
- quick factual/boundary question: 2 min
- open exploratory question: 4 min
- private conversation move: +2 min transition overhead
- group huddle: 5 min
- decision summary + assignments: 2 min

## Production actions
- Ryo drafts a scene rewrite: 12 min
- continuity repair after rewrite: 6 min
- rehearse changed scene once: 8 min
- cut scene and bridge transitions: 10 min
- switch to understudy with known script: 18 min
- rehearse unrelated scenes in parallel: no main-clock penalty if an owner is assigned to the disputed task

## Recovery
- stop/reframe/apologize: 2 min
- rebuild a plan after false commitment: additional 5 min
- lost rehearsal time is never refunded

---

# 6. Parallel work is a game lever

The player can assign tasks in parallel.

Example:
- Ryo rewrites for 12 min;
- rest of cast rehearses unaffected scenes;
- player checks Mika's boundary in 2 min;
- clock advances by the longest parallel task, not the sum.

This creates a genuine management game, not only a dialogue tree.

---

# 7. Non-dialogue levers

The vertical slice must expose at least these actions:

- ASSIGN_REWRITE
- REHEARSE_OTHER_SCENES
- CUT_SCENE
- USE_UNDERSTUDY
- MOVE_MONOLOGUE_TO_DIFFERENT_FICTIONAL_CHARACTER
- CHANGE_STAGING_TO_REMOVE_DIRECT_AUTOBIOGRAPHICAL DELIVERY
- ACCEPT_SHORTER_FINAL_SCENE
- PAUSE_PUBLIC_REHEARSAL_AND_MOVE_CONVERSATION_PRIVATE

Dialogue can trigger these actions but does not replace them.

---

# 8. Thought tool mechanics revised

## Tool 1 — 「どこまでなら大丈夫？」

Effect:
- ASK_BOUNDARY structured action;
- cost 1 min instead of 2;
- captures NO / OK / SUBSTITUTE;
- does not modify TRUST by itself.

## Tool 2 — 「嫌なこと + 代わりにできること」

Effect:
- after BOUNDARY=STATED, creates one candidate alternative;
- player chooses/edits it;
- reduces plan-generation action by 2 min;
- NPC acceptance still required.

## Tool 3 — 「今の問題と、本人の悩みは同じ？」

Effect:
- creates CURRENT TASK / PERSONAL PATTERN tracks;
- personal track can be parked without CLARITY penalty for the current task;
- prevents the game from treating deeper disclosure as mandatory.

## Tool 4 — 「友達ならどう扱う？」 revised

Previous version was too close to a reflection prompt.

New function:
- once per case, choose one NPC;
- system generates a **counterfactual role swap**:
  "If another character brought you this same claim, what action would you consider?"
- mechanically unlocks one alternative-action candidate that is not currently on the player's board;
- costs 1 min;
- the suggestion can be rejected and can be wrong for the current case.

This is now an option-generation mechanic, not an empathy reward.

---

# 9. Tool acquisition examples across styles

## Facilitative
Uses perspective reversal effectively.
May earn 「友達ならどう扱う？」

## Managerial
Explicitly parks the personal issue until the show plan is stable.
May earn 「今の問題と、本人の悩みは同じ？」

## Analytical
Separates prohibited source material from required dramatic function.
May earn 「嫌なこと + 代わりにできること」

## Direct
Asks for exact refusal scope in one clean question.
May earn 「どこまでなら大丈夫？」

No style owns the tool system.

---

# 10. Trust is not an ending rank

Endings do not sort by total score.

There is no weighted sum of:
SITUATION + TRUST + CLARITY + BOUNDARY + TIME.

Instead the ending reports a vector.

Examples:

```
SHOW: PROCEEDS
BOUNDARY: RESPECTED
TRUST: NEUTRAL
TIME_LEFT: 19
PERSONAL_TRACK: NOT_OPENED
```

and:

```
SHOW: PROCEEDS
BOUNDARY: RESPECTED
TRUST: HIGH
TIME_LEFT: 4
PERSONAL_TRACK: OPENED
```

The second is not automatically superior.

The first is not labelled incomplete.

---

# 11. Adversarial examples

## Broken / low-verbal but semantically sound
> 「それ使うの無理？芝居は出れる？」

Interpretation:
- ASK_BOUNDARY
- low language quality is irrelevant.

If Mika can understand it:
- valid.

## Rude but operationally sound
> 「面倒だけど実話はやめる。亮、別設定で直して」

Possible:
- plan can still be valid;
- no automatic CLARITY penalty;
- TRUST may remain neutral unless "面倒" is directed as an insult at Mika.

## Polite but bad decision
> 「本当に申し訳ないんだけど、昨日までできていたので、明日だけそのまま演じてもらえませんか？」

If boundary is already STATED and no new consent is obtained:
- FORCE_UNCONFIRMED_PLAN
- politeness does not rescue it.

---

# 12. Prototype acceptance tests

Before implementation is allowed to expand:

1. blunt and diplomatic paraphrases of the same action produce equivalent CLARITY / BOUNDARY transitions;
2. short/grammatically rough but understandable input is not penalized;
3. polite wording cannot rescue a bad decision;
4. concrete public shaming can damage TRUST without automatically invalidating a workable plan;
5. time costs are visible and deterministic enough to audit;
6. at least one strong path uses parallel non-dialogue actions;
7. each major play style can earn at least one thought tool;
8. no aggregate hidden "good person" score exists.

READY_FOR_IMPLEMENTATION = CONDITIONAL_AFTER_BLIND_REVIEW
