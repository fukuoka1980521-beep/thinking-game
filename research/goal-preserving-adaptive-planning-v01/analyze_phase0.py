from __future__ import annotations
import json,re
from collections import Counter,defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'phase0'/'raw'
OUT=ROOT/'phase0'/'analysis'
OUT.mkdir(parents=True,exist_ok=True)
files=sorted(RAW.glob('*.json'))
if len(files)!=20:
    raise SystemExit(f'phase0 incomplete {len(files)}/20')

rows=[]
for p in files:
    r=json.loads(p.read_text(encoding='utf-8'))
    m=re.search(r'^DECISION:\s*([A-D])\s*$',r.get('raw_text',''),flags=re.I|re.M)
    letter=m.group(1).upper() if m else None
    chosen=r['letter_to_class'].get(letter) if letter else 'UNPARSEABLE'
    correct=chosen==r['correct_class']
    gm=re.search(r'^CURRENT_GOAL:\s*(.+)$',r.get('raw_text',''),flags=re.I|re.M)
    rows.append({
        'run_id':r['run_id'],'scenario_id':r['scenario_id'],'condition_id':r['condition_id'],
        'correct':correct,'chosen_class':chosen,'correct_class':r['correct_class'],
        'decision_letter':letter,'current_goal_text':gm.group(1).strip() if gm else None,
        'injected_tokens':r.get('injected_tokens',0),'elapsed_seconds':r.get('elapsed_seconds')
    })

conditions=['CTRL','GOAL10','FULL10','STATE10','STATE_EVENT']
scenarios=['S1_API_COST_BLOCK','S2_TEST_TOOL_FAILURE','S3_LOCAL_PATCH_LOOP','S4_LEGITIMATE_GOAL_CHANGE']
summary={}
for c in conditions:
    z=[r for r in rows if r['condition_id']==c]
    stable=[r for r in z if r['scenario_id']!='S4_LEGITIMATE_GOAL_CHANGE']
    s4=[r for r in z if r['scenario_id']=='S4_LEGITIMATE_GOAL_CHANGE'][0]
    summary[c]={
      'correct_n':sum(r['correct'] for r in z),'n':len(z),'accuracy':sum(r['correct'] for r in z)/len(z),
      'stable_correct_n':sum(r['correct'] for r in stable),'stable_n':3,
      's4_correct':s4['correct'],
      'failure_classes':dict(Counter(r['chosen_class'] for r in z if not r['correct'])),
      'injected_tokens':sum(r['injected_tokens'] for r in z),
      'scenario_results':{r['scenario_id']:{'correct':r['correct'],'chosen_class':r['chosen_class']} for r in z}
    }

ctrl=summary['CTRL']
full_tokens=summary['FULL10']['injected_tokens']
go_candidates={}
for c in ['STATE10','STATE_EVENT']:
    x=summary[c]
    stable_gain=sum(
      x['scenario_results'][s]['correct'] and not ctrl['scenario_results'][s]['correct']
      for s in scenarios[:3]
    )
    plan_rigidity=x['failure_classes'].get('PLAN_RIGIDITY',0)
    ctrl_plan=ctrl['failure_classes'].get('PLAN_RIGIDITY',0)
    gates={
      'beats_ctrl_on_at_least_2_stable_scenarios':stable_gain>=2,
      'handles_legitimate_goal_change':bool(x['s4_correct']),
      'no_more_plan_rigidity_than_ctrl':plan_rigidity<=ctrl_plan,
      'fewer_injected_tokens_than_full10':x['injected_tokens']<full_tokens
    }
    go_candidates[c]={'gates':gates,'go':all(gates.values()),'stable_gain_vs_ctrl':stable_gain}

decision='GO_PHASE1' if any(x['go'] for x in go_candidates.values()) else 'NO_GO_REVISE'
res={'status':'PHASE0_CALIBRATION','decision':decision,'summary':summary,'state_candidates':go_candidates,'rows':rows}
(OUT/'PHASE0_ANALYSIS.json').write_text(json.dumps(res,indent=2),encoding='utf-8')

lines=['# Goal-Preserving Adaptive Planning — Phase 0 Analysis','',f'**Decision: {decision}**','',
'| condition | correct | stable goals | legitimate goal change | injected tokens |',
'|---|---:|---:|---:|---:|']
for c in conditions:
    x=summary[c]
    lines.append(f"| {c} | {x['correct_n']}/4 | {x['stable_correct_n']}/3 | {'PASS' if x['s4_correct'] else 'FAIL'} | {x['injected_tokens']} |")
lines += ['','## State-condition gates','']
for c,x in go_candidates.items():
    lines.append(f"### {c}")
    for k,v in x['gates'].items():
        lines.append(f"- {'PASS' if v else 'FAIL'} — {k}")
    lines.append(f"- Overall: {'GO' if x['go'] else 'NO_GO'}")
    lines.append('')
lines += ['## Failure classes','']
for c in conditions:
    lines.append(f"- {c}: {summary[c]['failure_classes']}")
lines += ['','Phase 0 is mechanism/format calibration only. It does not establish frontier-model generalization.']
(OUT/'PHASE0_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PHASE0_ANALYSIS=PASS')
print('DECISION='+decision)
for c in conditions:
    print(c,summary[c]['correct_n'],'/4','tokens',summary[c]['injected_tokens'],summary[c]['failure_classes'])
