# NEW LIFE — Phase 32 prior real-GCP evidence reconciliation V1

Date: 2026-09-23.

## Why this phase exists

Before asking the Owner to touch GCP again, repository history was re-audited for prior real Vertex AI deployment evidence. That audit found that this same repository had already used the GCP project `gas-test-runner-20260620-wjxf`, the Owner had enabled billing, a Gen 2 dialogue function had been deployed, and real Gemini calls had been exercised successfully.

That earlier live run also found two concrete production defects that the new NEW LIFE function had accidentally reintroduced in candidate form:

1. Cloud Functions Gen 2 did not provide a usable project id to the Vertex AI client unless `GCP_PROJECT` was set explicitly at deployment.
2. `gemini-2.5-flash` could consume a small output budget in internal thinking and return no visible text; the earlier function was stabilized with `maxOutputTokens: 2048` plus one transparent retry on an empty response.

## Changes

- `functions/newlife-dialogue/index.js`
  - output budget: 1024 -> 2048
  - one transparent retry if the first model response has no visible text
- `src/newlife/semantic/httpInterpreter.ts`
  - timeout: 20s -> 25s to leave headroom for the server-side retry
- `scripts/newlife-deploy/deploy.ps1`
  - defaults to the previously selected project `gas-test-runner-20260620-wjxf`
  - deploy command now sets `GCP_PROJECT` explicitly
- `scripts/newlife-deploy/check-readiness.ps1`
  - if no active project is configured, it falls back read-only to the previously selected project rather than forcing the Owner to find/type the id again
- `functions/newlife-dialogue/README.md`
  - records the prior real deployment evidence and the reused lessons
- regression tests pin all of the above

## Boundary

This phase still does not deploy NEW LIFE, mutate billing, enable APIs, modify IAM, or configure the public endpoint. Historical billing success is evidence that the chosen project was usable; the readiness script must still re-check current auth/billing/API state before a fresh deployment.

HUMAN_VALIDATION_STATUS = PENDING.
READY_FOR_PRODUCT_RELEASE = NO.
