# Execution Decision Policy v1.0

Status: ACTIVE
Date: 2026-10-03

## Default rule

For every research/development step, classify the next action into one of five states:

1. **DO_NOW**
   - Required inputs/tools are available.
   - Execute immediately.
   - Do not pause for extra confirmation unless the action is destructive, paid, or changes frozen scientific conditions.

2. **EXTERNAL_OPTION**
   - The current environment cannot complete the step directly.
   - Search current external sources/tools/services for a workable alternative.
   - Prefer zero-cost/open/reproducible options.
   - Adopt an alternative only if it does not invalidate the scientific comparison or introduce an uncontrolled confound.

3. **DEFER_WITH_DEPENDENCY**
   - A valid route exists, but depends on a resource not yet available (for example a model download or required checkpoint).
   - Record the dependency and continue all independent work in parallel.
   - Do not block the project on this dependency.

4. **ANSWER_WITH_CURRENT_EVIDENCE**
   - No valid alternative exists, or obtaining one would cost more than the scientific value.
   - Produce the strongest answer supported by current evidence.
   - State the claim ceiling explicitly.

5. **STOP_SCIENTIFICALLY**
   - Continuing would invalidate the experiment, corrupt data, violate a frozen design, or require unauthorized paid execution.
   - Stop only that branch, not the entire project.
   - Continue unrelated valid work.

## Required report when something cannot be completed

For every unresolved item report:

- **What could not be done**
- **Immediate cause**
- **Root cause**, if known
- **Alternatives checked**
- **Why alternatives were rejected**, if none used
- **Impact on results**
  - none
  - affects precision only
  - affects generalizability
  - affects causal interpretation
  - invalidates the claim
- **Best supported answer using current evidence**
- **What future resource would resolve it**

## Priority order

1. Preserve scientific validity.
2. Avoid unnecessary paid computation.
3. Avoid waiting on one dependency when independent work exists.
4. Prefer deterministic/local/reproducible analysis.
5. Use external tools when they materially expand what can be established.
6. If no further valid evidence can be obtained, conclude from existing evidence rather than looping.

## No-loop rule

Do not repeat the same failed action unless at least one material condition has changed:
- tool/runtime changed;
- source changed;
- credentials/access changed;
- data changed;
- algorithm changed;
- failure cause was identified and fixed.

Repeated retries without a changed condition are prohibited.

## Current project application

- Model downloads are dependencies, not blockers.
- While downloads run, perform literature synthesis, smoke analysis, measurement preparation, and code validation.
- Paid API/compute remains unauthorized.
- Calibration smoke/pilot may proceed locally.
- Confirmatory claims remain separate from calibration evidence.
