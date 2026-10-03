import json,re
from pathlib import Path
ROOT=Path(r"C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01")
RAW=ROOT/'pilot_v01'/'raw'
TASK_TERMS={
 'T1':['response','question','variation','factor','observation','explanation'],
 'T2':['site','process','time','completion','factor','observation','difference'],
}
out=[]
for p in sorted(RAW.glob('*.json')):
    r=json.loads(p.read_text(encoding='utf-8'))
    text=str(r.get('raw_text','')); low=text.lower()
    words=len(re.findall(r"\b[A-Za-z][A-Za-z'-]*\b",text))
    refusal=bool(re.search(r"\b(i cannot|i can't|unable to|cannot comply)\b",low))
    corruption=any(x in text for x in ['<|user|>','<|assistant|>','<|system|>'])
    hits=sum(t in low for t in TASK_TERMS.get(r.get('task_id'),[]))
    valid=bool(words>=100 and not refusal and not corruption and hits>=2)
    if not valid:
        out.append({
          'run_id':r['run_id'],'stage':r['training_stage'],'task':r['task_id'],'method':r['method_family'],
          'words':words,'refusal':refusal,'corruption':corruption,'objective_hits':hits,
          'elapsed_seconds':r.get('elapsed_seconds'),
          'text_preview':text[:700].replace('\n',' ')
        })
o=ROOT/'pilot_v01'/'analysis'/'INVALID_OUTPUTS_DETAIL.json'
o.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('INVALID_COUNT='+str(len(out)))
