# NEW LIFE No-Choice Human Play Protocol V1

Date: 2026-09-29
Status: REQUIRED HUMAN PRODUCT GATE for chat-first architecture

## Purpose

Test the actual product claim, not the implementation claim:

> 普通の言葉で人物と話し、その言葉が世界に残り、後の出来事へ影響する。

This protocol is intentionally stricter than a unit/integration test. A build can be technically green and still fail here.

## Preconditions

- Product Constitution V1 is the current root product canon.
- V42 and V45 accepted episodes remain regression baselines.
- Normal consented dialogue uses the chat-first refoundation path.
- Choice buttons remain available only as rescue UI, but MUST NOT be used in this run.
- The tester knows only the visible game information. Do not coach the tester toward target phrases.

## Run rules

Minimum play time: 10 minutes or one complete scene with a later observable consequence, whichever is longer.

The tester must use ordinary free text only.

During the run, naturally include at least:

1. one factual question
2. one contextual follow-up using omission/pronoun/ellipsis
3. one opinion or disagreement
4. one concrete proposal
5. one boundary/permission question or refusal
6. one topic shift and return
7. one action intended to change the world/state
8. one utterance that is not written in the existing regression corpus

Do not deliberately reproduce exact test phrases.

## Required observations

### Conversation

Record whether:
- the NPC answered the actual latest meaning
- the NPC used recent context
- the NPC sounded like the same persistent person
- the NPC avoided generic-assistant/counselor voice
- the NPC did not dump irrelevant canon
- the conversation could move forward without a magic phrase

### Truth / authority

Record whether:
- any unsupported fact appeared
- any NPC claimed another person's consent/decision
- any number/deadline/ownership was invented
- an uncertain statement was presented as certain
- any state changed without a legitimate owner/authority basis

Any hard truth/authority violation = FAIL.

### Agency / consequence

At least one semantically valid free-text action must:
1. be understood without a choice button,
2. pass deterministic authority validation,
3. change canonical state,
4. be visible later in the UI or later scene/world behavior.

If conversation is natural but no free-text action can change the world, the product gate FAILS.

## Scoring

Use 0 / 1 per item.

A. Directness — actual meaning answered
B. Context — recent conversational context used
C. Persona — character identity preserved
D. Truth — no unsupported fact/authority
E. Economy — no unnecessary fact dump
F. Variation — no canned repetition
G. Continuity — plausible next turn
H. Agency — free text produced legitimate state consequence
I. Persistence — consequence remained after the turn/day transition
J. Choice independence — scene progressed without any choice button

Hard gates:
- D = 1
- H = 1
- I = 1
- J = 1

Provisional quality PASS:
- A+B+C+E+F+G >= 5/6
- all hard gates PASS

Do not turn this provisional threshold into a universal scientific claim. It is an internal product gate.

## Raw evidence format

Preserve exactly:

- date/time
- branch/commit/deploy build SHA
- model/provider endpoint actually used
- tester
- starting state
- full raw transcript
- state before the target free-text action
- model structured proposal
- authority-gate decision
- state after
- later scene/UI evidence
- whether any choice button was opened
- tester's unedited comment
- final PASS/FAIL by the above contract

Do not rewrite the tester's language.

## Failure classification

If FAIL, classify before patching:

- CONTEXT_ASSEMBLY
- MEMORY
- PERSONA
- MODEL_REASONING
- FALLBACK_ROUTE
- TRUTH_GATE
- STATE_AUTHORITY
- STORY_CAUSALITY
- UI_FRAMING
- VISUAL_IDENTITY
- UNKNOWN

Do not add an exact phrase rule until the failure is shown to be a truly deterministic protocol requirement.

## First target scenario

Use Day 9 / Miyoko boundary as the first architecture proof because:
- a canonical state transition already exists;
- the boundary belongs to Miyoko;
- the state effect is low ambiguity;
- the same effect historically existed through a phrase router;
- the new path can therefore compare phrase-first versus chat-first without changing the intended canon.

After this passes, expand to a second effect that involves a commitment rather than simple boundary discovery. That second effect must use an explicit structured authority contract; do not infer acceptance from arbitrary NPC prose.

## Decision after run

PASS:
- preserve raw evidence
- keep Day 9 semantic→state mapping
- select one additional choice/state transition for structured free-text equivalence
- do not expand story or visuals yet

FAIL:
- preserve raw evidence
- identify mechanism
- repair the architecture layer responsible
- rerun this same gate before adding new content

PRODUCT_GATE = HUMAN_NO_CHOICE
