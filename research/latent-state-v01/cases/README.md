# Prospective case storage

Store one JSON object per line in future `cases/*.jsonl` files.

Rules:
- natural cases only
- no synthetic research observations
- unit-test fixtures remain under `scripts/tests` or temporary directories
- never backfill the frozen STGR six episodes into the prospective count
- preserve corrections rather than rewriting history silently
- do not store secrets, credentials, customer-identifying data, or private conversation content
- use concise fingerprints/summaries and evidence references
