from __future__ import annotations
import json, os, subprocess, sys
from datetime import datetime
from pathlib import Path

ROOT=Path(__file__).resolve().parent
STATE=ROOT/'AUTORUN_STATE.json'
MODEL_DIR=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot')
REQUIRED=[
    ROOT/'tmi_supervisor.py',
    ROOT/'tmi_watchdog.py',
    ROOT/'ensure_tmi_supervisor.ps1',
    ROOT/'run_pilot_stage.py',
    ROOT/'PILOT_MANIFEST_DRAFT_V1_0.jsonl',
    ROOT/'PILOT_MODELS_V1_0.json',
]
def age(iso):
    if not iso: return None
    return (datetime.now().astimezone()-datetime.fromisoformat(iso)).total_seconds()
def main():
    issues=[]
    if not STATE.exists():
        issues.append('STATE_MISSING'); state={}
    else:
        try: state=json.loads(STATE.read_text(encoding='utf-8'))
        except Exception as e:
            issues.append('STATE_INVALID:'+type(e).__name__); state={}
    hb=age(state.get('updated_at')) if state else None
    if hb is not None and hb>300: issues.append(f'HEARTBEAT_STALE:{hb:.0f}s')
    for p in REQUIRED:
        if not p.exists(): issues.append('MISSING:'+p.name)
    free=os.statvfs(MODEL_DIR).f_bavail*os.statvfs(MODEL_DIR).f_frsize if hasattr(os,'statvfs') else None
    # Windows fallback
    if free is None:
        import shutil; free=shutil.disk_usage(MODEL_DIR).free
    if free < 6_000_000_000: issues.append(f'DISK_LOW:{free}')
    status=state.get('status')
    if str(status).startswith('STOP'): issues.append('SCIENTIFIC_OR_POLICY_STOP:'+str(status))
    job=state.get('job')
    result={
      'health':'PASS' if not issues else 'ATTENTION',
      'issues':issues,
      'state':status,
      'heartbeat_age_sec':hb,
      'job':job,
      'free_bytes':free,
      'downloads':state.get('downloads',{}),
    }
    out=ROOT/'AUTORUN_HEALTH.json'
    out.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
    print('TMI_HEALTH='+result['health'])
    if issues:
        print('\n'.join(issues))
    sys.exit(0 if not issues else 2)
if __name__=='__main__': main()
