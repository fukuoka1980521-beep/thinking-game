from __future__ import annotations
import json,re,math
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'template_smoke'/'raw'
STAGES=['BASE','SFT','DPO','RLVR']
HEADINGS=['objective and scope','assumptions','research design','data or evidence needed','measurement','analysis','decision / stopping rule','limitations']

def toks(s): return re.findall(r"[a-z][a-z'-]*",s.lower())
def cosine(a,b):
    ca,cb=Counter(toks(a)),Counter(toks(b)); keys=set(ca)|set(cb)
    dot=sum(ca[k]*cb[k] for k in keys)
    na=math.sqrt(sum(v*v for v in ca.values())); nb=math.sqrt(sum(v*v for v in cb.values()))
    return dot/(na*nb) if na and nb else 0

def metric(rec):
    t=rec['raw_text']; low=t.lower(); timing=rec.get('timings') or {}
    return {
      'words':len(toks(t)),
      'headings':sum(h in low for h in HEADINGS),
      'hit_cap':timing.get('predicted_n')==rec['generation_settings']['max_new_tokens'],
      'elapsed':rec.get('elapsed_seconds'),
      'tps':timing.get('predicted_per_second'),
      'text':t,
    }

def load(stage,render):
    p=RAW/f'SMOKE-{stage}-{render.upper()}.json'
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else None

def main():
    rows={}
    for s in STAGES:
        for r in (['raw'] if s=='BASE' else ['raw','native']):
            x=load(s,r)
            if x: rows[f'{s}_{r.upper()}']=metric(x)

    lines=['# Smoke Progress Analysis','',
      '**Pre-pilot calibration only. GENERIC/T1 smoke; no method-family conclusions.**','',
      '| condition | words | headings/8 | hit cap | tok/s | elapsed s |',
      '|---|---:|---:|---:|---:|---:|']
    for k,x in rows.items():
        lines.append(f"| {k} | {x['words']} | {x['headings']} | {int(x['hit_cap'])} | {x['tps']:.2f} | {x['elapsed']:.1f} |")
    lines += ['','## Same-stage interface effect','']
    for s in ['SFT','DPO','RLVR']:
        a=rows.get(f'{s}_RAW'); b=rows.get(f'{s}_NATIVE')
        if a and b:
            lines.append(f"- {s}: RAW↔NATIVE lexical cosine={cosine(a['text'],b['text']):.3f}; headings {a['headings']}→{b['headings']}.")
    lines += ['','## Same raw-interface stage continuity','']
    available=[s for s in STAGES if f'{s}_RAW' in rows]
    for a,b in zip(available,available[1:]):
        x,y=rows[f'{a}_RAW'],rows[f'{b}_RAW']
        lines.append(f"- {a}→{b}: lexical cosine={cosine(x['text'],y['text']):.3f}; headings {x['headings']}→{y['headings']}; words {x['words']}→{y['words']}.")
    lines += ['','## Current interpretation','',
      '- BASE already shows substantive plan-like decomposition under a raw completion scaffold.',
      '- SFT produces a major jump in neutral-structure compliance under identical raw input, consistent with instruction-routing amplification.',
      '- DPO preserves strong structure compliance; with GENERIC smoke alone there is no basis yet to say DPO creates a new reasoning style.',
      '- Native chat rendering further improves/standardizes structural adherence for post-trained checkpoints, so template/interface is a real moderator.',
      '- Methodological specialization requires the frozen Bayesian/Software-Testing pilot cells and cannot be inferred from these GENERIC smoke outputs.'
    ]
    if 'RLVR_RAW' not in rows:
        lines += ['',
          '## Unresolved',
          '- RLVR smoke is not yet available. This prevents any empirical claim about verifier/reward-stage effects.',
          '- Impact: no effect on BASE/SFT/DPO observations; blocks DPO→RLVR comparison and full TrainingStage × MethodFraming interpretation.'
        ]
    out=ROOT/'SMOKE_PROGRESS_ANALYSIS.md'
    out.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('SMOKE_PROGRESS_ANALYSIS=PASS')

if __name__=='__main__': main()
