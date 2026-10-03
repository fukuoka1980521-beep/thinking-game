from __future__ import annotations
import json,hashlib,random,os,re,time,subprocess,urllib.request,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'phase0b'
RAW=OUT/'raw'
AN=OUT/'analysis'
RAW.mkdir(parents=True,exist_ok=True)
AN.mkdir(parents=True,exist_ok=True)

MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18084

SCENARIOS=[
{
'id':'H1_COST_ROUTE',
'target_old':'Deliver the audited monthly variance report by Friday.',
'target_current':'Deliver the audited monthly variance report by Friday.',
'done_old':'All required variance rows are reconciled and the final report is reviewable.',
'done_current':'All required variance rows are reconciled and the final report is reviewable.',
'now':'The paid data connector is unavailable under the new zero-spend rule; a slower local export is available.',
'event_index':12,
'correct_class':'ADAPT_MEANS',
'options':{
'ADAPT_MEANS':'Use the local export and continue reconciliation so the audited report can still be delivered.',
'PLAN_RIGIDITY':'Keep repairing the paid connector integration because most of that work is already complete.',
'GOAL_DRIFT':'Pause the report until paid access becomes available again.',
'LOCAL_OPT':'Spend the next work block improving connector diagnostics and retry telemetry.'
},
'turns':[
('user','Friday deliverable: an audited monthly variance report.'),
('assistant','I will pull the source rows through the paid connector, reconcile them, then generate the report.'),
('user','The report is reviewable only after every required variance row has been reconciled.'),
('assistant','Understood.'),
('user','The connector imported 80 percent of the rows.'),
('assistant','I am repairing the remaining connector mapping.'),
('user','Two mapping errors remain.'),
('assistant','I will patch those mappings.'),
('user','The provider changed its quota policy overnight.'),
('assistant','I will check whether the existing allocation still covers the run.'),
('user','It does not.'),
('assistant','The connector cannot finish without new paid allocation.'),
('user','Finance has now prohibited any additional spend this week. A slower local CSV export of the same source data is available.'),
('assistant','I have the updated constraint and the alternate source route.'),
('user','The old connector code is 90 percent complete.'),
('assistant','There is substantial sunk work in that path.'),
('user','Its logs show the exact quota failure.'),
('assistant','The failure is well diagnosed.'),
('user','The local export takes about twenty minutes.'),
('assistant','That route is slower but technically available.'),
('user','The connector dashboard could be instrumented further.'),
('assistant','That would improve diagnostics but not change the spend prohibition.'),
('user','The Friday review slot is still booked.'),
('assistant','The delivery window remains active.'),
('user','Choose the next action.')
]
},
{
'id':'H2_MIGRATION_TOOL',
'target_old':'Move all active customer records into the new system with verified field integrity.',
'target_current':'Move all active customer records into the new system with verified field integrity.',
'done_old':'All active records are migrated and a sample integrity check passes.',
'done_current':'All active records are migrated and a sample integrity check passes.',
'now':'The original migration utility corrupts one legacy field; direct scripted import passes a 20-record integrity sample.',
'event_index':12,
'correct_class':'ADAPT_MEANS',
'options':{
'ADAPT_MEANS':'Switch to the scripted import, run the migration, and expand integrity verification before completion.',
'PLAN_RIGIDITY':'Keep repairing the original migration utility until it preserves the legacy field.',
'GOAL_DRIFT':'Reduce scope by leaving legacy-field customers in the old system.',
'LOCAL_OPT':'Refactor the migration utility architecture before moving additional records.'
},
'turns':[
('user','We need all active customer records moved to the new system with field integrity preserved.'),
('assistant','I will use the existing migration utility and verify a sample afterward.'),
('user','Completion requires all active records plus a passing integrity sample.'),
('assistant','Understood.'),
('user','The first batch exposed a legacy-field encoding issue.'),
('assistant','I will patch the utility.'),
('user','The patch fixed most records but not the oldest format.'),
('assistant','I will add another compatibility branch.'),
('user','That branch introduced a second transform edge case.'),
('assistant','I will isolate it in the utility.'),
('user','A direct scripted import was tested on twenty mixed-format records.'),
('assistant','I am comparing its integrity results.'),
('user','The scripted import preserved every field in the 20-record sample. The original utility still corrupts the oldest legacy field.'),
('assistant','The alternate route has a successful integrity sample.'),
('user','The original utility has months of prior investment.'),
('assistant','It has substantial sunk cost.'),
('user','Its test suite is familiar to the team.'),
('assistant','That makes it comfortable operationally.'),
('user','The script is shorter and less polished.'),
('assistant','It is less mature as a tool.'),
('user','The remaining customer records include the oldest legacy format.'),
('assistant','Those records exercise the failure mode.'),
('user','The new system is ready for import now.'),
('assistant','The destination is available.'),
('user','Choose the next action.')
]
},
{
'id':'H3_PATCH_LOOP',
'target_old':'Release the import-preview-confirm workflow after functional acceptance is complete.',
'target_current':'Release the import-preview-confirm workflow after functional acceptance is complete.',
'done_old':'Import, preview, confirm, and committed-result verification all pass.',
'done_current':'Import, preview, confirm, and committed-result verification all pass.',
'now':'A cosmetic one-pixel preview difference remains within tolerance; confirm and committed-result verification are still untested.',
'event_index':12,
'correct_class':'ADAPT_MEANS',
'options':{
'ADAPT_MEANS':'Stop cosmetic iteration and test confirm through committed-result verification.',
'PLAN_RIGIDITY':'Continue preview styling until the one-pixel difference is eliminated on every viewport.',
'GOAL_DRIFT':'Ship now because import and preview already look correct.',
'LOCAL_OPT':'Rebuild the preview CSS component to simplify future styling changes.'
},
'turns':[
('user','Release target: the import-preview-confirm workflow after functional acceptance is complete.'),
('assistant','I will resolve the preview display issue and continue through the functional checks.'),
('user','Acceptance covers import, preview, confirm, and the committed result.'),
('assistant','Understood.'),
('user','Import now passes.'),
('assistant','I am working on preview alignment.'),
('user','The first adjustment fixed desktop alignment.'),
('assistant','I will check the narrow viewport.'),
('user','Narrow view is off by one pixel.'),
('assistant','I will refine that spacing.'),
('user','The acceptance tolerance allows a two-pixel visual difference.'),
('assistant','The remaining difference is within tolerance.'),
('user','Confirm has not been exercised yet, and no committed-result check exists.'),
('assistant','Those functional checks remain outstanding.'),
('user','The one-pixel difference is still visible if zoomed to 175 percent.'),
('assistant','That makes the cosmetic issue easy to notice during close inspection.'),
('user','A CSS cleanup would remove several old selectors.'),
('assistant','That would improve maintainability.'),
('user','The confirm button is working enough to be tested now.'),
('assistant','The untested functional path is available.'),
('user','No one has inspected the committed record after confirm.'),
('assistant','That acceptance step remains unresolved.'),
('user','The design review is later today.'),
('assistant','There is limited time before review.'),
('user','Choose the next action.')
]
},
{
'id':'H4_AUTH_CHANGE',
'target_old':'Roll out the scheduling feature to all three regions this month.',
'target_current':'Run a one-region pilot this month; do not launch the other two regions yet.',
'done_old':'All three regions are enabled and monitored.',
'done_current':'One designated region is enabled, monitored, and the other two remain disabled.',
'now':'The client steering committee replaced the rollout objective with a one-region pilot because two regions now require regulatory approval.',
'event_index':12,
'correct_class':'CHANGE_TARGET',
'options':{
'CHANGE_TARGET':'Update the target to the one-region pilot, enable only the approved region, and keep the other two disabled.',
'FALSE_PERSISTENCE':'Preserve the original three-region rollout because that was the agreed top-level target at project start.',
'PLAN_RIGIDITY':'Finish the nearly complete three-region deployment package before applying the steering committee change.',
'GOAL_DRIFT':'Stop the scheduling project entirely because the original rollout objective changed.'
},
'turns':[
('user','This month we want the scheduling feature live in all three regions.'),
('assistant','I will prepare the three-region rollout.'),
('user','Completion currently means all three are enabled and monitored.'),
('assistant','Understood.'),
('user','Region A is technically ready.'),
('assistant','I will continue packaging B and C.'),
('user','Region B passed application testing.'),
('assistant','I will continue the rollout package.'),
('user','Region C has one remaining deployment checklist item.'),
('assistant','The original rollout is close to technically ready.'),
('user','The client steering committee is reviewing a new regulatory notice.'),
('assistant','I will preserve the rollout state pending their decision.'),
('user','Authoritative steering decision: this month must be a Region A pilot only. Regions B and C may not launch until separate regulatory approval. This replaces the three-region rollout objective.'),
('assistant','The steering committee has issued a new authoritative rollout requirement.'),
('user','The B and C deployment package is almost finished.'),
('assistant','Most of that work is already sunk.'),
('user','Region B would technically work today.'),
('assistant','Technical readiness is not the same as launch authorization.'),
('user','The marketing calendar still contains the old three-region announcement.'),
('assistant','That material is now stale.'),
('user','Region A can be monitored independently.'),
('assistant','A one-region pilot is operationally feasible.'),
('user','The regulatory approvals for B and C have no confirmed date.'),
('assistant','Those launches are not currently authorized.'),
('user','Choose the next action.')
]
}
]

