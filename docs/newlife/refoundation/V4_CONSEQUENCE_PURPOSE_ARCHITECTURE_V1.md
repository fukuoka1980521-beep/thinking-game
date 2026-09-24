# NEW LIFE V4 — CONSEQUENCE / PURPOSE ARCHITECTURE V1

Date: 2026-09-24
Status: DESIGN ONLY / NO PRODUCT CODE

## 0. Human playtest result

Owner assessment after V3 community-theater playtest:

- Mika's NPC dialogue felt natural.
- The progression toward resolving her concern was acceptable and believable.
- The overall purpose of the experience was not clear during play.
- The purpose became understandable only when the game asked for a final evaluation.
- As a game, player responses must be able to produce failure / breakdown outcomes, not only cooperative resolution.

This is a design correction, not a dialogue correction.

---

## 1. Product purpose must be legible from the start

NEW LIFE is:

> **A scenario-based thinking game where the player becomes involved in an NPC's concrete problem, tries to move the situation forward through conversation and decisions, and may either resolve, partially resolve, or worsen the problem. Through that process, the player practices organizing facts, interpretations, boundaries, and next actions.**

The game must not hide this purpose until the end.

### Opening presentation

At case start, show only:

**今回の依頼**
- 人物の問題を理解する
- その場を前に進める
- 必要なら考えを整理する
- 結果はあなたの対応で変わる

Do NOT show:
- correct-answer hints;
- psychology labels;
- a morality score;
- the intended lesson.

The player should know *what kind of game this is* without knowing *what answer the game wants*.

---

## 2. Core gameplay loop

```
NPC PROBLEM APPEARS
  ↓
PLAYER OBSERVES / ASKS / ACTS
  ↓
NPC REACTS
  ↓
WORLD STATE CHANGES
  ↓
NEW FACT / NEW PRESSURE / RELATIONSHIP SHIFT
  ↓
PLAYER DECIDES AGAIN
  ↓
RESOLUTION / PARTIAL RESOLUTION / COLLAPSE
  ↓
SHORT REFLECTION
  ↓
OPTIONAL REAL-LIFE TRANSFER
```

The player is not merely "having a good conversation."

They are trying to move a live situation.

---

## 3. Consequence model

Every case tracks at least three independent state dimensions.

### A. SITUATION
Can the practical problem still be solved?

Example theater case:
- 3 = performance plan stable
- 2 = repairable
- 1 = critical
- 0 = collapsed / performance cannot proceed as planned

### B. TRUST
Will the NPC continue speaking honestly with the player?

- 3 = open
- 2 = cautious
- 1 = guarded
- 0 = withdraws / stops cooperating

### C. CLARITY
Has the actual point of conflict become understood?

- 3 = core issue named by NPC/player
- 2 = main distinction emerging
- 1 = still mixed with assumptions
- 0 = wrong frame dominates

No single global score is shown to the player.

---

## 4. Player actions must have trade-offs

A response can improve one axis and damage another.

Example:

> Player: 「そんなことで舞台止めるな。今日は我慢してやって」

Possible consequence:
- SITUATION +1 temporarily (rehearsal resumes)
- TRUST -2
- CLARITY -1
- delayed event unlocked: Mika disappears before performance / refuses public scene later

This is important:

> **An action that works immediately can still create a worse later state.**

That is what makes the game more than a chat assistant.

---

## 5. Four outcome families

Do not reduce endings to "good / bad."

### 1. RESOLVED
Practical issue moves forward and the NPC's actual concern is respected enough to remain workable.

Example:
- scene rewritten;
- Mika approves the boundary;
- rehearsal continues;
- future communication path exists.

### 2. SURFACE FIX
The immediate operation is saved but the personal issue remains.

Example:
- Mika agrees to perform under pressure;
- show happens;
- afterward she quits the troupe or stops trusting the director.

### 3. STALEMATE
The player avoids commitment or keeps gathering information without acting.

Example:
- rehearsal time runs out;
- no final script;
- performance delayed / reduced.

### 4. BREAKDOWN
The player's handling directly worsens the case.

Example:
- public accusation;
- dismissal of Mika's concern;
- speaking on Mika's behalf without consent;
- coercion;
- false promise to both sides.

Possible end:
- Mika leaves;
- director refuses further changes;
- show cannot proceed as planned.

Breakdown must follow understandable causality.
Never punish the player arbitrarily.

---

## 6. Failure should teach through consequence, not a lecture

Bad design:

> 「その回答は不適切です。相手の気持ちを尊重しましょう。」

Required design:

Player:
> 「そんなの気にしすぎ。昨日までできたなら明日もできるでしょ」

Mika:
> 「……分かりました。もういいです」

