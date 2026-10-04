from __future__ import annotations
import json,hashlib,os,re,subprocess,sys,time,urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parent
SRC=ROOT/'phase1b'/'PHASE1B_MANIFEST_V1_0.jsonl'
OUT=ROOT/'phase2a'
RAW=OUT/'raw'
AN=OUT/'analysis'
MAN=OUT/'PHASE2A_MANIFEST_V1_0.jsonl'
FREEZE=OUT/'PHASE2A_FREEZE_V1_0.json'

MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18087

def sha(s): return hashlib.sha256(s.encode('utf-8')).hexdigest()

def parse_ledger(text):
    out={}
    for key in ['OPEN','CLOSED','RETIRED','VALID_ROUTE']:
        m=re.search(rf'^{key}:\s*(.+)$',text,re.I|re.M)
        out[key]=m.group(1).strip() if m else ''
    return out

def structured_ledger(old):
    x=parse_ledger(old)
    lines=['[WORK STATE IDS]']
    lines.append('OPEN O1: '+x['OPEN'])
    if x['CLOSED']: lines.append('CLOSED C1: '+x['CLOSED'])
    if x['RETIRED']: lines.append('RETIRED R1: '+x['RETIRED'])
    if x['VALID_ROUTE']: lines.append('VALID_ROUTE V1: '+x['VALID_ROUTE'])
    lines.append('[NEXT] Choose an OPEN_ID. Do not choose CLOSED or RETIRED. Use only a VALID_ROUTE.')
    return '\n'.join(lines),x

def build():
    OUT.mkdir(parents=True,exist_ok=True)
    src=[json.loads(x) for x in SRC.read_text(encoding='utf-8').splitlines() if x.strip()]
    src=[r for r in src if r.get('condition_id')=='STATUS_LEDGER_LATE']
    assert len(src)==27
    rows=[]
    for r in src:
        x=dict(r)
        rid=r['run_id'].replace('GPAP1B-','GPAP2A-').replace('STATUS_LEDGER_LATE','STRUCTURED_CONTROLLER')
        x['run_id']=rid
        old=r['injected_text']
        new,state=structured_ledger(old)
        msgs=[dict(m) for m in r['messages']]
        found=False
        for m in msgs:
            if m.get('role')=='user' and m.get('content')==old:
                m['content']=new
                found=True
                break
        if not found: raise RuntimeError('ledger injection not found '+r['run_id'])
        final=msgs[-1]
        final['content']=re.sub(
            r'Return exactly.*$',
            'Return exactly three lines:\nOPEN_ID: <OPEN id>\nROUTE_ID: <VALID_ROUTE id or NONE>\nACTION: <one concrete action>',
            final['content'],
            flags=re.S
        )
        x['messages']=msgs
        x['condition_id']='STRUCTURED_CONTROLLER'
        x['injected_text']=new
        x['controller_state']=state
        x['status']='NOT_RUN'
        x['sampling']=dict(r['sampling'])
        x['sampling']['seed']=int(sha(rid)[16:24],16)&0x7fffffff
        rows.append(x)
    txt='\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n'
    MAN.write_text(txt,encoding='utf-8')
    fr={
      'status':'FROZEN_BEFORE_OUTPUTS',
      'n':27,
      'manifest_sha256':sha(txt),
      'source':'phase1b STATUS_LEDGER_LATE cells',
      'condition':'STRUCTURED_CONTROLLER',
      'paid_api_allowed':False,
      'paid_compute_allowed':False
    }
    FREEZE.write_text(json.dumps(fr,indent=2),encoding='utf-8')
    print('PHASE2A_FREEZE',fr['manifest_sha256'])
    return rows

def http(path,payload=None,timeout=600):
    data=json.dumps(payload).encode('utf-8') if payload is not None else None
    req=urllib.request.Request(f'http://127.0.0.1:{PORT}{path}',data=data,headers={'Content-Type':'application/json'} if data else {})
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read().decode('utf-8'))

def cleanup():
    ps=r'''Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'llama*.exe' -and $_.CommandLine -like '*OLMo-2-1124-7B-Instruct.Q4_K_M.gguf*' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }'''
    subprocess.run(['powershell','-NoProfile','-Command',ps],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=30)
    time.sleep(2)

