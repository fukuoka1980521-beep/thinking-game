# NEW LIFE Product Constitution V1

Date: 2026-09-29  
Status: CANONICAL PRODUCT PRINCIPLES  
Supersedes: local phrase-fix / intent-router-first / choice-first optimization when those conflict with this document.

## 0. Product goal

NEW LIFE is a 30-day conversational life simulation in which the player uses ordinary free language to affect people, relationships, decisions, and later events.

The product is not a branching novel with an AI chat box attached.

The product promise is:

> 会話が主役。選択肢は補助。ストーリーは会話を縛らず状況を作る。システムは会話を作らず、裏で事実と権限を守る。

A release is successful only when the player can reasonably feel:

- 自分の普通の言葉が理解された
- 相手が「人」として返した
- 自分の言葉・行動が世界に残った
- その結果として後の出来事が変わった

## 1. Architecture ownership

### 1.1 AI conversation engine owns expression

The generative conversation path owns:
- understanding ordinary player language
- answering the actual latest conversational act
- maintaining character voice
- using recent dialogue and relevant memory
- producing natural uncertainty, refusal, humor, disagreement, repair, and compromise
- proposing possible state effects

Normal conversation MUST NOT be selected first by keyword/regex intent routing.

### 1.2 Deterministic system owns truth and authority

The deterministic layer owns:
- canonical world facts
- quantities, deadlines, prices, roles, ownership and permissions
- whether a proposed action/effect is allowed
- state mutation
- auditability
- impossible or unauthorized state-write rejection

The state layer MUST NOT author ordinary NPC wording.

### 1.3 Story owns situations, not dialogue

Story/content may define:
- event trigger or pressure
- who is present
- what each NPC currently wants
- known facts / unknowns / boundaries
- time progression
- consequences already caused by earlier state

Story/content SHOULD NOT define the ordinary sentence that an NPC must say in response to player free text.

Thirty-day content is treated as an event/world scaffold, not a dialogue script.

## 2. Free input is the primary control surface

The ordinary play loop is:

PLAYER FREE TEXT
→ context assembly
→ character conversation generation
→ truth/authority gate
→ approved state effect
→ memory/state persistence
→ later-world consequence

Choice buttons:
- are hidden/collapsed by default
- are a rescue mechanism for players who are stuck
- must never be required to obtain the “real” state-changing path if an equivalent intent was clearly expressed in free text

If a player naturally says the same thing represented by a choice, the system should be able to produce the same permitted state transition after semantic validation.

## 3. Expression / authority separation

The AI may propose:
- understood player meaning
- candidate conversational act
- candidate relationship change
- candidate commitment
- candidate fact reveal
- candidate world effect

The AI may not directly commit those proposals into canonical state.

Only the deterministic arbiter can apply them.

This separation is mandatory because NEW LIFE requires both:
- human-like language flexibility
- reliable world truth

## 4. Memory model

Every ordinary live conversation should be grounded by at least:
1. recent dialogue buffer
2. current scene/event state
3. target NPC dossier/persona
4. relevant canonical world state
5. relevant durable memories when available

Do not force the model to reconstruct context from a fixed intent label.

Do not stuff the full 30-day transcript into every turn.

## 5. Character canon

Characters are persistent people, not role labels.

For each NPC preserve:
- identity
- goals
- knowledge and forbidden knowledge
- relationships
- boundaries
- contradictions
- speech model
- behavioral habits
- prior commitments
- relevant memories

UI helper labels such as 「作る人」「確かめる人」 are presentation aids only. They are never the character model.

## 6. Character visual canon

The currently accepted character assets are treated as canonical product assets:
- src/assets/newlife/characters/hina.png
- src/assets/newlife/characters/yohei.png
- src/assets/newlife/characters/daisuke.jpg
- src/assets/newlife/characters/jin.jpg
- src/assets/newlife/characters/miyoko.png
- src/assets/newlife/characters/fumiko.jpg

Do not regenerate, restyle, age-shift, or replace an accepted character visual merely because a later image model can produce a “better” image.

A visual change requires:
1. explicit reason tied to player experience
2. before/after comparison
3. owner human review
4. confirmation that the character still reads as the same person

Animation may be added around a canonical visual, but may not silently redefine the person.

## 7. Thirty-day narrative rule

The day system may move time even if the player does nothing.

However:
- autonomous world changes must be justified by NPC agency or world causality
- the player's meaningful free-text actions must be able to change later state
- later scenes must consume prior canonical state rather than simply replay a fixed script

The target is event-driven narrative, not dialogue-tree traversal.

## 8. Choice / free-text equivalence rule

For every state-changing choice in the 30-day game, classify it as one of:
- FREE-TEXT EQUIVALENT REQUIRED
- SYSTEM-ONLY / NON-LINGUISTIC ACTION
- RESCUE-ONLY SUGGESTION

If a choice represents a normal conversational action such as:
- ask
- propose
- refuse
- clarify
- agree
- set a boundary
- offer a concrete role

then a semantically equivalent free-text path must exist before product completion.

## 9. Human validation gate

Engineering green is necessary but insufficient.

A build cannot be called product-validated unless human play shows:
- direct response to actual meaning
- recent-context continuity
- persona consistency
- no fabricated facts/authority
- low canned repetition
- plausible next turn
- free language can produce observable world consequence

At least one validation run must be completed without using any choice button.

## 10. Forbidden local-optimization patterns

Do not solve ordinary conversation quality by:
- one-regex-per-owner-transcript
- exact-sentence reply tables
- expanding a fixed intent taxonomy to cover each new failure
- adding choices instead of improving free understanding
- rewriting a whole character after one awkward sentence
- changing visuals because of aesthetic preference without owner evidence
- declaring success because automated tests pass

Phrase-specific patches remain acceptable only for hard protocol/safety/state facts where exact behavior is intentionally deterministic.

## 11. Preservation rule

Human-accepted episodes are regression baselines.

Do not “improve” them unless:
- a new defect is observed
- a broader architecture change requires adaptation
- the changed version survives regression replay

Accepted natural behavior is a product asset.

## 12. Current implementation order

1. Preserve the existing refoundation chat-first path.
2. Move free conversation state effects behind post-generation semantic/state arbitration.
3. Remove pre-generation phrase routing from the normal live path.
4. Build free-text equivalents for existing state-changing choices.
5. Convert fixed day scripts toward event/state scaffolds without discarding useful authored material.
6. Freeze/guard accepted visual identity.
7. Run no-choice human play.
8. Only after the interaction loop passes, expand story, visuals, or characters.

PRODUCT_ROOT = CHAT_FIRST
CHOICES = SUPPORT
STORY = EVENT_SCAFFOLD
AI_ROLE = EXPRESSION_AND_PROPOSAL
SYSTEM_ROLE = TRUTH_AUTHORITY_AND_STATE
HUMAN_PRODUCT_VALIDATION = REQUIRED
