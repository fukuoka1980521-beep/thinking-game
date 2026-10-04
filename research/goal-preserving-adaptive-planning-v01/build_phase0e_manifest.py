from __future__ import annotations
import json, hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parent
SRC=ROOT/'phase0d'/'PHASE0D_MANIFEST_V1_0.jsonl'
OUT=ROOT/'phase0e'
OUT.mkdir(exist_ok=True)

def h(s:str)->str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

src=[json.loads(x) for x in SRC.read_text(encoding='utf-8').splitlines() if x.strip()]
by={(r['scenario_id'],r['condition_id']):r for r in src}
rows=[]

for sid in ['H1_COST_ROUTE','H2_MIGRATION_TOOL','H3_PATCH_LOOP','H4_AUTH_CHANGE']:
    ctrl=json.loads(json.dumps(by[(sid,'CTRL')]))
    focus=json.loads(json.dumps(by[(sid,'FOCUS_GAP_EVENT')]))
    focus_text=focus['injected_text']

    for cond,base in [('CTRL',ctrl),('FOCUS_EVENT',focus)]:
        r=json.loads(json.dumps(base))
        r['run_id']='GPAP0E-'+sid+'-'+cond
        r['condition_id']=cond
        r['status']='NOT_RUN'
        r['sampling']['seed']=int(h(r['run_id'])[16:24],16)&0x7fffffff
        rows.append(r)

    late=json.loads(json.dumps(ctrl))
    late['run_id']='GPAP0E-'+sid+'-FOCUS_LATE'
    late['condition_id']='FOCUS_LATE'
    late['injected_text']=focus_text
    late['messages']=late['messages'][:-1]+[
        {'role':'user','content':focus_text},
        {'role':'assistant','content':'Noted.'},
        late['messages'][-1]
    ]
    late['status']='NOT_RUN'
    late['sampling']['seed']=int(h(late['run_id'])[16:24],16)&0x7fffffff
    rows.append(late)

    refresh=json.loads(json.dumps(focus))
    refresh['run_id']='GPAP0E-'+sid+'-FOCUS_REFRESH'
    refresh['condition_id']='FOCUS_REFRESH'
    refresh['messages']=refresh['messages'][:-1]+[
        {'role':'user','content':focus_text},
        {'role':'assistant','content':'Noted.'},
        refresh['messages'][-1]
    ]
    refresh['injected_text']=focus_text+'\n---REFRESH---\n'+focus_text
    refresh['status']='NOT_RUN'
    refresh['sampling']['seed']=int(h(refresh['run_id'])[16:24],16)&0x7fffffff
    rows.append(refresh)

assert len(rows)==16
manifest=OUT/'PHASE0E_MANIFEST_V1_0.jsonl'
text='\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n'
manifest.write_text(text,encoding='utf-8')
freeze={
 'status':'FROZEN_BEFORE_OUTPUTS',
 'n':16,
 'manifest_sha256':h(text),
 'source_manifest':'phase0d/PHASE0D_MANIFEST_V1_0.jsonl',
 'conditions':['CTRL','FOCUS_EVENT','FOCUS_LATE','FOCUS_REFRESH'],
 'treatment':'same Focus wording; timing only',
 'paid_api_allowed':False,
 'paid_compute_allowed':False
}
(OUT/'PHASE0E_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE0E_FREEZE',freeze['manifest_sha256'])
