from __future__ import annotations
import json
from datetime import datetime
from pathlib import Path

ROOT=Path(__file__).resolve().parent
STATE=ROOT/'AUTORUN_STATE.json'

def age(iso):
    if not iso: return None
    try:
        return max(0,(datetime.now().astimezone()-datetime.fromisoformat(iso)).total_seconds())
    except Exception: return None

s=json.loads(STATE.read_text(encoding='utf-8')) if STATE.exists() else {}
updated=s.get('updated_at')
heartbeat=age(updated)
print('TMI STATUS')
print('state=',s.get('status'))
print('heartbeat_age_sec=',round(heartbeat,1) if heartbeat is not None else 'NA')
print('runtime_backend=',s.get('runtime_backend','pending'))
j=s.get('job')
if j:
    print('job=',j.get('type'),j.get('stage',''),j.get('rendering',''),'pid=',j.get('pid'))
    print('job_age_sec=',round(age(j.get('started_at')) or 0,1),'progress=',j.get('progress_count','NA'))
else:
    print('job=none')
print('downloads:')
for stage,row in s.get('downloads',{}).items():
    print(' ',stage,row.get('status'),'bytes=',row.get('bytes',row.get('partial_bytes','NA')),'pid=',row.get('pid'))
smoke=ROOT/'template_smoke'/'raw'
pilot=ROOT/'pilot_v01'/'raw'
print('smoke_outputs=',len(list(smoke.glob('*.json'))) if smoke.exists() else 0)
print('pilot_outputs=',len(list(pilot.glob('*.json'))) if pilot.exists() else 0)
gate=ROOT/'template_smoke'/'TEMPLATE_SMOKE_GATE.json'
if gate.exists():
    g=json.loads(gate.read_text(encoding='utf-8'))
    print('smoke_gate=',g.get('decision'))
analysis=ROOT/'pilot_v01'/'analysis'/'PILOT_ANALYSIS.json'
print('pilot_analysis_ready=',analysis.exists())
if s.get('last_exception'):
    print('last_exception=',s['last_exception'])
