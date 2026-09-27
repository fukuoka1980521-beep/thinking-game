# Novelty Stress Test — Scope-Relative Globality

Date: 2026-09-28
Status: critical positioning / no novelty claim

## 1. Strong prior art

### BDI intention reconsideration

Classic BDI work already formalizes the core tradeoff:
- intentions should persist long enough to avoid wasteful constant deliberation;
- but agents must sometimes reconsider intentions when the world or goal relevance changes.

Wooldridge and Schut's work on intention reconsideration explicitly treats when an agent should pause and reconsider an intention under bounded rationality.

Therefore the following are **not novel**:
- "agents should sometimes reconsider goals";
- "reconsideration has a cost";
- "always reconsidering is inefficient";
- "never reconsidering is brittle";
- "top-level goals and subgoals form a hierarchy".

### Goal representation and hierarchy

BDI/agent-programming literature distinguishes:
- top-level goals;
- subgoals produced by plans;
- intention stacks;
- re-planning at current or parent goals.

Therefore "parent goal matters" is not a new conceptual discovery.

### Modern LLM goal drift

Arike et al. (2025) show that long-running language-model agents can drift from assigned goals under competing environmental pressure.

Menon et al. (2026) show inherited goal drift: trajectory context from weaker agents can induce drift even in otherwise robust models.

AgentLAB (2026) studies objective drifting and memory poisoning in adversarial long-horizon settings.

Therefore "LLM agents can drift over long context" is also not novel.

## 2. What remains potentially differentiated

The narrower candidate is:

> **Reassessment-horizon mismatch in a trigger-based LLM harness.**

Operational signature:
1. a local trigger fires;
2. the Gate correctly freezes and reassesses the current task state;
3. the local decision is defensible;
4. the parent project objective is absent from the frozen state;
5. the overall trajectory is still misaligned with the parent frame.

This is not simply "no reconsideration."

It is:

> **reconsideration occurred at the wrong hierarchy level.**

Candidate term:
- Scope-Relative Globality

Mechanism candidate:
- Hierarchical Goal-Frame Drift

## 3. Why the distinction may matter

A system can satisfy a local safety/control invariant while violating a parent objective.

This means evaluation should distinguish:
- **Gate activation quality**
from
- **reassessment horizon adequacy**.

A harness can improve the first without solving the second.

## 4. Relation to modern harness work

LongHorizon-Harness externalizes verified task state and uses manager-executor-auditor separation.

ReAcTree and related systems explicitly decompose goals into hierarchical subgoals.

These approaches support the general value of explicit hierarchy.

The STGR extension is not claiming hierarchical planning as new.

The candidate contribution would be empirical/methodological:
- identify a natural failure where a trigger-based reassessment controller was locally correct but hierarchically under-scoped;
- prospectively compare local-only vs parent-anchored reassessment on naturally occurring transitions;
- measure added overhead and false reanchors.

## 5. Provenance-binding prior art

Provenance-aware memory systems already store:
- origin;
- timestamp;
- evidence pointer;
- entity/event relations.

Therefore "memory should have provenance" is not novel.

The narrower candidate mechanism is:

> **provenance-binding failure**: a supported historical fact is attached to the wrong current entity/environment/version/time referent.

This resembles entity resolution and temporal provenance problems.

Novelty, if any, would require showing that explicit referent tuples materially change agent decisions/claim states in natural long-horizon work.

## 6. Falsification criteria

The new hypothesis should be weakened or abandoned if:

### For RQ-A
- parent anchoring rarely changes decisions;
- changes are mostly unnecessary interruptions;
- explicit current-task goals already capture the parent constraint;
- observed macro drift is better explained by ambiguous user intent alone.

### For RQ-B
- referent binding almost never changes claim state;
- ordinary source verification already catches the same cases;
- errors are better explained by retrieval failure rather than wrong binding.

## 7. Current novelty statement

Allowed:

> We observed a post-publication operational case suggesting that a local trigger-based reassessment controller may remain internally correct while missing higher-level project drift when its frozen state omits the parent reference frame. We are prospectively testing this as a reassessment-horizon hypothesis.

Not allowed:

> We discovered that agents need hierarchical goals.

Not allowed:

> Scope-Relative Globality is a new established failure mode.

## 8. Research value even if novelty fails

Even if prior art fully subsumes the conceptual mechanism, the study can still contribute:
- a concrete LLM software-engineering operationalization;
- a low-overhead trigger policy;
- field evidence about when parent reanchoring helps or hurts;
- integration of goal-hierarchy and provenance binding into practical harness evaluation.

The correct standard is explanatory and empirical value, not terminology novelty.
