from __future__ import annotations
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
RAW=ROOT/'phase0c'/'raw_ctrl'; OUT=ROOT/'phase0c'/'analysis'; OUT.mkdir(parents=True,exist_ok=True)
fs=sorted(RAW.glob('*.json'))
if len(fs)!=5: raise SystemExit(f'incomplete {len(fs)}/5')
rows=[]
def contains_any(text,terms): return any(t in text for t in terms)
for p in fs:
 r=json.loads(p.read_text(encoding='utf-8')); txt=r['raw_text']; low=txt.lower()
 m=re.search(r'^NEXT_ACTION:\s*(.+)$',txt,re.I|re.M)
 action=(m.group(1).strip() if m else txt.splitlines()[0] if txt.splitlines() else '').lower()
 rub=r['rubric']
 req1=contains_any(action,rub['required_any'])
 req2=contains_any(low,rub['required_goal_any'])
 forbidden=contains_any(action,rub['forbidden_primary'])
 correct=bool(req1 and req2 and not forbidden)
 rows.append({'run_id':r['run_id'],'scenario_id':r['scenario_id'],'correct':correct,'required_action_signal':req1,'goal_signal':req2,'forbidden_action_signal':forbidden,'next_action':action,'raw_text':txt})
k=sum(x['correct'] for x in rows)
decision='HEADROOM_PASS' if k<=3 else ('BORDERLINE' if k==4 else 'CEILING_FAIL')
res={'status':'PHASE0C_CTRL_SCREEN','correct_n':k,'n':5,'decision':decision,'rows':rows}
(OUT/'PHASE0C_CTRL_ANALYSIS.json').write_text(json.dumps(res,indent=2),encoding='utf-8')
lines=['# Phase 0c Free-Response Control Screen','',f'**Decision: {decision}**','',f'- deterministic rubric correct: {k}/5','']
for x in rows: lines.append(f"- {x['scenario_id']}: {'CORRECT' if x['correct'] else 'FAIL'} — {x['next_action']}")
lines += ['','The rubric is frozen before outputs. Any plausible false negative requires a separate sensitivity note and does not change this screen post hoc.']
(OUT/'PHASE0C_CTRL_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PHASE0C_CTRL',k,'/5',decision)
