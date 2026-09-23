# NEW LIFE REFOUNDATION CHARTER V1

Date: 2026-09-24
Status: DESIGN RESET / PRODUCT CODE FREEZE
Branch: chatgpt/newlife-refoundation-v1

## 0. Decision

The current NEW LIFE implementation is not the target product.

The target is **not** an NPC chat demo, a fixed-response visual novel, or a 30-day calendar filled with dialogue scenes.

The target is:

> **A narrative thinking RPG where the player becomes involved in other people's dilemmas, observes people and events, forms and revises interpretations, makes choices with consequences, and gradually transfers the same thinking structure to a real problem in their own life. AI supports the process without deciding for the player.**

Until the new loop is validated in a human playtest, **do not add product code, regex dialogue patches, new Day1-Day30 scenes, new AI routing exceptions, or visual assets.**

The previous emergency patch branch `chatgpt/newlife-phase34-human-playtest-repair` is not part of this design and must not be merged.

---

## 1. What went wrong

The current runtime optimizes technical correctness around conversation:

- deterministic intent classification;
- fixed NPC reply tables;
- semantic fallback only for unmapped utterances;
- truth gates;
- deployment/CI evidence.

Those protections are useful infrastructure, but they became the product center.

The failure mode is structural:

1. The player asks a human question.
2. A keyword router decides a category.
3. A prewritten answer is returned.
4. The scene does not meaningfully change.
5. The player's thinking is not represented as a game object.
6. There is no dramatic reason to continue.

This can pass tests while failing as a game.

### Explicitly deprecated development direction

Do **not** improve the product by adding more:
- regexes;
- canned responses;
- topic keyword exceptions;
- "correct answer" dialogue tables;
- calendar-day filler;
- generic chat with no consequence.

If a bug is caused by an utterance not matching a regex, the default response is **not** "add another regex." Revisit the architecture.

---

## 2. Product thesis

NEW LIFE should make the player feel three things:

1. **I want to know what happens to these people.**
2. **I am actively deciding what I think, not merely reading dialogue.**
3. **Something in this story unexpectedly helped me see my own problem differently.**

These are the three primary product gates.

Technical correctness, model quality, deployment status, and test coverage are necessary but subordinate.

---

## 3. External design patterns to reuse

We reuse mechanics and learning architecture, not copyrighted story text or art.

### 3.1 SPARX — challenge, reflection, real-life transfer

Reference:
- https://www.bmj.com/content/344/bmj.e2598

Pattern to reuse:
- skills are embedded in a world and challenges;
- a guide frames the experience without replacing play;
- each module ends by connecting the in-game experience to a real-life challenge.

NEW LIFE translation:
- the player does not receive a lecture on observation / hypothesis / reframing;
- the player practices those moves while dealing with a character conflict;
- only after a dramatic beat do we name or reflect on the thinking move;
- a small real-life quest follows.

### 3.2 SuperBetter — real life as quests, obstacles, allies, power-ups

References:
- https://v1.superbetter.com/faq
- https://superbetter.com/the-science/

Pattern to reuse:
- Quest = a small action toward a meaningful goal;
- Bad Guy = obstacle, thought, habit, situation;
- Ally = another person who can help;
- Power-Up = a quick action/resource that improves capacity.

NEW LIFE translation:
- REAL QUEST is always a small, observable action;
- obstacles are made concrete instead of described abstractly;
- NPC relationships can become allies or constraints;
- resources discovered in play can be reused in the player's real problem.

### 3.3 Disco Elysium — thoughts as inventory and inner voices as fallible agents

References:
- https://discoelysium.com/devblog/2019/09/30/introducing-the-thought-cabinet
- https://discoelysium.com/devblog/2016/10/06/active-skill-checks

Pattern to reuse:
- conversations can unlock Thoughts;
- Thoughts are collected, internalized, replaced, or discarded;
- inner faculties interrupt dialogue and are not automatically correct;
- active checks appear at dramatic knots, not every turn.

NEW LIFE translation:
- the player's interpretations become game objects;
- "探偵 / 悪魔 / 他者視点 / 参謀" return as **fallible inner voices**, not teachers;
- a thought can help in one scene and mislead in another;
- the player chooses whether to accept, hold, or reject an inner voice.

### 3.4 Serious-game transfer research — make transfer explicit

Reference:
- https://games.jmir.org/2026/1/e77173

Pattern to reuse:
- reflection is common;
- actual transformation / real-world transfer is much rarer;
- transfer must be deliberately designed, not assumed.

NEW LIFE translation:
- every case must define the exact transfer mechanism before content is written;
- gameplay ends with a bridge from fictional case -> player's current problem -> one real action -> later verification.

---

## 4. New core loop

