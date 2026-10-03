import json,re
from pathlib import Path
ROOT=Path(r"C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01")
RAW=ROOT/'pilot_v01'/'raw'
TASK_TERMS={
 'T1':['response','question','variation','factor','observation','explanation'],
 'T2':['site','process','time','completion','factor','observation','difference'],
}
rows=[]
for p in sorted(RAW.glob('*.json')):
    r=json.loads(p.read_text(encoding='utf-8'))
    text=str(r.get('raw_text','')); low=text.lower()
    rows.append({
      'stage':r['training_stage'],
      'words':len(re.findall(r"\b[A-Za-z][A-Za-z'-]*\b",text)),
      'refusal':bool(re.search(r"\b(i cannot|i can't|unable to|cannot comply)\b",low)),
      'corruption':any(x in text for x in ['<|user|>','<|assistant|>','<|system|>']),
      'hits':sum(t in low for t in TASK_TERMS.get(r.get('task_id'),[]))
    })
out=[]
for words_min in [80,90,95,97,100,110]:
  for hits_min in [1,2]:
    vals=[x['words']>=words_min and not x['refusal'] and not x['corruption'] and x['hits']>=hits_min for x in rows]
    stage={}
    for s in ['BASE','SFT','DPO','RLVR']:
      z=[v for v,x in zip(vals,rows) if x['stage']==s]
      stage[s]=sum(z)/len(z)
    out.append({'words_min':words_min,'hits_min':hits_min,'valid_n':sum(vals),'valid_rate':sum(vals)/72,'gate95':sum(vals)>=69,'stage_rate':stage})
o=ROOT/'pilot_v01'/'analysis'/'VALIDITY_SENSITIVITY.json'
o.write_text(json.dumps(out,indent=2),encoding='utf-8')
lines=['# Validity Gate Sensitivity','',
'**Post-hoc sensitivity only. Official pilot decision remains NO_GO under the frozen rule: words>=100 and objective_hits>=2.**','',
'| min words | min objective hits | valid n/72 | valid rate | >=95% gate |',
'|---:|---:|---:|---:|---:|']
for x in out:
 lines.append(f"| {x['words_min']} | {x['hits_min']} | {x['valid_n']}/72 | {x['valid_rate']:.3f} | {x['gate95']} |")
lines += ['',
'Interpretation: this table measures how close the frozen validity gate was to its threshold; it must not be used to retroactively redefine validity.']
(ROOT/'pilot_v01'/'analysis'/'VALIDITY_SENSITIVITY.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('VALIDITY_SENSITIVITY=PASS')