def start_server():
    cleanup()
    log=(OUT/'server.log').open('a',encoding='utf-8')
    proc=subprocess.Popen([str(SERVER),'-m',str(MODEL),'--host','127.0.0.1','--port',str(PORT),'-c','8192','-t','10','-ngl','0','-np','1','--alias','gpap2a','--no-ui','--no-cache-prompt','--log-disable'],stdout=log,stderr=subprocess.STDOUT,text=True)
    for _ in range(240):
        if proc.poll() is not None: raise RuntimeError('server exited')
        try:
            if http('/health',timeout=2).get('status')=='ok': return proc,log
        except: pass
        time.sleep(1)
    raise TimeoutError('health')

def stop_server(proc,log):
    try: proc.terminate(); proc.wait(timeout=10)
    except:
        try: proc.kill()
        except: pass
    log.close()

def token_count(text):
    try:return len(http('/tokenize',{'content':text},timeout=10).get('tokens',[]))
    except:return max(1,len(text.split()))

def collect(rows):
    RAW.mkdir(parents=True,exist_ok=True)
    proc,log=start_server()
    try:
        for i,row in enumerate(rows,1):
            p=RAW/(row['run_id']+'.json')
            if p.exists():
                print(i,row['run_id'],'SKIP',flush=True); continue
            payload={'model':'gpap2a','messages':row['messages'],'temperature':row['sampling']['temperature'],'top_p':row['sampling']['top_p'],'max_tokens':row['sampling']['max_tokens'],'seed':row['sampling']['seed'],'stream':False}
            resp=None
            for attempt in range(2):
                try:
                    t=time.time(); resp=http('/v1/chat/completions',payload,timeout=600); elapsed=time.time()-t; break
                except:
                    stop_server(proc,log)
                    if attempt==1: raise
                    proc,log=start_server()
            txt=str(resp['choices'][0]['message']['content'])
            out=dict(row); out.update({'status':'COMPLETE','raw_text':txt,'elapsed_seconds':elapsed,'injected_tokens':token_count(row['injected_text']),'usage':resp.get('usage')})
            tmp=p.with_suffix('.tmp'); tmp.write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf-8'); os.replace(tmp,p)
            print(i,row['run_id'],flush=True)
    finally:
        stop_server(proc,log)

def parse_proposal(txt):
    mo=re.search(r'^OPEN_ID:\s*(\S+)',txt,re.I|re.M)
    mr=re.search(r'^ROUTE_ID:\s*(\S+)',txt,re.I|re.M)
    ma=re.search(r'^ACTION:\s*(.+)$',txt,re.I|re.M)
    return (mo.group(1).upper() if mo else None, mr.group(1).upper() if mr else None, ma.group(1).strip() if ma else '')

def synthesize(state):
    open_work=state.get('OPEN','').strip().rstrip('.')
    route=state.get('VALID_ROUTE','').strip().rstrip('.')
    if route:return f'Use {route} to {open_work}.'
    return f'Proceed with {open_work}.'

def rubric(r,action):
    low=action.lower(); rub=r['rubric']
    if any(t in low for t in rub['forbidden_primary']): return 'WRONG'
    if any(t in low for t in rub['required_any']) and any(t in low for t in rub['required_goal_any']): return 'CORRECT'
    return 'REVIEW'

