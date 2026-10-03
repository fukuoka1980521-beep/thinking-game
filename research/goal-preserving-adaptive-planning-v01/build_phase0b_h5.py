from __future__ import annotations
import json,hashlib,random
from pathlib import Path
ROOT=Path(__file__).resolve().parent
sc=json.loads((ROOT/'PHASE0B_H5_SCENARIO_V1_0.json').read_text(encoding='utf-8'))
rid='GPAP0B-H5_SUNK_DATA_PIPELINE-CTRL'
def h(s): return hashlib.sha256(s.encode()).hexdigest()
rng=random.Random(int(h(rid)[:16],16))
pairs=list(sc['options'].items()); rng.shuffle(pairs)
letters=['A','B','C','D']; mapping={letters[i]:pairs[i][0] for i in range(4)}
correct=next(k for k,v in mapping.items() if v==sc['correct_class'])
msgs=[dict(x) for x in sc['turns']]
opts='\n'.join(f"{letters[i]}. {pairs[i][1]}" for i in range(4))
msgs[-1]['content'] += '\n\nOptions:\n'+opts+'\n\nReturn exactly three lines:\nDECISION: <A/B/C/D>\nREASON: <one concise sentence>\nCURRENT_GOAL: <current top-level goal in one concise sentence>'
row={'run_id':rid,'scenario_id':sc['id'],'condition_id':'CTRL','correct_class':sc['correct_class'],'correct_letter':correct,'letter_to_class':mapping,'messages':msgs,'sampling':{'temperature':0.0,'top_p':1.0,'max_tokens':160,'seed':int(h(rid)[16:24],16)&0x7fffffff},'status':'NOT_RUN'}
out=ROOT/'phase0b'; out.mkdir(exist_ok=True)
p=out/'PHASE0B_H5_CTRL_MANIFEST_V1_0.jsonl'; p.write_text(json.dumps(row,ensure_ascii=False,sort_keys=True)+'\n',encoding='utf-8')
freeze={'status':'FROZEN_BEFORE_H5_OUTPUT','run_id':rid,'manifest_sha256':h(p.read_text(encoding='utf-8')),'decision_rule':'If H5 incorrect then combined CTRL=3/5 -> HEADROOM_PASS. If H5 correct then combined CTRL=4/5 -> CEILING_REMAINS.','paid_api_allowed':False}
(out/'PHASE0B_H5_CTRL_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
print('H5_MANIFEST_PASS',freeze['manifest_sha256'])
