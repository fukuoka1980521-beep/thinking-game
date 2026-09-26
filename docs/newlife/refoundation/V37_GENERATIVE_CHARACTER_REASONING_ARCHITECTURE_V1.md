# NEW LIFE — GENERATIVE CHARACTER REASONING ARCHITECTURE V1

Date: 2026-09-26
Status: AUTHORITATIVE REDESIGN
Supersedes the runtime assumptions in V31/V32 where they conflict.

## 0. Why this redesign exists

Owner human testing exposed a structural mistake.

The system was drifting toward:
- classifying each player utterance into a narrow action label;
- feeding NPC generation a thin projection;
- patching missing replies case by case;
- adding specific prompt rules after each failed conversation.

That path does not scale and is not the product.

NEW LIFE must NOT attempt to predefine a response for every possible player sentence.

The intended product is:

> A story world with authored facts and character lives, in which a generative AI can converse broadly and naturally as each person, reason from that person's background/current situation, and combine this with an explicit thought-organization layer that helps the player understand and solve the problem.

The game should feel closer to a real conversation inside a bounded fictional world than to a branching FAQ.

---

## 1. New core principle

Old shorthand:

> System owns truth/state. AI owns expression.

This was too narrow.

New rule:

> **System owns canonical truth, permissions, irreversible state transitions, time, and authored event constraints.**
>
> **AI owns language understanding, conversational reasoning, character-consistent interpretation, natural dialogue, and candidate next moves/advice.**

The AI is not merely a sentence renderer.
It is the conversational reasoning engine.

The system remains the final authority over facts and world-state mutation.

---

## 2. Runtime architecture

### A. CANONICAL WORLD MODEL

Authored / deterministic.

Contains:
- scene facts;
- timeline;
- locations;
- deadlines;
- available resources;
- current tasks;
- irreversible events;
- facts known by each NPC;
- facts unknown to each NPC;
- explicit boundaries / permissions;
- authored story pressure and future event triggers.

This is the source of truth.

### B. CHARACTER MIND MODEL

Each NPC receives a real character dossier, not only a voice summary.

Minimum:
- identity / role;
- life history;
- stable traits;
- values;
- current wants;
- private wants;
- fears;
- working assumptions;
- contradictions;
- relationships;
- current emotional state;
- current pressure;
- what the NPC knows;
- what the NPC wrongly believes;
- what the NPC does not know;
- speech model;
- behavioral habits;
- transformation axis;
- non-transformation path.

The existing Phase 25-26 character models are the starting material.

### C. CONVERSATION BRAIN

Input:
- raw player utterance;
- recent raw conversation;
- current scene;
- relevant world facts;
- current NPC mind model;
- NPC memory of validated prior events;
- what this NPC is allowed to know;
- current relationship;
- current problem/deadline.

The AI must first understand what the player actually means, then answer as the person.

It may:
- answer questions;
- ask questions;
- disagree;
- misunderstand plausibly;
- joke;
- refuse;
- suggest a compromise;
- react emotionally;
- discuss ordinary topics;
- explain its own view;
- change its mind;
- say it does not know;
- propose an action;
- surface a concern.

It must NOT:
- invent canonical past events;
- invent permission;
- invent completed actions;
- expose hidden facts the NPC does not know;
- silently mutate world state;
- turn every reply into therapy/advice.

### D. STATE ARBITER

AI output may contain candidate structured effects:
- proposedAction;
- proposedFactRevealIds;
- proposedRelationshipSignal;
- proposedTaskChange;
- proposedCommitment;
- uncertainty.

The deterministic arbiter validates them against the world model.

Only validated effects can modify the game.

Natural dialogue itself remains free-form.

### E. STORY DIRECTOR

Authored story is not a list of response branches.

It is a graph of:
- situation;
- tensions;
- deadlines;
- event triggers;
- character goals;
- resources;
- consequences.

Events advance because:
- time passes;
- tasks complete/fail;
- people choose;
- relationships change;
- facts are discovered.

The player's exact wording does not need a prewritten branch.

### F. THOUGHT-ORGANIZATION ENGINE

Separate from NPC dialogue.

Purpose:
- help the player understand the problem;
- identify facts vs assumptions;
- separate immediate task from deeper concern;
- identify missing information;
- generate options;
- identify boundary / acceptable substitute;
- propose a low-risk next test or action;
- revise the hypothesis after new evidence.

Inputs:
- validated world facts;
- player observations;
- recent dialogue;
- unresolved questions;
- current goal.

Outputs should be optional and concise:
- わかっている
- そうかもしれない
- まだわからない
- 選択肢
- 次に確かめること / 次の一手

This is the explicit “thinking OS” layer.

NPCs remain people.
The thought-organizer is the game's problem-solving support.

---

## 3. Response model

For each player utterance, the conversation brain reasons across five dimensions.

### 1. WHAT DID THE PLAYER MEAN?
Not only classification labels.

Examples:
- question;
- challenge;
- sympathy;
- sarcasm;
- proposal;
- decision;
- change of topic;
- request for explanation;
- request for advice;
- attempt to end the situation.

### 2. WHAT DOES THIS CHARACTER KNOW?
Answer from the character's actual knowledge.

