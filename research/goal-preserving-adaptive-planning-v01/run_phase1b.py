from __future__ import annotations
import json, os, subprocess, time, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parent
MAN=ROOT/'phase1b'/'PHASE1B_MANIFEST_V1_0.jsonl'
RAW=ROOT/'phase1b'/'raw'
OUT=ROOT/'phase1b'
MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18089

def http(path,payload=None,timeout=600):
    data=json.dumps(payload).encode('utf-8') if payload is not None else None
    req=urllib.request.Request(f'http://127.0.0.1:{PORT}{path}',data=data,headers={'Content-Type':'application/json'} if data else {})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return json.loads(r.read().decode('utf-8'))

def cleanup():
    ps=r'''Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'llama*.exe' -and $_.CommandLine -like '*OLMo-2-1124-7B-Instruct.Q4_K_M.gguf*' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }'''
    subprocess.run(['powershell','-NoProfile','-Command',ps],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=30)
    time.sleep(2)

def start_server():
    cleanup()
    log=(OUT/'server.log').open('a',encoding='utf-8')
    proc=subprocess.Popen(
      [str(SERVER),'-m',str(MODEL),'--host','127.0.0.1','--port',str(PORT),'-c','8192','-t','10','-ngl','0','-np','1','--alias','gpap1b','--no-ui','--no-cache-prompt','--log-disable'],
      stdout=log,stderr=subprocess.STDOUT,text=True
    )
    for _ in range(240):
        if proc.poll() is not None:
            log.close(); raise RuntimeError('server exited during load')
        try:
            if http('/health',timeout=2).get('status')=='ok': return proc,log
        except Exception: pass
        time.sleep(1)
    raise TimeoutError('server health timeout')

def stop_server(proc,log):
    try:
        proc.terminate(); proc.wait(timeout=10)
    except Exception:
        try: proc.kill()
        except Exception: pass
    log.close()

def token_count(text):
    if not text:return 0
    try:return len(http('/tokenize',{'content':text},timeout=10).get('tokens',[]))
    except Exception:return max(1,len(text.split()))

rows=[json.loads(x) for x in MAN.read_text(encoding='utf-8').splitlines() if x.strip()]
if len(rows)!=54: raise SystemExit(f'manifest n={len(rows)}')
RAW.mkdir(parents=True,exist_ok=True)
proc,log=start_server()
try:
    for i,row in enumerate(rows,1):
        p=RAW/(row['run_id']+'.json')
        if p.exists():
            print(i,row['run_id'],'SKIP',flush=True); continue
        payload={
          'model':'gpap1b','messages':row['messages'],
          'temperature':row['sampling']['temperature'],'top_p':row['sampling']['top_p'],
          'max_tokens':row['sampling']['max_tokens'],'seed':row['sampling']['seed'],'stream':False
        }
        for attempt in range(2):
            try:
                t0=time.time(); resp=http('/v1/chat/completions',payload,timeout=600); elapsed=time.time()-t0; break
            except Exception:
                stop_server(proc,log)
                if attempt==1: raise
                proc,log=start_server()
        text=str(resp['choices'][0]['message']['content'])
        out=dict(row)
        out.update({'status':'COMPLETE','raw_text':text,'elapsed_seconds':elapsed,'injected_tokens':token_count(row.get('injected_text','')),'usage':resp.get('usage')})
        tmp=p.with_suffix('.tmp'); tmp.write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf-8'); os.replace(tmp,p)
        print(i,row['run_id'],flush=True)
finally:
    stop_server(proc,log)
