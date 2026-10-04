from __future__ import annotations
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'phase1b'/'raw'
OUT=ROOT/'phase1b'/'analysis'
OUT.mkdir(parents=True,exist_ok=True)

def contains_any(text,terms):
    return any(t in text for t in terms)

def classify(r):
    txt=r.get('raw_text',''); low=txt.lower()
    m=re.search(r'^NEXT_ACTION:\s*(.+)$',txt,re.I|re.M)
    action=(m.group(1).strip() if m else (txt.splitlines()[0] if txt.splitlines() else '')).lower()
    rub=r['rubric']
    if contains_any(action,rub['forbidden_primary']): return 'WRONG',action
    if contains_any(action,rub['required_any']) and contains_any(low,rub['required_goal_any']): return 'CORRECT',action
    return 'REVIEW',action

files=sorted(RAW.glob('*.json'))
if len(files)!=54: raise SystemExit(f'incomplete {len(files)}/54')

rows=[]
for p in files:
    r=json.loads(p.read_text(encoding='utf-8')); status,action=classify(r)
    rows.append({
      'run_id':r['run_id'],'scenario_id':r['scenario_id'],'condition_id':r['condition_id'],
      'instrument_family':r['instrument_family'],'replicate':r['replicate'],
      'status':status,'action':action,'tokens':r.get('injected_tokens',0),'raw_text':r.get('raw_text','')
    })

conds=['CTRL','STATUS_LEDGER_LATE']
summary={}
for c in conds:
    z=[x for x in rows if x['condition_id']==c]
    summary[c]={
      'correct':sum(x['status']=='CORRECT' for x in z),
      'wrong':sum(x['status']=='WRONG' for x in z),
      'review':sum(x['status']=='REVIEW' for x in z),
      'n':len(z),
      'accuracy':sum(x['status']=='CORRECT' for x in z)/len(z),
      'wrong_rate':sum(x['status']=='WRONG' for x in z)/len(z),
      'tokens':sum(x['tokens'] for x in z),
      'mean_tokens':sum(x['tokens'] for x in z)/len(z)
    }

scenario_summary={}
for sid in sorted({x['scenario_id'] for x in rows}):
    scenario_summary[sid]={}
    for c in conds:
        z=[x for x in rows if x['scenario_id']==sid and x['condition_id']==c]
        scenario_summary[sid][c]={
          'correct':sum(x['status']=='CORRECT' for x in z),
          'wrong':sum(x['status']=='WRONG' for x in z),
          'review':sum(x['status']=='REVIEW' for x in z)
        }

wins=losses=ties=0
for sid in scenario_summary:
    for rep in [1,2,3]:
        a=next(x for x in rows if x['scenario_id']==sid and x['condition_id']=='CTRL' and x['replicate']==rep)
        b=next(x for x in rows if x['scenario_id']==sid and x['condition_id']=='STATUS_LEDGER_LATE' and x['replicate']==rep)
        ac=a['status']=='CORRECT'; bc=b['status']=='CORRECT'
        if bc and not ac:wins+=1
        elif ac and not bc:losses+=1
        else:ties+=1

goal_change=['H4_AUTH_CHANGE','H4_GOAL_CHANGE_WITH_REUSE']
critical=['H1_COST_ROUTE','H3_PATCH_LOOP','H1_COST_SUNK','H5_SUNK_DATA_PIPELINE']

gates={
 'accuracy_gain_ge_0_15':summary['STATUS_LEDGER_LATE']['accuracy']-summary['CTRL']['accuracy']>=0.15,
 'wrong_rate_not_higher':summary['STATUS_LEDGER_LATE']['wrong_rate']<=summary['CTRL']['wrong_rate'],
 'goal_change_each_ge_2_of_3':all(scenario_summary[s]['STATUS_LEDGER_LATE']['correct']>=2 for s in goal_change),
 'critical_each_ge_2_of_3':all(scenario_summary[s]['STATUS_LEDGER_LATE']['correct']>=2 for s in critical),
 'paired_wins_gt_losses':wins>losses,
 'mean_token_overhead_le_100':summary['STATUS_LEDGER_LATE']['mean_tokens']<=100
}
decision='ADOPT_LEDGER_LATE' if all(gates.values()) else 'PROMPT_ONLY_NO_GO_EXTERNAL_CONTROLLER'

res={
 'status':'PHASE1B_ROBUSTNESS_VALIDATION','decision':decision,
 'summary':summary,'scenario_summary':scenario_summary,
 'paired':{'wins':wins,'losses':losses,'ties':ties},
 'gates':gates,'rows':rows
}
(OUT/'PHASE1B_ANALYSIS.json').write_text(json.dumps(res,indent=2,ensure_ascii=False),encoding='utf-8')
lines=['# Phase 1B Work-State Ledger Robustness Validation','',f'**Decision: {decision}**','',
'| condition | correct | wrong | review | accuracy | mean injected tokens |',
'|---|---:|---:|---:|---:|---:|']
for c,x in summary.items():
    lines.append(f"| {c} | {x['correct']}/{x['n']} | {x['wrong']} | {x['review']} | {x['accuracy']:.3f} | {x['mean_tokens']:.1f} |")
lines += ['','## Paired result','',f'- wins={wins}, losses={losses}, ties={ties}','',
'## Gates','']
for k,v in gates.items(): lines.append(f"- {'PASS' if v else 'FAIL'} — {k}")
lines += ['','## Per-scenario ledger result','']
for sid,x in scenario_summary.items():
    l=x['STATUS_LEDGER_LATE']; c=x['CTRL']
    lines.append(f"- {sid}: CTRL {c['correct']}/3 correct; LEDGER {l['correct']}/3 correct")
(OUT/'PHASE1B_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PHASE1B_ANALYSIS',decision)
print(json.dumps(summary,indent=2))
print('PAIRED',wins,losses,ties)
print('GATES',gates)