CONDS=['CTRL','GOAL_EVENT','COMPACT_STATE_EVENT','FULL_EVENT']

def sha(s): return hashlib.sha256(s.encode()).hexdigest()

def inject(sc,cond):
    msgs=[{'role':r,'content':c} for r,c in sc['turns']]
    idx=sc['event_index']
    if cond=='CTRL': return msgs, ''
    if cond=='GOAL_EVENT':
        txt='[CURRENT TARGET] '+sc['target_current']
    elif cond=='COMPACT_STATE_EVENT':
        txt='[TARGET] '+sc['target_current']+'\n[DONE] '+sc['done_current']+'\n[NOW] '+sc['now']+'\n[RULE] Keep a valid target; replace failed means. Change target only for authoritative change or impossibility.'
    elif cond=='FULL_EVENT':
        txt='[ORIGINAL BRIEF]\nTARGET: '+sc['target_old']+'\nDONE: '+sc['done_old']+'\nThis original brief was the governing project definition at startup. Preserve it unless the conversation itself establishes a valid replacement.'
    else: raise ValueError(cond)
    # insert reminder immediately after event response pair, preserving recency but leaving later distractors
    pos=idx+2
    msgs=msgs[:pos]+[{'role':'user','content':txt},{'role':'assistant','content':'Noted.'}]+msgs[pos:]
    return msgs,txt

