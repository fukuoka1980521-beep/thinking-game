from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
AN=ROOT/'pilot_v01'/'analysis'/'PILOT_ANALYSIS.json'
GATE=ROOT/'pilot_v01'/'analysis'/'PILOT_GATE.json'
OUT=ROOT/'pilot_v01'/'analysis'/'PROGRAM_DECISION_REPORT.md'

def main():
    if not AN.exists() or not GATE.exists():
        raise SystemExit('pilot analysis/gate missing')
    a=json.loads(AN.read_text(encoding='utf-8'))
    g=json.loads(GATE.read_text(encoding='utf-8'))
    acc={s:a['method_by_stage'][s]['combined_accuracy'] for s in ['BASE','SFT','DPO','RLVR']}
    chance=a.get('chance_method_accuracy',1/3)
    stage_acc=a['stage_cross_task']['combined_accuracy']
    failed=[k for k,v in g.get('gates',{}).items() if not v]

    lines=[
      '# Training Stage × Method Framing — Program Decision Report','',
      f"**Pilot decision: {g['status']}**",'',
      '## Completed','',
      '- Four-stage OLMo 2 lineage available locally: BASE / SFT / DPO / RLVR.',
      '- Template smoke 7/7 complete; COMMON_RAW selected.',
      '- Calibration pilot complete: 72/72 outputs.',
      '- No paid API or paid compute used.',
      '- Method, structure-only, length-only, diversity, stage-identity and cross-stage-transfer analyses complete.',
      '',
      '## Core pilot result','',
      '| Stage | Method accuracy |',
      '|---|---:|',
    ]
    for s in ['BASE','SFT','DPO','RLVR']:
        lines.append(f'| {s} | {acc[s]:.3f} |')
    lines += [
      '',
      f'- nominal method chance: {chance:.3f}',
      f'- stage-identity cross-task accuracy: {stage_acc:.3f}',
      '',
      '## Failed / unresolved gates','',
    ]
    if failed:
        for x in failed: lines.append(f'- {x}')
    else:
        lines.append('- none; calibration gate passed.')

    if g['status']=='GO':
        lines += [
          '',
          '## Currently possible next','',
          '- Freeze a larger confirmatory design without reusing pilot outputs.',
          '- Use the existing four local checkpoints and COMMON_RAW rendering.',
          '- Preserve the same deterministic measurement and gross controls.',
          '',
          '## Current limitation','',
          '- Pilot is calibration-only and cannot support the final TrainingStage × MethodFraming causal claim.',
          '- Algorithm-only causality remains unavailable because data/objective change across post-training stages.',
          '',
          '## Impact','',
          'The pilot justifies a confirmatory test but does not itself establish the full stage interaction.',
          '',
          '## Current answer','',
          'The tested post-training stages produce measurable differences worth a preregistered confirmatory study. The pilot remains excluded from that confirmatory denominator.'
        ]
    else:
        lines += [
          '',
          '## Currently unavailable','',
          '- A larger confirmatory TrainingStage × MethodFraming claim is not justified under the frozen calibration rule.',
          '',
          '## External alternatives','',
          '- Additional external models/compute are not used merely to rescue a failed calibration.',
          '- A new lineage or revised measurement would be a new study, not continuation of this frozen pilot.',
          '',
          '## Impact','',
          'The failed gate limits only the new training-stage mechanism claim. It does not overturn the parent 714-plan finding that methodological framing changes observable research-plan behavior.',
          '',
          '## Current answer','',
          'Answer from the parent replicated study plus the completed pilot boundary evidence; report the failed gate(s) rather than enlarging N.'
        ]

    lines += [
      '',
      '## Causal boundary','',
      'Even a GO result concerns the published OLMo post-training pipeline as a stage treatment. It does not isolate the optimization algorithm from its changing training data.',
    ]
    OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PROGRAM_DECISION_REPORT=PASS')

if __name__=='__main__':
    main()
