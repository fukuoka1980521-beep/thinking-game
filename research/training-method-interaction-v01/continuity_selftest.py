from __future__ import annotations
import json, os, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent
STATE=ROOT/'AUTORUN_STATE.json'
WATCHDOG=ROOT/'tmi_watchdog.py'
SUPERVISOR=ROOT/'tmi_supervisor.py'
ENSURE=ROOT/'ensure_tmi_supervisor.ps1'

checks=[]

def add(name,ok,detail=''):
    checks.append({'name':name,'ok':bool(ok),'detail':str(detail)})

# Static invariants: these protect scientific conditions from recovery logic.
w=WATCHDOG.read_text(encoding='utf-8')
s=SUPERVISOR.read_text(encoding='utf-8')
e=ENSURE.read_text(encoding='utf-8')

add('watchdog_has_file_lock','msvcrt.locking' in w)
add('supervisor_has_file_lock','msvcrt.locking' in s)
add('download_stale_recovery','DOWNLOAD_STALE' in w and 'download_stale_' in w)
add('segmented_download_mtime_progress','partial_mtime_ns' in w and 'current_mtime_ns' in w)
add('job_progress_recovery','JOB_STALE_NO_PROGRESS' in w)
add('job_absolute_timeout','JOB_STALE_ABSOLUTE' in w)
add('retry_limit','STOP_RETRY_LIMIT' in w)
add('scientific_stop_persists',"startswith(\"STOP\")" in w or "startswith('STOP')" in w)
add('existing_output_skip',"dest.exists()" in (ROOT/'run_pilot_stage.py').read_text(encoding='utf-8'))
add('no_paid_api_reference','api.openai.com' not in w.lower())
add('ensure_checks_heartbeat','heartbeatAge' in e and '-gt 300' in e)
add('ensure_collapses_duplicates','DUPLICATE_TERMINATED' in e)
add('ensure_restarts_missing','RESTARTED' in e)

state={}
if STATE.exists():
    try:
        state=json.loads(STATE.read_text(encoding='utf-8'))
        add('state_json_valid',True,state.get('status'))
    except Exception as ex:
        add('state_json_valid',False,type(ex).__name__)
else:
    add('state_json_valid',False,'missing')

# The recovery layer must not change the frozen manifest.
meta=ROOT/'PILOT_MANIFEST_DRAFT_V1_0.meta.json'
manifest=ROOT/'PILOT_MANIFEST_DRAFT_V1_0.jsonl'
if meta.exists() and manifest.exists():
    import hashlib
    h=hashlib.sha256(manifest.read_text(encoding='utf-8').encode()).hexdigest()
    expected=json.loads(meta.read_text(encoding='utf-8')).get('manifest_sha256')
    add('manifest_hash_matches',h==expected,f'{h} expected={expected}')
else:
    add('manifest_hash_matches',False,'missing')

result={'status':'PASS' if all(x['ok'] for x in checks) else 'FAIL','checks':checks}
(ROOT/'CONTINUITY_SELFTEST.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print('CONTINUITY_SELFTEST='+result['status'])
for x in checks:
    print(('PASS' if x['ok'] else 'FAIL'),x['name'],x['detail'])
sys.exit(0 if result['status']=='PASS' else 2)
