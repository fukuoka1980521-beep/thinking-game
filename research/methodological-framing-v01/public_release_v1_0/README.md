# Methodological Framing Public Release v1.0

Creator: Shinobu Fukuoka
Release date: 2026-10-03

## Counted data
- Study A: 336 plans
- External Replication R1: 378 plans
- Total: 714 complete counted plans

The partial Study C dataset is intentionally excluded because its frozen denominator was not completed.

## Privacy / release hygiene
Public JSONL records exclude response identifiers, raw API envelopes, timestamps, usage/billing metadata, local filesystem paths, private infrastructure details, and credentials.

## Reproduction
Requirements: Python 3 and NumPy.

Core confirmatory and replication results:
python code/reproduce_main_results.py

The default uses the frozen 10,000-permutation setting. For a local smoke test only:
python code/reproduce_main_results.py --permutations 100

Post-hoc zero-cost robustness:
python code/zero_cost_robustness_v1.py

The robustness script also defaults to 10,000 permutations. A smoke-test override can be supplied with MF_PERMUTATIONS.

No model API call is required for any reproduction command in this release.

## Scientific boundary
Classification recoverability is not methodology quality. This release supports claims about observable black-box research-plan signatures only. It does not expose hidden chain-of-thought or neural states.
