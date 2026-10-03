from __future__ import annotations
import json
from pathlib import Path
import pilot_measurement_v0_1 as m

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'pilot_v01'/'raw'
OUT=ROOT/'pilot_v01'/'analysis'

def load():
    rows=[]
    for p in sorted(RAW.glob('*.json')):
        r=json.loads(p.read_text(encoding='utf-8'))
        rows.append({
            'id':r['run_id'],
            'training_stage':r['training_stage'],
            'task_id':r['task_id'],
            'method_family':r['method_family'],
            'text':r['raw_text'],
            'rendering':r.get('rendering'),
            'elapsed_seconds':r.get('elapsed_seconds'),
        })
    return rows

def recall(preds,classes):
    out={}
    for c in classes:
        z=[x for x in preds if x['true']==c]
        n=len(z); k=sum(x['pred']==c for x in z)
        out[c]={'correct':k,'n':n,'recall':k/n if n else None}
    return out

def macro_recall(rec):
    vals=[x['recall'] for x in rec.values() if x['recall'] is not None]
    return sum(vals)/len(vals) if vals else None

def main():
    rows=load()
    if len(rows)!=72:
        raise SystemExit(f'pilot incomplete {len(rows)}/72')
    ids=[r['id'] for r in rows]
    if len(set(ids))!=72:
        raise SystemExit('duplicate pilot run_id')
    cell={(r['training_stage'],r['task_id'],r['method_family']) for r in rows}
    if len(cell)!=24:
        raise SystemExit(f'pilot cell mismatch {len(cell)}/24')

    result={
        'status':'PILOT_CALIBRATION_ONLY',
        'n':72,
        'chance_method_accuracy':1/len(m.METHODS),
        'chance_stage_accuracy':1/len(m.STAGES),
        'method_by_stage':{},
        'stage_cross_task':{},
        'cross_stage_method_transfer':{},
        'compliance':{},
        'runtime':{},
    }

    # Within-stage, cross-task method recoverability.
    for stage in m.STAGES:
        z=[r for r in rows if r['training_stage']==stage]
        t1=[r for r in z if r['task_id']=='T1']
        t2=[r for r in z if r['task_id']=='T2']
        a=m.classify(t1,t2,'method_family',m.METHODS)
        b=m.classify(t2,t1,'method_family',m.METHODS)
        preds=a['predictions']+b['predictions']
        rec=recall(preds,m.METHODS)
        result['method_by_stage'][stage]={
            'T1_to_T2':a,
            'T2_to_T1':b,
            'combined_accuracy':(a['correct']+b['correct'])/(a['n']+b['n']),
            'recall':rec,
            'macro_recall':macro_recall(rec),
        }

    # Negative control: how recoverable is stage identity across tasks?
    t1=[r for r in rows if r['task_id']=='T1']
    t2=[r for r in rows if r['task_id']=='T2']
    a=m.classify(t1,t2,'training_stage',m.STAGES)
    b=m.classify(t2,t1,'training_stage',m.STAGES)
    stage_preds=a['predictions']+b['predictions']
    stage_rec=recall(stage_preds,m.STAGES)
    result['stage_cross_task']={
        'T1_to_T2':a,
        'T2_to_T1':b,
        'combined_accuracy':(a['correct']+b['correct'])/(a['n']+b['n']),
        'recall':stage_rec,
        'macro_recall':macro_recall(stage_rec),
    }

    # Cross-stage transfer: does a method signature learned at one training stage
    # remain recognizable at another stage?
    for train_stage in m.STAGES:
        result['cross_stage_method_transfer'][train_stage]={}
        tr=[r for r in rows if r['training_stage']==train_stage]
        for test_stage in m.STAGES:
            if test_stage==train_stage:
                continue
            te=[r for r in rows if r['training_stage']==test_stage]
            # Pool tasks deliberately here; task balance is identical in train/test.
            x=m.classify(tr,te,'method_family',m.METHODS)
            rec=recall(x['predictions'],m.METHODS)
            result['cross_stage_method_transfer'][train_stage][test_stage]={
                'accuracy':x['accuracy'],
                'recall':rec,
                'macro_recall':macro_recall(rec),
            }

    # Method-neutral compliance and runtime burden.
    for stage in m.STAGES:
        z=[r for r in rows if r['training_stage']==stage]
        cs=[m.compliance(r['text']) for r in z]
        result['compliance'][stage]={
            'valid_nonempty_rate':sum(x['nonempty'] for x in cs)/len(cs),
            'all_headings_rate':sum(x['all_headings'] for x in cs)/len(cs),
            'refusal_rate':sum(x['refusal_like'] for x in cs)/len(cs),
            'mean_word_count':sum(x['word_count'] for x in cs)/len(cs),
        }
        secs=[r['elapsed_seconds'] for r in z if isinstance(r.get('elapsed_seconds'),(int,float))]
        result['runtime'][stage]={
            'n_timed':len(secs),
            'mean_seconds':sum(secs)/len(secs) if secs else None,
            'max_seconds':max(secs) if secs else None,
        }

    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'PILOT_ANALYSIS.json').write_text(json.dumps(result,indent=2),encoding='utf-8')

    lines=['# Pilot Analysis','','**Calibration only; not confirmatory.**','']
    lines += ['## Method recoverability by training stage','']
    for s,x in result['method_by_stage'].items():
        lines.append(f"- {s}: accuracy **{x['combined_accuracy']:.3f}**, macro recall {x['macro_recall']:.3f}")
    lines += [
        '',
        '## Stage-identity negative control','',
        f"- stage cross-task accuracy: **{result['stage_cross_task']['combined_accuracy']:.3f}**",
        f"- stage macro recall: {result['stage_cross_task']['macro_recall']:.3f}",
        '',
        '## Cross-stage method transfer','',
        '| train stage | test stage | accuracy | macro recall |',
        '|---|---|---:|---:|',
    ]
    for a,row in result['cross_stage_method_transfer'].items():
        for b,x in row.items():
            lines.append(f"| {a} | {b} | {x['accuracy']:.3f} | {x['macro_recall']:.3f} |")
    lines += ['','## Compliance','']
    for s,x in result['compliance'].items():
        lines.append(f"- {s}: headings={x['all_headings_rate']:.2f}, refusal={x['refusal_rate']:.2f}, words={x['mean_word_count']:.1f}")
    lines += ['','## Interpretation rule','',
        'A training-stage effect is not interpreted as methodological specialization if method recoverability is explainable by generic compliance, gross output structure, or stage identity alone.',
        'Cross-stage transfer is behavioral evidence only and does not establish persistence of the same internal representation.'
    ]
    (OUT/'PILOT_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PILOT_ANALYSIS=PASS')

if __name__=='__main__':
    main()
