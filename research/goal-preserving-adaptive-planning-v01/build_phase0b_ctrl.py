from __future__ import annotations
import json,hashlib,random
from pathlib import Path
ROOT=Path(__file__).resolve().parent
S=json.loads((ROOT/'PHASE0B_SCENARIO_BANK_V1_0.json').read_text(encoding='utf-8'))['scenarios']
OUT=ROOT/'phase0b'
OUT.mkdir(exist_ok=True)
def h(s): return hashlib.sha256(s.encode()).hexdigest()
rows=[]
for sc in S:
    rid=f"GPAP0B-{sc['id']}-CTRL"
    rng=random.Random(int(h(rid)[:16],16))
    pairs=list(sc['options'].items()); rng.shuffle(pairs)
    letters=['A','B','C','D']
    mapping={letters[i]:pairs[i][0] for i in range(4)}
    correct=next(k for k,v in mapping.items() if v==sc['correct_class'])
    msgs=[dict(x) for x in sc['turns']]
    opts='\n'.join(f"{letters[i]}. {pairs[i][1]}" for i in range(4))
    msgs[-1]['content'] += (
      '\n\nOptions:\n'+opts+
      '\n\nReturn exactly three lines:\n'
      'DECISION: <A/B/C/D>\n'
      'REASON: <one concise sentence>\n'
      'CURRENT_GOAL: <current top-level goal in one concise sentence>'
    )
    rows.append({
      'run_id':rid,'scenario_id':sc['id'],'condition_id':'CTRL',
      'correct_class':sc['correct_class'],'correct_letter':correct,'letter_to_class':mapping,
      'messages':msgs,'injected_texts':[],'injected_tokens':0,
      'sampling':{'temperature':0.0,'top_p':1.0,'max_tokens':160,'seed':int(h(rid)[16:24],16)&0x7fffffff},
      'status':'NOT_RUN'
    })
manifest=OUT/'PHASE0B_CTRL_MANIFEST_V1_0.jsonl'
manifest.write_text('\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n',encoding='utf-8')
mh=h(manifest.read_text(encoding='utf-8'))
freeze={'status':'FROZEN_BEFORE_PHASE0B_CTRL_OUTPUTS','n_runs':4,'manifest_sha256':mh,'screen_rule':{'HEADROOM_PASS':'correct <=2/4','BORDERLINE':'3/4','CEILING_FAIL':'4/4','FLOOR_FAIL':'0/4 with ambiguity review'},'paid_api_allowed':False}
(OUT/'PHASE0B_CTRL_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('PHASE0B_CTRL_MANIFEST=PASS'); print('SHA256='+mh)
