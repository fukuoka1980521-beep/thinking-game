from __future__ import annotations
import json, math, re
from pathlib import Path
import numpy as np
import pilot_measurement_v0_1 as m

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'pilot_v01'/'raw'
OUT=ROOT/'pilot_v01'/'analysis'
HEADINGS=['objective and scope','assumptions','research design','data or evidence needed','measurement','analysis','decision / stopping rule','limitations']

def load():
    rows=[]
    for p in sorted(RAW.glob('*.json')):
        r=json.loads(p.read_text(encoding='utf-8'))
        rows.append({
            'id':r['run_id'],'training_stage':r['training_stage'],'task_id':r['task_id'],
            'method_family':r['method_family'],'text':r['raw_text'],
            'rendering':r.get('rendering'),'elapsed_seconds':r.get('elapsed_seconds'),
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

def structure_features(text):
    low=text.lower()
    lines=[x for x in text.splitlines() if x.strip()]
    paras=[x for x in re.split(r'\n\s*\n',text) if x.strip()]
    words=re.findall(r"\b[A-Za-z][A-Za-z'-]*\b",text)
    sents=[x for x in re.split(r'[.!?]+',text) if x.strip()]
    bullets=sum(bool(re.match(r'^\s*[-*•]',x)) for x in text.splitlines())
    numbered=sum(bool(re.match(r'^\s*\d+[.)]',x)) for x in text.splitlines())
    headings=sum(h in low for h in HEADINGS)
    return np.array([
        len(words),len(text),len(lines),len(paras),len(sents),bullets,numbered,headings,
        len(words)/max(1,len(sents)),len(words)/max(1,len(lines)),
    ],dtype=float)

def length_features(text):
    return np.array([len(re.findall(r"\b[A-Za-z][A-Za-z'-]*\b",text))],dtype=float)

def numeric_classify(train,test,label_key,classes,feature_fn):
    X=np.vstack([feature_fn(r['text']) for r in train])
    Y=np.array([classes.index(r[label_key]) for r in train],dtype=int)
    Z=np.vstack([feature_fn(r['text']) for r in test])
    truth=[r[label_key] for r in test]
    mu=X.mean(axis=0); sd=X.std(axis=0); sd[sd<1e-9]=1.0
    X=(X-mu)/sd; Z=(Z-mu)/sd
    cents=[]
    for i,_ in enumerate(classes):
        z=X[Y==i]
        cents.append(z.mean(axis=0) if len(z) else np.zeros(X.shape[1]))
    C=np.vstack(cents)
    pred_idx=np.argmin(((Z[:,None,:]-C[None,:,:])**2).sum(axis=2),axis=1)
    preds=[classes[int(i)] for i in pred_idx]
    correct=sum(a==b for a,b in zip(preds,truth))
    return {
        'correct':correct,'n':len(test),'accuracy':correct/len(test),
        'predictions':[{'id':r['id'],'true':t,'pred':p} for r,t,p in zip(test,truth,preds)]
    }

def paired_cross_task(train_t1,train_t2,classifier):
    a=classifier(train_t1,train_t2)
    b=classifier(train_t2,train_t1)
    preds=a['predictions']+b['predictions']
    rec=recall(preds,m.METHODS)
    return {
        'T1_to_T2':a,'T2_to_T1':b,
        'combined_accuracy':(a['correct']+b['correct'])/(a['n']+b['n']),
        'recall':rec,'macro_recall':macro_recall(rec),
    }

def main():
    rows=load()
    if len(rows)!=72: raise SystemExit(f'pilot incomplete {len(rows)}/72')
    if len({r['id'] for r in rows})!=72: raise SystemExit('duplicate pilot run_id')
    if len({(r['training_stage'],r['task_id'],r['method_family']) for r in rows})!=24:
        raise SystemExit('pilot cell mismatch')

    result={
        'status':'PILOT_CALIBRATION_ONLY','n':72,
        'chance_method_accuracy':1/len(m.METHODS),'chance_stage_accuracy':1/len(m.STAGES),
        'method_by_stage':{},'structure_only_by_stage':{},'length_only_by_stage':{},
        'stage_cross_task':{},'cross_stage_method_transfer':{},'compliance':{},'runtime':{},
    }

    for stage in m.STAGES:
        z=[r for r in rows if r['training_stage']==stage]
        t1=[r for r in z if r['task_id']=='T1']; t2=[r for r in z if r['task_id']=='T2']
        result['method_by_stage'][stage]=paired_cross_task(
            t1,t2,lambda tr,te:m.classify(tr,te,'method_family',m.METHODS))
        result['structure_only_by_stage'][stage]=paired_cross_task(
            t1,t2,lambda tr,te:numeric_classify(tr,te,'method_family',m.METHODS,structure_features))
        result['length_only_by_stage'][stage]=paired_cross_task(
            t1,t2,lambda tr,te:numeric_classify(tr,te,'method_family',m.METHODS,length_features))

    t1=[r for r in rows if r['task_id']=='T1']; t2=[r for r in rows if r['task_id']=='T2']
    a=m.classify(t1,t2,'training_stage',m.STAGES); b=m.classify(t2,t1,'training_stage',m.STAGES)
    stage_preds=a['predictions']+b['predictions']; stage_rec=recall(stage_preds,m.STAGES)
    result['stage_cross_task']={
        'T1_to_T2':a,'T2_to_T1':b,
        'combined_accuracy':(a['correct']+b['correct'])/(a['n']+b['n']),
        'recall':stage_rec,'macro_recall':macro_recall(stage_rec),
    }

    for train_stage in m.STAGES:
        result['cross_stage_method_transfer'][train_stage]={}
        tr=[r for r in rows if r['training_stage']==train_stage]
        for test_stage in m.STAGES:
            if test_stage==train_stage: continue
            te=[r for r in rows if r['training_stage']==test_stage]
            x=m.classify(tr,te,'method_family',m.METHODS)
            rec=recall(x['predictions'],m.METHODS)
            result['cross_stage_method_transfer'][train_stage][test_stage]={
                'accuracy':x['accuracy'],'recall':rec,'macro_recall':macro_recall(rec)}

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
        result['runtime'][stage]={'n_timed':len(secs),'mean_seconds':sum(secs)/len(secs) if secs else None,'max_seconds':max(secs) if secs else None}

    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'PILOT_ANALYSIS.json').write_text(json.dumps(result,indent=2),encoding='utf-8')

    lines=['# Pilot Analysis','','**Calibration only; not confirmatory.**','',
           '## Method recoverability and negative controls','',
           '| stage | lexical method acc | structure-only acc | length-only acc | macro recall |',
           '|---|---:|---:|---:|---:|']
    for s in m.STAGES:
        x=result['method_by_stage'][s]
        lines.append(f"| {s} | {x['combined_accuracy']:.3f} | {result['structure_only_by_stage'][s]['combined_accuracy']:.3f} | {result['length_only_by_stage'][s]['combined_accuracy']:.3f} | {x['macro_recall']:.3f} |")
    lines += ['','## Stage-identity negative control','',
              f"- stage cross-task accuracy: **{result['stage_cross_task']['combined_accuracy']:.3f}**",
              f"- stage macro recall: {result['stage_cross_task']['macro_recall']:.3f}",
              '','## Cross-stage method transfer','',
              '| train stage | test stage | accuracy | macro recall |','|---|---|---:|---:|']
    for aa,row in result['cross_stage_method_transfer'].items():
        for bb,x in row.items(): lines.append(f"| {aa} | {bb} | {x['accuracy']:.3f} | {x['macro_recall']:.3f} |")
    lines += ['','## Compliance','']
    for s,x in result['compliance'].items():
        lines.append(f"- {s}: headings={x['all_headings_rate']:.2f}, refusal={x['refusal_rate']:.2f}, words={x['mean_word_count']:.1f}")
    lines += ['','## Interpretation rule','',
      'A lexical method signal is not interpreted as methodological specialization if structure-only or length-only recoverability provides a comparable explanation.',
      'A training-stage effect is not interpreted as methodological specialization if it is explainable by generic compliance or stage identity alone.',
      'Cross-stage transfer is behavioral evidence only and does not establish persistence of the same internal representation.'
    ]
    (OUT/'PILOT_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PILOT_ANALYSIS=PASS')

if __name__=='__main__': main()
