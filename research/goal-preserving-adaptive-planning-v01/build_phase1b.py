from __future__ import annotations
import json, hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'phase1b'
OUT.mkdir(exist_ok=True)

CURRENT=ROOT/'phase0f'/'PHASE0F_MANIFEST_V1_0.jsonl'
LEGACY_CTRL=ROOT/'phase0c'/'PHASE0C_CTRL_MANIFEST_V1_0.jsonl'
BANK=ROOT/'PHASE0B_SCENARIO_BANK_V1_0.json'
H5=ROOT/'PHASE0B_H5_SCENARIO_V1_0.json'

def h(s:str)->str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

current=[json.loads(x) for x in CURRENT.read_text(encoding='utf-8').splitlines() if x.strip()]
cur_by={(r['scenario_id'],r['condition_id']):r for r in current}
legacy_ctrl=[json.loads(x) for x in LEGACY_CTRL.read_text(encoding='utf-8').splitlines() if x.strip()]
leg_by={r['scenario_id']:r for r in legacy_ctrl}

scenarios=json.loads(BANK.read_text(encoding='utf-8'))['scenarios']
scenarios.append(json.loads(H5.read_text(encoding='utf-8')))
sc_by={s['id']:s for s in scenarios}

CURRENT_RUBRICS={
'H1_COST_ROUTE':{
 'required_any':['local','csv','export'],
 'required_goal_any':['report','reconcil','variance'],
 'forbidden_primary':['request an exception','additional spend','paid connector','finance department']
},
'H2_MIGRATION_TOOL':{
 'required_any':['script','scripted'],
 'required_goal_any':['integrity','migrat','import','verify'],
 'forbidden_primary':['repair the original','fix the original utility','refactor the migration utility','original utility']
},
'H3_PATCH_LOOP':{
 'required_any':['confirm'],
 'required_goal_any':['committed','result','verify','test'],
 'forbidden_primary':['one-pixel','one pixel','continue preview','rebuild the preview','css cleanup','css']
},
'H4_AUTH_CHANGE':{
 'required_any':['region a','one-region','pilot'],
 'required_goal_any':['region','pilot','disabled','marketing'],
 'forbidden_primary':['three-region','all three','launch b','launch c','finish b and c']
}
}

LEGACY_LEDGER={
'H1_COST_SUNK':"""[WORK STATE]
OPEN: finish the defensible cross-model comparison using allowed available evidence.
CLOSED: valid cached cloud result and normalized parent-study data are reusable evidence.
RETIRED: new paid calls and further cloud authentication/quota repair for this project.
VALID_ROUTE: parent-study data, valid cached output, and local model evidence with an explicit caveat.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state.""",
'H2_TOOL_NEARLY_FIXED':"""[WORK STATE]
OPEN: collect trustworthy end-to-end release evidence from a route that reaches the real application.
CLOSED: startup repair history is preserved; manual and lightweight routes already reach the application.
RETIRED: further original-harness repair before the release decision.
VALID_ROUTE: manual browser or lightweight script plus confirm and persisted-result evidence.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state.""",
'H3_PATCH_WITH_REAL_BUG':"""[WORK STATE]
OPEN: test confirm and verify the persisted result.
CLOSED: functional preview corruption is fixed; remaining padding is within accepted cosmetic tolerance.
RETIRED: further preview/CSS refactoring before downstream functional verification.
VALID_ROUTE: confirm and persisted-result verification.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state.""",
'H4_GOAL_CHANGE_WITH_REUSE':"""[WORK STATE]
OPEN: finish the required CSV audit field and ship the compliant CSV-only release.
CLOSED: useful PDF code may be preserved outside production for future reuse.
RETIRED: old PDF+CSV production objective and finishing PDF as release work.
VALID_ROUTE: CSV-only production release.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state.""",
'H5_SUNK_DATA_PIPELINE':"""[WORK STATE]
OPEN: adapt the structured export and reconcile the complete dataset before the morning deadline.
CLOSED: validated mappings from OCR work may be reused.
RETIRED: finishing the OCR/manual pipeline as the primary route.
VALID_ROUTE: structured export plus reused mappings and reconciliation.
[NEXT] Choose only OPEN work. Do not act on CLOSED or RETIRED items unless new evidence changes their state."""
}

rows=[]

for sid in ['H1_COST_ROUTE','H2_MIGRATION_TOOL','H3_PATCH_LOOP','H4_AUTH_CHANGE']:
    for cond in ['CTRL','STATUS_LEDGER_LATE']:
        base=json.loads(json.dumps(cur_by[(sid,cond)]))
        for rep in range(1,4):
            r=json.loads(json.dumps(base))
            r['run_id']=f'GPAP1B-CURRENT-{sid}-{cond}-R{rep:02d}'
            r['condition_id']=cond
            r['instrument_family']='CURRENT4'
            r['replicate']=rep
            r['rubric']=CURRENT_RUBRICS[sid]
            r['status']='NOT_RUN'
            r['sampling']={'temperature':0.7,'top_p':0.95,'max_tokens':180,'seed':int(h(r['run_id'])[:8],16)&0x7fffffff}
            rows.append(r)

for sid in ['H1_COST_SUNK','H2_TOOL_NEARLY_FIXED','H3_PATCH_WITH_REAL_BUG','H4_GOAL_CHANGE_WITH_REUSE','H5_SUNK_DATA_PIPELINE']:
    ctrl=json.loads(json.dumps(leg_by[sid]))
    sc=sc_by[sid]
    for cond in ['CTRL','STATUS_LEDGER_LATE']:
        base=json.loads(json.dumps(ctrl))
        if cond=='STATUS_LEDGER_LATE':
            ledger=LEGACY_LEDGER[sid]
            base['messages']=base['messages'][:-1]+[
                {'role':'user','content':ledger},
                {'role':'assistant','content':'Noted.'},
                base['messages'][-1]
            ]
            base['injected_text']=ledger
        else:
            base['injected_text']=''
        for rep in range(1,4):
            r=json.loads(json.dumps(base))
            r['run_id']=f'GPAP1B-LEGACY-{sid}-{cond}-R{rep:02d}'
            r['condition_id']=cond
            r['instrument_family']='LEGACY5'
            r['replicate']=rep
            r['status']='NOT_RUN'
            r['sampling']={'temperature':0.7,'top_p':0.95,'max_tokens':180,'seed':int(h(r['run_id'])[:8],16)&0x7fffffff}
            rows.append(r)

assert len(rows)==54
assert len({r['run_id'] for r in rows})==54

manifest=OUT/'PHASE1B_MANIFEST_V1_0.jsonl'
text='\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n'
manifest.write_text(text,encoding='utf-8')
freeze={
 'status':'FROZEN_BEFORE_PHASE1B_OUTPUTS',
 'n_runs':54,
 'scenarios':9,
 'conditions':['CTRL','STATUS_LEDGER_LATE'],
 'replicates_per_cell':3,
 'temperature':0.7,
 'top_p':0.95,
 'manifest_sha256':h(text),
 'primary':'next-action correctness',
 'go_rule':'ledger improves accuracy by >=0.15, no higher wrong rate, goal-change and critical sunk/rigidity scenarios >=2/3, paired wins>losses, mean ledger overhead<=100 tokens',
 'paid_api_allowed':False,
 'paid_compute_allowed':False
}
(OUT/'PHASE1B_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE1B_FREEZE',freeze['manifest_sha256'])
