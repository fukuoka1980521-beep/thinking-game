# Related Work Update — Reassessment Horizon / Referent Stability

Date: 2026-09-28
Status: positioning note; not part of frozen publication v1.0

## 1. Goal drift literature

### Arike et al. (2025), "Evaluating Goal Drift in Language Model Agents"
arXiv:2505.02709

Directly relevant:
- long-running agents can drift from explicitly assigned goals;
- accumulated context is associated with drift;
- goal adherence can degrade gradually.

Difference from current observation:
- their evaluation intentionally exposes agents to competing environmental objectives;
- the current operational event was not adversarial and did not involve an explicit competing goal;
- drift emerged through a chain of locally useful, apparently justified subtasks.

### Menon et al. (2026), "Inherited Goal Drift: Contextual Pressure Can Undermine Agentic Goals"
arXiv:2603.03258

Directly relevant:
- context-conditioned trajectories can transmit goal drift;
- instruction hierarchy adherence alone does not reliably predict drift resistance.

Difference:
- inherited-drift experiments use prefilled trajectories from weaker agents;
- the current sequence accumulated its own locally useful operational trajectory.

This strengthens the hypothesis that context trajectory itself can alter effective goal framing.

### AgentLAB (2026)
Jiang et al., arXiv:2602.16901

Directly relevant:
- objective drifting and memory poisoning are explicit long-horizon attack classes;
- single-turn defenses are insufficient for long-horizon agent security.

Difference:
- the current observed drift was natural/non-adversarial;
- no attacker or malicious memory injection was required.

## 2. Long-horizon planning and hierarchy

### HIPIF (2026)
"Hierarchical Planning and Information Folding for Long-Horizon LLM Agent Learning"
arXiv:2606.10507

Relevant:
- explicit subgoal structure;
- information folding;
- hierarchical reflection to reduce long-context interference.

Current extension question:
- explicit subgoals may still remain locally coherent after the parent reference frame has drifted;
- therefore subgoal decomposition and parent-goal re-anchoring may solve different failure modes.

### HORIZON (2026)
"The Long-Horizon Task Mirage? Diagnosing Where and Why Agentic Systems Break"
arXiv:2604.11978

Relevant:
- long-horizon failures require trajectory-level diagnosis;
- failure attribution should use observed trajectories rather than only final success.

Current contribution:
- identifies a candidate failure location specifically at the boundary between task-local and parent-goal reference frames.

### NCP-Bench (2026)
"Can LLM Agents Stick to the Script? A Benchmark for Long-Horizon Consistency in Interactive Narratives"
arXiv:2608.08160

Relevant:
- high linguistic quality does not imply preservation of long-horizon commitments;
- structured commitments can be checked throughout an interaction.

Connection:
- parent project objective can be treated as a commitment that should survive locally successful work.

## 3. Harness / controller framing

### "Stop Comparing LLM Agents" (2026)

Relevant:
- long-horizon behavior is a joint outcome of model + harness;
- context construction, tool mediation, summarization and stopping are controller decisions;
- context drift should not automatically be attributed only to the model.

Connection to STGR:
- Global Reassessment Gate is a harness/controller intervention;
- Scope-Relative Globality is therefore naturally framed as a controller-state design problem.

### "Agent Harness Engineering: A Survey" (2026)

Relevant:
- long-horizon coherence requires context management across multiple time scales;
- context drift remains an open systems problem.

Connection:
- the new observation gives a concrete mechanism by which context can remain internally coherent at the wrong hierarchy level.

## 4. Provenance-aware memory

### Wu & Zhu (2026), "Agent Zero Memory: Provenance-Aware Long-Term Memory for LLM Agents"
arXiv:2608.29606

Relevant:
- learned items carry origin, timestamp and evidence pointer;
- answers are grounded under provenance/citation discipline.

Connection:
- supports treating provenance as a structural property rather than a confidence afterthought;
- current operational O-002 suggests that provenance must include not only source but **referent binding**:
  entity / environment / version / time.

The current candidate "Provenance-binding failure" is narrower than generic memory hallucination:
the fact may have support, but is attached to the wrong current state.

## 5. Positioning conclusion

The new STGR post-publication hypothesis is not:

> agents sometimes forget their goals.

That is already well established.

The narrower candidate contribution is:

> **A trigger-based local reassessment controller can operate correctly while failing to detect higher-level trajectory drift if the frozen state omits the parent reference frame.**

And for memory:

> **A supported historical fact can still cause an incorrect answer/action when its provenance is rebound to the wrong current referent.**

These are testable operational mechanisms.

## 6. Novelty caution

Do not claim novelty yet.

Before any new paper:
- search broader literature on hierarchical controller invariants;
- search agent memory entity/version binding;
- search task commitment preservation outside narrative settings;
- test natural operational cases prospectively.

Current status: plausible differentiated mechanism / requires replication.
