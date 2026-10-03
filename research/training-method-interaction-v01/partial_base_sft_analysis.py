from __future__ import annotations
import json
from pathlib import Path
import analyze_pilot_v0_1 as a
import pilot_measurement_v0_1 as m

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'pilot_v01'/'raw'
OUT=ROOT/'pilot_v01'/'partial'

rows=[]
for p in sorted(RAW.glob('*.json')):
    r=json.loads(p.read_text(encoding='utf-8'))
    if r['training_stage'] in {'BASE','SFT'}:
        rows.append({
            'id':r['run_id'],'training_stage':r['training_stage'],'task_id':r['task_id'],
            'method_family':r['method_family'],'text':r['raw_text'],
            'elapsed_seconds':r.get('elapsed_seconds')
        })

if len(rows)!=36:
    raise SystemExit(f'need complete BASE+SFT 36 rows, got {len(rows)}')

result={'status':'PARTIAL_DESCRIPTIVE_ONLY','n':36,'stages':{}}
for stage in ['BASE','SFT']:
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
        'lexical_advantage_over_gross_controls':lex['combined_accuracy']-max(struct['combined_accuracy'],length['combined_accuracy']),
        'diversity':div['diversity_1_minus_similarity'],
        'all_headings_rate':sum(x['all_headings'] for x in comp)/len(comp),
        'mean_words':sum(x['word_count'] for x in comp)/len(comp),
    }

# cross-stage transfer in both directions, pooled over balanced tasks
for train_stage,test_stage in [('BASE','SFT'),('SFT','BASE')]:
    tr=[r for r in rows if r['training_stage']==train_stage]
    te=[r for r in rows if r['training_stage']==test_stage]
    x=m.classify(tr,te,'method_family',m.METHODS)
    result[f'{train_stage}_to_{test_stage}']={'accuracy':x['accuracy'],'recall':a.recall(x['predictions'],m.METHODS)}

OUT.mkdir(parents=True,exist_ok=True)
(OUT/'BASE_SFT_PARTIAL.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
b=result['stages']['BASE']; s=result['stages']['SFT']
lines=['# BASE vs SFT Partial Descriptive Analysis','',
'**Partial descriptive only; DPO/RLVR not yet included; not used for pilot GO/NO-GO.**','',
'| metric | BASE | SFT |',
'|---|---:|---:|',
f"| lexical cross-task method accuracy | {b['lexical_accuracy']:.3f} | {s['lexical_accuracy']:.3f} |",
f"| macro recall | {b['macro_recall']:.3f} | {s['macro_recall']:.3f} |",
f"| structure-only accuracy | {b['structure_accuracy']:.3f} | {s['structure_accuracy']:.3f} |",
f"| length-only accuracy | {b['length_accuracy']:.3f} | {s['length_accuracy']:.3f} |",
f"| lexical advantage over gross controls | {b['lexical_advantage_over_gross_controls']:+.3f} | {s['lexical_advantage_over_gross_controls']:+.3f} |",
f"| within-cell lexical diversity | {b['diversity']:.3f} | {s['diversity']:.3f} |",
f"| exact 8-heading compliance | {b['all_headings_rate']:.3f} | {s['all_headings_rate']:.3f} |",
f"| mean words | {b['mean_words']:.1f} | {s['mean_words']:.1f} |",
'',
f"- BASE→SFT method transfer: {result['BASE_to_SFT']['accuracy']:.3f}",
f"- SFT→BASE method transfer: {result['SFT_to_BASE']['accuracy']:.3f}",
'',
'Chance for the three pilot method classes is 0.333.'
]
(OUT/'BASE_SFT_PARTIAL.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PARTIAL_BASE_SFT=PASS')
print(json.dumps(result,indent=2))
