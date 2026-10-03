import json
from pathlib import Path
ROOT=Path(r"C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01")
an=json.loads((ROOT/'pilot_v01'/'analysis'/'PILOT_ANALYSIS.json').read_text(encoding='utf-8'))
invalid=json.loads((ROOT/'pilot_v01'/'analysis'/'INVALID_OUTPUTS_DETAIL.json').read_text(encoding='utf-8'))
bad={x['run_id'] for x in invalid}
out=[]
for stage,x in an['method_by_stage'].items():
    preds=x['T1_to_T2']['predictions']+x['T2_to_T1']['predictions']
    badpred=[p for p in preds if p['id'] in bad]
    goodpred=[p for p in preds if p['id'] not in bad]
    out.append({
      'stage':stage,
      'official_accuracy':x['combined_accuracy'],
      'invalid_n':len(badpred),
      'invalid_correct':sum(p['true']==p['pred'] for p in badpred),
      'valid_n':len(goodpred),
      'valid_only_test_accuracy_descriptive':sum(p['true']==p['pred'] for p in goodpred)/len(goodpred) if goodpred else None,
      'invalid_predictions':badpred
    })
o=ROOT/'pilot_v01'/'analysis'/'INVALID_PREDICTION_IMPACT.json'
o.write_text(json.dumps(out,indent=2),encoding='utf-8')
lines=['# Invalid-output impact on method classification','',
'**Post-hoc descriptive sensitivity. Official pilot accuracies and NO_GO decision are unchanged.**','',
'| stage | official acc | invalid test n | invalid correct | valid-only test acc* |',
'|---|---:|---:|---:|---:|']
for x in out:
    v=x['valid_only_test_accuracy_descriptive']
    lines.append(f"| {x['stage']} | {x['official_accuracy']:.3f} | {x['invalid_n']} | {x['invalid_correct']} | {v:.3f} |")
lines += ['','*This only removes invalid items from scoring after the original classifiers/predictions were produced. It is not a refit and cannot replace the official analysis.']
(ROOT/'pilot_v01'/'analysis'/'INVALID_PREDICTION_IMPACT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('INVALID_IMPACT=PASS')
