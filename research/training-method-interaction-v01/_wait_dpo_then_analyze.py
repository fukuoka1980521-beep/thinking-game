import glob,subprocess,time
from pathlib import Path
ROOT=Path(r"C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01")
for _ in range(180):
    n=len(glob.glob(str(ROOT/'pilot_v01'/'raw'/'P1-DPO-*.json')))
    if n>=18:
        cp=subprocess.run(['python',str(ROOT/'analyze_completed_stages.py')],cwd=str(ROOT),capture_output=True,text=True)
        (ROOT/'pilot_v01'/'partial'/'DPO_STAGE_TRIGGER.log').write_text(cp.stdout+'\n'+cp.stderr,encoding='utf-8')
        raise SystemExit(cp.returncode)
    time.sleep(10)
raise SystemExit('DPO did not complete within monitor window')
