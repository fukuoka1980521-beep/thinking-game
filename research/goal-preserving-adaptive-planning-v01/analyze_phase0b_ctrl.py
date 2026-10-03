from __future__ import annotations
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
RAW=ROOT/'phase0b'/'raw_ctrl'; OUT=ROOT/'phase0b'/'analysis'; OUT.mkdir(parents=True,exist_ok=True)
fs=sorted(RAW.glob('*.json'))
if len(fs)!=4: raise SystemExit(f'incomplete {len(fs)}/4')
rows=[]
for p in fs:
    r=json.loads(p.read_text(encoding='utf-8')); txt=r['raw_text']
    m=re.search(r'^DECISION:\s*([A-D])\b',txt,re.I|re.M)
    if not m: m=re.search(r'^\s*([A-D])[.)]\s+',txt,re.I|re.M)
    letter=m.group(1).upper() if m else None
    chosen=r['letter_to_class'].get(letter) if letter else 'UNPARSEABLE'
    rows.append({'run_id':r['run_id'],'scenario_id':r['scenario_id'],'letter':letter,'chosen_class':chosen,'correct_class':r['correct_class'],'correct':chosen==r['correct_class'],'raw_text':txt})
k=sum(x['correct'] for x in rows)
decision='HEADROOM_PASS' if 1<=k<=2 else ('FLOOR_REVIEW' if k==0 else ('BORDERLINE' if k==3 else 'CEILING_FAIL'))
res={'status':'PHASE0B_CTRL_SCREEN','correct_n':k,'n':4,'decision':decision,'rows':rows}
(OUT/'PHASE0B_CTRL_ANALYSIS.json').write_text(json.dumps(res,indent=2),encoding='utf-8')
lines=['# Phase 0b Control Screen','',f'**Decision: {decision}**','',f'- CTRL correct: {k}/4','']
for x in rows: lines.append(f"- {x['scenario_id']}: {'CORRECT' if x['correct'] else 'FAIL'} — {x['chosen_class']}")
(OUT/'PHASE0B_CTRL_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PHASE0B_CTRL',k,'/4',decision)
