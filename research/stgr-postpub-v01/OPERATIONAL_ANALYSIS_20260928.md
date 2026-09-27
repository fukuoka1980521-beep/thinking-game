# STGR Post-Publication Operational Analysis v0.1

Date: 2026-09-28
Status: PROSPECTIVE OPERATIONAL OBSERVATION / NON-CONFIRMATORY
Publication held fixed: DOI 10.5281/zenodo.22983828

## 0. Boundary

This note does not modify the frozen six-episode confirmatory dataset, published trigger definitions, paired shadow results, or interpretation boundary.

The observations below occurred after publication during ordinary work and are analyzed as operational evidence and hypothesis generation only.

## 1. Why this sequence matters

A single extended work session produced both:
- cases where the Global Reassessment Gate changed the next operation; and
- a higher-level failure in which the overall conversation drifted away from the research objective despite those local gate successes.

This suggests a distinction between **whether reassessment occurs** and **what reference frame the reassessment treats as global**.

A gate can be locally correct while the task frame itself has already drifted.

## 2. Natural operational events

### O-001 — portfolio routing contradiction

Observed:
- autonomous task list placed invoice-payroll-v2 first;
- canonical priorities said invoice-payroll should remain held while required human information was missing;
- human-actions-required still showed that blocker.

Trigger: `GOAL_RELATION_AMBIGUITY`

Proposed continuation: continue invoice-payroll implementation.

Evidence: canonical priority + human-action boundary.

Decision: `SWITCH_TASK_OR_LAYER`

Result: invoice-payroll stayed held; work moved to BenriAI.

Interpretation: bounded evidence changed next-operation selection. This does not prove that a failure would definitely have occurred without the Gate.

### O-002 — production identity / restored-data mismatch

Observed:
- prior conversational context suggested that BenriAI production data had previously been restored;
- the currently opened local SQLite DB contained zero cases;
- historical CLOSE evidence described the local production state as zero cases;
- no matching BenriAI Cloud Run service was found in currently accessible Google Cloud projects.

Trigger: `SOURCE_HISTORY_OR_IDENTITY_DIVERGENCE`

Proposed continuation: treat the local SQLite DB as the previously restored production dataset and continue bulk ingestion.

Evidence: direct DB counts + historical CLOSE + current cloud service inventory.

Decision: `OBSERVE_OR_TEST`

Result: local DB was reclassified as a new real-data pilot. No claim was made that the earlier restored production dataset had been recovered or overwritten.

Interpretation: this is also an epistemic identity-binding case. A previously supported statement can become false when rebound to the wrong current environment, version, or deployment state.
### O-003 — branch-history divergence before production import

Observed:
- historical-import feature branch was ready to fast-forward;
- master had gained two new canonical/documentation commits;
- fast-forward failed.

Trigger class: `SOURCE_HISTORY_OR_IDENTITY_DIVERGENCE`

Proposed continuation: integrate feature branch and continue production DB mutation.

Evidence:
- master-only commit list;
- feature-only commit list;
- file-level diff;
- master changed only `CANONICAL_BENRIAI_SYSTEM.md` and `CLAUDE.md`;
- feature changed application code/tests only.

Decision: `REPLAN_LOCAL`

Action:
- rebase feature branch onto current master;
- rerun full suite.

Verification:
- conflict-free rebase;
- 159/159 tests PASS;
- only then fast-forward and continue.

Interpretation: evidence supported continuing, but only after re-anchoring to current canonical history.

## 3. More important failure: conversation-level goal drift

The session began as research continuation.

It then moved through:
1. portfolio priority inspection;
2. BenriAI implementation;
3. intake-box changes;
4. LAN authentication;
5. business-file analysis/import;
6. cross-project handoff.

Much of this work was useful and locally coherent.

However, the active project was the research project. The Owner eventually had to explicitly say:

> 「こちらは本来の研究のための分析などを行ってください」

This is a natural correction that the trajectory had crossed the intended project boundary.

### Why local gate activations did not stop it

Each frozen state was framed around the current development task:
- which repo to work on;
- which DB identity was current;
- which branch history was authoritative.

It did not re-anchor against the higher-level chain:

`RESEARCH PROGRAM → CURRENT RESEARCH OBJECTIVE → OPERATIONAL OBSERVATION → IMPLEMENTATION TASK → NEXT MUTATION`

Once the frame shifted from “study the mechanism” to “improve BenriAI,” later reassessments remained globally coherent only **inside the already-drifted frame**.

This is the key post-publication observation.

## 4. New hypothesis: Scope-Relative Globality

Candidate concept:

> **Scope-Relative Globality**  
> A “global reassessment” is only global relative to an explicit reference frame. If the reference frame itself has drifted, a gate can validate locally safe actions while failing to detect higher-level goal divergence.

Equivalent formulation:

> **A correct local gate does not imply a correct global trajectory.**

This does not falsify the published mechanism. The published study tested whether a trigger-based decision boundary can alter continuation at captured trigger states. The new observation concerns **how far upward the reassessment horizon extends**.
## 5. Candidate mechanism extension

Observed sequence:

1. legitimate operational subtask is entered;
2. the subtask produces useful concrete work;
3. each local decision has plausible evidence;
4. local completion generates another useful operational action;
5. no trigger asks whether the operational frame still serves the parent research objective;
6. locally justified actions accumulate;
7. Owner detects macro-level drift.

Candidate label:

**Hierarchical Goal-Frame Drift**

“Nested Local Task Momentum” is another possible description, but the more conservative label is preferred until more natural cases exist.

## 6. Candidate missing state variable

Current minimal frozen state includes:
- CURRENT_GOAL
- CURRENT_STEP
- TARGET_IDENTITY
- TARGET_ENVIRONMENT
- OBSERVED_TRIGGER
- PROPOSED_NEXT_OPERATION
- LATEST_EVIDENCE_REFS

