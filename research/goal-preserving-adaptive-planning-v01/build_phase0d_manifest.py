from __future__ import annotations
import json, hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parent
SRC=ROOT/'phase0c'/'PHASE0C_MANIFEST_V1_0.jsonl'
OUT=ROOT/'phase0d'
OUT.mkdir(exist_ok=True)

FOCUS={
'H1_COST_ROUTE':'[FOCUS] Target=audited monthly variance report by Friday; Gap=reconcile remaining rows and produce a reviewable report; Block=no extra spend, paid connector unavailable, local CSV export available.\n[NEXT] Close Gap. Drop blocked means and work already inside acceptance tolerance.',
'H2_MIGRATION_TOOL':'[FOCUS] Target=migrate all active customer records with field integrity; Gap=migrate legacy-format records and verify integrity; Block=original utility corrupts the oldest legacy field, scripted import passed its sample.\n[NEXT] Close Gap. Drop blocked means and work already inside acceptance tolerance.',
'H3_PATCH_LOOP':'[FOCUS] Target=release the import-preview-confirm workflow after functional acceptance; Gap=test confirm and verify the committed result; Block=the one-pixel preview difference is already within acceptance tolerance.\n[NEXT] Close Gap. Drop blocked means and work already inside acceptance tolerance.',
'H4_AUTH_CHANGE':'[FOCUS] Target=one-region Region A pilot, with Regions B and C not launched; Gap=align rollout and monitoring with the Region A pilot; Block=the steering committee replaced the old three-region goal.\n[NEXT] Close Gap. Drop blocked means and work already inside acceptance tolerance.'
}

def h(s:str)->str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

src=[json.loads(x) for x in SRC.read_text(encoding='utf-8').splitlines() if x.strip()]
by={(r['scenario_id'],r['condition_id']):r for r in src}
rows=[]

for sid in ['H1_COST_ROUTE','H2_MIGRATION_TOOL','H3_PATCH_LOOP','H4_AUTH_CHANGE']:
    for cond in ['CTRL','GOAL_EVENT','COMPACT_STATE_EVENT']:
        r=json.loads(json.dumps(by[(sid,cond)]))
        r['run_id']=r['run_id'].replace('GPAP0C-','GPAP0D-')
        r['status']='NOT_RUN'
        r['sampling']['seed']=int(h(r['run_id'])[16:24],16)&0x7fffffff
        rows.append(r)

    base=json.loads(json.dumps(by[(sid,'COMPACT_STATE_EVENT')]))
    old=base.get('injected_text','')
    new=FOCUS[sid]
    replaced=False
    for m in base['messages']:
        if m.get('role')=='user' and m.get('content')==old:
            m['content']=new
            replaced=True
            break
    if not replaced:
        raise RuntimeError('injection point not found: '+sid)
    base['run_id']='GPAP0D-'+sid+'-FOCUS_GAP_EVENT'
    base['condition_id']='FOCUS_GAP_EVENT'
    base['injected_text']=new
    base['status']='NOT_RUN'
    base['sampling']['seed']=int(h(base['run_id'])[16:24],16)&0x7fffffff
    rows.append(base)

assert len(rows)==16
manifest=OUT/'PHASE0D_MANIFEST_V1_0.jsonl'
text='\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n'
manifest.write_text(text,encoding='utf-8')
freeze={
 'status':'FROZEN_BEFORE_OUTPUTS',
 'n':16,
 'manifest_sha256':h(text),
 'source_manifest':'phase0c/PHASE0C_MANIFEST_V1_0.jsonl',
 'conditions':['CTRL','GOAL_EVENT','COMPACT_STATE_EVENT','FOCUS_GAP_EVENT'],
 'primary':'open next-action correctness',
 'paid_api_allowed':False,
 'paid_compute_allowed':False
}
(OUT/'PHASE0D_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE0D_FREEZE',freeze['manifest_sha256'])
