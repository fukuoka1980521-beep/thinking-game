# NEW LIFE — Concrete Scene Anchor V1

## Why this exists

Owner feedback showed two distinct failures:
1. the authored scene can be understandable only from hidden design notes; and
2. even when the player's advice is sensible, an NPC may answer with a generic abstraction and drift away from the live issue.

A successful example was:

- Player meaning: decide in advance what can/cannot be done; do not leave an operational boundary until the event day.
- Miyoko response: connect that principle to the cafe's actual seat count/conditions.
- Fumiko response: connect it to the concrete unanswered question, "how many people may wait at the cafe?"

The important property is not those exact sentences. It is the reasoning structure that produced them.

## Reusable mechanism

### 1. MEANING — understand the player's practical point

Reduce the newest utterance to what the player is trying to change in practice.

Example:
"商売ですからね、できることとできないことは決めておいたほうが良いですよ"

Practical meaning:
"Do not defer service boundaries until the day; decide the workable limit beforehand."

Do not replace this with a keyword class such as ROLE / BUSINESS / ADVICE.

### 2. ANCHOR — bind that meaning to the concrete live scene

Identify:
- the concrete object/place/task currently at issue;
- what is still undecided.

Day 3:
- object/place: Miyoko's cafe seats as a possible waiting place;
- undecided: whether they may be used, how many people, and under what conditions.

A generic answer such as "担当を明確にしましょう" loses this anchor.

### 3. AUTHORITY — preserve who may actually decide

Identify whose permission/decision is required.

Day 3:
- Miyoko decides use of her cafe seats and the acceptable conditions.
- Fumiko owns the notice/guide work.
- The player may advise or ask, but may not create Miyoko's consent.

The answer must never convert sensible advice into authority the speaker does not possess.

### 4. REPLY — answer as the character using the same concrete nouns

If the player statement concerns the current practical issue:
- acknowledge the actual meaning;
- reconnect it to the concrete scene;
- speak from the target NPC's own position;
- mention at least one natural concrete referent from the scene;
- advance at most one useful step.

Example direction, not a fixed answer table:
- Miyoko: "人数や条件を先に決める"
- Fumiko: "混んだ時に何人まで喫茶で待てるのかを確認する"

If the player deliberately changes topic, do not force the conversation back to the scene merely to satisfy the anchor.

## Runtime contract

Optional `sceneFocus`:
- `issue`: what is concretely going wrong / at risk;
- `decision`: the concrete decision/check that would move the scene forward;
- `authority`: who owns that permission/decision.

The UI may show this to the player as a compact situation guide.
The dialogue model also receives it as dynamic context, while canonical state/authority remains protected by the deterministic gate.

## Anti-patterns

Do not:
- map player language to a phrase-specific reply table;
- answer a concrete scene problem with generic management advice;
- repeat the whole scene exposition in every NPC line;
- force unrelated free conversation back to the current issue;
- let a non-owner NPC grant another person's permission;
- treat `sceneFocus` as a state mutation.

## Validation

A good anchored reply should let a reviewer answer:
1. Did it understand what the player meant?
2. Did it keep the current object/place/task visible?
3. Did it preserve the correct decision owner?
4. Did it move the conversation one concrete step instead of becoming generic advice?
5. If the player changed topic, did the NPC allow that change naturally?

The exact wording may vary. Success is semantic alignment, not string matching.