The operational failure suggests a missing parent anchor.

Candidate variables for future study, not immediate standard change:
- `PARENT_GOAL`
- `GOAL_HIERARCHY_REF`
- `ACTIVE_REFERENCE_FRAME`

A compact form could be:

`PROJECT_OBJECTIVE → CURRENT_TASK_GOAL → PROPOSED_NEXT_OPERATION`

The research question is whether this is needed only at scope transitions rather than every action.

## 7. Candidate trigger for future testing

Do **not** add this to the canonical trigger set yet.

Prospective candidate:

`PARENT_GOAL_REANCHOR_REQUIRED`

Possible observable conditions:
- moving from research to implementation;
- switching project/repository families;
- multiple consequential scope switches without parent-goal check;
- current task produces value but no direct evidence toward parent objective;
- Owner restates the original purpose.

This needs selectivity testing. An always-on parent-goal check could recreate the bureaucracy the original Gate was designed to avoid.

## 8. Epistemic reliability finding: provenance-binding failure

O-002 also informs the hallucination track.

The problematic state was not necessarily a pure invented fact. A prior statement about restored production data may have referred to another deployment, DB copy, branch, machine state, or earlier valid state.

The failure occurred when that remembered fact was rebound to the current local DB without identity verification.

Candidate mechanism:

> **Provenance-binding failure**  
> A statement with some prior support is attached to the wrong current entity, version, environment, or time state.

This is distinct from:
- retrieval failure;
- fabrication from no evidence;
- arithmetic error;
- simple staleness.

It is a strong candidate explanation for some cross-chat answer variance.

## 9. Cross-chat answer stability implication

The important failure is not “same question → different wording.”

A more material failure mode is:

> **same surface entity name → different hidden referent binding across chats.**

For example, “BenriAI production” can denote:
- current local SQLite;
- prior restored environment;
- Cloud Run deployment;
- canonical repo state.

If different chats bind to different referents, responses can each be internally coherent while materially inconsistent.

Track A should therefore explicitly compare:
- referent identity;
- environment;
- version/branch;
- evidence timestamp;
- source-of-truth hierarchy.

Candidate term:

**Referent Stability**
## 10. Implication for the prior “value scoring reduces hallucination” hypothesis

This sequence further weakens the idea that hallucination can be sufficiently controlled by better value/cost assignment.

The local actions had genuine value:
- BenriAI intake work;
- branch reconciliation;
- historical data import.

Yet the session still drifted from the research objective, and the production-identity claim still required provenance verification.

Value scoring can optimize whether an action is worth doing. It cannot by itself establish:
- which environment a remembered fact belongs to;
- whether two chats refer to the same entity state;
- whether the current task frame still serves the parent objective.

Status remains:

**INSUFFICIENT / NOT SUPPORTED AS A GENERAL HALLUCINATION CONTROL MECHANISM**

## 11. Owner-touch implication

The frozen confirmatory study correctly reported no Owner terminal relay across its captured trigger loops.

This post-publication sequence adds a limitation:

> Higher-level trajectory drift can remain invisible to a locally scoped Gate and may still require Owner correction.

This does not revise the frozen 0/6 result. It narrows the deployment interpretation:
- Owner-touch elimination was observed inside captured gate loops;
- it was not demonstrated for meta-goal supervision across long sessions.

## 12. What this observation supports

Supported as prospective operational evidence:

1. Existing trigger-based reassessment can still alter local next operations after publication.
2. Source/history divergence remains a high-value trigger class.
3. A gate can be correctly applied locally while the overall trajectory is wrong for the parent project.
4. Entity/environment binding is a concrete mechanism for at least one apparent memory/hallucination problem.
5. Parent-goal/reference-frame state is a plausible candidate for further study.

## 13. What this observation does NOT support

Do not claim:
- the published Gate is ineffective;
- all long sessions require constant goal checking;
- adding PARENT_GOAL will solve goal drift;
- the new candidate trigger has acceptable false-positive cost;
- provenance-binding failure explains all hallucinations;
- one Owner correction establishes a prevalence rate;
- these operational cases belong in the frozen six.

## 14. Next research step

Do not immediately modify the canonical Gate.

Open a separate prospective operational phase around two research questions.

### RQ-A — Reassessment horizon

When a trigger occurs, does including an explicit parent-goal anchor change next-operation quality compared with task-local reassessment?

Capture:
- current project objective;
- current task objective;
- proposed next operation;
- scope/repository/project switch;
- task-local gate decision;
- parent-anchored decision;
- later Owner correction;
- latency/overhead.

### RQ-B — Referent stability

When a materially important fact comes from prior chat/memory/history, does explicit binding to
`(entity, environment, version, timestamp, source)`
reduce cross-chat contradictions or unsupported claims?

Capture natural cases only. Do not generate synthetic hallucinations to fill the dataset.
## 15. Provisional design principle

The operational evidence suggests a possible two-level architecture.

### Level 1 — Local Global Reassessment Gate
- existing trigger set;
- fast;
- mutation/scope/closure boundary.

### Level 2 — Parent-Goal Reanchor
- only on scope/project/reference-frame transitions;
- checks whether current task still serves parent objective.

This is a hypothesis, not yet a standard.

Target:
- preserve the speed/selectivity of the published Gate;
- catch higher-level frame drift without turning every action into recursive reflection.

## 16. Current research decision

1. Keep the six confirmatory episodes frozen.
2. Record O-001 to O-003 as post-publication operational observations.
3. Record the Owner correction as the first clear higher-level goal-frame drift signal.
4. Open a new prospective track: **Reassessment Horizon / Referent Stability**.
5. Do not alter FCC trigger definitions until additional natural observations are collected.
