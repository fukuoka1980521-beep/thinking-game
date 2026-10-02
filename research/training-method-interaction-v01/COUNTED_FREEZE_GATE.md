# Counted Freeze Gate v0.1

Status: NOT READY / FEASIBILITY IN PROGRESS

## Already passed

- Independent worktree/branch created.
- Prior 714-plan paper remains separate.
- Four public OLMo 2 1B training stages identified.
- Architecture probe: PASS (same Olmo2 architecture signature; hidden size 2048; 16 layers).
- Tokenizer probe: PASS (same tokenizer.json ETag across all four stages).
- Prior seven LABEL_ONLY method cues reused exactly.
- Prior T1/T2/T3 task objectives reused exactly.
- Paid model/API endpoints in feasibility runner: 0.
- Official weight storage estimated: ~13.83 GiB total; local disk is sufficient.

## Still required before freeze

- CPU PyTorch/Transformers environment PASS.
- BASE local generation PASS.
- SFT local generation PASS.
- DPO local generation PASS.
- RLVR local generation PASS.
- Prompt hash identity across stages verified from actual records.
- Small balanced non-counted pilot completed.
- Runtime projection for n=336 documented.
- Degeneration/compliance diagnostics reviewed without changing the primary scientific success criterion.

## Freeze decision rule

Freeze only if local counted execution is technically feasible and the measurement plan can be applied without redefining the research question after observing pilot method-separation results.

Pilot may change engineering settings such as output budget if required for feasibility.
Pilot must not be used to choose whichever methods/tasks happen to separate best.
