from __future__ import annotations
import hashlib,json
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parent
p=ROOT/'PILOT_MANIFEST_DRAFT_V1_0.jsonl'; rows=[json.loads(x) for x in p.read_text(encoding='utf-8').splitlines() if x.strip()]
assert len(rows)==72 and len({r['run_id'] for r in rows})==72
for r in rows:
 assert hashlib.sha256(r['user_text'].encode()).hexdigest()==r['user_text_sha256']
 assert hashlib.sha256(r['raw_completion_prompt'].encode()).hexdigest()==r['raw_completion_prompt_sha256']
 assert r['raw_rendering_version']=='COMMON_RAW_V2_NEUTRAL_SCAFFOLD'
 assert r['counted_confirmatory'] is False and r['generation_status']=='NOT_RUN'
c=Counter((r['training_stage'],r['task_id'],r['method_family']) for r in rows)
assert len(c)==24 and set(c.values())=={3}
print('PILOT_MANIFEST_VALIDATE=PASS'); print('ROWS=72 CELLS=24 EACH=3')