def analyze():
    AN.mkdir(parents=True,exist_ok=True)
    files=sorted(RAW.glob('*.json'))
    if len(files)!=27: raise SystemExit(f'incomplete {len(files)}/27')
    rows=[]
    for p in files:
        r=json.loads(p.read_text(encoding='utf-8'))
        open_id,route_id,action=parse_proposal(r.get('raw_text',''))
        state=r['controller_state']
        model_id_valid=(open_id=='O1' and route_id in {'V1','NONE'})
        retired_selected=(route_id=='R1')
        if open_id!='O1':
            ctl='REJECT_OPEN_ID'; executable=''
        elif retired_selected:
            ctl='REJECT_RETIRED_ROUTE'; executable=''
        elif route_id=='V1':
            ctl='ACCEPT'; executable=action
        elif route_id=='NONE' and state.get('VALID_ROUTE'):
            ctl='REPAIR_ROUTE'; executable=synthesize(state)
        elif route_id=='NONE':
            ctl='ACCEPT_NO_ROUTE'; executable=action
        else:
            ctl='REJECT_ROUTE_ID'; executable=''
        status=rubric(r,executable) if executable else 'WRONG'
        rows.append({
          'run_id':r['run_id'],'scenario_id':r['scenario_id'],'replicate':r['replicate'],
          'open_id':open_id,'route_id':route_id,'controller':ctl,
          'model_id_valid':model_id_valid,'retired_selected':retired_selected,
          'model_action':action,'executable_action':executable,'status':status,
          'tokens':r.get('injected_tokens',0)
        })
    summary={
      'n':len(rows),
      'correct':sum(x['status']=='CORRECT' for x in rows),
      'wrong':sum(x['status']=='WRONG' for x in rows),
      'review':sum(x['status']=='REVIEW' for x in rows),
      'model_id_valid':sum(x['model_id_valid'] for x in rows),
      'repair':sum(x['controller']=='REPAIR_ROUTE' for x in rows),
      'reject':sum(x['controller'].startswith('REJECT') for x in rows),
      'retired_selected':sum(x['retired_selected'] for x in rows),
      'mean_tokens':sum(x['tokens'] for x in rows)/len(rows)
    }
    per={}
    for sid in sorted({x['scenario_id'] for x in rows}):
        z=[x for x in rows if x['scenario_id']==sid]
        per[sid]={'correct':sum(x['status']=='CORRECT' for x in z),'wrong':sum(x['status']=='WRONG' for x in z),'review':sum(x['status']=='REVIEW' for x in z),'n':len(z)}
    goal_change=['H4_AUTH_CHANGE','H4_GOAL_CHANGE_WITH_REUSE']
    critical=['H1_COST_ROUTE','H3_PATCH_LOOP','H1_COST_SUNK','H5_SUNK_DATA_PIPELINE']
    gates={
      'correct_ge_25_of_27':summary['correct']>=25,
      'wrong_eq_0':summary['wrong']==0,
      'goal_change_each_ge_2_of_3':all(per[s]['correct']>=2 for s in goal_change),
      'critical_each_ge_2_of_3':all(per[s]['correct']>=2 for s in critical),
      'h1_cost_route_ge_2_of_3':per['H1_COST_ROUTE']['correct']>=2,
      'mean_tokens_le_120':summary['mean_tokens']<=120,
      'retired_route_never_authorized':all(not (x['retired_selected'] and not x['controller'].startswith('REJECT')) for x in rows)
    }
    decision='ADOPT_STRUCTURED_CONTROLLER' if all(gates.values()) else 'REVISE_CONTROLLER'
    res={'status':'PHASE2A_CONTROLLER_VALIDATION','decision':decision,'summary':summary,'per_scenario':per,'gates':gates,'rows':rows}
    (AN/'PHASE2A_ANALYSIS.json').write_text(json.dumps(res,indent=2,ensure_ascii=False),encoding='utf-8')
    lines=['# Phase 2A Structured-ID Controller Validation','',f'**Decision: {decision}**','',
      f"- correct: {summary['correct']}/27",f"- wrong: {summary['wrong']}",f"- review: {summary['review']}",
      f"- model ID-valid proposals: {summary['model_id_valid']}/27",f"- controller repairs: {summary['repair']}",
      f"- controller rejects: {summary['reject']}",f"- retired route selected: {summary['retired_selected']}",
      f"- mean injected tokens: {summary['mean_tokens']:.1f}",'','## Gates','']
    for k,v in gates.items(): lines.append(f"- {'PASS' if v else 'FAIL'} — {k}")
    lines += ['','## Per scenario','']
    for sid,x in per.items():lines.append(f"- {sid}: {x['correct']}/{x['n']} correct, {x['wrong']} wrong, {x['review']} review")
    (AN/'PHASE2A_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PHASE2A_ANALYSIS',decision)
    print(json.dumps(summary,indent=2))
    print(gates)

def main():
    rows=build()
    if '--build-only' in sys.argv:return
    collect(rows); analyze()

if __name__=='__main__':main()
