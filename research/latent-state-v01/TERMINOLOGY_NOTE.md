# Terminology Note — Operational Latent State

**Preferred term:** Operational Latent State Reliability (OLSR)

## Meaning

An **operational latent state** is a candidate lower-dimensional factor inferred from observable workflow evidence such as:

- evidence availability,
- source/version identity,
- completion pressure,
- context state,
- answer/core-claim differences,
- tool-result interpretation,
- proposed action,
- actual outcome.

It is not directly observed and is not assumed causal.

## Explicit non-equivalence

Operational latent state != transformer hidden state.

This project does not currently inspect:
- residual-stream activations,
- attention tensors,
- internal token representations,
- logits as latent-state evidence,
- neural truthfulness probes.

Those belong to a separate model-internal research layer.

## Why the distinction matters

The phrase “latent state” is heavily used in current LLM factuality research to refer to model-internal representations. Without this distinction, OLSR could accidentally overstate what its evidence measures.

## Repository continuity

The existing path `research/latent-state-v01/` remains unchanged to preserve history.
Publication-facing titles and future reports should use **Operational Latent State Reliability**.
