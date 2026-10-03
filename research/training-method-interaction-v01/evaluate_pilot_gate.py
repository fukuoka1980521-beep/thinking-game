from __future__ import annotations
import json,re,sys
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'pilot_v01'/'raw'
AN=ROOT/'pilot_v01'/'analysis'/'PILOT_ANALYSIS.json'
OUT=ROOT/'pilot_v01'/'analysis'

TASK_TERMS={
 'T1':['response','question','variation','factor','observation','explanation'],
 'T2':['site','process','time','completion','factor','observation','difference'],
}

def plan_valid(r):
    text=str(r.get('raw_text',''))
    low=text.lower()
    words=len(re.findall(r"\b[A-Za-z][A-Za-z'-]*\b",text))
    refusal=bool(re.search(r"\b(i cannot|i can't|unable to|cannot comply)\b",low))
    corruption=any(x in text for x in ['<|user|>','<|assistant|>','<|system|>'])
    terms=TASK_TERMS.get(r.get('task_id'),[])
    hits=sum(t in low for t in terms)
    return bool(words>=100 and not refusal and not corruption and hits>=2)

def main():
    if not AN.exists():
        raise SystemExit('pilot analysis missing')
    files=sorted(RAW.glob('*.json'))
    if len(files)!=72:
        raise SystemExit(f'pilot incomplete {len(files)}/72')
    rows=[json.loads(p.read_text(encoding='utf-8')) for p in files]
    analysis=json.loads(AN.read_text(encoding='utf-8'))

    valid=[plan_valid(r) for r in rows]
    valid_rate=sum(valid)/len(valid)
    stage_valid={}
    for stage in ['BASE','SFT','DPO','RLVR']:
        z=[v for r,v in zip(rows,valid) if r['training_stage']==stage]
        stage_valid[stage]=sum(z)/len(z)

    method_acc={s:x['combined_accuracy'] for s,x in analysis['method_by_stage'].items()}
    chance=1/3
    max_stage=max(method_acc,key=method_acc.get)
    min_stage=min(method_acc,key=method_acc.get)
    spread=method_acc[max_stage]-method_acc[min_stage]
    # Combined per-stage cross-task accuracy uses 18 predictions; two-correct difference = 2/18.
    min_interaction_resolution=2/18

    cross_vals=[]
    for a,row in analysis.get('cross_stage_method_transfer',{}).items():
        for b,x in row.items():
            cross_vals.append((a,b,x['accuracy']))
    best_cross=max(cross_vals,key=lambda x:x[2]) if cross_vals else (None,None,0)

    gates={
      'G1_valid_rate_ge_95pct':valid_rate>=0.95,
      'G2_each_stage_valid_rate_ge_80pct':all(v>=0.80 for v in stage_valid.values()),
      'G3_method_signal_above_chance_some_stage':max(method_acc.values())>chance,
      'G4_stage_interaction_measurable_at_two_correct_resolution':spread>=min_interaction_resolution,
    }
    go=all(gates.values())
    result={
      'status':'GO' if go else 'NO_GO',
      'role':'CALIBRATION_GATE_ONLY',
      'valid_rate':valid_rate,
      'stage_valid_rate':stage_valid,
      'method_accuracy_by_stage':method_acc,
      'method_accuracy_chance':chance,
      'max_method_stage':max_stage,
      'min_method_stage':min_stage,
      'stage_accuracy_spread':spread,
      'minimum_interaction_resolution':min_interaction_resolution,
      'best_cross_stage_method_transfer':{'train':best_cross[0],'test':best_cross[1],'accuracy':best_cross[2]},
      'stage_identity_accuracy':analysis['stage_cross_task']['combined_accuracy'],
      'gates':gates,
      'decision':'Proceed to confirmatory-design sizing/freeze' if go else 'Do not launch confirmatory collection; answer from pilot/current evidence and report failed gate(s).',
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'PILOT_GATE.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    lines=['# Pilot Gate','',f"**Decision: {result['status']}**",'',
           f"- valid outputs: {valid_rate:.3f}",
           f"- method accuracy range: {method_acc[min_stage]:.3f} ({min_stage}) to {method_acc[max_stage]:.3f} ({max_stage})",
           f"- stage spread: {spread:.3f}",
           f"- stage-identity cross-task accuracy: {result['stage_identity_accuracy']:.3f}",
           f"- best cross-stage method transfer: {best_cross[0]} → {best_cross[1]} = {best_cross[2]:.3f}",
           '',
           '## Gates','']
    for k,v in gates.items(): lines.append(f"- {'PASS' if v else 'FAIL'} — {k}")
    lines += ['','This gate decides whether a larger confirmatory design is worth launching. Pilot outputs remain calibration-only.']
    (OUT/'PILOT_GATE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PILOT_GATE='+result['status'])
    sys.exit(0)
if __name__=='__main__':
    main()
