# Model Adapter / Run Capture Contract

Every raw run preserves:
- exact delivered messages;
- raw response;
- timestamp;
- visible provider/model/configuration;
- fresh vs continued context;
- decoding settings if exposed, otherwise UNKNOWN;
- tools/retrieval/memory state if observable;
- source/tool outputs actually presented.

## Controlled endpoint cohort
Prefer fixed explicit model identifier and fixed decoding settings. Record seed if supported; do not assume perfect determinism unless documented.

## ChatGPT product field cohort
Product routing, memory, retrieval, tools, and backend state may not be fully observable. Record visible configuration, project/chat context, fresh-chat status, actual sources/tools, and mark unknown backend state UNKNOWN.

Controlled endpoint and product cohorts are never pooled without stratification.

## Raw-data immutability
Raw responses are append-only. Scoring is stored separately and versioned. No response may be removed because it is inconsistent or difficult to score.
