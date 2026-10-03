import json,time
from pathlib import Path
ROOT=Path(r"C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01")
statep=ROOT/'AUTORUN_STATE.json'
raw=ROOT/'pilot_v01'/'raw'
last=None
for _ in range(1440):
    n=len(list(raw.glob('*.json'))) if raw.exists() else 0
    try:
        s=json.loads(statep.read_text(encoding='utf-8'))
        state=s.get('status')
        job=s.get('job')
    except Exception:
        state='STATE_READ_ERROR'; job=None
    key=(n,state, (job or {}).get('stage'), (job or {}).get('progress_count'))
    if key!=last:
        print(time.strftime('%H:%M:%S'), 'n=',n,'state=',state,'job=',job,flush=True)
        last=key
    if n>=72 and state in {'PILOT_COMPLETE_GO','PILOT_COMPLETE_NO_GO'}:
        print('PILOT_TERMINAL',state,flush=True)
        raise SystemExit(0)
    if isinstance(state,str) and state.startswith('STOPPED_') and n<72:
        print('PILOT_STOPPED_EARLY',state,flush=True)
        raise SystemExit(2)
    time.sleep(10)
raise SystemExit('monitor timeout')
