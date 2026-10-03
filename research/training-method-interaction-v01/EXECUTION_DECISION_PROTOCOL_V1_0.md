# Execution Decision Protocol v1.0

Status: ACTIVE
Date: 2026-10-03

## Purpose

Prevent both over-cautious checking and unproductive blocking.

## Required order

1. **Do what is currently possible first.**
   - Use local files, existing results, already-downloaded models, existing code and zero-cost computation.
   - Do not stop merely because one subtask is blocked.

2. **Separate possible from impossible/currently blocked.**
   For every blocked item record:
   - exact blocker;
   - whether it is technical, data, access, compute, cost or scientific-design related;
   - whether the blocker affects the main conclusion or only a secondary claim.

3. **Research external alternatives only for the blocked part.**
   - Search documentation, model repositories, papers, tools or alternative runtimes.
   - Prefer zero-marginal-cost alternatives.
   - Do not replace a working local path merely because an external option exists.

4. **Adopt an external alternative if it preserves the estimand and experimental conditions.**
   - Operational substitutions are allowed when they do not change the scientific treatment.
   - Any substitution that changes model, quantization, prompt, sampling, task or measurement is a scientific amendment and must be documented before using affected outputs.

5. **If no valid alternative exists, answer from available evidence.**
   Do not wait indefinitely for a perfect dataset.

6. **Always report unresolved limitations.**
   Final reporting must state:
   - what could not be done;
   - why it could not be done;
   - which claims are affected;
   - direction/magnitude of likely impact where estimable;
   - which conclusions remain supported despite the missing piece.

## Minimal mandatory guards

Only three guards are mandatory:
1. no unapproved paid API/compute;
2. no destructive loss/corruption of canonical research data;
3. no post-result silent change to frozen experimental conditions.

All other checks are advisory and should not block forward progress unless they materially threaten those three guards.

## Default behavior

When one branch is blocked:
- continue independent branches;
- investigate the blocker in parallel conceptually, not by spawning duplicate expensive work;
- stop the whole program only if the blocker invalidates the primary estimand.

## Reporting schema

At each substantive milestone, summarize:

### Completed
What was actually executed and verified.

### Currently possible next
What can proceed immediately with existing resources.

### Blocked / unavailable
What cannot currently be done.

### External alternative
What was checked and whether it is usable.

### Impact
What the blocker changes in interpretation.

### Current answer
The strongest conclusion supported by existing evidence now.

This protocol supersedes ad-hoc safety-check loops.
