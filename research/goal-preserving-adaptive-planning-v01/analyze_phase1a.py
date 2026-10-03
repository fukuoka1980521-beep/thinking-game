from __future__ import annotations
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
CTRL=ROOT/'phase0c'/'raw_ctrl'; RAW=ROOT/'phase1a'/'raw'; OUT=ROOT/'phase1a'/'analysis'; OUT.mkdir(parents=True,exist_ok=True)
def contains_any(text,terms): return any(t in text for t in terms)
def score(r):
 txt=r['raw_text']; low=txt.lower(); m=re.search(r'^NEXT_ACTION:\s*(.+)$',txt,re.I|re.M); action=(m.group(1).strip() if m else txt.splitlines()[0] if txt.splitlines() else '').lower(); rub=r['rubric']
 return bool(contains_any(action,rub['required_any']) and contains_any(low,rub['required_goal_any']) and not contains_any(action,rub['forbidden_primary'])),action
rows=[]
for p in sorted(CTRL.glob('*.json')):
 r=json.loads(p.read_text(encoding='utf-8')); ok,action=score(r); rows.append({'scenario_id':r['scenario_id'],'condition_id':'CTRL','correct':ok,'action':action,'injected_tokens':0})
for p in sorted(RAW.glob('*.json')):
 r=json.loads(p.read_text(encoding='utf-8')); ok,action=score(r); rows.append({'scenario_id':r['scenario_id'],'condition_id':r['condition_id'],'correct':ok,'action':action,'injected_tokens':r.get('injected_tokens',0)})
conds=['CTRL','GOAL_EVENT','FULL_EVENT','STATE_EVENT']; summary={}
for c in conds:
 z=[x for x in rows if x['condition_id']==c]; sm={x['scenario_id']:x for x in z}
 summary[c]={'correct_n':sum(x['correct'] for x in z),'n':len(z),'accuracy':sum(x['correct'] for x in z)/len(z),'H4_correct':sm['H4_GOAL_CHANGE_WITH_REUSE']['correct'],'H5_correct':sm['H5_SUNK_DATA_PIPELINE']['correct'],'injected_tokens':sum(x['injected_tokens'] for x in z),'scenarios':sm}
eligible=[]
for c in conds[1:]:
 x=summary[c]
 if x['correct_n']>=4 and x['H4_correct'] and x['H5_correct'] and x['correct_n']>summary['CTRL']['correct_n']: eligible.append(c)
if eligible:
 eligible.sort(key=lambda c:(-summary[c]['correct_n'],summary[c]['injected_tokens']))
 winner=eligible[0]; decision='GO_TIMING_PHASE'
else:
 winner=None; decision='NO_GO_REVISE'
res={'status':'PHASE1A_CONTENT_CALIBRATION','decision':decision,'winner':winner,'eligible':eligible,'summary':summary,'rows':rows}
(OUT/'PHASE1A_ANALYSIS.json').write_text(json.dumps(res,indent=2),encoding='utf-8')
lines=['# Phase 1A Reinjection Content Calibration','',f'**Decision: {decision}**',f'**Winner: {winner}**','',
'| condition | correct | H4 goal-change | H5 plan-rigidity | injected tokens |',
'|---|---:|---:|---:|---:|']
for c in conds:
 x=summary[c]; lines.append(f"| {c} | {x['correct_n']}/5 | {'PASS' if x['H4_correct'] else 'FAIL'} | {'PASS' if x['H5_correct'] else 'FAIL'} | {x['injected_tokens']} |")
lines += ['','Eligible formats require >=4/5, H4 PASS, H5 PASS, and improvement over CTRL. Ties use lower injected-token overhead.']
(OUT/'PHASE1A_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PHASE1A',decision,'winner',winner)
for c in conds: print(c,summary[c]['correct_n'],'/5','tokens',summary[c]['injected_tokens'],'H4',summary[c]['H4_correct'],'H5',summary[c]['H5_correct'])
