from __future__ import annotations
import json,re
from datetime import datetime
from pathlib import Path

ROOT=Path(__file__).resolve().parent
STATE=ROOT/'AUTORUN_STATE.json'

def age(iso):
    if not iso: return None
    try:
        return max(0,(datetime.now().astimezone()-datetime.fromisoformat(iso)).total_seconds())
    except Exception: return None

def aria_progress(stage):
    p=ROOT/'autorun_logs'/f'download_{stage}.log'
    if not p.exists(): return None
    try:
        data=p.read_text(encoding='utf-8',errors='ignore')[-20000:]
    except Exception:
        return None
    # Example: [#f4dcf8 2.8GiB/4.1GiB(69%) CN:8 DL:6.8MiB ETA:3m9s]
    matches=list(re.finditer(
        r'\[#\S+\s+([^\s]+/[^\s]+)\((\d+)%\)\s+CN:(\d+)\s+DL:([^\s]+)(?:\s+ETA:([^\]\r\n]+))?',
        data
    ))
    if not matches: return None
    m=matches[-1]
    return {
        'amount':m.group(1),'percent':int(m.group(2)),
        'connections':int(m.group(3)),'speed':m.group(4),
        'eta':(m.group(5) or '').strip(),
        'log_age_sec':max(0,(datetime.now().timestamp()-p.stat().st_mtime)),
    }

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
    ap=aria_progress(stage)
    base=f"  {stage} {row.get('status')} pid={row.get('pid')}"
    if ap and row.get('status')=='DOWNLOADING':
        print(base+f" actual={ap['percent']}% {ap['amount']} speed={ap['speed']} eta={ap['eta']} log_age={ap['log_age_sec']:.0f}s")
    else:
        print(base+f" bytes={row.get('bytes',row.get('partial_bytes','NA'))}")
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
