from __future__ import annotations
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'phase0d'/'raw'
OUT=ROOT/'phase0d'/'analysis'
OUT.mkdir(parents=True,exist_ok=True)

RULES={
'H1_COST_ROUTE':{
 'required':[['local','csv','export'],['report','reconcil','variance']],
 'wrong':['request an exception','additional spend','paid connector','finance department']
},
'H2_MIGRATION_TOOL':{
 'required':[['script'],['import','migrat'],['integrity','verify','check']],
 'wrong':['repair the original','fix the original utility','refactor the migration utility']
},
'H3_PATCH_LOOP':{
 'required':[['confirm'],['committed','record','result'],['test','verify','check']],
 'wrong':['one-pixel','one pixel','continue preview','rebuild the preview','css cleanup']
},
'H4_AUTH_CHANGE':{
 'required':[['region a','one-region','pilot'],['marketing calendar','disable','hold','do not launch','remain disabled','remove references','only']],
 'wrong':['three-region','all three','launch b','launch c','finish b and c']
}
}

def extract(text):
    m=re.search(r'^NEXT_ACTION:\s*(.+)$',text,re.I|re.M)
    return m.group(1).strip() if m else ''

def score(sid,action):
    low=action.lower()
    rule=RULES[sid]
    if any(x in low for x in rule['wrong']):
        return 'WRONG'
    if all(any(k in low for k in grp) for grp in rule['required']):
        return 'CORRECT'
    return 'REVIEW'

files=sorted(RAW.glob('*.json'))
if len(files)!=16:
    raise SystemExit(f'incomplete {len(files)}/16')

rows=[]
for p in files:
    r=json.loads(p.read_text(encoding='utf-8'))
    a=extract(r.get('raw_text',''))
    rows.append({
      'run_id':r['run_id'],
      'scenario_id':r['scenario_id'],
      'condition_id':r['condition_id'],
      'action':a,
      'score':score(r['scenario_id'],a),
      'tokens':r.get('injected_tokens',0),
      'raw_text':r.get('raw_text','')
    })

summary={}
for c in ['CTRL','GOAL_EVENT','COMPACT_STATE_EVENT','FOCUS_GAP_EVENT']:
    z=[x for x in rows if x['condition_id']==c]
    summary[c]={
      'correct':sum(x['score']=='CORRECT' for x in z),
      'wrong':sum(x['score']=='WRONG' for x in z),
      'review':sum(x['score']=='REVIEW' for x in z),
      'tokens':sum(x['tokens'] for x in z)
    }

h3=next(x for x in rows if x['scenario_id']=='H3_PATCH_LOOP' and x['condition_id']=='FOCUS_GAP_EVENT')
h4=next(x for x in rows if x['scenario_id']=='H4_AUTH_CHANGE' and x['condition_id']=='FOCUS_GAP_EVENT')

decision='FOCUS_GAP_PROMISING' if (
    summary['FOCUS_GAP_EVENT']['correct']>summary['CTRL']['correct']
    and summary['FOCUS_GAP_EVENT']['correct']>summary['GOAL_EVENT']['correct']
    and h3['score']=='CORRECT'
    and h4['score']=='CORRECT'
    and summary['FOCUS_GAP_EVENT']['wrong']<=summary['COMPACT_STATE_EVENT']['wrong']
    and summary['FOCUS_GAP_EVENT']['tokens']<summary['COMPACT_STATE_EVENT']['tokens']
) else 'NO_GO_OR_REVISE'

res={'status':'PHASE0D_CALIBRATION','decision':decision,'summary':summary,'rows':rows}
(OUT/'PHASE0D_ANALYSIS.json').write_text(json.dumps(res,indent=2,ensure_ascii=False),encoding='utf-8')

lines=['# Phase 0d Analysis','',f'**Decision: {decision}**','',
'| condition | correct | wrong | review | injected tokens |',
'|---|---:|---:|---:|---:|']
for c,x in summary.items():
    lines.append(f"| {c} | {x['correct']} | {x['wrong']} | {x['review']} | {x['tokens']} |")
lines += ['','REVIEW outputs require inspection and are not silently counted as correct.']
(OUT/'PHASE0D_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')

print('PHASE0D_ANALYSIS',decision)
print(json.dumps(summary,indent=2))
