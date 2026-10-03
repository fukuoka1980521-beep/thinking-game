from __future__ import annotations
import json, sys
from collections import defaultdict
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
PARENT = HERE.parent / 'methodological-framing-v01'
sys.path.insert(0, str(PARENT))
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as m

SEED=20261003
REPS=6
KS=[3,6,12,18]
CHANCE=1/7

def load_rows(path, task_filter=None):
    rows=[]
    for p in sorted(path.glob('*.json')):
        r=json.loads(p.read_text(encoding='utf-8'))
        if r.get('instruction_depth')!='LABEL_ONLY':
            continue
        if task_filter and r['task_id'] not in task_filter:
            continue
        rows.append({'id':r['run_id'],'task_id':r['task_id'],'condition':r['method_family'],'text':r['raw_text']})
    return rows

def sample_task(rows, task, k, rng):
    out=[]
    for fam in m.CONDITIONS:
        z=[r for r in rows if r['task_id']==task and r['condition']==fam]
        idx=rng.choice(len(z),size=k,replace=False)
        out.extend(z[int(i)] for i in idx)
    return sorted(out,key=lambda x:x['id'])
def direction(train,test):
    tt,xt,labels=m.prepare_direction(train,test)
    truth=np.array([m.CONDITIONS.index(r['condition']) for r in test],dtype=np.int16)
    pred,_=m.predict(tt,xt,labels)
    return float(np.mean(pred==truth))

def eval_source(rows,tasks,name):
    rng=np.random.default_rng(SEED+sum(map(ord,name)))
    result={}
    for k in KS:
        vals=[]; both=[]
        for _ in range(REPS):
            a=sample_task(rows,tasks[0],k,rng)
            b=sample_task(rows,tasks[1],k,rng)
            x=direction(a,b); y=direction(b,a)
            vals.append((x+y)/2)
            both.append(x>CHANCE and y>CHANCE)
        ar=np.array(vals)
        result[str(k)]={
            'k_per_family_per_task':k,
            'total_outputs_for_two_tasks':14*k,
            'mean_accuracy':float(ar.mean()),
            'median_accuracy':float(np.median(ar)),
            'p10':float(np.quantile(ar,.10)),
            'p90':float(np.quantile(ar,.90)),
            'fraction_both_directions_above_chance':float(np.mean(both)),
            'repetitions':REPS,
        }
    return result

def main():
    study=load_rows(PARENT/'study_a'/'raw',{'T1','T2'})
    r1b=load_rows(PARENT/'replication_r1b'/'raw',{'T1','T2'})
    out={
      'status':'ZERO_COST_PILOT_SIZING_PROXY',
      'warning':'Uses existing Study A/R1b behavior as a precision proxy only; not a power analysis for TrainingStage interaction.',
      'study_A_SOL':eval_source(study,('T1','T2'),'SOL'),
      'R1b_LUNA':eval_source(r1b,('T1','T2'),'LUNA'),
    }
    (HERE/'PILOT_SIZING_PROXY.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
    lines=['# Pilot Sizing Proxy','',out['warning'],'']
    for key in ('study_A_SOL','R1b_LUNA'):
        lines += ['## '+key,'','| k/family/task | total 2-task outputs | median acc | p10 | p90 | both dirs > chance |','|---:|---:|---:|---:|---:|---:|']
        for k in KS:
            x=out[key][str(k)]
            lines.append(f"| {k} | {x['total_outputs_for_two_tasks']} | {x['median_accuracy']:.3f} | {x['p10']:.3f} | {x['p90']:.3f} | {x['fraction_both_directions_above_chance']:.2f} |")
        lines.append('')
    (HERE/'PILOT_SIZING_PROXY.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PILOT_SIZING_PROXY=PASS')

if __name__=='__main__': main()
