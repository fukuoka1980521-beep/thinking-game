from __future__ import annotations
import json, os, re, subprocess, time, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parent
MANIFEST=ROOT/'phase0'/'PHASE0_MANIFEST_V1_0.jsonl'
OUT=ROOT/'phase0'/'raw'
LOG=ROOT/'phase0'/'PHASE0_RUN.log'
MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18083

OUT.mkdir(parents=True,exist_ok=True)

def log(s):
    line=time.strftime('%Y-%m-%d %H:%M:%S')+' '+s
    print(line,flush=True)
    with LOG.open('a',encoding='utf-8') as f: f.write(line+'\n')

def http_json(path,payload=None,timeout=600):
    url=f'http://127.0.0.1:{PORT}{path}'
    if payload is None:
        req=urllib.request.Request(url)
    else:
        data=json.dumps(payload).encode('utf-8')
        req=urllib.request.Request(url,data=data,headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return json.loads(r.read().decode('utf-8'))

def wait_health(proc):
    for _ in range(240):
        if proc.poll() is not None:
            raise RuntimeError('llama-server exited during load')
        try:
            x=http_json('/health',timeout=2)
            if x.get('status')=='ok':
                return
        except Exception:
            pass
        time.sleep(1)
    raise TimeoutError('server health timeout')

def cleanup_study_llama():
    ps=r'''Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'llama*.exe' -and $_.CommandLine -like '*OLMo-2-1124-7B-Instruct.Q4_K_M.gguf*' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }'''
    subprocess.run(['powershell','-NoProfile','-Command',ps],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=30)
    time.sleep(2)

def atomic_json(path,obj):
    tmp=path.with_suffix(path.suffix+'.tmp')
    tmp.write_text(json.dumps(obj,indent=2,ensure_ascii=False),encoding='utf-8')
    os.replace(tmp,path)

rows=[json.loads(x) for x in MANIFEST.read_text(encoding='utf-8').splitlines() if x.strip()]
if len(rows)!=20:
    raise SystemExit('manifest must contain 20 rows')
if not MODEL.exists():
    raise SystemExit('model missing: '+str(MODEL))

cleanup_study_llama()
server_log=(ROOT/'phase0'/'llama_server.log').open('w',encoding='utf-8')
cmd=[str(SERVER),'-m',str(MODEL),'--host','127.0.0.1','--port',str(PORT),'-c','8192','-t','10','-ngl','0','-np','1','--alias','gpap0','--no-ui','--no-cache-prompt','--log-disable']
proc=subprocess.Popen(cmd,stdout=server_log,stderr=subprocess.STDOUT,text=True)

try:
    wait_health(proc)
    log('SERVER_READY')
    for i,row in enumerate(rows, start=1):
        outp=OUT/(row['run_id']+'.json')
        if outp.exists():
            log(f"SKIP {i}/20 {row['run_id']}")
            continue
        payload={
            'model':'gpap0',
            'messages':row['messages'],
            'temperature':row['sampling']['temperature'],
            'top_p':row['sampling']['top_p'],
            'max_tokens':row['sampling']['max_tokens'],
            'seed':row['sampling']['seed'],
            'stream':False
        }
        t0=time.time()
        resp=http_json('/v1/chat/completions',payload,timeout=900)
        elapsed=time.time()-t0
        choices=resp.get('choices') or []
        text=str((choices[0].get('message') or {}).get('content','')) if choices else ''
        token_overhead=0
        for inj in row['injected_texts']:
            try:
                tj=http_json('/tokenize',{'content':inj},timeout=10)
                token_overhead += len(tj.get('tokens') or [])
            except Exception:
                token_overhead += max(1,len(inj.split()))
        out=dict(row)
        out.update({
            'status':'COMPLETE',
            'raw_text':text,
            'elapsed_seconds':elapsed,
            'injected_tokens':token_overhead,
            'usage':resp.get('usage')
        })
        atomic_json(outp,out)
        log(f"DONE {i}/20 {row['run_id']} sec={elapsed:.1f}")
    log('PHASE0_COLLECTION_COMPLETE')
finally:
    try: proc.terminate()
    except Exception: pass
    try: proc.wait(timeout=10)
    except Exception:
        try: proc.kill()
        except Exception: pass
    server_log.close()
