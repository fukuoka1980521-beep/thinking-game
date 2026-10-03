from __future__ import annotations
import hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
STAGES=['BASE','SFT','DPO','RLVR']
METHODS={
 'GENERIC':'Use your best general research judgment.',
 'BAYESIAN':'Use a Bayesian methodological approach.',
 'SOFTWARE_TESTING':'Use a software-testing methodological approach.',
}
TASKS={
 'T1':'Why can repeated responses to the same question differ, which observable factors account for the variation, and what observations would distinguish competing explanations?',
 'T2':'Why do sites using the same nominal work process show persistent completion-time differences, which measurable factors account for those differences, and what observations would distinguish competing explanations?',
}
HEADINGS=['Objective and scope','Assumptions','Research design','Data or evidence needed','Measurement','Analysis','Decision / stopping rule','Limitations']
RAW_COMPLETION_SUFFIX='\n\nResearch plan:\n\nObjective and scope\n'

def user_text(method,task):
    return (
      'Produce a research plan for the objective below.\n\n'
      f'Methodological framing: {METHODS[method]}\n\n'
      f'Research objective: {TASKS[task]}\n\n'
      'Use exactly these neutral section headings, in this order:\n- '
      + '\n- '.join(HEADINGS)
      + '\n\nDo not discuss this instruction. Return only the research plan.'
    )

def sha(s): return hashlib.sha256(s.encode('utf-8')).hexdigest()
rows=[]
for stage in STAGES:
  for task in TASKS:
    for method in METHODS:
      for rep in range(1,4):
        txt=user_text(method,task)
        raw_prompt=txt+RAW_COMPLETION_SUFFIX
        rid=f'P1-{stage}-{task}-{method}-R{rep:02d}'
        seed=int(sha(rid)[:8],16) & 0x7fffffff
        rows.append({
          'run_id':rid,'pilot':True,'counted_confirmatory':False,
          'training_stage':stage,'task_id':task,'method_family':method,'replicate':rep,
          'user_text':txt,'user_text_sha256':sha(txt),
          'raw_completion_prompt':raw_prompt,'raw_completion_prompt_sha256':sha(raw_prompt),
          'raw_rendering_version':'COMMON_RAW_V2_NEUTRAL_SCAFFOLD',
          'rendering_primary':'COMPLETION_NEUTRAL',
          'generation_settings':{
            'temperature':1.0,'top_p':1.0,'top_k':0,'min_p':0.0,'typical_p':1.0,
            'repeat_penalty':1.0,'presence_penalty':0.0,'frequency_penalty':0.0,
            'dry_multiplier':0.0,'xtc_probability':0.0,'dynatemp_range':0.0,
            'context_size':4096,'max_new_tokens':1200,'threads':10,'gpu_layers':0,
            'cache_prompt':False,'stream':False,'n_cmpl':1,'seed':seed,
          },
          'generation_status':'NOT_RUN',
        })
assert len(rows)==72
assert len({r['run_id'] for r in rows})==72
out=ROOT/'PILOT_MANIFEST_DRAFT_V1_0.jsonl'
out.write_text('\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n',encoding='utf-8')
meta={
 'status':'DRAFT_NOT_FROZEN','rows':72,'stages':STAGES,'methods':list(METHODS),
 'tasks':list(TASKS),'replicates_per_cell':3,
 'manifest_sha256':sha(out.read_text(encoding='utf-8')),
 'paid_execution_authorized':False,
}
(ROOT/'PILOT_MANIFEST_DRAFT_V1_0.meta.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
print('PILOT_MANIFEST_BUILD=PASS')
print('ROWS=72')
print('SHA256='+meta['manifest_sha256'])
