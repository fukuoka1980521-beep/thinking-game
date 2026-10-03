# NEW LIFE — Response Construction Kernel V1

Date: 2026-10-03  
Status: architecture correction derived from owner play evidence

## Problem statement

The recurring failures were not independent bad sentences.

Observed examples included:
- an ordinary question being answered too cryptically;
- a sensible proposal being converted back into generic "担当/確認/線引き" language;
- two nearby objects (chair repair and baked-goods pickup) being falsely merged;
- a character defending the current procedure instead of evaluating a simpler alternative;
- correct memory retrieval still losing the concrete issue during reply generation.

The common failure is:

**one model call was being asked to understand, resolve references, evaluate causality/authority, decide what to do, preserve character, and phrase the final line at the same time.**

That single-pass design made important semantic obligations optional. The schema even required only `npcLine`; meaning metadata could disappear while the request still counted as usable.

## Root-cause model

### RC1 — Semantic / expression collapse

Understanding and wording happened in one generation step.

When persona, scene, memory, state, and the newest utterance competed for attention, the model could produce a fluent line before fully preserving:
- the actual player meaning;
- the concrete referent;
- the unresolved decision;
- authority;
- burden/cost;
- a newly proposed alternative.

Fluency could therefore hide incomplete reasoning.

### RC2 — Flat context competition

The prompt presented large character material, scene facts, memory, state and instructions together.

The model had no mandatory intermediate representation saying:
"these are the exact semantic elements that must survive into the reply."

### RC3 — SceneFocus solution anchoring

`sceneFocus.decision` was useful as a description of what was unresolved, but the model could treat it like the required solution path.

That produced procedural stubbornness:
even when the player proposed removing the cafe dependency entirely, the NPC could keep insisting on defining cafe-seat conditions.

### RC4 — Co-occurrence binding

When several nouns appeared close together, the model could create an unsupported causal link.

Day 4 exposed this:
- chair = repair object;
- baked goods = trial-sale goods;
- workshop = candidate pickup location.

Because these appeared in the same scene, the model invented "chair sales / chair pickup."

### RC5 — Persona-prior leakage

Character traits and voice examples sometimes became evidence for world facts or off-screen continuity.

A personality prior is not episodic evidence.

### RC6 — Ontology coupling

The old generic conversational-act taxonomy was being asked to classify 30-day natural conversation even when those labels were irrelevant to the product response.

This added a second optimization target that could distract from the actual human meaning.

## Corrected architecture

```
PLAYER / NPC INPUT
        |
        v
CANONICAL CONTEXT ASSEMBLY
(scene facts + sceneFocus + current canonical facts
 + recent dialogue + relevant durable memory + NPC knowledge/boundary)
        |
        v
SEMANTIC RESPONSE PLAN
(no character wording)
- mode
- player meaning
- direct semantic answer
- active referents
- current issue
- unresolved decision
- authority owner
- burden owner
- player proposal
- proposal disposition
- required content
- unknowns
- state/effect proposals
        |
        v
CHARACTER RENDER
(plan is a meaning contract)
- persona/voice
- 1–3 natural sentences
- no new facts / no new reasoning
        |
        v
TRUTH / AUTHORITY GATE
        |
        v
CANONICAL STATE + DURABLE MEMORY
```

## Why this is not a new intent router

The plan is not a fixed list of user intents and does not choose a canned answer.

It is a transient structured representation of the reasoning obligations for this turn.

The model still:
- understands free language;
- evaluates a new proposal;
- handles arbitrary referents;
- chooses a conversational move;
- produces natural wording.

Deterministic code still does not author ordinary dialogue.

## Planner rules

The semantic planner must:

1. answer the literal user question first;
2. bind each important noun/pronoun to the correct object/person/task;
3. distinguish co-present but unrelated objects;
4. state the actual unresolved decision;
5. state who owns the relevant authority;
6. identify who bears a proposed burden;
7. treat `sceneFocus` as an unresolved question, not the mandatory answer;
8. evaluate a player alternative on its merits;
9. preserve unknowns rather than inventing facts;
10. propose state effects only as non-authoritative candidates.

## Renderer rules

The renderer does not re-solve the situation.

It receives the plan and the NPC dossier and must:
- preserve `directAnswer`;
- preserve concrete `requiredContent`;
- apply the NPC's voice and social style;
- avoid introducing new facts or causal claims;
- avoid forcing scene problems into genuine casual topic shifts.

Character individuality may alter **how** the answer is said, not **what facts or logic become true**.

## Ontology decision

For NEW LIFE 30-day conversation, the old action/boundary taxonomy is no longer part of semantic planning.

After the plan is complete, the server synthesizes only conservative compatibility metadata:
- CLARIFY/UNKNOWN when the plan is genuinely unclear;
- otherwise OBSERVE/NOT_RELEVANT.

Actual canonical state effects remain closed, explicit world-effect proposals behind the authority gate.

This removes the earlier ontology-coupling failure without weakening state safety.

## Validation strategy

Do not validate this kernel with exact expected sentences.

Replay owner failures and unseen paraphrases, and inspect:

- Did the semantic plan identify the same practical meaning?
- Are referents correctly separated?
- Is the direct answer logically responsive?
- Is a new proposal actually evaluated?
- Are authority and burden assigned correctly?
- Does the rendered line preserve the plan?
- Are unsupported facts absent?
- Does a casual question stay casual?

A single exact wording is not the target.

## Falsifier

This architecture is insufficient if:
- the plan itself repeatedly misunderstands ordinary player meaning;
- the renderer repeatedly contradicts or drops a correct plan;
- latency makes normal play unusable;
- owner play still shows the same semantic failures despite correct plans.

If the plan is correct but rendering fails, fix the render boundary.
If the plan is wrong, fix context/planning.
Do not patch the final sentence.

## Current decision

**RESPONSE_ROOT = PLAN_THEN_RENDER**

The corrective principle is:

> Do not repair the sentence first. Make the system explicitly preserve the reasoning elements that the sentence must express.
