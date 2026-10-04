# Phase 0f Work-State Ledger Analysis

**Decision: LEDGER_PROMISING**

| condition | correct | wrong | review | injected tokens |
|---|---:|---:|---:|---:|
| CTRL | 1 | 2 | 1 | 0 |
| STATUS_LEDGER_EVENT | 3 | 1 | 0 | 292 |
| STATUS_LEDGER_LATE | 3 | 0 | 1 | 292 |
| STATUS_LEDGER_REFRESH | 3 | 0 | 1 | 600 |

Promising ledger timings: STATUS_LEDGER_LATE, STATUS_LEDGER_REFRESH

If decision is PROMPT_ONLY_NO_GO_EXTERNAL_CONTROLLER, stop prompt-only mitigation and move to a validator/controller that rejects CLOSED/RETIRED actions.
