# Related Work Audit 窶・Methodological Framing v0.1

## Verified adjacent literatures

1. **Reasoning Strategies in Large Language Models: Can They Follow, Prefer, and Optimize?** (2025), arXiv:2507.11423.
   - Directly relevant: prompting can steer reasoning strategy; no single strategy dominates all tasks.
   - Overlap: method instruction changes problem-solving behavior.
   - Gap relative to this project: focuses on reasoning performance rather than the structure of scientific workflow and evidence acquisition.

2. **StyleBench: Evaluating thinking styles in Large Language Models** (2025), arXiv:2509.20868.
   - Directly relevant: compares several reasoning styles across tasks/models.
   - Overlap: style-of-thought is treated as an experimental factor.
   - Gap: benchmark performance focus; not a causal decomposition of research planning, evidence selection, and conclusions.

3. **Topologies of Reasoning: Demystifying Chains, Trees, and Graphs of Thoughts** (2024), arXiv:2401.14295; later TPAMI version (2025).
   - Relevant: structured prompting changes reasoning topology.
   - Gap: focuses on reasoning structures and performance, not methodological frames as scientific-workflow treatments.

4. **Plan, Verify and Switch: Integrated Reasoning with Diverse X-of-Thoughts** (2023), EMNLP.
   - Relevant: different reasoning procedures are complementary and can be dynamically selected.
   - Gap: task solving, not research-behavior mediation.

5. **Prompting as Scientific Inquiry** (2025), arXiv:2507.00163.
   - Highly relevant conceptual framing: prompting as behavioral science for opaque models.
   - Gap: conceptual/methodological argument; does not by itself provide the randomized research-trajectory decomposition proposed here.

6. **Machine Psychology: Investigating Emergent Capabilities and Behavior in Large Language Models Using Psychological Methods** (2023), arXiv:2303.13988.
   - Relevant: treats LLMs as behavioral experimental subjects.
   - Gap: broad behavioral probing rather than methodological framing of research workflows.

7. **Deep Research: A Systematic Survey** (2025), arXiv:2512.02038.
   - Relevant: research agents combine reasoning and tools in open-ended investigation.
   - Gap: system architecture survey, not controlled same-objective/different-method experiments.

## Novelty boundary

Do **not** claim novelty for:
- the fact that prompts alter LLM reasoning;
- comparing Chain-of-Thought / Tree-of-Thought / other reasoning strategies;
- treating prompting as behavioral experimentation;
- the observation that structured workflows can improve performance.

Candidate differentiated contribution:

> A randomized, black-box decomposition of how **methodological framing**, with research objective held fixed, changes (1) research-plan structure, (2) evidence acquisition, and (3) conclusions, using an explicit research-state vector and staged mediation design.

Novelty remains provisional until a deeper literature review specifically targeting AI research agents, methodology prompts, and evidence-selection behavior is complete.

## Additional adjacent work found in extended audit

8. **Role-Conditioned Instruction Sets for Evaluating Epistemic Behavior in Large Language Models** (2026), Zenodo 18402911/18402912.
   - Same-model, clean-slate comparison under different role-conditioned instruction sets.
   - Important overlap: controlled instruction framing changes epistemic behavior.
   - Difference: two role profiles and qualitative epistemic behavior rather than a multi-method causal decomposition of research planning, evidence selection, and conclusion.

9. **Idea2Plan: Exploring AI-Powered Research Planning** (2025), arXiv:2510.24891.
   - Directly relevant to evaluating LLM research-plan generation.
   - Important for future task-bank design and research-plan quality baselines.
   - Difference: planning capability benchmark rather than randomized methodological-framing effects.

10. **Do LLM Agents Know How to Ground, Recover, and Assess? A Benchmark for Epistemic Competence in Information-Seeking Agents** (2025), arXiv:2509.22391.
   - Relevant to Study C because it scores step-level evidence grounding and search behavior rather than final-answer accuracy alone.
   - Difference: information-seeking competence benchmark rather than same-objective methodological treatments.

11. **On the Brittle Foundations of ReAct Prompting for Agentic Large Language Models** (2024), arXiv:2405.13966.
   - Strong methodological warning: apparent gains from a named reasoning framework may come from prompt details other than the claimed mechanism.
   - Implication: Study A must separate label-only framing from operational instructions and avoid attributing effects to a method name without isolating the active prompt components.

## Updated novelty boundary

The new project should **not** claim that it is the first controlled study showing instructions can alter epistemic or reasoning behavior.

The narrower candidate contribution is:

> A staged causal decomposition of methodological-framing effects on LLM scientific work, separating plan formation, fixed-evidence interpretation, active evidence selection, and final conclusion under a constant research objective.

The strongest methodological novelty candidate is the explicit mediator structure:

M -> Z_plan -> E_selected -> Y_conclusion

together with condition-blinded structural scoring and within-condition stochastic baselines.

## 2026-10-02 extended search

12. **Diversity of Thought Improves Reasoning Abilities of Large Language Models** (2023), arXiv:2310.07088.
   - Relevant: deliberately varying input prompts can induce diverse reasoning paths and improve ensemble reasoning.
   - Boundary: performance/diversity optimization, not research-plan structure or evidence-selection mediation.

13. **Hypothesis Testing Prompting Improves Deductive Reasoning in Large Language Models** (2024), arXiv:2405.06707.
   - Relevant: a named reasoning procedure changes intermediate validation behavior and task performance.
   - Boundary: method-specific prompting for deductive QA, not randomized scientific-method framing across a common research objective.

14. **Reasoning Strategies in Large Language Models: Can They Follow, Prefer, and Optimize?** (2025), arXiv:2507.11423.
   - Reinforces that prompted reasoning strategy is controllable and strategy effectiveness is task-dependent.
   - Implication: method-by-task interaction is not optional in a general methodological-framing claim.

## Updated design consequence

The literature makes three weak claims unavailable:
- 窶徇ethod instructions affect LLM behavior窶・is already known;
- 窶彭ifferent reasoning strategies produce different outcomes窶・is already known;
- 窶徘rompting can steer a model toward a named reasoning procedure窶・is already known.

The stronger candidate contribution remains:

> Hold the scientific objective fixed, randomize methodological framing, and decompose the observable effect into research-plan structure, evidence-selection policy, fixed-evidence interpretation, and final conclusion, while explicitly separating within-condition stochastic variation from between-method variation.

Study A therefore treats LABEL_ONLY framing as the primary causal treatment. OPERATIONAL instructions are secondary because directly prescribed workflow elements can otherwise create a tautological result.