If unknown:
- say they do not know;
- ask someone who may know;
- state uncertainty.

Do not fill canon gaps with invented facts.

### 3. HOW WOULD THIS PERSON REACT?
Use:
- personality;
- values;
- pressure;
- relationship;
- history;
- current emotion.

Not a generic “helpful assistant” response.

### 4. WHAT HAPPENS NEXT?
The NPC can propose or perform only actions actually available to them.

The arbiter validates world effects.

### 5. DOES THE PLAYER NEED THOUGHT SUPPORT?
If the player is stuck / conflict is complex / uncertainty matters, the thought-organizer may offer:
- a distinction;
- an option set;
- one useful question;
- one next experiment.

Not after every turn.

---

## 4. Broad free conversation

The player may say almost anything.

The runtime should handle at least:

### In-world factual question
Grounded answer from known facts.

### Character/personal question
Answer from the character dossier and allowed memory.

### Opinion or emotion
Generate a character-consistent human response.

### Practical proposal
Evaluate against goals, constraints, time, and relationships.

### General conversation / small talk
Respond naturally in character, without pretending every sentence is a game command.

### Ambiguous statement
Ask a natural clarification.

### Off-topic input
Respond as the person would, then optionally reconnect to the current situation if appropriate.

### Advice request
NPC gives only advice that person plausibly would give.
Structured problem-solving advice belongs primarily to the thought-organizer.

---

## 5. Important separation: NPC vs thought organizer

### NPC
A human character inside the world.

Should sound like:
- “それなら、実話の部分だけ外せるなら私はやれます。”
- “代役は今からじゃ厳しい。場面を短くする方がまだ現実的だ。”

### Thought organizer / strategist
A game support layer.

May say:
- “今わかっているのは、美香は『公演そのもの』ではなく『実話をそのまま公開すること』を拒否している点です。”
- “次に確認すると分岐が減るのは、『実話を外せば出演できるか』です。”

These roles must not be mixed.

NPCs should not suddenly become counselors.

---

## 6. Why the recent local patches were wrong

The following pattern is explicitly rejected:

player says X
→ response is poor
→ add special prompt rule for X
→ player says Y
→ add another rule for Y

This leads to infinite local optimization.

Instead:

player says anything
→ give model enough world + character + conversation context
→ model reasons naturally
→ deterministic system validates only the world effects.

The fix is better context architecture, not more answer-specific rules.

---

## 7. Required implementation changes

### Retire as primary runtime contract
The current thin `NpcVisibleStateProjection` is insufficient as the sole NPC input.

It may remain as a low-level safety/testing type, but production generation needs a richer `CharacterConversationContext`.

### New `CharacterConversationContext`

Minimum shape:

```ts
{
  rawPlayerUtterance,
  recentDialogue,
  scene,
  relevantWorldFacts,
  characterProfile,
  characterKnowledge,
  characterBeliefs,
  currentGoals,
  currentEmotion,
  relationship,
  currentPressure,
  availableActions,
  forbiddenKnowledge,
  unresolvedQuestions
}
```

### New model output

```ts
{
  npcLine,
  understoodPlayerMeaning,
  candidateWorldEffects,
  candidateFactReveals,
  candidateCommitments,
  uncertainty,
  thoughtSupportSignal
}
```

Only `npcLine` is displayed immediately.
All candidate effects are validated before state mutation.

---

## 8. First implementation slice

Do NOT redesign all 30 days first.

Use the Mika / Ryo theater case only.

But test it with broad free conversation, not scripted answers.

The slice passes only if the model can naturally handle unseen inputs such as:
- “なんで今まで言わなかったの？”
- “今日は一旦帰ろうか”
- “亮はこの件どう思ってる？”
- “美香が出ないなら公演やめよう”
- “台本じゃなく演出で隠せない？”
- “二人とも少し意地になってない？”
- “もう疲れた。勝手に決めて”
- typo / short / dialect / blunt inputs;
- unrelated small talk;
- requests for explanation;
- requests for advice.

No case-specific answer table is allowed.

---

## 9. Evaluation

Success is not “all inputs map to a predeclared action.”

Human evaluation asks:

- Did the AI understand what I meant?
- Did the person answer my actual question?
- Did the reply fit this character?
- Did it use the story facts correctly?
- Did it avoid inventing facts?
- Did the conversation move naturally?
- When useful, did the thought-organizer help me see the problem more clearly?
- Could the situation still fail if I handled it badly?

This is the actual product gate.

---

## 10. Immediate development rule

STOP:
- case-specific reply patches;
- adding more response regexes;
- adding one-off prompts for individual Owner utterances;
- exhaustive action taxonomy expansion merely to cover language variety.

START:
- rich character/world context;
- raw-conversation reasoning;
- deterministic fact/state validation;
- separate thought-organization support.

AUTHORITATIVE_DIRECTION = GENERATIVE_CHARACTER_REASONING
CASE_SPECIFIC_RESPONSE_PATCHING = STOP
NPC_IS_HUMAN_CHARACTER = YES
THOUGHT_ORGANIZER_IS_SEPARATE = YES
SYSTEM_CANON_AUTHORITY = YES
AI_CONVERSATIONAL_REASONING = YES
