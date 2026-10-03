from __future__ import annotations
import json
from pathlib import Path
import analyze_pilot_v0_1 as a
import pilot_measurement_v0_1 as m

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'pilot_v01'/'raw'
OUT=ROOT/'pilot_v01'/'partial'
STAGES=['BASE','SFT','DPO','RLVR']

def load():
    rows=[]
    for p in sorted(RAW.glob('*.json')):
        r=json.loads(p.read_text(encoding='utf-8'))
        rows.append({
            'id':r['run_id'],'training_stage':r['training_stage'],'task_id':r['task_id'],
            'method_family':r['method_family'],'text':r['raw_text'],
            'elapsed_seconds':r.get('elapsed_seconds')
        })
    return rows

rows=load()
counts={s:sum(r['training_stage']==s for r in rows) for s in STAGES}
complete=[s for s in STAGES if counts[s]==18]
if not complete:
    raise SystemExit('no complete stage')

result={'status':'PARTIAL_COMPLETED_STAGES_ONLY','counts':counts,'complete_stages':complete,'stages':{},'cross_stage':{}}
for stage in complete:
    z=[r for r in rows if r['training_stage']==stage]
    t1=[r for r in z if r['task_id']=='T1']; t2=[r for r in z if r['task_id']=='T2']
    lex=a.paired_cross_task(t1,t2,lambda tr,te:m.classify(tr,te,'method_family',m.METHODS))
    struct=a.paired_cross_task(t1,t2,lambda tr,te:a.numeric_classify(tr,te,'method_family',m.METHODS,a.structure_features))
    length=a.paired_cross_task(t1,t2,lambda tr,te:a.numeric_classify(tr,te,'method_family',m.METHODS,a.length_features))
    div=a.within_cell_diversity(z)
    comp=[m.compliance(r['text']) for r in z]
    result['stages'][stage]={
      'lexical_accuracy':lex['combined_accuracy'],
      'macro_recall':lex['macro_recall'],
      'family_recall':lex['recall'],
      'structure_accuracy':struct['combined_accuracy'],
      'length_accuracy':length['combined_accuracy'],
      'lexical_advantage':lex['combined_accuracy']-max(struct['combined_accuracy'],length['combined_accuracy']),
      'diversity':div['diversity_1_minus_similarity'],
      'mean_headings':sum(x['headings_present'] for x in comp)/len(comp),
      'all_headings_rate':sum(x['all_headings'] for x in comp)/len(comp),
      'mean_words':sum(x['word_count'] for x in comp)/len(comp)
    }

for tr_stage in complete:
    result['cross_stage'][tr_stage]={}
    tr=[r for r in rows if r['training_stage']==tr_stage]
    for te_stage in complete:
        if tr_stage==te_stage: continue
        te=[r for r in rows if r['training_stage']==te_stage]
        x=m.classify(tr,te,'method_family',m.METHODS)
        result['cross_stage'][tr_stage][te_stage]=x['accuracy']

OUT.mkdir(parents=True,exist_ok=True)
tag='_'.join(complete)
(OUT/f'COMPLETED_STAGES_{tag}.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
lines=['# Completed Stages Partial Analysis','',
'**Descriptive only; not used to modify the frozen pilot.**','',
f"Complete stages: {', '.join(complete)}",'',
'| stage | lexical | structure | length | lexical advantage | diversity | mean headings | mean words |',
'|---|---:|---:|---:|---:|---:|---:|---:|']
for s in complete:
    x=result['stages'][s]
    lines.append(f"| {s} | {x['lexical_accuracy']:.3f} | {x['structure_accuracy']:.3f} | {x['length_accuracy']:.3f} | {x['lexical_advantage']:+.3f} | {x['diversity']:.3f} | {x['mean_headings']:.2f} | {x['mean_words']:.1f} |")
lines += ['','## Cross-stage method transfer','']
for a1,row in result['cross_stage'].items():
    for b1,v in row.items():
        lines.append(f'- {a1} → {b1}: {v:.3f}')
(OUT/f'COMPLETED_STAGES_{tag}.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('COMPLETED_STAGE_ANALYSIS=PASS')
print(json.dumps(result,indent=2))
