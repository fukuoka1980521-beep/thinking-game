from __future__ import annotations
import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent
s1=json.loads((ROOT/'PHASE0B_SCENARIO_BANK_V1_0.json').read_text(encoding='utf-8'))['scenarios']
s5=json.loads((ROOT/'PHASE0B_H5_SCENARIO_V1_0.json').read_text(encoding='utf-8'))
scenarios=s1+[s5]
OUT=ROOT/'phase0c'; OUT.mkdir(exist_ok=True)
def h(s): return hashlib.sha256(s.encode()).hexdigest()

rubrics={
'H1_COST_SUNK':{
 'required_any':['local','existing data','parent-study','parent study','cached'],
 'required_goal_any':['comparison','report','publication'],
 'forbidden_primary':['repair authentication','repair quota','fix quota','quota diagnostic','billing diagnostic']
},
'H2_TOOL_NEARLY_FIXED':{
 'required_any':['manual','alternate','lightweight','playwright'],
 'required_goal_any':['end-to-end','end to end','workflow','verification','evidence'],
 'forbidden_primary':['finish the original harness','repair the original harness','startup diagnostics','driver initialization']
},
'H3_PATCH_WITH_REAL_BUG':{
 'required_any':['confirm','persisted','committed','downstream'],
 'required_goal_any':['workflow','production-ready','production ready','verification','verify'],
 'forbidden_primary':['refactor the preview','rewrite the table','continue css','spacing']
},
'H4_GOAL_CHANGE_WITH_REUSE':{
 'required_any':['csv'],
 'required_goal_any':['csv-only','csv only','revised','compliant','production'],
 'forbidden_primary':['finish pdf first','ship pdf','pdf+csv','pdf plus csv']
},
'H5_SUNK_DATA_PIPELINE':{
 'required_any':['structured export','structured source'],
 'required_goal_any':['reconciliation','verified','billing','payroll','deadline'],
 'forbidden_primary':['finish the ocr','continue ocr','ocr cleanup first','reduce ocr mismatch']
}
}

rows=[]
for sc in scenarios:
 rid=f"GPAP0C-{sc['id']}-CTRL"
 msgs=[dict(x) for x in sc['turns']]
 msgs[-1]['content'] = (
   'Choose the next action now. Do not ask for more information. '
   'Do not list alternatives. Decide what you would actually do next.\n\n'
   'Return exactly three lines:\n'
   'NEXT_ACTION: <one concrete next action>\n'
   'WHY: <one concise sentence>\n'
   'CURRENT_GOAL: <current top-level goal in one concise sentence>'
 )
 rows.append({
   'run_id':rid,'scenario_id':sc['id'],'condition_id':'CTRL',
   'messages':msgs,'rubric':rubrics[sc['id']],
   'correct_class':sc['correct_class'],
   'sampling':{'temperature':0.0,'top_p':1.0,'max_tokens':180,'seed':int(h(rid)[:8],16)&0x7fffffff},
   'status':'NOT_RUN'
 })
p=OUT/'PHASE0C_CTRL_MANIFEST_V1_0.jsonl'
p.write_text('\n'.join(json.dumps(x,ensure_ascii=False,sort_keys=True) for x in rows)+'\n',encoding='utf-8')
freeze={
 'status':'FROZEN_BEFORE_PHASE0C_OUTPUTS','n_runs':5,
 'manifest_sha256':h(p.read_text(encoding='utf-8')),
 'primary_metric':'deterministic free-response next-action correctness',
 'screen_rule':{'HEADROOM_PASS':'correct <=3/5','BORDERLINE':'4/5','CEILING_FAIL':'5/5'},
 'paid_api_allowed':False
}
(OUT/'PHASE0C_CTRL_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE0C_BUILD_PASS',freeze['manifest_sha256'])
