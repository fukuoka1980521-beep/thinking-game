# NEW LIFE VERTICAL SLICE OPENING — HUMAN FAILURE REPORT V1

Date: 2026-09-24
Status: FAIL AT OPENING / DO NOT IMPLEMENT

## Owner human-playtest evidence

The very first playable opening failed before meaningful play began.

Owner feedback:

- 「『……三十って、全部買えるように見えるな』これは意味がわからない」
- 「陽菜の手が一瞬止まる。『数は合ってます』これも文脈がずれてる」
- 「店の隅には、名前らしきものが何行か書かれた小さな手帳も見える。何のための行為かわからない」

The Owner selected action 2 ("talk to Hina") but simultaneously reported that the scene itself was not coherent enough to support play.

This is a product-design failure, not a wording bug.

## Root causes

### 1. The player had no concrete immediate job

The role "manage a shared storefront for 30 days" was too abstract.

The player did not know:
- what must be decided now;
- what failure would look like;
- why Hina / Yohei matter;
- what authority the player actually has.

Without a concrete objective, every observation feels like unexplained scenery.

### 2. The conflict depended on hidden bookkeeping

The line:

> 「三十って、全部買えるように見えるな」

only makes sense if the player already understands the distinction between:
- total produced;
- reserved;
- walk-in inventory;
- what the sign implies.

That knowledge existed in the designer's head, not in the scene.

A player should never need hidden design notes to understand why two characters disagree.

### 3. NPC dialogue was written to deliver a mechanic, not to behave like people

Hina's reply:

> 「数は合ってます」

is technically related to the designer's intended conflict, but it is not a natural answer to what the player has just witnessed.

The scene made the characters carry system logic.

That is the same failure mode as the previous canned-response implementation, only moved into authored narrative.

### 4. The notebook was a "game clue" with no visible reason to inspect it

The notebook existed because the designer wanted an observation mechanic.

The world did not give the player a reason to care about it.

Rule:

> Never place an evidence object merely because the game needs evidence.

Objects must have a visible practical role in the current situation.

### 5. Mystery was confused with ambiguity

A good mystery gives the player:
- a clear surface problem;
- incomplete explanation.

This opening gave the player:
- an unclear surface problem;
- hidden explanation.

That produces confusion, not curiosity.

## New opening gate

Before a playable scene begins, an uninformed player must be able to answer all four within 30 seconds:

1. **Why am I here?**
2. **What is the immediate problem?**
3. **What happens if nobody acts?**
4. **What can I actually do?**

If any answer is unclear, the scene cannot enter human playtest.

## Narrative rule

Do not start with a hidden psychological contradiction.

Start with an observable practical event.

Then allow the player to discover that the practical event has:
- interpersonal meaning;
- competing interpretations;
- a deeper motive.

Order:

```
VISIBLE PROBLEM
→ HUMAN REACTION
→ PLAYER ACTION
→ NEW EVIDENCE
→ INTERPRETATION
→ HIDDEN MOTIVE
```

Not:

```
HIDDEN MOTIVE
→ cryptic dialogue
→ unexplained clue
→ ask player to infer the game
```

## Prop rule

Every inspectable object must satisfy at least one:

- someone is actively using it;
- it blocks or enables an immediate action;
- another character explicitly refers to it;
- the player needs it to complete their stated role.

No "mysterious notebook on a table" without context.

## Dialogue rule

Before accepting an NPC line, test:

> Would a real person say this sentence here if there were no game mechanic to teach?

If no, rewrite the event, not just the line.

## V2 design direction

Do not repair the baked-goods opening yet.

First choose a case with a simpler, legible surface problem and a stronger player role.

Preferred structure:

- one person wants something;
- another person objects for a concrete reason;
- the player has a practical responsibility that forces a decision;
- both positions are understandable;
- the deeper dilemma only appears after the player has acted.

Candidate case domains:
- work / resignation / role conflict;
- small business / staffing / responsibility;
- family obligation versus personal choice;
- money / promise / boundary.

The next V2 opening must be tested as plain narrative in chat before any Thought Board, inner voice, hidden clue, or real-life Mirror is shown.
