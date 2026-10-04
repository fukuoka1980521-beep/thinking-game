from __future__ import annotations
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'phase1b'/'raw'
OUT=ROOT/'phase2_controller'
OUT.mkdir(exist_ok=True)

def parse_ledger(text):
    out={}
    for key in ['OPEN','CLOSED','RETIRED','VALID_ROUTE']:
        m=re.search(rf'^{key}:\s*(.+)$',text,re.I|re.M)
        out[key]=m.group(1).strip() if m else ''
    return out

def extract_action(text):
    m=re.search(r'^NEXT_ACTION:\s*(.+)$',text,re.I|re.M)
    return m.group(1).strip() if m else ''

def synthesize(ledger):
    open_work=ledger.get('OPEN','').strip().rstrip('.')
    route=ledger.get('VALID_ROUTE','').strip().rstrip('.')
    if route and open_work:
        return f"Use {route} to {open_work}."
    if open_work:
        return f"Proceed with OPEN work: {open_work}."
    return ''

def overlap(a,b):
    toks=lambda s:{x for x in re.findall(r'[a-z0-9]+',s.lower()) if len(x)>=4}
    A=toks(a); B=toks(b)
    return len(A&B)

def controller_decision(r):
    ledger=parse_ledger(r.get('injected_text',''))
    action=extract_action(r.get('raw_text',''))
    if not ledger.get('OPEN'):
        return {'mode':'NO_LEDGER','action':action,'ledger':ledger}

    closed=ledger.get('CLOSED','')
    retired=ledger.get('RETIRED','')
    route=ledger.get('VALID_ROUTE','')
    open_work=ledger.get('OPEN','')

    # If the action clearly overlaps retired/closed state more than OPEN, reject it.
    bad=max(overlap(action,closed),overlap(action,retired))
    good=overlap(action,open_work)
    route_overlap=overlap(action,route)

    if bad>good and bad>0:
        return {'mode':'REWRITE_RETIRED_OR_CLOSED','action':synthesize(ledger),'original_action':action,'ledger':ledger}
    if good>0 and (not route or route_overlap>0):
        return {'mode':'ACCEPT','action':action,'original_action':action,'ledger':ledger}
    if good>0 and route and route_overlap==0:
        return {'mode':'GROUND_VALID_ROUTE','action':synthesize(ledger),'original_action':action,'ledger':ledger}

    return {'mode':'REWRITE_TO_OPEN','action':synthesize(ledger),'original_action':action,'ledger':ledger}

def rubric_classify(r,action):
    low=action.lower()
    rub=r['rubric']
    if any(t in low for t in rub['forbidden_primary']):
        return 'WRONG'
    if any(t in low for t in rub['required_any']) and any(t in low for t in rub['required_goal_any']):
        return 'CORRECT'
    return 'REVIEW'

files=sorted(RAW.glob('*.json'))
ledger_files=[]
for p in files:
    r=json.loads(p.read_text(encoding='utf-8'))
    if r.get('condition_id')!='STATUS_LEDGER_LATE':
        continue
    ctl=controller_decision(r)
    before=rubric_classify(r,extract_action(r.get('raw_text','')))
    after=rubric_classify(r,ctl['action'])
    ledger_files.append({
        'run_id':r['run_id'],
        'scenario_id':r['scenario_id'],
        'replicate':r['replicate'],
        'before':before,
        'after':after,
        'controller_mode':ctl['mode'],
        'original_action':ctl.get('original_action',extract_action(r.get('raw_text',''))),
        'controller_action':ctl['action'],
        'ledger':ctl['ledger']
    })

summary={
    'n':len(ledger_files),
    'before':{
        'correct':sum(x['before']=='CORRECT' for x in ledger_files),
        'wrong':sum(x['before']=='WRONG' for x in ledger_files),
        'review':sum(x['before']=='REVIEW' for x in ledger_files),
    },
    'after':{
        'correct':sum(x['after']=='CORRECT' for x in ledger_files),
        'wrong':sum(x['after']=='WRONG' for x in ledger_files),
        'review':sum(x['after']=='REVIEW' for x in ledger_files),
    },
    'modes':{}
}
for x in ledger_files:
    summary['modes'][x['controller_mode']]=summary['modes'].get(x['controller_mode'],0)+1

per_scenario={}
for sid in sorted({x['scenario_id'] for x in ledger_files}):
    z=[x for x in ledger_files if x['scenario_id']==sid]
    per_scenario[sid]={
        'before_correct':sum(x['before']=='CORRECT' for x in z),
        'after_correct':sum(x['after']=='CORRECT' for x in z),
        'n':len(z)
    }

result={'status':'POSTHOC_EXTERNAL_CONTROLLER_SIMULATION','summary':summary,'per_scenario':per_scenario,'rows':ledger_files}
(OUT/'PHASE2_CONTROLLER_SIMULATION.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')

lines=['# Phase 2 External Controller Simulation','',
'Uses only already-generated Phase 1b ledger outputs. No new model generation.','',
'| metric | before controller | after controller |',
'|---|---:|---:|',
f"| correct | {summary['before']['correct']}/{summary['n']} | {summary['after']['correct']}/{summary['n']} |",
f"| wrong | {summary['before']['wrong']} | {summary['after']['wrong']} |",
f"| review | {summary['before']['review']} | {summary['after']['review']} |",
'',
'## Controller modes','']
for k,v in sorted(summary['modes'].items()): lines.append(f'- {k}: {v}')
lines += ['','## Per scenario','']
for sid,x in per_scenario.items():
    lines.append(f"- {sid}: {x['before_correct']}/{x['n']} -> {x['after_correct']}/{x['n']}")
(OUT/'PHASE2_CONTROLLER_SIMULATION.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps(result['summary'],indent=2))
for sid,x in per_scenario.items(): print(sid,x)
