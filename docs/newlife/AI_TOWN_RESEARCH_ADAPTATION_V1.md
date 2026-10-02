# NEW LIFE — AI Town / Generative-Agent Research Adaptation V1

Status: research-backed design + bounded implementation plan  
Date: 2026-10-03

## 1. What "AIだけの町" most closely maps to

The closest academic lineage is **Generative Agents: Interactive Simulacra of Human Behavior** (Park et al., UIST 2023 / arXiv:2304.03442), commonly demonstrated as the 25-agent town "Smallville."

Its important contribution is not "many AI characters chat." It is a cognitive/world architecture:

1. **Observation / memory stream** — agents continuously write natural-language experiences.
2. **Retrieval** — memory is selected by a combination of recency, importance, and semantic relevance.
3. **Reflection** — accumulated concrete memories are periodically synthesized into higher-level beliefs/insights and written back into memory.
4. **Planning** — agents create longer-horizon plans and decompose them into actionable steps.
5. **Reaction** — new observations can cause an agent to change the current plan.
6. **Social propagation** — agents can learn information from other agents, and that information can influence later action.

The authors' ablation study reported lower believability when observation, planning, or reflection was removed. The famous Valentine's-party example emerged from one seeded intention spreading through agent-to-agent interaction rather than a fully scripted dialogue tree.

Primary source:
- Park, J. S. et al. (2023), "Generative Agents: Interactive Simulacra of Human Behavior", arXiv:2304.03442.

## 2. AI Town engineering lessons

The open-source **AI Town** project (a16z / Convex), explicitly inspired by Generative Agents, separates:

- **world/game state**: authoritative simulation state;
- **agent state**: agent-specific memory / async cognition;
- **game engine**: processes ordered inputs and advances shared simulation;
- **client UI**: renders state rather than owning truth;
- **agent loop**: mixes rule-based logic with LLM calls; long-running LLM work can execute asynchronously and submit state-changing inputs back through the engine.

This separation is directly relevant to NEW LIFE because the current redesign already insists that:
- AI owns expression/meaning;
- deterministic code owns canonical state/authority.

Primary source:
- a16z-infra/ai-town, README + ARCHITECTURE.md.

## 3. Project Sid / PIANO lessons

**Project Sid** (Altera, 2024; arXiv:2411.00114) extends the question from 25 believable agents to 10–1000+ agents and "AI civilization" benchmarks.

Two architecture ideas matter here:

### 3.1 Concurrency
Slow cognition (reflection, long-horizon planning) should not block immediate interaction. The paper argues agents should be able to think and act concurrently.

### 3.2 Information bottleneck / coherent controller
Multiple information streams should not independently emit contradictory actions. A central decision process selects/coheres information and broadcasts a high-level decision to downstream action/talk modules.

Project Sid reports emergent specialization, collective-rule adherence/amendment, and cultural transmission in Minecraft-based simulations. These are research results in that environment; they are **not** evidence that NEW LIFE should dynamically rewrite all character identities.

Primary source:
- Altera.AL et al. (2024), "Project Sid: Many-agent simulations toward AI civilization", arXiv:2411.00114.

## 4. OASIS lesson

**OASIS** (2024; arXiv:2411.11581) demonstrates that LLM-agent social simulation can scale to very large populations when environment/action/network mechanics are explicit and separable. Its strongest relevance to NEW LIFE is architectural, not numerical: social environment state and agent cognition should be distinct layers.

NEW LIFE has six core NPCs, so million-agent scaling is not a current product requirement.

## 5. What NEW LIFE should adopt now

### Adopt A — durable per-NPC memory stream

Each NPC needs memories that survive scene/day transcript resets.

Memory records should preserve:
- owner NPC;
- day;
- memory kind: observation / reflection / plan;
- natural-language content;
- importance;
- creation/access sequence;
- provenance.

This directly addresses the current weakness where the browser keeps only a short rolling transcript.

### Adopt B — three-factor retrieval

For each new player utterance, retrieve a compact memory subset by:

`score = recency + importance + relevance`

Smallville used:
- recency decay;
- LLM-rated importance;
- embedding cosine relevance.

NEW LIFE V1 will preserve the same **three-factor contract** while using a deterministic local relevance approximation first, so no extra embedding service or latency is introduced into the human-play gate. The interface must allow semantic-vector relevance to replace the local approximation later without changing callers.

This is an adaptation, not a claim of exact reproduction.

### Adopt C — reflection without blocking dialogue

Reflection should be slower/background cognition:
- trigger only after enough salient memory has accumulated;
- synthesize a small number of higher-level insights;
- write those insights back into the same NPC memory stream;
- never directly mutate canonical game state.

This follows Smallville's reflection loop plus Project Sid's concurrency principle.

### Adopt D — scene focus as a short-horizon plan / decision anchor

NEW LIFE's current `sceneFocus { issue, decision, authority }` already performs part of the planning/bottleneck function:
- what is currently wrong;
- what needs deciding;
- who has authority.

Do **not** replace this with a fully free-running plan generator yet. The authored 30-day arc still supplies world pressure and timing.

### Adopt E — one coherent response bottleneck

Before an NPC speaks, combine:
1. character canon;
2. current scene focus;
3. canonical world state;
4. relevant durable memories;
5. recent dialogue;
6. player meaning.

Then generate **one** coherent NPC reply/proposal. State changes still go through the deterministic authority gate.

This is the NEW LIFE analogue of Project Sid's bottlenecked controller.

## 6. What not to copy yet

Do not copy these merely because the papers demonstrate them:

- 25/1000 agents;
- dynamic profession mutation for the six canonical characters;
- taxation/religion/governance systems;
- fully autonomous open-world movement;
- embedding infrastructure before human evidence shows retrieval quality is the blocker;
- autonomous world-state mutation by LLM output.

These would add scale/novelty before proving the current product experience.

## 7. Target runtime pipeline

```
WORLD / PLAYER EVENT
        |
        v
per-NPC MEMORY WRITE
(observation, importance, provenance)
        |
        +------> background REFLECTION when salience threshold is reached
        |              |
        |              v
        |        reflection written back to memory
        |
        v
RETRIEVE for current turn
(recency + importance + relevance)
        |
        v
CONTEXT BOTTLENECK
persona + sceneFocus + canonical state
+ retrieved durable memories
+ recent dialogue + player meaning
        |
        v
CHAT MODEL
npcLine + semantic proposals
        |
        v
TRUTH / AUTHORITY GATE
        |
        v
canonical state mutation
```

## 8. Validation criteria

This adaptation only counts as useful if human play improves.

Required tests:
- NPC remembers a material Day N fact after transcript reset on Day N+1.
- NPC does not surface irrelevant old memories merely because they are old/high-importance.
- reflection never invents a new consent/commitment/world fact.
- the same memory does not become "truer" merely through repeated retrieval.
- a genuine topic change is still allowed.
- dialogue latency does not wait for background reflection.
- deterministic state/authority remains the only path to canonical mutation.

## 9. Research boundary

The cited research supports memory/reflection/planning/concurrency and multi-agent social dynamics in their tested environments. It does **not** establish that copying those architectures will automatically make NEW LIFE fun, natural, or commercially successful.

The product decision is therefore:
**import the mechanisms that directly address observed NEW LIFE failures, then verify them through owner/human play before adding scale.**
