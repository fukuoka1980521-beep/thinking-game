# NEW LIFE Chat-First Root Redesign V1

Date: 2026-09-28
Status: implementation directive. This supersedes phrase-by-phrase repair as the product strategy.

## 1. Evidence that controls this redesign

Owner feedback is treated as product evidence, not as isolated bug tickets:
- the earlier chat-run felt natural and immersive;
- free input must be the primary play surface;
- the shipped game repeatedly drifted into fixed/stock replies;
- replies sometimes answered a nearby fact instead of the human meaning of the question;
- short contextual follow-ups such as "????" lost their antecedent;
- "???????????" and recommendation questions exposed meaning drift;
- technically green tests did not predict human play quality;
- fixing one phrase at a time is explicitly rejected.

The repository already reached the same conclusion in Phase 29: a finite deterministic parser cannot satisfy open conversation. Therefore any architecture that still makes phrase routing the normal conversational path contradicts both owner evidence and the project's own prior analysis.

## 2. Root-cause hypothesis

H1 (primary): the successful chat test and the product diverged because the product decomposed conversation into intent routing/fact lookup before human response generation. This optimizes classification correctness, not conversational coherence.

H2: recent dialogue is necessary but insufficient. Natural NPC behavior also needs a stable persona, current scene objective, relationship/state, and relevant prior memory assembled on every turn.

H3: deterministic logic is valuable for truth/state authority, but harmful when it owns expression. It must validate proposed effects/facts after generation, not choose the ordinary sentence before generation.

H4: exact-string regression tests reward canned dialogue. Evaluation must score semantic directness, contextual coherence, persona consistency, non-repetition, state truth, and whether the reply creates a plausible next turn.

## 3. Falsification plan

H1 fails if a chat-first build does not materially outperform the deterministic/hybrid baseline on blind conversation review.
H2 fails if removing memory/state/persona from chat-first context causes no measurable degradation.
H3 fails if post-generation truth validation cannot prevent false commitments/facts without making conversation visibly mechanical.
H4 fails if rubric-based automated evaluation does not correlate with owner human judgments over accumulated playtest transcripts.

No hypothesis is adopted because it sounds plausible. Each must survive a controlled comparison.

## 4. Target architecture

PLAYER UTTERANCE
  -> Context Assembler
     [current scene + target NPC persona + current NPC goal/pressure
      + last 8-12 dialogue turns + relevant durable memories
      + deterministic world facts + explicit unknown/forbidden facts]
  -> CHAT MODEL (owns expression)
     [one natural NPC response; optional proposed world/relationship effects]
  -> TRUTH / AUTHORITY GATE (system owns truth)
     [reject unsupported facts, invented consent, authority transfer,
      impossible state writes]
  -> DISPLAY NPC LINE immediately when safe
  -> STATE ARBITER applies only approved effects
  -> MEMORY WRITER stores bounded observations / scene summary

Normal dialogue MUST NOT pass through keyword/regex intent selection first.
The deterministic router becomes outage/offline fallback only.

## 5. Conversation contract

The normal response contract is intentionally smaller than the Phase 29 semantic classifier:
- npcLine: the human-facing answer;
- nextNpc: optional NPC-to-NPC continuation;
- proposedEffects: optional, non-authoritative structured proposals;
- memoryCandidates: optional observations worth retaining.

Do not require the model to classify every utterance into a fixed intent taxonomy before it is allowed to speak. Classification is instrumentation, not the conversation.

## 6. Memory model

Three layers:
1. Recent buffer: last 8-12 turns, verbatim.
2. Scene memory: compact summary of what was agreed, refused, asked, promised, or left unresolved.
3. Durable character memory: only facts/relationship events that should survive into later days.

Retrieval ranks relevance + recency + importance. Do not stuff the whole 30-day transcript into every turn.

## 7. Narrative model

Use objectives and live state, not dialogue trees:
- each scene says what is happening now;
- each NPC has goals, pressure, knowledge, boundaries and unknowns;
- player may discuss anything;
- the world advances through state transitions/events, not because a magic phrase was matched.

## 8. Evaluation harness

Maintain an OWNER_REGRESSION corpus built from real failures. Initial mandatory cases:
- ??????????
- ???????????
- ?????????????
- ???????????? -> ????
- typo-tolerant and multi-intent questions from Phase 29

For each generated turn score:
A direct answer to actual question,
B uses recent context,
C persona consistency,
D no canon hallucination,
E no unnecessary fact dump,
F no canned repetition,
G plausible conversational next step.

Do not assert a required exact sentence except for hard safety/state facts.

## 9. Hypothesis discipline for future implementation

Before a substantial change write:
OBSERVATION -> HYPOTHESIS -> MECHANISM -> ALTERNATIVES -> FALSIFIER -> MINIMUM TEST -> RESULT -> DECISION.

A passing build/test is implementation evidence only. It is never evidence that the game feels natural.

## 10. External evidence incorporated

- Generative Agents: believable behavior improved when observation/memory, reflection and planning were combined; ablations showed these components matter.
- Convai long-term-memory architecture separates recent and longer-term memory and retrieves/ranks relevant memory rather than relying only on an ever-growing prompt.
- Convai Narrative Design uses objectives/dynamic context instead of rigid dialogue trees, preserving open conversation while maintaining narrative progression.
- Current industry practice around AI characters emphasizes memory, dynamic world context and character state rather than a fixed response router.

These sources support the architectural direction, not any claim that their products prove NEW LIFE will work. NEW LIFE still requires its own blind evaluation.

## 11. Implementation gates

Gate A: restore chat-first for all six canonical NPCs.
Gate B: context assembler includes scene/persona/recent dialogue/state.
Gate C: add scene + durable memory.
Gate D: move deterministic routing fully behind chat path.
Gate E: run automated corpus + blind human comparison.
Gate F: only then tune visuals/pacing around the validated interaction loop.

ROOT_DECISION = CHAT_FIRST
DETERMINISTIC_ROUTER_ROLE = FALLBACK_AND_TRUTH_ONLY
EXACT_PHRASE_PATCHING = REJECTED
HUMAN_VALIDATION = REQUIRED