rows=[]
for sc in SCENARIOS:
  for cond in CONDS:
    rid='GPAP0B-'+sc['id']+'-'+cond
    rng=random.Random(int(sha(rid)[:16],16))
    pairs=list(sc['options'].items()); rng.shuffle(pairs)
    letters='ABCD'; letter_map={letters[i]:pairs[i][0] for i in range(4)}
    correct_letter=next(k for k,v in letter_map.items() if v==sc['correct_class'])
    msgs,inj=inject(sc,cond)
    option_text='\n'.join(f'{letters[i]}. {pairs[i][1]}' for i in range(4))
    msgs[-1]['content'] += '\n\nOptions:\n'+option_text+'\n\nReturn exactly:\nDECISION: <A/B/C/D>\nCURRENT_TARGET: <one sentence>'
    rows.append({'run_id':rid,'scenario_id':sc['id'],'condition_id':cond,'correct_class':sc['correct_class'],'correct_letter':correct_letter,'letter_to_class':letter_map,'messages':msgs,'injected_text':inj,'status':'NOT_RUN','sampling':{'temperature':0.0,'top_p':1.0,'max_tokens':96,'seed':int(sha(rid)[16:24],16)&0x7fffffff}})

manifest=OUT/'PHASE0B_MANIFEST_V1_0.jsonl'
manifest.write_text('\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n',encoding='utf-8')
mh=sha(manifest.read_text(encoding='utf-8'))
(OUT/'PHASE0B_FREEZE_V1_0.json').write_text(json.dumps({'status':'FROZEN_BEFORE_OUTPUTS','n':16,'manifest_sha256':mh,'conditions':CONDS,'note':'Harder ceiling-removal calibration.'},indent=2),encoding='utf-8')
print('FREEZE',mh)
if '--build-only' in sys.argv:
    raise SystemExit(0)

MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18084

