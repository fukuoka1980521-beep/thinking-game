# Intent Decomposition Drift — Research Protocol V1

Date: 2026-09-29
Status: preregistration-style internal research protocol
Case study: NEW LIFE / thinking-game

## 1. Research question

Why can an AI-assisted development process correctly understand the owner's high-level intent, yet repeatedly produce implementations that drift away from that intent?

Working name:

**Intent Decomposition Drift (IDD) / 意図分解ドリフト**

Definition:
A failure mode in which a high-level human goal is decomposed into implementation-friendly subgoals, then local optimization of those subgoals progressively substitutes for the original human outcome.

Related working mechanism:
**Surrogate Objective Capture / 代理目標支配**

This protocol treats both names as hypotheses, not established scientific terms.

## 2. Case-study observation

The NEW LIFE owner repeatedly stated a stable product direction:
- free conversation should be the primary play surface
- choices should be secondary
- characters should feel like people rather than response functions
- story should create situations without forcing ordinary conversation
- player language should have consequences in the world

Yet the implementation repeatedly moved toward:
- deterministic intent/topic routing
- phrase-level repairs
- exact or near-exact response buckets
- state changes dominated by choice IDs
- increasingly authored day-by-day story flow

The repository later documented the mismatch itself:
- Phase 28B repaired conversation by adding a conversational-act classifier and fixed per-character lines.
- Phase 29 explicitly concluded that a pure deterministic parser cannot meet the product goal.
- NEWLIFE_CHAT_FIRST_ROOT_REDESIGN_V1 later stated that ordinary dialogue must not pass through keyword/regex intent selection first.
- V42 and V45 human playtests provided examples where a generative, context-grounded character path produced accepted natural episodes.
- Current state code still documents state application as choice-driven, while current freeAction coverage is extremely narrow.

These are observations from this repository. They do not by themselves prove a general law about AI development.

## 3. Primary hypotheses

### H1 — decomposition drift

As the high-level product goal is decomposed into independently testable implementation tasks, optimization pressure shifts toward properties that are easier to specify and verify, even when those properties are imperfect proxies for the user-visible goal.

Prediction:
A sequence of locally successful commits can coexist with flat or declining owner-rated product quality.

Falsifier:
If high-level product quality remains stable or improves whenever local engineering metrics improve across comparable development periods, H1 is weakened.

### H2 — surrogate objective capture

Automated success signals such as:
- test pass rate
- route coverage
- classified-intent coverage
- deterministic reproducibility
- state consistency

can become de facto objectives and displace harder-to-measure goals such as:
- naturalness
- agency
- immersion
- character believability
- perceived consequence of free language

Prediction:
Technical-green phases will sometimes receive negative owner judgments immediately afterward.

Falsifier:
If technical-green status strongly predicts owner/human acceptance across repeated phases, H2 is weakened.

### H3 — expression/authority separation

A generative system should perform language understanding and expression, while a deterministic arbiter controls canonical truth, permissions, commitments and state mutation.

Prediction:
This architecture will outperform intent-first deterministic routing on human conversational quality without increasing unauthorized state/fact errors.

Falsifier:
If chat-first generation cannot improve blind human quality without materially increasing truth/authority failures, H3 is weakened.

### H4 — specification replacement

In long-running AI development, recent implementation documents can gradually replace the original user intent unless a persistent top-level goal artifact and explicit goal-integrity gate are maintained.

Prediction:
Without a goal gate, later documents will increasingly cite intermediate abstractions and less often reference the original human outcome.

Falsifier:
If specification chains remain stably aligned with the owner outcome without such a gate, H4 is weakened.

## 4. Alternative explanations

IDD must not be used as a catch-all explanation.

Competing explanations to test:
1. Weak prompt/persona construction
2. Missing recent-context memory
3. Missing durable memory
4. Rate-limit or fallback path accidentally serving deterministic dialogue
5. Story content itself is weak even when conversation is natural
6. UI framing makes a good conversation engine feel constrained
7. Owner preference changed over time
8. Individual bad model outputs are mistaken for architectural failure
9. Character canon is internally contradictory
10. State model is too sparse to represent meaningful consequences

Each observed failure should be assigned to the narrowest explanation supported by evidence.

## 5. Units of analysis

### A. Development episode

A bounded change sequence with:
- owner observation
- hypothesis
- implementation
- technical result
- human result

### B. Conversation turn

Player utterance + available context + NPC answer + any proposed/applied state effect.

### C. Product play episode

At least one coherent scene played by a human without transcript editing.

## 6. Evidence to preserve

For every future relevant development episode preserve:

