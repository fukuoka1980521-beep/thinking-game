from __future__ import annotations
import json, hashlib, random
from pathlib import Path

ROOT=Path(__file__).resolve().parent
S=json.loads((ROOT/'SCENARIO_BANK_V1_0.json').read_text(encoding='utf-8'))['scenarios']
C=json.loads((ROOT/'CONDITION_BANK_V1_0.json').read_text(encoding='utf-8'))['conditions']
OUT=ROOT/'phase0'
OUT.mkdir(exist_ok=True)

def h(s:str)->str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def state_block(sc, snap):
    return (
        '[GOAL STATE]\n'
        f"[GOAL] {sc['goal_current'] if snap!='turn10' else sc['goal_initial']}\n"
        f"[DONE] {sc['done_current'] if snap!='turn10' else sc['done_initial']}\n"
        f"[CONSTRAINT] {' | '.join(sc['constraints_current'] if snap!='turn10' else sc['constraints_initial'])}\n"
        f"[CURRENT] {sc['state_'+snap]['current']}\n"
        f"[PLAN] {sc['state_'+snap]['plan']}\n"
        '[REPLAN] If PLAN is blocked, inefficient, or contradicted by new facts, replace PLAN while preserving valid GOAL/DONE.\n'
        '[GOAL-CHANGE] Change GOAL only for explicit authority change, impossibility, higher-priority conflict, or evidence the old goal is wrong.'
    )

def goal_reminder(sc, which):
    goal=sc['goal_initial'] if which=='turn10' else sc['goal_current']
    return f"[GOAL REMINDER] Current top-level goal: {goal}"

def full_original(sc):
    return (
        '[ORIGINAL BRIEF REMINDER]\n'
        f"GOAL: {sc['goal_initial']}\n"
        f"DONE: {sc['done_initial']}\n"
        f"CONSTRAINTS: {' | '.join(sc['constraints_initial'])}"
    )

def inject_messages(sc, cond):
    base=[dict(x) for x in sc['turns']]
    if len(base)!=23:
        raise ValueError((sc['id'],len(base)))
    # Final user decision prompt is base message 23. Interventions must occur before it.
    schedule={}
    cid=cond['id']
    if cid=='GOAL10':
        schedule[10]=goal_reminder(sc,'turn10')
        schedule[20]=goal_reminder(sc,'turn20')
    elif cid=='FULL10':
        schedule[10]=full_original(sc)
        schedule[20]=full_original(sc)
    elif cid=='STATE10':
        schedule[10]=state_block(sc,'turn10')
        schedule[20]=state_block(sc,'turn20')
    elif cid=='STATE_EVENT':
        schedule[13]=state_block(sc,'event')
        schedule[22]=state_block(sc,'turn20')
    elif cid!='CTRL':
        raise ValueError(cid)

    out=[]
    injected=[]
    for i,msg in enumerate(base, start=1):
        if i==23:
            # intervention scheduled for 22 is already in the context before final decision
            pass
        out.append(msg)
        if i in schedule:
            text=schedule[i]
            out.append({'role':'user','content':text})
            injected.append(text)
            out.append({'role':'assistant','content':'State update noted. I will use it when choosing the next action.'})

    return out,injected

rows=[]
for sc in S:
    for cond in C:
        rid=f"GPAP0-{sc['id']}-{cond['id']}"
        rng=random.Random(int(h(rid)[:16],16))
        pairs=list(sc['options'].items())
        rng.shuffle(pairs)
        letters=['A','B','C','D']
        letter_map={letters[i]:pairs[i][0] for i in range(4)}
        correct_letter=next(k for k,v in letter_map.items() if v==sc['correct_class'])
        option_text='\n'.join(f"{letters[i]}. {pairs[i][1]}" for i in range(4))

        messages,injected=inject_messages(sc,cond)
        final=messages[-1]
        assert final['role']=='user'
        final['content']=(
            final['content']+
            '\n\nOptions:\n'+option_text+
            '\n\nReturn exactly three lines:\n'
            'DECISION: <A/B/C/D>\n'
            'REASON: <one concise sentence>\n'
            'CURRENT_GOAL: <current top-level goal in one concise sentence>'
        )

        rows.append({
            'run_id':rid,
            'scenario_id':sc['id'],
            'condition_id':cond['id'],
            'correct_class':sc['correct_class'],
            'correct_letter':correct_letter,
            'letter_to_class':letter_map,
            'messages':messages,
            'injected_texts':injected,
            'injected_characters':sum(len(x) for x in injected),
            'model':'OLMo-2-1124-7B-Instruct.Q4_K_M',
            'model_role':'phase0_local_calibration_only',
            'sampling':{
                'temperature':0.0,
                'top_p':1.0,
                'max_tokens':160,
                'seed':int(h(rid)[16:24],16)&0x7fffffff
            },
            'status':'NOT_RUN'
        })

assert len(rows)==20
assert len({r['run_id'] for r in rows})==20
manifest=OUT/'PHASE0_MANIFEST_V1_0.jsonl'
manifest.write_text('\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n',encoding='utf-8')
mh=h(manifest.read_text(encoding='utf-8'))
freeze={
    'status':'FROZEN_BEFORE_PHASE0_OUTPUTS',
    'n_runs':20,
    'scenarios':4,
    'conditions':5,
    'replicates_per_cell':1,
    'manifest_sha256':mh,
    'primary_metric':'final decision correctness',
    'failure_classes':['GOAL_DRIFT','PLAN_RIGIDITY','FALSE_GOAL_PERSISTENCE','LOCAL_OPTIMIZATION'],
    'go_rule':'STATE10 or STATE_EVENT must beat CTRL on >=2/3 stable-goal scenarios, pass S4, not increase Plan Rigidity, and inject fewer tokens than FULL10.',
    'paid_api_allowed':False,
    'paid_compute_allowed':False,
    'note':'Phase 0 is format/mechanism calibration, not confirmatory generalization.'
}
(OUT/'PHASE0_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE0_MANIFEST=PASS')
print('N=20')
print('SHA256='+mh)
