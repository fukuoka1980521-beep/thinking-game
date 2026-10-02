# Paid External Call Gate v1.0

Status: ACTIVE — applies to this research program.

## Purpose

Prevent uncontrolled cost, duplicate generation, and automatic paid resumption.

## Default

Local computation and reuse of existing data are the default.

A request such as "進めて" does **not** authorize a new paid API batch.

## Mandatory gate before any paid external model call

All of the following must be satisfied before the first paid request:

1. **Existing-data check**
   - prove that the requested scientific question cannot be answered from already collected valid data.

2. **Scientific necessity**
   - state what new identification or replication value the new calls add.
   - reject runs that merely add N without changing the inference.

3. **Cost envelope**
   - estimate number of calls and a maximum spend/call budget before execution.
   - set a hard stop.

4. **Resume semantics**
   - valid run IDs already written are never regenerated.
   - first valid response for each frozen run ID is authoritative.
   - technical resume requests only missing run IDs.

5. **Retry control**
   - retries must be bounded.
   - no automatic credit-restoration loop.
   - no unattended paid rerun after quota/credit failure.

6. **Explicit authorization**
   - user must explicitly approve the stated paid batch after seeing its purpose and cost envelope.
   - generic continuation language does not count as approval.

7. **Post-run accounting**
   - report valid calls, retries, duplicates, and completion count.

## Current override

As of 2026-10-03:

**NO PAID API CALLS ARE AUTHORIZED.**

This remains in force until the user explicitly changes it.

## Allowed without approval

- local Python / statistical computation;
- deterministic reanalysis;
- bootstrap / permutation tests;
- document and paper preparation;
- Git operations;
- use of already generated raw data;
- local open-weight inference that does not incur paid API fees, if separately chosen.