```
STORY HOOK
  ↓
OBSERVE WORLD
  ↓
TALK / INSPECT / MOVE
  ↓
COLLECT THOUGHTS
  ↓
SORT WHAT YOU THINK
  ↓
INNER VOICE INTERRUPTION (only at meaningful moments)
  ↓
COMMIT TO AN INTERPRETATION OR ACTION
  ↓
VISIBLE CONSEQUENCE
  ↓
NEW INFORMATION / RELATIONSHIP CHANGE
  ↓
REVISE OR KEEP
  ↓
MIRROR TO REAL LIFE
  ↓
REAL QUEST
  ↓
VERIFY WHAT HAPPENED
```

The loop must be playable even if the player writes no free text.

Free text enriches play; it does not substitute for game design.

---

## 5. Player role

The player must have a reason to be present and a reason to care.

MVP role:

> **The player has temporary responsibility for a small shared space in a town for 30 days.**

This gives the player:
- access to several people;
- practical stakes;
- reasons to inspect, ask, arrange, refuse, or wait;
- a deadline;
- consequences that are visible in the world.

The player is **not** a therapist, counselor, omniscient narrator, or neutral chatbot operator.

The player has limited knowledge and incomplete authority.

---

## 6. NPC architecture

NPCs are not answer databases.

Each NPC requires these fields:

```
IDENTITY
PUBLIC_GOAL
PRIVATE_GOAL
FEAR
VALUE
FALSE_OR_PARTIAL_BELIEF
CURRENT_PRESSURE
RELATIONSHIPS
KNOWN_FACTS
UNKNOWN_FACTS
SECRETS_NOT_YET_REVEALED
BOUNDARIES
VOICE
MEMORY_OF_PLAYER
CURRENT_EMOTIONAL_STATE
```

### AI responsibility

AI owns:
- semantic interpretation of the player's natural language;
- natural in-character wording;
- social nuance;
- choosing how much to reveal based on relationship / pressure / scene;
- referring to remembered prior interactions;
- generating a conversational hook that can move the scene forward.

### System responsibility

System owns:
- canonical facts;
- world state;
- event eligibility;
- what an NPC actually knows;
- relationship scores / flags;
- hidden facts;
- allowed state changes;
- safety and privacy constraints.

### Principle

> **System owns truth and state. AI owns meaning and expression.**

The old architecture drifted toward:
> System owns truth, state, intent, meaning, and often wording.

That is the core mistake to reverse.

---

## 7. No-regex conversation rule

Regex may be used only for narrow non-semantic duties such as:
- input length;
- sanitization;
- obvious command/safety boundaries;
- formatting.

Regex must not be the primary method for deciding what a human sentence means.

Free dialogue should go through one semantic conversation engine with structured output.

Suggested response contract:

```json
{
  "playerMove": "ask_motive | ask_fact | challenge | comfort | accuse | joke | observe | propose | withdraw | other",
  "playerMeaning": "short semantic summary",
  "npcLine": "visible natural dialogue",
  "npcEmotion": "calm | guarded | warm | irritated | hurt | relieved | curious",
  "relationshipDeltaProposal": -2,
  "revealedFactIds": ["F12"],
  "unlockedThoughtIds": ["T07"],
  "sceneHook": "what the NPC does or points to next",
  "requiresSystemDecision": true
}
```

The engine may propose deltas; the system validates and applies only allowed transitions.

---

## 8. Thought Cabinet V1

The internal model can remain rich, but the player-facing UI must stay simple.

### Visible board: only three bins

1. **わかっている**
2. **そうかもしれない**
3. **まだわからない**

Cards can move between bins.

Example:
- "予約は12件ある" -> わかっている
- "洋平は陽菜の挑戦に反対している" -> そうかもしれない
- "陽菜が今回急いで売りたい理由" -> まだわからない

### Internal representation

Behind the UI, cards may be typed as:
- FACT
- INTERPRETATION
- FEELING
- VALUE
- FEAR
- UNKNOWN
- HYPOTHESIS
- OPTION
- NEXT_TEST

Do not expose all nine types at first. Beginner comprehension beats conceptual purity.

---

## 9. Inner voices

Return the earlier thinking characters as game mechanics.

### 探偵
Looks for what is observed versus assumed.

### 悪魔
Attacks the player's strongest interpretation with a counterexample.

### 他者視点
Shows how the same event may look to another NPC.

### 参謀
Looks for the smallest action that would distinguish between competing interpretations.

Rules:
- only one voice interrupts at a dramatic knot;
- never every turn;
- the voice can be wrong;
- the player can accept / hold / reject it;
- accepting it is not scored as "correct";
- repeated dependence on one voice may create blind spots later.

---

## 10. Event-first, not Day-first

30 days remain as a world deadline.

But content is authored in this order:

