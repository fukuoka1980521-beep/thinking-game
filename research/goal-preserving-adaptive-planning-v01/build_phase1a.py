from __future__ import annotations
import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent
S=json.loads((ROOT/'PHASE0B_SCENARIO_BANK_V1_0.json').read_text(encoding='utf-8'))['scenarios']
S.append(json.loads((ROOT/'PHASE0B_H5_SCENARIO_V1_0.json').read_text(encoding='utf-8')))
rub={}
for line in (ROOT/'phase0c'/'PHASE0C_CTRL_MANIFEST_V1_0.jsonl').read_text(encoding='utf-8').splitlines():
 if line.strip():
  r=json.loads(line); rub[r['scenario_id']]=r['rubric']
OUT=ROOT/'phase1a'; OUT.mkdir(exist_ok=True)
EVENT_POS={'H1_COST_SUNK':15,'H2_TOOL_NEARLY_FIXED':17,'H3_PATCH_WITH_REAL_BUG':21,'H4_GOAL_CHANGE_WITH_REUSE':15,'H5_SUNK_DATA_PIPELINE':21}
CONDS=['GOAL_EVENT','FULL_EVENT','STATE_EVENT']
def h(s): return hashlib.sha256(s.encode()).hexdigest()
def inject_text(sc,cond):
 goal=sc['goal_current']; done=sc['done_current']; cons=' | '.join(sc['constraints_initial'])
 if cond=='GOAL_EVENT':
  return f"[CURRENT GOAL] {goal}"
 if cond=='FULL_EVENT':
  return f"[CURRENT PROJECT BRIEF]\n[GOAL] {goal}\n[DONE] {done}\n[CONSTRAINT] {cons}"
 st=sc.get('state_event') or {'current':'OCR pipeline is 70% complete with 4% unresolved mismatch; a complete structured export can be adapted and reconciled in about one hour before the fixed deadline.','plan':'Switch to the structured export, reuse validated mappings, reconcile it, and deliver the verified dataset before the morning run.'}
 return (
  f"[GOAL STATE]\n[GOAL] {goal}\n[DONE] {done}\n[CONSTRAINT] {cons}\n"
  f"[CURRENT] {st['current']}\n[PLAN] {st['plan']}\n"
  "[REPLAN] If the current PLAN is blocked, inefficient, or contradicted by new facts, replace the PLAN while preserving a still-valid GOAL and DONE.\n"
  "[GOAL-CHANGE] Change GOAL only for an explicit authoritative change, impossibility, higher-priority constraint conflict, or evidence the old goal is wrong."
 )
rows=[]
for sc in S:
 for cond in CONDS:
  rid=f"GPAP1A-{sc['id']}-{cond}"
  msgs=[dict(x) for x in sc['turns']]
  pos=EVENT_POS[sc['id']]
  assert msgs[pos-1]['role']=='user'
  inj=inject_text(sc,cond)
  msgs[pos-1]['content'] += '\n\n'+inj
  msgs[-1]['content']=(
   'Choose the next action now. Do not ask for more information. '
   'Do not list alternatives. Decide what you would actually do next.\n\n'
   'Return exactly three lines:\n'
   'NEXT_ACTION: <one concrete next action>\n'
   'WHY: <one concise sentence>\n'
   'CURRENT_GOAL: <current top-level goal in one concise sentence>'
  )
  rows.append({
   'run_id':rid,'scenario_id':sc['id'],'condition_id':cond,'messages':msgs,
   'rubric':rub[sc['id']],'correct_class':sc['correct_class'],
   'injected_text':inj,'event_message_index':pos,
   'sampling':{'temperature':0.0,'top_p':1.0,'max_tokens':180,'seed':int(h(rid)[:8],16)&0x7fffffff},
   'status':'NOT_RUN'
  })
p=OUT/'PHASE1A_MANIFEST_V1_0.jsonl'
p.write_text('\n'.join(json.dumps(x,ensure_ascii=False,sort_keys=True) for x in rows)+'\n',encoding='utf-8')
freeze={'status':'FROZEN_BEFORE_PHASE1A_OUTPUTS','n_new_runs':15,'reused_ctrl_runs':5,'conditions':CONDS,'manifest_sha256':h(p.read_text(encoding='utf-8')),'ctrl_accuracy_frozen':'3/5','go_rule':'candidate accuracy >=4/5, H4 correct, H5 correct; highest accuracy then lowest injected tokens','paid_api_allowed':False}
(OUT/'PHASE1A_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE1A_BUILD_PASS',freeze['manifest_sha256'])
