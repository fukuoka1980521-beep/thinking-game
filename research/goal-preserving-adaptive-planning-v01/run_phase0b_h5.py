from __future__ import annotations
import json,os,re,subprocess,time,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parent
MAN=ROOT/'phase0b'/'PHASE0B_H5_CTRL_MANIFEST_V1_0.jsonl'
OUT=ROOT/'phase0b'/'raw_ctrl'; OUT.mkdir(parents=True,exist_ok=True)
MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18085
def http_json(path,payload=None,timeout=600):
    req=urllib.request.Request(f'http://127.0.0.1:{PORT}{path}',data=None if payload is None else json.dumps(payload).encode(),headers={} if payload is None else {'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read().decode())
def cleanup():
    ps=r'''Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'llama*.exe' -and $_.CommandLine -like '*OLMo-2-1124-7B-Instruct.Q4_K_M.gguf*' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }'''
    subprocess.run(['powershell','-NoProfile','-Command',ps],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=30); time.sleep(2)
def atomic(p,o):
    t=p.with_suffix('.json.tmp'); t.write_text(json.dumps(o,indent=2,ensure_ascii=False),encoding='utf-8'); os.replace(t,p)
row=json.loads(MAN.read_text(encoding='utf-8').strip())
cleanup()
log=(ROOT/'phase0b'/'llama_server_h5.log').open('w',encoding='utf-8')
proc=subprocess.Popen([str(SERVER),'-m',str(MODEL),'--host','127.0.0.1','--port',str(PORT),'-c','8192','-t','10','-ngl','0','-np','1','--alias','gpap0bh5','--no-ui','--no-cache-prompt','--log-disable'],stdout=log,stderr=subprocess.STDOUT,text=True)
try:
    for _ in range(240):
        if proc.poll() is not None: raise RuntimeError('server exit')
        try:
            if http_json('/health',timeout=2).get('status')=='ok': break
        except: pass
        time.sleep(1)
    p=OUT/(row['run_id']+'.json')
    if not p.exists():
        t=time.time(); resp=http_json('/v1/chat/completions',{'model':'gpap0bh5','messages':row['messages'],'temperature':0.0,'top_p':1.0,'max_tokens':160,'seed':row['sampling']['seed'],'stream':False},timeout=900)
        text=((resp.get('choices') or [{}])[0].get('message') or {}).get('content','')
        o=dict(row); o.update({'status':'COMPLETE','raw_text':text,'elapsed_seconds':time.time()-t,'usage':resp.get('usage')}); atomic(p,o)
        print(text)
finally:
    proc.terminate(); log.close()
