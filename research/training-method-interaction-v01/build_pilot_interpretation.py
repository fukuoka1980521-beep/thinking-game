from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
AN=ROOT/'pilot_v01'/'analysis'/'PILOT_ANALYSIS.json'
GATE=ROOT/'pilot_v01'/'analysis'/'PILOT_GATE.json'
OUT=ROOT/'pilot_v01'/'analysis'/'PILOT_INTERPRETATION.md'
STAGES=['BASE','SFT','DPO','RLVR']

def main():
    if not AN.exists() or not GATE.exists():
        raise SystemExit('analysis/gate missing')
    a=json.loads(AN.read_text(encoding='utf-8'))
    g=json.loads(GATE.read_text(encoding='utf-8'))
    acc={s:a['method_by_stage'][s]['combined_accuracy'] for s in STAGES}
    rec={s:a['method_by_stage'][s]['recall'] for s in STAGES}
    comp=a['compliance']
    chance=a.get('chance_method_accuracy',1/3)

    patterns=[]
    if acc['BASE']>chance:
        patterns.append(('Repertoire-first support',
          'BASE method recoverability is above nominal 1/3 chance, consistent with some routable method-linked behavior existing before instruction tuning.'))
    else:
        patterns.append(('No clear BASE method signal',
          'BASE does not exceed nominal method-class chance in this small calibration, so the pilot does not support a strong repertoire-first behavioral claim.'))

    if acc['SFT']>acc['BASE']:
        patterns.append(('Routing amplification',
          f"SFT method recoverability exceeds BASE by {acc['SFT']-acc['BASE']:.3f}; together with compliance changes, this is consistent with instruction tuning strengthening routing from named instructions into stable behavior."))
    else:
        patterns.append(('No SFT method-recoverability gain',
          f"SFT does not exceed BASE in method recoverability (Δ={acc['SFT']-acc['BASE']:.3f}); any SFT effect is more likely visible in generic compliance/formatting than method separation."))

    dpo_delta=acc['DPO']-acc['SFT']
    patterns.append(('SFT→DPO selection shift',
      f"Method recoverability changes by {dpo_delta:+.3f}. Interpret together with family recalls and compliance; this stage is about preference reshaping, not automatically 'more reasoning'."))

    rl_delta=acc['RLVR']-acc['DPO']
    sw_dpo=rec['DPO']['SOFTWARE_TESTING']['recall']
    sw_rl=rec['RLVR']['SOFTWARE_TESTING']['recall']
    bay_dpo=rec['DPO']['BAYESIAN']['recall']
    bay_rl=rec['RLVR']['BAYESIAN']['recall']
    if sw_rl>sw_dpo and (sw_rl-sw_dpo)>(bay_rl-bay_dpo):
        patterns.append(('Verifier-affinity pattern present',
          f"SOFTWARE_TESTING recall rises DPO→RLVR by {sw_rl-sw_dpo:+.3f}, more than BAYESIAN ({bay_rl-bay_dpo:+.3f}). This is directionally consistent with selective reinforcement of verification-oriented strategies."))
    else:
        patterns.append(('No clear verifier-selective amplification',
          f"SOFTWARE_TESTING DPO→RLVR change={sw_rl-sw_dpo:+.3f}; BAYESIAN change={bay_rl-bay_dpo:+.3f}. The preregistered directional pattern is not clearly present in this calibration."))

    cross=a.get('cross_stage_method_transfer',{})
    b2s=(cross.get('BASE',{}).get('SFT') or {}).get('accuracy')
    if b2s is not None:
        if b2s>chance:
            patterns.append(('BASE→SFT transfer',
              f"Cross-stage method transfer BASE→SFT={b2s:.3f} (> nominal chance), supporting continuity of some observable method signature across the instruction-tuning boundary."))
        else:
            patterns.append(('Weak BASE→SFT transfer',
              f"Cross-stage method transfer BASE→SFT={b2s:.3f}; the calibration does not show strong behavioral continuity across the instruction-tuning boundary."))

    stage_acc=a['stage_cross_task']['combined_accuracy']
    max_method=max(acc.values())
    if stage_acc>max_method:
        stage_note='Stage identity is more recoverable than the strongest within-stage method identity; stage-style confounding remains important.'
    else:
        stage_note='Method identity is at least as recoverable as stage identity in this calibration, reducing (not eliminating) concern that results are only stage-style artifacts.'

    lines=['# Training Stage × Method Framing — Pilot Interpretation','',
           '**Calibration only. This report does not upgrade the 72-run pilot into confirmatory evidence.**','',
           f"Pilot gate: **{g['status']}**",'',
           '## Method recoverability by stage','',
           '| stage | accuracy | macro recall |',
           '|---|---:|---:|']
    for s in STAGES:
        lines.append(f"| {s} | {acc[s]:.3f} | {a['method_by_stage'][s]['macro_recall']:.3f} |")
    lines += ['','## Pattern interpretation','']
    for title,txt in patterns:
        lines += [f'### {title}',txt,'']
    lines += ['## Stage-identity control','',f'- stage cross-task accuracy: {stage_acc:.3f}',f'- strongest method accuracy: {max_method:.3f}',f'- {stage_note}','',
              '## Compliance','']
    for s in STAGES:
        x=comp[s]
        lines.append(f"- {s}: all-headings={x['all_headings_rate']:.2f}, refusal={x['refusal_rate']:.2f}, mean words={x['mean_word_count']:.1f}")
    lines += ['','## Claim ceiling','',
              'Allowed from this pilot: describe observed behavioral stage differences and decide whether a larger confirmatory design is justified.',
              'Not allowed: infer hidden chain-of-thought, claim a one-to-one mapping from training algorithm to cognitive faculty, or rank methodologies by quality.',
              '',
              '## If gate is NO_GO','',
              'Do not collect a larger confirmatory dataset. Use this pilot plus the completed parent 714-plan study to report where the training-stage extension failed and whether the failure was measurement, generation validity, weak method signal, or insufficient stage interaction.',
              '',
              '## If gate is GO','',
              'Proceed only to confirmatory-design sizing and freeze. The pilot outputs remain excluded from the confirmatory denominator.'
    ]
    OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PILOT_INTERPRETATION=PASS')

if __name__=='__main__':
    main()