She stops explaining.

Five minutes later:
- she gives back the script;
- says she will not perform;
- the director now has no lead actor;
- the player must recover from a worse state.

The game shows what the response caused.

---

## 7. Recovery is part of the game

A poor decision should not always immediately end the case.

Allow:
- apology;
- reframing;
- asking again;
- changing the plan;
- accepting a cost;
- finding another path.

Example recovery:

> 「今の言い方は悪かった。出てほしい気持ちが先に出た。何が嫌なのか、もう一度聞かせて」

Trust may recover partially, not fully.

This creates:
- stakes;
- consequence;
- second chances;
- meaningful memory.

---

## 8. NPC memory requirements

NPC remembers:
- whether player interrupted;
- whether player asked before assuming;
- whether player respected a stated boundary;
- whether player kept a promise;
- whether player spoke privately or publicly;
- whether player corrected their own mistake.

Later dialogue must reflect those states.

The NPC cannot reset to neutral after each turn.

---

## 9. V3 theater case — branch structure

### Node T0 — Mika refuses scene

Player can:
- inquire;
- pressure;
- ignore;
- ask director first;
- separate parties;
- propose replacement.

### Branch A — inquiry / understanding
Unlock:
- personal-story boundary
- rewrite option
- trust-preserving path

### Branch B — pressure
Immediate:
- Mika may comply temporarily
Delayed:
- trust collapses
- later refusal before performance

### Branch C — public blame of director
Immediate:
- director becomes defensive
- Mika may not want to be used as justification
- group polarization increases

### Branch D — avoid decision
Immediate:
- no argument
Delayed:
- rehearsal time loss
- production schedule becomes critical

### Branch E — rewrite without asking Mika
Immediate:
- script may become workable
Risk:
- autonomy violation; Mika rejects rewrite because the boundary was guessed rather than confirmed

---

## 10. Example breakdown ending

### END: 「公演中止」

Trigger example:
1. player dismisses Mika's concern;
2. player pressures her to continue;
3. player publicly tells others that Mika is "being difficult";
4. Mika leaves;
5. no understudy exists;
6. director refuses a last-minute structural rewrite.

Final screen:

> **結果**
> 公演は予定どおり行えなかった。

Then show only causal history:

- 美香の懸念を確認する前に出演継続を求めた
- 美香が説明をやめた
- 代替案を作れる時間が失われた
- 主演不在になった

No moral score.

Then:
> **もう一度、どこからやり直しますか？**
> - 最初から
> - 美香が理由を話す前
> - 公開で対立した直前

This is game structure, not chat grading.

---

## 11. Example partial ending

### END: 「舞台は成功、関係は残らない」

The show runs.

Afterward:
- Mika thanks the player for helping the performance happen;
- but tells Ryo she will leave the troupe.

This ending demonstrates:
> operational success != human resolution.

Important for NEW LIFE's thinking model.

---

## 12. Example stronger ending

### END: 「続けられる形」

The show proceeds with altered fiction.
Mika's personal boundary is preserved.
Ryo understands he needs explicit permission before using personal rehearsal material.
Mika identifies a low-burden method for raising concerns earlier.

No perfect score.
Future tensions can still exist.

---

## 13. Thought mechanics unlock after consequence

Thought cards should not interrupt the opening.

After the first meaningful consequence, unlock one contextual card.

Examples from this V3 playtest:

- **「友達ならどう扱う？」**
  - perspective reversal / self-standard check

- **「どこまでなら大丈夫？」**
  - boundary decomposition

- **「嫌なこと + 代わりにできること」**
  - boundary + acceptable substitute

- **「今の問題と、本人の悩みは同じ？」**
  - separates operational issue from deeper personal issue

The player earns tools from play.
They are not shown as a tutorial checklist.

---

## 14. Definition of a valid case

A NEW LIFE case is valid only if:

1. NPC has an understandable concrete problem.
2. Player has authority to affect it.
3. Multiple plausible actions exist.
4. At least one action can worsen the situation.
5. The NPC reacts differently based on player behavior.
6. Consequences persist.
7. Recovery is possible in at least one failure branch.
8. At least two endings are meaningfully different.
9. The deeper thought pattern emerges from the case.
10. The game can finish without forcing personal disclosure from the player.

---

## 15. Updated product gate

The next playable prototype must demonstrate both:

### SUCCESS PATH
The Owner can help an NPC reach a workable resolution.

### FAILURE PATH
A different response causes believable deterioration / breakdown.

Only after both are convincing should product code implementation start.

READY_FOR_IMPLEMENTATION = NO
READY_FOR_BRANCHING_CHAT_PLAYTEST = YES
