from __future__ import annotations
import hashlib,json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
PARENT=ROOT.parent/'methodological-framing-v01'
GATE=ROOT/'pilot_v01'/'analysis'/'PILOT_GATE.json'
OUT=ROOT/'confirmatory_v1_0'

STAGES=['BASE','SFT','DPO','RLVR']
REPS=6
HEADINGS=[
 'Objective and scope','Assumptions','Research design','Data or evidence needed',
 'Measurement','Analysis','Decision / stopping rule','Limitations'
]

def sha(s:str)->str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def load_json(p): return json.loads(p.read_text(encoding='utf-8'))

def main():
    if not GATE.exists():
        raise SystemExit('pilot gate missing')
    gate=load_json(GATE)
    if gate.get('status')!='GO':
        raise SystemExit('pilot gate is not GO; confirmatory design not built')

    method_bank=load_json(PARENT/'FROZEN_STUDY_A_METHOD_BANK_V1_0.json')
    task_bank=load_json(PARENT/'FROZEN_STUDY_A_TASK_BANK_V1_0.json')
    methods={
      x['family']:x['instruction']
      for x in method_bank['conditions'] if x['depth']=='LABEL_ONLY'
    }
    tasks={x['id']:x['objective'] for x in task_bank['tasks']}
    assert list(methods)==['GENERIC','DIFFERENTIAL','BAYESIAN','FALSIFICATION','CAUSAL','STATE_SPACE','SOFTWARE_TESTING']
    assert set(tasks)=={'T1','T2'}

    rows=[]
    for stage in STAGES:
      for task_id,objective in tasks.items():
        for method,instruction in methods.items():
          for rep in range(1,REPS+1):
            user=(
              'Produce a research plan for the objective below.\n\n'
              f'Methodological framing: {instruction}\n\n'
              f'Research objective: {objective}\n\n'
              'Use exactly these neutral section headings, in this order:\n- '
              + '\n- '.join(HEADINGS)
              + '\n\nDo not discuss this instruction. Return only the research plan.'
            )
            raw=user+'\n\nResearch plan:\n\nObjective and scope\n'
            rid=f'C1-{stage}-{task_id}-{method}-R{rep:02d}'
            seed=int(sha(rid)[:8],16)&0x7fffffff
            rows.append({
              'run_id':rid,
              'study':'TRAINING_METHOD_INTERACTION_CONFIRMATORY_V1_0',
              'counted_confirmatory':True,
              'training_stage':stage,
              'task_id':task_id,
              'method_family':method,
              'instruction_depth':'LABEL_ONLY',
              'replicate':rep,
              'user_text':user,
              'user_text_sha256':sha(user),
              'raw_completion_prompt':raw,
              'raw_completion_prompt_sha256':sha(raw),
              'rendering':'COMMON_RAW',
              'generation_settings':{
                'temperature':1.0,'top_p':1.0,'top_k':0,'min_p':0.0,'typical_p':1.0,
                'repeat_penalty':1.0,'presence_penalty':0.0,'frequency_penalty':0.0,
                'dry_multiplier':0.0,'xtc_probability':0.0,'dynatemp_range':0.0,
                'context_size':4096,'max_new_tokens':512,'threads':10,'gpu_layers':0,
                'cache_prompt':False,'stream':False,'n_cmpl':1,'seed':seed,
              },
              'generation_status':'NOT_RUN'
            })

    assert len(rows)==4*2*7*REPS==336
    assert len({r['run_id'] for r in rows})==336
    OUT.mkdir(parents=True,exist_ok=True)
    manifest=OUT/'CONFIRMATORY_MANIFEST_V1_0.jsonl'
    manifest.write_text('\n'.join(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)+'\n',encoding='utf-8')
    manifest_hash=sha(manifest.read_text(encoding='utf-8'))

    freeze={
      'status':'DESIGN_FROZEN_AFTER_PILOT_GO_BEFORE_CONFIRMATORY_COLLECTION',
      'study':'TrainingStage x MethodFraming confirmatory v1.0',
      'pilot_outputs_reused':0,
      'counted_runs_at_freeze':0,
      'denominator':336,
      'stages':STAGES,
      'methods':list(methods),
      'tasks':['T1','T2'],
      'replicates_per_cell':REPS,
      'primary_rendering':'COMMON_RAW',
      'manifest_sha256':manifest_hash,
      'n_rationale':'6 replicates/cell chosen from parent-study zero-cost subsampling stability proxy, not pilot effect size.',
      'primary_measurement':'Reuse parent FROZEN_STUDY_A_MEASUREMENT_V1_0.py principles/lexical masking and cross-task method recoverability, extended across training stages without tuning on confirmatory outputs.',
      'primary_estimand':'TrainingStage x MethodFraming moderation of cross-task recoverability.',
      'pilot_gate_status':'GO',
      'pilot_gate_file':'pilot_v01/analysis/PILOT_GATE.json',
      'paid_api_allowed':False,
      'paid_compute_allowed':False,
      'execution_authorized_by_this_freeze':False,
      'note':'This builder freezes design only. It does not launch 336 generations.'
    }
    (OUT/'CONFIRMATORY_FREEZE_V1_0.json').write_text(json.dumps(freeze,indent=2),encoding='utf-8')
    print('CONFIRMATORY_DESIGN_BUILD=PASS')
    print('N=336')
    print('MANIFEST_SHA256='+manifest_hash)

if __name__=='__main__':
    main()
