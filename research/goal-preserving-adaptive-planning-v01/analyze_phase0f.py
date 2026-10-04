from __future__ import annotations
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'phase0f'/'raw'
OUT=ROOT/'phase0f'/'analysis'
OUT.mkdir(parents=True,exist_ok=True)

RULES={
'H1_COST_ROUTE':{'required':[['local','csv','export'],['report','reconcil','variance']],'wrong':['request an exception','additional spend','paid connector','finance department']},
'H2_MIGRATION_TOOL':{'required':[['script'],['import','migrat'],['integrity','verify','check']],'wrong':['repair the original','fix the original utility','refactor the migration utility','custom decoder']},
'H3_PATCH_LOOP':{'required':[['confirm'],['committed','record','result'],['test','verify','check']],'wrong':['one-pixel','one pixel','continue preview','rebuild the preview','css cleanup','css']},
'H4_AUTH_CHANGE':{'required':[['region a','one-region','pilot'],['marketing calendar','disable','hold','do not launch','remain disabled','remove references','only']],'wrong':['three-region','all three','launch b','launch c','finish b and c']}
}

def extract(text):
    m=re.search(r'^NEXT_ACTION:\s*(.+)$',text,re.I|re.M)
    return m.group(1).strip() if m else ''

def score(sid,action):
    low=action.lower(); rule=RULES[sid]
    if any(x in low for x in rule['wrong']): return 'WRONG'
    if all(any(k in low for k in grp) for grp in rule['required']): return 'CORRECT'
    return 'REVIEW'

files=sorted(RAW.glob('*.json'))
if len(files)!=16: raise SystemExit(f'incomplete {len(files)}/16')
rows=[]
for p in files:
    r=json.loads(p.read_text(encoding='utf-8')); a=extract(r.get('raw_text',''))
    rows.append({'run_id':r['run_id'],'scenario_id':r['scenario_id'],'condition_id':r['condition_id'],'action':a,'score':score(r['scenario_id'],a),'tokens':r.get('injected_tokens',0),'raw_text':r.get('raw_text','')})

conds=['CTRL','STATUS_LEDGER_EVENT','STATUS_LEDGER_LATE','STATUS_LEDGER_REFRESH']
summary={}
for c in conds:
    z=[x for x in rows if x['condition_id']==c]
    summary[c]={'correct':sum(x['score']=='CORRECT' for x in z),'wrong':sum(x['score']=='WRONG' for x in z),'review':sum(x['score']=='REVIEW' for x in z),'tokens':sum(x['tokens'] for x in z)}

def cell(sid,c):
    return next(x for x in rows if x['scenario_id']==sid and x['condition_id']==c)

promising=[]
for c in conds[1:]:
    if (
      cell('H2_MIGRATION_TOOL',c)['score']=='CORRECT'
      and cell('H3_PATCH_LOOP',c)['score']=='CORRECT'
      and cell('H4_AUTH_CHANGE',c)['score']=='CORRECT'
      and summary[c]['wrong']<summary['CTRL']['wrong']
    ):
        promising.append(c)

decision='LEDGER_PROMISING' if len(promising)>=2 else 'PROMPT_ONLY_NO_GO_EXTERNAL_CONTROLLER'
res={'status':'PHASE0F_WORK_STATE_CALIBRATION','decision':decision,'promising':promising,'summary':summary,'rows':rows}
(OUT/'PHASE0F_ANALYSIS.json').write_text(json.dumps(res,indent=2,ensure_ascii=False),encoding='utf-8')
lines=['# Phase 0f Work-State Ledger Analysis','',f'**Decision: {decision}**','',
'| condition | correct | wrong | review | injected tokens |',
'|---|---:|---:|---:|---:|']
for c,x in summary.items(): lines.append(f"| {c} | {x['correct']} | {x['wrong']} | {x['review']} | {x['tokens']} |")
lines += ['','Promising ledger timings: '+(', '.join(promising) if promising else 'none'),
'','If decision is PROMPT_ONLY_NO_GO_EXTERNAL_CONTROLLER, stop prompt-only mitigation and move to a validator/controller that rejects CLOSED/RETIRED actions.']
(OUT/'PHASE0F_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PHASE0F_ANALYSIS',decision)
print(json.dumps(summary,indent=2))
