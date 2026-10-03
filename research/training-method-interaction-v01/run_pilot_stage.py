from __future__ import annotations
import argparse, hashlib, json, subprocess, time, urllib.request, urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parent
MODEL_DIR=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot')
LLAMA_DIR=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe')
SERVER=LLAMA_DIR/'llama-server.exe'
REG=json.loads((ROOT/'PILOT_MODELS_V1_0.json').read_text(encoding='utf-8'))
MANIFEST=[json.loads(x) for x in (ROOT/'PILOT_MANIFEST_DRAFT_V1_0.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
PORT=18081

def sha256_file(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(8*1024*1024),b''): h.update(b)
 return h.hexdigest()

def http_json(path,payload=None,timeout=3600):
 url=f'http://127.0.0.1:{PORT}{path}'
 if payload is None:
  req=urllib.request.Request(url)
 else:
  data=json.dumps(payload).encode('utf-8'); req=urllib.request.Request(url,data=data,headers={'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=timeout) as resp: return json.loads(resp.read().decode('utf-8'))
def wait_health(proc):
 for _ in range(180):
  if proc.poll() is not None: raise RuntimeError('llama-server exited during load')
  try:
   x=http_json('/health',None,2)
   if x.get('status')=='ok': return
  except Exception: pass
  time.sleep(1)
 raise RuntimeError('server health did not become ready')

def request_payload(row,rendering):
 s=row['generation_settings']
 common={
  'temperature':s['temperature'],'top_p':s['top_p'],'top_k':s['top_k'],'min_p':s['min_p'],
  'typical_p':s['typical_p'],'repeat_penalty':s['repeat_penalty'],
  'presence_penalty':s['presence_penalty'],'frequency_penalty':s['frequency_penalty'],
  'dry_multiplier':s['dry_multiplier'],'xtc_probability':s['xtc_probability'],
  'dynatemp_range':s['dynatemp_range'],'seed':s['seed'],'cache_prompt':False,'stream':False,
 }
 if rendering=='raw':
  return '/completion',{**common,'prompt':row['user_text'],'n_predict':s['max_new_tokens']}
 return '/v1/chat/completions',{**common,'model':'local','messages':[{'role':'user','content':row['user_text']}],'max_tokens':s['max_new_tokens']}

def extract_text(resp,rendering):
 if rendering=='raw': return str(resp.get('content',''))
 choices=resp.get('choices') or []
 return str(choices[0].get('message',{}).get('content','')) if choices else ''
def run(stage,rendering,mode,dry_run=False):
 info=REG['stages'][stage]; model=MODEL_DIR/info['filename']
 rows=[r for r in MANIFEST if r['training_stage']==stage]
 if mode=='smoke': rows=[r for r in rows if r['task_id']=='T1' and r['method_family']=='GENERIC' and r['replicate']==1]
 if dry_run:
  print(json.dumps({'stage':stage,'rendering':rendering,'mode':mode,'model':str(model),'model_exists':model.exists(),'rows':[r['run_id'] for r in rows]},indent=2)); return
 if not model.exists(): raise SystemExit('missing model: '+str(model))
 model_hash=sha256_file(model)
 outroot=ROOT/('template_smoke' if mode=='smoke' else 'pilot_v01')/'raw'; outroot.mkdir(parents=True,exist_ok=True)
 logs=ROOT/('template_smoke' if mode=='smoke' else 'pilot_v01')/'logs'; logs.mkdir(parents=True,exist_ok=True)
 logf=(logs/f'server_{stage}_{rendering}.log').open('w',encoding='utf-8')
 cmd=[str(SERVER),'-m',str(model),'--host','127.0.0.1','--port',str(PORT),'-c','4096','-t','10','-ngl','0','-np','1','--alias','local','--no-ui','--no-cache-prompt','--log-disable']
 proc=subprocess.Popen(cmd,stdout=logf,stderr=subprocess.STDOUT,text=True)
 try:
  wait_health(proc)
  for row in rows:
   oid=('SMOKE-'+stage+'-'+rendering.upper()) if mode=='smoke' else row['run_id']+'-'+rendering.upper()
   dest=outroot/(oid+'.json')
   if dest.exists(): print('SKIP',oid); continue
   endpoint,payload=request_payload(row,rendering); started=time.time(); resp=http_json(endpoint,payload); elapsed=time.time()-started; text=extract_text(resp,rendering)
   rec={**row,'execution_id':oid,'rendering':rendering,'model_file':info['filename'],'model_sha256':model_hash,'pilot_model_repo':info['pilot_repo'],'pilot_model_revision':info['pilot_revision'],'llama_cpp_commit':'4e7481175cbd4759df8bee2f1c1a0073effbebd7','raw_text':text,'elapsed_seconds':elapsed,'response_stop':resp.get('stop'),'response_stopped_limit':resp.get('stopped_limit'),'usage':resp.get('usage'),'timings':resp.get('timings')}
   dest.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding='utf-8'); print('OK',oid,'chars',len(text),'sec',round(elapsed,2),flush=True)
 finally:
  proc.terminate()
  try: proc.wait(timeout=10)
  except subprocess.TimeoutExpired: proc.kill()
  logf.close()
if __name__=='__main__':
 ap=argparse.ArgumentParser(); ap.add_argument('--stage',required=True,choices=list(REG['stages'])); ap.add_argument('--rendering',required=True,choices=['raw','native']); ap.add_argument('--mode',choices=['smoke','pilot'],default='smoke'); ap.add_argument('--dry-run',action='store_true'); a=ap.parse_args(); run(a.stage,a.rendering,a.mode,a.dry_run)