```
PERSON
→ CONFLICT
→ PRESSURE
→ EVENT
→ PLAYER INTERVENTION
→ CONSEQUENCE
→ RELATIONSHIP CHANGE
→ NEXT EVENT
→ elapsed time
```

Never:
```
Day 1
Day 2
Day 3
...
```

A quiet day is allowed to be skipped.

---

## 11. Visual design principle

Visuals are evidence, not decoration.

A scene image should reveal:
- physical distance between people;
- who faces whom;
- what object someone is touching;
- facial tension or avoidance;
- environmental clues;
- change after a decision.

Example:
- Hina is smiling, but gripping the price tag;
- Yohei is outside the shop rather than beside her;
- Miyoko stands closer to Hina;
- an old sign remains visible behind them.

The player should be able to infer something before reading dialogue.

### MVP visual requirement

For one 15-20 minute vertical slice:
- 3 scene keyframes;
- 3 character portraits with at least 2 emotional variants each;
- thought-board cards;
- one consequence image/state change.

Do not build a full art pipeline before the slice works.

---

## 12. Real-case transformation pipeline

The final product should use de-identified real consultation cases, but no case may be copied directly into the game.

Pipeline:

```
RAW CONSULTATION
→ REMOVE IDENTIFIERS
→ EXTRACT STRUCTURE
→ CORE DILEMMA
→ COMPETING VALUES
→ FACT / INTERPRETATION / UNKNOWN
→ PRESSURE EVENT
→ SAFE FICTIONALIZATION
→ GAME CASE
→ HUMAN REVIEW
```

Required fields:

```
CASE_ID
CORE_DILEMMA
WHAT_PERSON_SAYS_THEY_WANT
WHAT_BLOCKS_ACTION
COMPETING_VALUES
KNOWN_FACTS
ASSUMPTIONS
UNKNOWNS
EMOTIONAL_LOAD
STAKE
SMALLEST_TESTABLE_ACTION
WHAT_CHANGED_AFTER_ACTION
TRANSFER_TARGET
```

No personal identifiers, employer names, addresses, medical diagnoses, or unnecessary sensitive detail are required for gameplay.

Current repository search did not locate the prior real thinking-OS subject cases, so **V1 must not pretend a synthetic scenario is real evidence**.

---

## 13. Real-life Mirror

After the in-game consequence, the system asks for only one optional real-life connection:

> 「この話と少し似た構造のこと、今の自分にもありますか？」

If the player skips it, the game still works.

If answered, the AI converts the player's text into three cards only:
- わかっている
- そうかもしれない
- まだわからない

The user corrects the cards.

Only after that does the game propose a Real Quest.

---

## 14. REAL QUEST

A Real Quest must be:
- doable within 24-72 hours;
- observable;
- low risk;
- reversible where possible;
- directly useful for reducing uncertainty or moving one step.

Bad:
- "会社を辞める"
- "家族と話し合う"
- "もっと自信を持つ"

Good:
- "明日12時までに、上司へ『10分相談したいことがあります』と送る"
- "請求書を3か月分だけ並べて平均額を確認する"
- "相手に『一番困っているのはAとBどちら？』と一問だけ聞く"

Next session:
> 「できた？」ではなく「何が起きた？」

That response becomes new evidence.

---

## 15. Vertical-slice gates

Before any full implementation, one 15-20 minute slice must pass all five:

1. **Curiosity:** player wants to know what happens next.
2. **Character:** at least one NPC feels like a person, not an information terminal.
3. **Agency:** at least one decision changes a later scene or relationship.
4. **Thinking:** player visibly revises, keeps, or tests an interpretation.
5. **Transfer:** player can connect the structure to a real situation without being forced.

If any fails, fix the design, not the polish.

---

## 16. What survives from current NEW LIFE

Keep:
- character research;
- relationship modeling;
- state / truth separation;
- Vertex AI deployment knowledge;
- consent and data-boundary work;
- calibrated-trust principle;
- observation / hypothesis / falsification / perspective / updating concepts;
- evidence discipline and human-validation gates.

Rework:
- free-conversation architecture;
- scene progression;
- 30-day authoring;
- UI hierarchy;
- AI role;
- thought representation.

Retire from product center:
- fixed dialogue reply tables;
- semantic keyword router as primary conversation engine;
- regex-per-utterance repair;
- day-by-day filler;
- technical PASS as proxy for product quality.

---

## 17. Immediate next step

Do not code.

Build and human-playtest one complete vertical slice in conversation first.

The slice must include:
- role;
- 3 NPCs;
- 2 locations;
- 3 events;
- one hidden motive;
- one misleading but plausible interpretation;
- Thought Cabinet;
- one inner-voice intervention;
- one consequential decision;
- one Mirror;
- one Real Quest.

Only after the Owner says the slice itself is interesting and coherent should implementation begin.
