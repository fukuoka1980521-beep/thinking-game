from __future__ import annotations
import json
from collections import defaultdict
from pathlib import Path
import pilot_measurement_v0_1 as m
ROOT=Path(__file__).resolve().parent
RAW=ROOT/'pilot_v01'/'raw'; OUT=ROOT/'pilot_v01'/'analysis'

def load():
 rows=[]
 for p in sorted(RAW.glob('*.json')):
  r=json.loads(p.read_text(encoding='utf-8'))
  rows.append({'id':r['run_id'],'training_stage':r['training_stage'],'task_id':r['task_id'],'method_family':r['method_family'],'text':r['raw_text']})
 return rows

def recall(preds,classes):
 out={}
 for c in classes:
  z=[x for x in preds if x['true']==c]; n=len(z); k=sum(x['pred']==c for x in z)
  out[c]={'correct':k,'n':n,'recall':k/n if n else None}
 return out

def main():
 rows=load()
 if len(rows)!=72: raise SystemExit(f'pilot incomplete {len(rows)}/72')
 result={'status':'PILOT_CALIBRATION_ONLY','n':72,'method_by_stage':{},'stage_cross_task':{},'compliance':{}}
 for stage in m.STAGES:
  z=[r for r in rows if r['training_stage']==stage]; t1=[r for r in z if r['task_id']=='T1']; t2=[r for r in z if r['task_id']=='T2']
  a=m.classify(t1,t2,'method_family',m.METHODS); b=m.classify(t2,t1,'method_family',m.METHODS); preds=a['predictions']+b['predictions']
  result['method_by_stage'][stage]={'T1_to_T2':a,'T2_to_T1':b,'combined_accuracy':(a['correct']+b['correct'])/(a['n']+b['n']),'recall':recall(preds,m.METHODS)}
 t1=[r for r in rows if r['task_id']=='T1']; t2=[r for r in rows if r['task_id']=='T2']
 a=m.classify(t1,t2,'training_stage',m.STAGES); b=m.classify(t2,t1,'training_stage',m.STAGES)
 result['stage_cross_task']={'T1_to_T2':a,'T2_to_T1':b,'combined_accuracy':(a['correct']+b['correct'])/(a['n']+b['n'])}
 for stage in m.STAGES:
  cs=[m.compliance(r['text']) for r in rows if r['training_stage']==stage]
  result['compliance'][stage]={'valid_nonempty_rate':sum(x['nonempty'] for x in cs)/len(cs),'all_headings_rate':sum(x['all_headings'] for x in cs)/len(cs),'refusal_rate':sum(x['refusal_like'] for x in cs)/len(cs),'mean_word_count':sum(x['word_count'] for x in cs)/len(cs)}
 OUT.mkdir(parents=True,exist_ok=True); (OUT/'PILOT_ANALYSIS.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
 lines=['# Pilot Analysis','', '**Calibration only; not confirmatory.**','']
 for s,x in result['method_by_stage'].items(): lines += [f'- {s} method cross-task accuracy: **{x["combined_accuracy"]:.3f}**']
 lines += ['',f'- Stage cross-task accuracy: **{result["stage_cross_task"]["combined_accuracy"]:.3f}**','', '## Compliance','']
 for s,x in result['compliance'].items(): lines.append(f'- {s}: headings={x["all_headings_rate"]:.2f}, refusal={x["refusal_rate"]:.2f}, words={x["mean_word_count"]:.1f}')
 (OUT/'PILOT_ANALYSIS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8'); print('PILOT_ANALYSIS=PASS')
if __name__=='__main__': main()
