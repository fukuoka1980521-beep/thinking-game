from __future__ import annotations
import json,os,subprocess,time,urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parent
MAN=ROOT/'phase1a'/'PHASE1A_MANIFEST_V1_0.jsonl'
OUT=ROOT/'phase1a'/'raw'
OUT.mkdir(parents=True,exist_ok=True)

MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18087
SERVER_CMD=[str(SERVER),'-m',str(MODEL),'--host','127.0.0.1','--port',str(PORT),'-c','8192','-t','10','-ngl','0','-np','1','--alias','gpap1a','--no-ui','--no-cache-prompt','--log-disable']

def http_json(path,payload=None,timeout=600):
    req=urllib.request.Request(
        f'http://127.0.0.1:{PORT}{path}',
        data=None if payload is None else json.dumps(payload).encode(),
        headers={} if payload is None else {'Content-Type':'application/json'}
    )
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return json.loads(r.read().decode())

def cleanup():
    ps=r'''Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'llama*.exe' -and $_.CommandLine -like '*OLMo-2-1124-7B-Instruct.Q4_K_M.gguf*' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }'''
    subprocess.run(['powershell','-NoProfile','-Command',ps],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=30)
    time.sleep(2)

def atomic(p,o):
    t=p.with_suffix('.json.tmp')
    t.write_text(json.dumps(o,indent=2,ensure_ascii=False),encoding='utf-8')
    os.replace(t,p)

def start_server(attempt_tag):
    cleanup()
    log=(ROOT/'phase1a'/f'llama_server_{attempt_tag}.log').open('w',encoding='utf-8')
    proc=subprocess.Popen(SERVER_CMD,stdout=log,stderr=subprocess.STDOUT,text=True)
    for _ in range(240):
        if proc.poll() is not None:
            log.close()
            raise RuntimeError('llama-server exited during load')
        try:
            if http_json('/health',timeout=2).get('status')=='ok':
                return proc,log
        except Exception:
            pass
        time.sleep(1)
    try: proc.terminate()
    except Exception: pass
    log.close()
    raise TimeoutError('server health timeout')

def stop_server(proc,log):
    if proc is not None:
        try: proc.terminate()
        except Exception: pass
        try: proc.wait(timeout=10)
        except Exception:
            try: proc.kill()
            except Exception: pass
    if log is not None:
        try: log.close()
        except Exception: pass

rows=[json.loads(x) for x in MAN.read_text(encoding='utf-8').splitlines() if x.strip()]

proc=None
log=None
server_seq=0

try:
    server_seq += 1
    proc,log=start_server(f'{server_seq:02d}')
    for i,row in enumerate(rows,1):
        p=OUT/(row['run_id']+'.json')
        if p.exists():
            print(f'SKIP {i}/15 {row["run_id"]}',flush=True)
            continue

        success=False
        last_error=None
        for attempt in range(1,4):
            try:
                try:
                    tok=http_json('/tokenize',{'content':row['injected_text']},timeout=10)
                    injected_tokens=len(tok.get('tokens') or [])
                except Exception:
                    injected_tokens=len(row['injected_text'].split())

                t=time.time()
                resp=http_json(
                    '/v1/chat/completions',
                    {
                        'model':'gpap1a',
                        'messages':row['messages'],
                        'temperature':0.0,
                        'top_p':1.0,
                        'max_tokens':180,
                        'seed':row['sampling']['seed'],
                        'stream':False
                    },
                    timeout=900
                )
                text=((resp.get('choices') or [{}])[0].get('message') or {}).get('content','')
                o=dict(row)
                o.update({
                    'status':'COMPLETE',
                    'raw_text':text,
                    'elapsed_seconds':time.time()-t,
                    'injected_tokens':injected_tokens,
                    'usage':resp.get('usage'),
                    'runtime_attempt':attempt
                })
                atomic(p,o)
                print(f'DONE {i}/15 {row["run_id"]} attempt={attempt}',flush=True)
                success=True
                break
            except Exception as e:
                last_error=f'{type(e).__name__}: {e}'
                print(f'RECOVER {i}/15 {row["run_id"]} attempt={attempt} error={last_error}',flush=True)
                stop_server(proc,log)
                proc=log=None
                if attempt < 3:
                    server_seq += 1
                    proc,log=start_server(f'{server_seq:02d}')
        if not success:
            raise RuntimeError(f'run failed after 3 attempts: {row["run_id"]}: {last_error}')
finally:
    stop_server(proc,log)
    cleanup()
