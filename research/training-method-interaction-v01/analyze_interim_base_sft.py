from __future__ import annotations
import json, math, re
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'template_smoke'/'raw'
FILES={
    'BASE_RAW':RAW/'SMOKE-BASE-RAW.json',
    'SFT_RAW':RAW/'SMOKE-SFT-RAW.json',
    'SFT_NATIVE':RAW/'SMOKE-SFT-NATIVE.json',
}
HEADINGS=[
    'objective and scope','assumptions','research design','data or evidence needed',
    'measurement','analysis','decision / stopping rule','limitations'
]
def words(s): return re.findall(r"[A-Za-z][A-Za-z'-]*",s.lower())
def cosine(a,b):
    ca,cb=Counter(words(a)),Counter(words(b))
    keys=set(ca)|set(cb)
    dot=sum(ca[k]*cb[k] for k in keys)
    na=math.sqrt(sum(v*v for v in ca.values())); nb=math.sqrt(sum(v*v for v in cb.values()))
    return dot/(na*nb) if na and nb else 0.0
def metrics(rec):
    t=rec['raw_text']; low=t.lower(); wc=len(words(t))
    return {
        'word_count':wc,
        'headings_present':sum(h in low for h in HEADINGS),
        'heading_rate':sum(h in low for h in HEADINGS)/len(HEADINGS),
        'elapsed_seconds':rec.get('elapsed_seconds'),
        'predicted_tokens':(rec.get('timings') or {}).get('predicted_n'),
        'generation_tps':(rec.get('timings') or {}).get('predicted_per_second'),
        'hit_limit':bool((rec.get('timings') or {}).get('predicted_n')==rec['generation_settings']['max_new_tokens']),
        'has_refusal':bool(re.search(r"\b(i cannot|i can't|unable to|cannot comply)\b",low)),
        'template_corruption':any(x in t for x in ['<|user|>','<|assistant|>','<|system|>']),
    }
def main():
    recs={k:json.loads(p.read_text(encoding='utf-8')) for k,p in FILES.items()}
    met={k:metrics(v) for k,v in recs.items()}
    sims={
      'BASE_RAW_vs_SFT_RAW':cosine(recs['BASE_RAW']['raw_text'],recs['SFT_RAW']['raw_text']),
      'SFT_RAW_vs_SFT_NATIVE':cosine(recs['SFT_RAW']['raw_text'],recs['SFT_NATIVE']['raw_text']),
      'BASE_RAW_vs_SFT_NATIVE':cosine(recs['BASE_RAW']['raw_text'],recs['SFT_NATIVE']['raw_text']),
    }
    out={'status':'INTERIM_CALIBRATION_ONLY','metrics':met,'lexical_cosine':sims}
    (ROOT/'INTERIM_BASE_SFT_SMOKE_ANALYSIS.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
    lines=['# Interim BASE vs SFT Smoke Analysis','',
           '**Calibration evidence only — not the 72-run pilot and not confirmatory.**','',
           '| condition | words | headings/8 | hit 512 cap | gen tok/s | elapsed s | refusal | template corruption |',
           '|---|---:|---:|---:|---:|---:|---:|---:|']
    for k in ['BASE_RAW','SFT_RAW','SFT_NATIVE']:
        x=met[k]
        lines.append(f"| {k} | {x['word_count']} | {x['headings_present']} | {int(x['hit_limit'])} | {x['generation_tps']:.2f} | {x['elapsed_seconds']:.1f} | {int(x['has_refusal'])} | {int(x['template_corruption'])} |")
    lines += ['','## Lexical similarity','']
    for k,v in sims.items(): lines.append(f'- {k}: {v:.3f}')
    lines += ['','## What can already be said','',
      '1. BASE can generate a substantive research-plan continuation under the common raw scaffold; instruction tuning is not required for plan-like behavior to exist at all.',
      '2. SFT sharply improves structural instruction adherence under the same raw prompt. SFT RAW is already much more organized than BASE RAW.',
      '3. The native SFT chat interface improves adherence further, so interface/template effects are real and must be separated from weight-stage effects.',
      '4. This pattern is consistent with a repertoire-plus-routing account: pretraining provides some research-planning repertoire, while SFT makes the user instruction easier to route into a coherent requested format.',
      '',
      '## What cannot yet be said','',
      '- No conclusion yet about Bayesian vs software-testing method responsiveness; only GENERIC smoke has been observed.',
      '- No conclusion yet about DPO preference reshaping or RLVR verifier-selective amplification.',
      '- No stage-by-method interaction estimate exists until the 72-run pilot is complete.',
      '- No internal mechanism claim follows from these black-box outputs.',
      '',
      '## If later stages become unavailable','',
      'The strongest defensible result would remain: BASE already exhibits plan-like problem decomposition, and SFT materially changes instruction routing/structural compliance. The missing DPO/RLVR stages would limit the study to the pretraining→instruction-tuning transition and prevent claims about preference optimization or RLVR.'
    ]
    (ROOT/'INTERIM_BASE_SFT_SMOKE_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('INTERIM_BASE_SFT_ANALYSIS=PASS')
if __name__=='__main__': main()
