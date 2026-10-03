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
    struct={s:a['structure_only_by_stage'][s]['combined_accuracy'] for s in STAGES}
    length={s:a['length_only_by_stage'][s]['combined_accuracy'] for s in STAGES}
    residual={s:acc[s]-max(struct[s],length[s]) for s in STAGES}
    rec={s:a['method_by_stage'][s]['recall'] for s in STAGES}
    comp=a['compliance']
    diversity={s:a['within_cell_diversity_by_stage'][s]['diversity_1_minus_similarity'] for s in STAGES}
    chance=a.get('chance_method_accuracy',1/3)

    patterns=[]

    if acc['BASE']>chance and residual['BASE']>0:
        patterns.append(('Repertoire-first behavioral support',
          f"BASE lexical method accuracy={acc['BASE']:.3f} exceeds chance and its structure/length controls by {residual['BASE']:+.3f}. This is consistent with some method-linked behavior being routable before instruction tuning."))
    elif acc['BASE']>chance:
        patterns.append(('BASE signal may be surface/structural',
          f"BASE lexical accuracy exceeds chance, but its advantage over structure/length controls is only {residual['BASE']:+.3f}. Do not interpret this as repertoire evidence without stronger controls."))
    else:
        patterns.append(('No clear BASE method signal',
          'BASE does not exceed nominal method-class chance in this small calibration.'))

    sft_delta=acc['SFT']-acc['BASE']
    if sft_delta>0 and residual['SFT']>0:
        patterns.append(('Routing amplification candidate',
          f"SFT lexical method recoverability exceeds BASE by {sft_delta:+.3f}, with {residual['SFT']:+.3f} advantage over structure/length controls. Combined with compliance changes, this is consistent with stronger instruction routing."))
    elif sft_delta>0:
        patterns.append(('SFT gain may be compliance/structure-driven',
          f"SFT lexical accuracy rises by {sft_delta:+.3f}, but structure/length controls explain a comparable signal."))
    else:
        patterns.append(('No SFT method-recoverability gain',
          f"SFT does not exceed BASE in lexical method recoverability (Δ={sft_delta:+.3f})."))

    dpo_delta=acc['DPO']-acc['SFT']
    patterns.append(('SFT→DPO selection shift',
      f"Lexical method recoverability changes by {dpo_delta:+.3f}; DPO residual over structure/length is {residual['DPO']:+.3f}. Interpret family recalls and compliance before attributing this to preference selection."))
    dpo_div_delta=diversity['DPO']-diversity['SFT']
    if dpo_div_delta < 0:
        patterns.append(('DPO diversity compression candidate',
          f"Within-cell residual lexical diversity changes SFT→DPO by {dpo_div_delta:+.3f}, directionally consistent with preference optimization narrowing response variation."))
    else:
        patterns.append(('No DPO diversity compression in this pilot',
          f"Within-cell residual lexical diversity changes SFT→DPO by {dpo_div_delta:+.3f}; the expected compression pattern is not present."))

    sw_dpo=rec['DPO']['SOFTWARE_TESTING']['recall']
    sw_rl=rec['RLVR']['SOFTWARE_TESTING']['recall']
    bay_dpo=rec['DPO']['BAYESIAN']['recall']
    bay_rl=rec['RLVR']['BAYESIAN']['recall']
    if sw_rl>sw_dpo and (sw_rl-sw_dpo)>(bay_rl-bay_dpo) and residual['RLVR']>0:
        patterns.append(('Verifier-affinity pattern present',
          f"SOFTWARE_TESTING recall rises DPO→RLVR by {sw_rl-sw_dpo:+.3f}, more than BAYESIAN ({bay_rl-bay_dpo:+.3f}), while RLVR lexical signal exceeds gross controls. This is directionally consistent with selective reinforcement of verification-oriented strategies."))
    else:
        patterns.append(('No clear verifier-selective amplification',
          f"SOFTWARE_TESTING DPO→RLVR change={sw_rl-sw_dpo:+.3f}; BAYESIAN change={bay_rl-bay_dpo:+.3f}; RLVR residual lexical advantage={residual['RLVR']:+.3f}. The preregistered directional pattern is not clearly present."))

    cross=a.get('cross_stage_method_transfer',{})
    b2s=(cross.get('BASE',{}).get('SFT') or {}).get('accuracy')
    if b2s is not None:
        if b2s>chance:
            patterns.append(('BASE→SFT behavioral continuity',
              f"Cross-stage method transfer BASE→SFT={b2s:.3f} (> nominal chance), consistent with some observable signature persisting across the instruction-tuning boundary."))
        else:
            patterns.append(('Weak BASE→SFT transfer',
              f"Cross-stage method transfer BASE→SFT={b2s:.3f}; no strong behavioral continuity is demonstrated."))

    stage_acc=a['stage_cross_task']['combined_accuracy']
    max_method=max(acc.values())
    stage_note=(
        'Stage identity is more recoverable than the strongest method identity; stage-style confounding remains important.'
        if stage_acc>max_method else
        'Method identity is at least as recoverable as stage identity in this calibration, reducing (not eliminating) stage-style concern.'
    )

    lines=['# Training Stage × Method Framing — Pilot Interpretation','',
           '**Calibration only. This report does not upgrade the 72-run pilot into confirmatory evidence.**','',
           f"Pilot gate: **{g['status']}**",'',
           '## Method recoverability and gross controls','',
           '| stage | lexical acc | structure-only | length-only | lexical advantage | macro recall |',
           '|---|---:|---:|---:|---:|---:|']
    for s in STAGES:
        lines.append(f"| {s} | {acc[s]:.3f} | {struct[s]:.3f} | {length[s]:.3f} | {residual[s]:+.3f} | {a['method_by_stage'][s]['macro_recall']:.3f} |")

    lines += ['','## Within-cell residual lexical diversity','']
    for s in STAGES:
        lines.append(f"- {s}: {diversity[s]:.3f}")
    lines += ['','## Pattern interpretation','']
    for title,txt in patterns:
        lines += [f'### {title}',txt,'']

    lines += ['## Stage-identity control','',
              f'- stage cross-task accuracy: {stage_acc:.3f}',
              f'- strongest lexical method accuracy: {max_method:.3f}',
              f'- {stage_note}','',
              '## Compliance','']
    for s in STAGES:
        x=comp[s]
        lines.append(f"- {s}: all-headings={x['all_headings_rate']:.2f}, refusal={x['refusal_rate']:.2f}, mean words={x['mean_word_count']:.1f}")

    lines += ['','## Claim ceiling','',
              'Allowed: describe calibration-stage behavioral differences and decide whether a larger confirmatory design is justified.',
              'Not allowed: infer hidden chain-of-thought, claim a one-to-one mapping from training algorithm to cognitive faculty, or rank methodologies by scientific quality.',
              '',
              '## Decision handling','',
              'If NO_GO: do not enlarge the dataset. Report which gate failed and answer from the parent 714-plan study plus this pilot.',
              'If GO: proceed only to confirmatory-design sizing/freeze; pilot outputs remain excluded from the confirmatory denominator.']

    OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('PILOT_INTERPRETATION=PASS')

if __name__=='__main__':
    main()
