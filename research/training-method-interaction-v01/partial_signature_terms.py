from __future__ import annotations
import json, math
from collections import Counter,defaultdict
from pathlib import Path
import pilot_measurement_v0_1 as m

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'pilot_v01'/'raw'
OUT=ROOT/'pilot_v01'/'partial'

rows=[]
for p in sorted(RAW.glob('*.json')):
    r=json.loads(p.read_text(encoding='utf-8'))
    if r['training_stage'] in {'BASE','SFT'}:
        rows.append(r)
if len(rows)!=36: raise SystemExit(f'need 36 rows, got {len(rows)}')

def tokens(text):
    return [x for x in m.normalize(text).split() if len(x)>=3]

def top_contrast(stage,method,n=15):
    z=[r for r in rows if r['training_stage']==stage]
    target=[r for r in z if r['method_family']==method]
    other=[r for r in z if r['method_family']!=method]
    # document frequency rather than raw frequency to avoid repetition artifacts
    tdf=Counter(); odf=Counter()
    for r in target: tdf.update(set(tokens(r['raw_text'])))
    for r in other: odf.update(set(tokens(r['raw_text'])))
    nt=max(1,len(target)); no=max(1,len(other))
    vals=[]
    for tok in set(tdf)|set(odf):
        # smoothed log odds of document presence
        pt=(tdf[tok]+0.5)/(nt+1)
        po=(odf[tok]+0.5)/(no+1)
        score=math.log(pt/(1-pt))-math.log(po/(1-po))
        if tdf[tok]>=2:
            vals.append((score,tok,tdf[tok],odf[tok]))
    return sorted(vals,reverse=True)[:n]

out={}
for stage in ['BASE','SFT']:
    out[stage]={}
    for method in m.METHODS:
        out[stage][method]=[
            {'term':tok,'score':score,'target_docs':td,'other_docs':od}
            for score,tok,td,od in top_contrast(stage,method)
        ]
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'BASE_SFT_CONTRAST_TERMS.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
lines=['# BASE vs SFT Residual Contrast Terms','',
'Method labels and the measurement mask have already been removed before this descriptive term analysis.','',
'**Descriptive only; terms are not causal features and are not used to tune the classifier.**','']
for stage in ['BASE','SFT']:
    lines += [f'## {stage}','']
    for method in m.METHODS:
        ts=', '.join(x['term'] for x in out[stage][method][:10])
        lines.append(f'- **{method}**: {ts}')
    lines.append('')
(OUT/'BASE_SFT_CONTRAST_TERMS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PARTIAL_TERMS=PASS')
for stage in ['BASE','SFT']:
    print(stage)
    for method in m.METHODS:
        print(method, [x['term'] for x in out[stage][method][:8]])
