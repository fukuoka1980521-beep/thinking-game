# AI DEVELOPMENT EXECUTION BOUNDARY V1

Date: 2026-09-26
Status: ACTIVE PROCESS RULE

## Purpose

Prevent slow, overbuilt development caused by:
- speculative hardening before the main path is proven;
- repeated review loops;
- unrequested refactors;
- confusing "can prepare" with "can execute";
- discovering credential / permission / human-only boundaries too late.

The rule is simple:

> First separate what can be done now, what can only be verified, what can be prepared but not executed, and what requires a human. Then take the shortest path to the requested outcome.

---

## 1. Capability classification must happen first

Before implementation, classify every required step into exactly one bucket.

### A. CAN_EXECUTE_NOW
The current tool/session has verified permission and can complete the action now.

Examples:
- read repository files;
- edit an isolated branch;
- create tests;
- run available GitHub CI;
- inspect GitHub PR/Issue evidence.

### B. CAN_VERIFY_READ_ONLY
The current tool/session can inspect evidence but cannot mutate the external system.

Examples:
- read deployment metadata exposed through an available connector;
- inspect logs exposed through an available connector;
- inspect code/config/history.

### C. CAN_PREPARE_NOT_EXECUTE
The assistant can build the script/config/change, but final execution requires credentials or an external environment not available in-session.

Examples:
- GCP deployment when this session has no GCP credentialed tool;
- WIF bootstrap requiring Owner Google authorization;
- local-PC execution when no computer/local-shell connector is present.

### D. HUMAN_ONLY_OR_EXTERNAL_APPROVAL
Requires:
- MFA;
- billing choice;
- irreversible production approval;
- subjective human product judgment;
- consent only the Owner can give.

### E. NOT_AVAILABLE
No connected tool or evidence path exists.

Do not describe C/D/E as if they are autonomously executable.

---

## 2. Minimum Completion Path

For every task, write internally:

GOAL
→ minimum evidence needed
→ minimum action needed
→ verification
→ stop.

Do not add:
- architecture cleanup;
- generalized framework work;
- new UI;
- new scenario;
- additional blind evaluation;
- new safety layer;
- migration work

unless it is directly required to complete or safely verify the requested goal.

All extra ideas go to PARKING LOT, not implementation.

---

## 3. REQUIRED vs OPTIONAL

Every proposed change is classified:

### REQUIRED
Without it, the requested result is impossible, unsafe, or unverifiable.

### OPTIONAL
Improves maintainability, elegance, generality, coverage, or future readiness.

Autonomous mode may execute REQUIRED changes.

OPTIONAL changes require either:
- explicit Owner request; or
- a later task whose goal directly needs them.

---

## 4. Two-loop stop rule

If the same blocker survives two materially different attempts:

STOP.

Do not create a third workaround automatically.

Report:
- blocker;
- evidence;
- what is actually possible now;
- smallest external action needed, if any.

Likewise, if investigation produces no new evidence after two loops, stop investigating.

---

## 5. Evidence ladder

Never confuse these evidence levels:

1. CODE EVIDENCE
   - repository says what should happen.

2. DEPLOYMENT EVIDENCE
   - deployed metadata says what is running.

3. RUNTIME EVIDENCE
   - logs/requests show what actually happened.

4. HUMAN VALUE EVIDENCE
   - a human reports whether the product is understandable/useful/enjoyable.

Higher levels cannot be claimed from lower levels.

---

## 6. Human gate comes earlier

For user-facing product work:

vertical slice
→ minimal technical verification
→ human test
→ only then hardening/generalization.

Do not spend multiple rounds perfecting infrastructure, ontology, review harnesses, or edge-case coverage before the user has seen the core experience unless a real safety/data-loss risk requires it.

---

## 7. Time discipline

Default investigation budget:
- 1 focused repository/evidence pass;
- 1 targeted follow-up pass only if the first identifies a concrete gap.

Default implementation budget:
- smallest reversible change;
- one focused test set;
- one review pass.

A second review pass is allowed only if the first finds a concrete blocker.

Do not keep iterating because "more assurance would be nice."

---

## 8. No unrequested product change

Autonomous development must not change:
- product concept;
- gameplay loop;
- model/provider;
- public route;
- user-facing behavior;
- data model;
- deployment target

unless:
1. the Owner requested that outcome; or
2. the current requested outcome cannot be completed without the change, and the dependency is demonstrated.

When a dependency forces a product-affecting change, stop before implementing it and surface the decision.

---

## 9. NEW LIFE specific boundary

### Can do autonomously now
- inspect GitHub code/history/PRs;
- edit isolated refoundation branch;
- add focused tests;
- run/inspect GitHub CI;
- prepare migration harnesses;
- compare fixed evidence;
- document exact blockers.

### Cannot honestly claim from this session unless a connected credentialed tool exists
- direct GCP deployment;
- direct GCP IAM/WIF mutation;
- billing changes;
- direct Cloud Logging/Monitoring queries;
- local-PC execution;
- Owner MFA/Google authorization.

### Must remain human
- whether the game is enjoyable;
- whether NPCs feel human;
- whether a model migration preserves the desired feel;
- final product-value judgment.

---

## 10. Reporting format

Every autonomous task closes with only:

RESULT:
- completed / partially completed / blocked

CAN_DO_NOW:
- ...

CANNOT_DO_FROM_CURRENT_SESSION:
- ...

OWNER_ACTION_REQUIRED:
- YES / NO

If YES:
- exactly one smallest action.

No long list of speculative next steps.

---

## 11. Immediate application to current model-migration work

Current goal:
Determine safe migration path away from Gemini 2.5 without degrading NEW LIFE conversation quality.

Required:
- fix the two concrete blind-comparison blockers already found;
- run focused tests/CI;
- prepare comparison artifacts.

Not required before that:
- more ontology redesign;
- more gameplay refactoring;
- more UI work;
- additional general-purpose frameworks.

Actual live Vertex comparison is CAN_PREPARE_NOT_EXECUTE from a session that has no credentialed GCP execution tool.

Do not pretend otherwise.

---

ACTIVE_RULE = YES
SCOPE_EXPANSION_DEFAULT = NO
TWO_LOOP_STOP_RULE = ON
HUMAN_VALUE_GATE_EARLY = ON