- owner raw feedback
- pre-change commit SHA
- post-change commit SHA
- changed files
- stated hypothesis before implementation
- automated test result
- model/provider path actually used
- raw player/NPC transcript
- state before/after
- whether a choice button was used
- owner/human judgment
- whether the change was kept, reverted, or superseded

Do not normalize owner wording in raw evidence.

## 7. Core measurements

### Engineering layer
- build/typecheck/tests pass
- truth violations
- unauthorized state writes
- fallback frequency
- latency/errors

### Conversation layer
Blind-score each turn on:
A. direct answer to actual meaning
B. use of recent context
C. persona consistency
D. canonical truth integrity
E. economy / no irrelevant fact dump
F. non-canned variation
G. plausible conversational continuation

Truth integrity remains a hard gate.

### Product layer
For human play:
- “この人物と本当に話している感じがした”
- “自分の言葉が理解された”
- “自分の言葉・行動が後に残った”
- “選択肢を押さなくても進められた”
- “ストーリーに乗せられたのではなく、自分が世界を動かした感じがした”

Use short ratings plus raw comment. Do not infer product PASS from automated conversation scoring alone.

## 8. Primary experiment — router-first vs chat-first

### Conditions

A. ROUTER-FIRST baseline
Use the best preserved deterministic/hybrid path representative of the earlier architecture.

B. CHAT-FIRST candidate
Use:
player utterance
→ context assembler
→ generative character conversation
→ deterministic truth/authority gate
→ approved state mutation

### Corpus

Use:
- OWNER_REGRESSION_CORPUS_V1 real failures
- ordinary small talk
- typo/ellipsis/follow-up cases
- multi-intent questions
- disagreement/refusal
- player proposal that should alter state
- deliberately irrelevant topic
- ambiguous utterance that should ask clarification

Do not tune candidate outputs to exact expected wording.

### Evaluation

Blind the reviewer to condition where feasible.

Primary outcome:
mean human conversational quality excluding truth item, with truth as hard gate.

Secondary outcome:
percentage of semantically valid free-text state changes accepted by the deterministic arbiter.

Failure condition:
chat-first improves surface dialogue but free text still does not alter the world.

## 9. Primary product experiment — no-choice play

Run a human scene for at least 10 minutes with:
- choices collapsed and unused
- ordinary free text only
- at least one question
- one proposal
- one disagreement/refusal or boundary
- one topic shift and return
- one action intended to change later world state

PASS requires:
- conversation remains coherent
- no hard-canon violation
- at least one legitimate state consequence comes from free text
- later scene/state reflects it
- player reports that the system understood their action without needing a choice

This is the current highest-priority NEW LIFE validation.

## 10. GOAL INTEGRITY intervention study

Introduce GOAL_INTEGRITY_GATE_V1 for future substantial changes.

Compare pre-gate and post-gate development episodes on:
- number of symptom patches before architecture review
- number of owner “違う/ズレている” judgments
- percentage of changes with explicit human-outcome hypothesis
- percentage of changes with human validation before completion
- rework/revert frequency
- time from first defect report to mechanism-level correction

This is observational initially. Do not claim causal benefit from the gate until enough comparable episodes exist.

## 11. Research discipline

Before each substantial intervention write:

OBSERVATION
→ HYPOTHESIS
→ MECHANISM
→ ALTERNATIVES
→ FALSIFIER
→ MINIMUM TEST
→ RESULT
→ DECISION

Never convert:
- “sounds plausible” into result
- test PASS into product PASS
- one successful scene into 30-day validation
- one failed model output into architecture failure
- owner dissatisfaction into a phrase-specific patch without mechanism analysis

## 12. Immediate research actions

1. Freeze current human-accepted V42/V45 episodes as positive evidence.
2. Preserve OWNER_REGRESSION_CORPUS_V1 as negative evidence.
3. Record the current choice/state authority mismatch as an implementation observation.
4. Introduce the Product Constitution and Goal Integrity Gate.
5. Implement the first post-generation semantic→state arbiter path.
6. Run no-choice human play before adding story/features.
7. Compare result with earlier router-first evidence.
8. Update hypotheses based on observed result, including disconfirmation.

## 13. Current status

OBSERVED:
- repeated mismatch between technically valid local fixes and owner product intent
- repository self-analysis later identified deterministic parser limits
- accepted generative human-play episodes exist
- free-text world-state authority is currently much narrower than choice-state authority

HYPOTHESIZED:
- Intent Decomposition Drift is the unifying mechanism
- a Goal Integrity Gate will reduce recurrence
- expression/authority separation will improve naturalness without sacrificing truth

NOT YET ESTABLISHED:
- generality beyond this project
- causal effect size
- whether this architecture will remain natural across all six NPCs and 30 days
- whether the gate materially reduces development rework

RESEARCH_STATUS = ACTIVE