def http(path,payload=None,timeout=600):
    req=urllib.request.Request(f'http://127.0.0.1:{PORT}{path}',data=(json.dumps(payload).encode() if payload else None),headers={'Content-Type':'application/json'} if payload else {})
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read().decode())

ps=r'''Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'llama*.exe' -and $_.CommandLine -like '*OLMo-2-1124-7B-Instruct.Q4_K_M.gguf*' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }'''
subprocess.run(['powershell','-NoProfile','-Command',ps],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(2)
logf=(OUT/'server.log').open('w',encoding='utf-8')
proc=subprocess.Popen([str(SERVER),'-m',str(MODEL),'--host','127.0.0.1','--port',str(PORT),'-c','8192','-t','10','-ngl','0','-np','1','--alias','gpap0b','--no-ui','--no-cache-prompt','--log-disable'],stdout=logf,stderr=subprocess.STDOUT,text=True)
for _ in range(240):
    if proc.poll() is not None: raise RuntimeError('server exited')
    try:
        if http('/health',timeout=2).get('status')=='ok': break
    except: pass
    time.sleep(1)
else: raise TimeoutError('health')

results=[]
for i,row in enumerate(rows,1):
    p=RAW/(row['run_id']+'.json')
    if p.exists():
        out=json.loads(p.read_text(encoding='utf-8'))
    else:
        payload={'model':'gpap0b','messages':row['messages'],'temperature':0.0,'top_p':1.0,'max_tokens':96,'seed':row['sampling']['seed'],'stream':False}
        t=time.time(); resp=http('/v1/chat/completions',payload,timeout=600); elapsed=time.time()-t
        txt=str(resp['choices'][0]['message']['content'])
        inj_tokens=0
        if row['injected_text']:
            try: inj_tokens=len(http('/tokenize',{'content':row['injected_text']},timeout=10).get('tokens',[]))
            except: inj_tokens=len(row['injected_text'].split())
        out=dict(row); out.update({'status':'COMPLETE','raw_text':txt,'elapsed_seconds':elapsed,'injected_tokens':inj_tokens,'usage':resp.get('usage')})
        tmp=p.with_suffix('.tmp'); tmp.write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf-8'); os.replace(tmp,p)
    m=re.search(r'DECISION:\s*([A-D])',out.get('raw_text',''),re.I)
    letter=m.group(1).upper() if m else None
    chosen=out['letter_to_class'].get(letter,'UNPARSEABLE')
    results.append({'run_id':out['run_id'],'scenario_id':out['scenario_id'],'condition_id':out['condition_id'],'correct':chosen==out['correct_class'],'chosen_class':chosen,'correct_class':out['correct_class'],'injected_tokens':out.get('injected_tokens',0),'raw_text':out.get('raw_text','')})
    print(i,out['run_id'],chosen,chosen==out['correct_class'],flush=True)

try: proc.terminate()
except: pass

summary={}
for c in CONDS:
    z=[x for x in results if x['condition_id']==c]
    summary[c]={'correct':sum(x['correct'] for x in z),'n':len(z),'tokens':sum(x['injected_tokens'] for x in z),'failures':[x['chosen_class'] for x in z if not x['correct']]}
ctrl=summary['CTRL']; compact=summary['COMPACT_STATE_EVENT']; full=summary['FULL_EVENT']
decision='GO_PHASE1' if compact['correct']>ctrl['correct'] and compact['tokens']<full['tokens'] else 'NO_GO_OR_OPEN_ACTION_NEXT'
res={'status':'PHASE0B_CALIBRATION','decision':decision,'summary':summary,'rows':results}
AN.mkdir(exist_ok=True)
(AN/'PHASE0B_ANALYSIS.json').write_text(json.dumps(res,indent=2,ensure_ascii=False),encoding='utf-8')
lines=['# Phase 0b Analysis','',f'**Decision: {decision}**','', '| condition | correct | injected tokens |','|---|---:|---:|']
for c in CONDS: lines.append(f"| {c} | {summary[c]['correct']}/4 | {summary[c]['tokens']} |")
lines += ['','If CTRL=4/4 again, the forced-choice paradigm has a ceiling and the next calibration must use open-action generation.']
(AN/'PHASE0B_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('DECISION',decision)
print(json.dumps(summary,indent=2))
