from __future__ import annotations
import json, hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parent
SRC=ROOT/'phase0e'/'PHASE0E_MANIFEST_V1_0.jsonl'
OUT=ROOT/'phase0f'
OUT.mkdir(exist_ok=True)

LEDGER={
'H1_COST_ROUTE':"""[WORK STATE]
OPEN: reconcile remaining rows; produce the reviewable Friday report.
CLOSED: quota diagnosis.
RETIRED: paid connector this week; additional spend is prohibited.
VALID_ROUTE: local CSV export.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state.""",
'H2_MIGRATION_TOOL':"""[WORK STATE]
OPEN: migrate oldest-format records; verify field integrity.
CLOSED: scripted-import sample passed.
RETIRED: original utility for the oldest legacy format because it corrupts that field.
VALID_ROUTE: scripted import.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state.""",
'H3_PATCH_LOOP':"""[WORK STATE]
OPEN: test confirm; verify the committed result.
CLOSED: import passes; preview alignment is accepted within tolerance.
RETIRED: further preview/CSS polishing before functional acceptance.
VALID_ROUTE: confirm and committed-result verification.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state.""",
'H4_AUTH_CHANGE':"""[WORK STATE]
OPEN: align Region A pilot and monitoring; keep Regions B and C disabled.
CLOSED: Region A technical readiness.
RETIRED: old three-region rollout objective and B/C launch until approvals.
VALID_ROUTE: Region A pilot only.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state."""
}

def h(s:str)->str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

src=[json.loads(x) for x in SRC.read_text(encoding='utf-8').splitlines() if x.strip()]
by={(r['scenario_id'],r['condition_id']):r for r in src}
rows=[]

for sid in ['H1_COST_ROUTE','H2_MIGRATION_TOOL','H3_PATCH_LOOP','H4_AUTH_CHANGE']:
    focus_text=by[(sid,'FOCUS_EVENT')]['injected_text']
    ledger=LEDGER[sid]

    ctrl=json.loads(json.dumps(by[(sid,'CTRL')]))
    ctrl['run_id']='GPAP0F-'+sid+'-CTRL'
    ctrl['condition_id']='CTRL'
    ctrl['status']='NOT_RUN'
    ctrl['sampling']['seed']=int(h(ctrl['run_id'])[16:24],16)&0x7fffffff
    rows.append(ctrl)

    event=json.loads(json.dumps(by[(sid,'FOCUS_EVENT')]))
    event['run_id']='GPAP0F-'+sid+'-STATUS_LEDGER_EVENT'
    event['condition_id']='STATUS_LEDGER_EVENT'
    for m in event['messages']:
        if m.get('role')=='user' and m.get('content')==focus_text:
            m['content']=ledger
            break
    event['injected_text']=ledger
    event['status']='NOT_RUN'
    event['sampling']['seed']=int(h(event['run_id'])[16:24],16)&0x7fffffff
    rows.append(event)

    late=json.loads(json.dumps(by[(sid,'FOCUS_LATE')]))
    late['run_id']='GPAP0F-'+sid+'-STATUS_LEDGER_LATE'
    late['condition_id']='STATUS_LEDGER_LATE'
    for m in late['messages']:
        if m.get('role')=='user' and m.get('content')==focus_text:
            m['content']=ledger
            break
    late['injected_text']=ledger
    late['status']='NOT_RUN'
    late['sampling']['seed']=int(h(late['run_id'])[16:24],16)&0x7fffffff
    rows.append(late)

    refresh=json.loads(json.dumps(by[(sid,'FOCUS_REFRESH')]))
    refresh['run_id']='GPAP0F-'+sid+'-STATUS_LEDGER_REFRESH'
    refresh['condition_id']='STATUS_LEDGER_REFRESH'
    for m in refresh['messages']:
        if m.get('role')=='user' and m.get('content')==focus_text:
            m['content']=ledger
    refresh['injected_text']=ledger+'\n---REFRESH---\n'+ledger
    refresh['status']='NOT_RUN'
    refresh['sampling']['seed']=int(h(refresh['run_id'])[16:24],16)&0x7fffffff
    rows.append(refresh)

assert len(rows)==16
manifest=OUT/'PHASE0F_MANIFEST_V1_0.jsonl'
text='\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n'
manifest.write_text(text,encoding='utf-8')
freeze={
 'status':'FROZEN_BEFORE_OUTPUTS',
 'n':16,
 'manifest_sha256':h(text),
 'source_manifest':'phase0e/PHASE0E_MANIFEST_V1_0.jsonl',
 'conditions':['CTRL','STATUS_LEDGER_EVENT','STATUS_LEDGER_LATE','STATUS_LEDGER_REFRESH'],
 'treatment':'OPEN/CLOSED/RETIRED work-state ledger',
 'prompt_only_final_phase':True,
 'paid_api_allowed':False,
 'paid_compute_allowed':False
}
(OUT/'PHASE0F_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE0F_FREEZE',freeze['manifest_sha256'])
