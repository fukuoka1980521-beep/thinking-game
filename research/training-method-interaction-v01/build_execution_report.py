from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
STATE=ROOT/'AUTORUN_STATE.json'
SMOKE=ROOT/'template_smoke'/'raw'
PILOT=ROOT/'pilot_v01'/'raw'
ANALYSIS=ROOT/'pilot_v01'/'analysis'/'PILOT_ANALYSIS.json'
EXT=ROOT/'EXTERNAL_EVIDENCE_SYNTHESIS_V1_0.md'

STAGES=['BASE','SFT','DPO','RLVR']

def exists_smoke(stage,rendering):
    return (SMOKE/f'SMOKE-{stage}-{rendering.upper()}.json').exists()

def main():
    s=json.loads(STATE.read_text(encoding='utf-8')) if STATE.exists() else {}
    rows=[]
    for stage in STAGES:
        ds=s.get('downloads',{}).get(stage,{})
        ready=ds.get('status')=='READY'
        raw=exists_smoke(stage,'raw')
        native=exists_smoke(stage,'native') if stage!='BASE' else None
        if ready and raw and (stage=='BASE' or native):
            state='DO_NOW_COMPLETE'
            cause='Required local model and smoke outputs are available.'
            impact='none'
            next_action='Use existing outputs in analysis; do not regenerate.'
        elif ready:
            state='DO_NOW'
            cause='Model is locally available; smoke generation is pending or running.'
            impact='none'
            next_action='Run/continue frozen smoke automatically.'
        elif ds.get('status')=='DOWNLOADING':
            state='DEFER_WITH_DEPENDENCY'
            cause='Model checkpoint is still downloading locally.'
            impact='delays stage comparison only; does not affect completed-stage evidence'
            next_action='Continue independent analysis while supervisor resumes download automatically.'
        else:
            state='EXTERNAL_OPTION'
            cause='Local model artifact is not ready and no active local dependency is recorded.'
            impact='stage-specific inference unavailable until alternative or local artifact exists'
            next_action='Check external/open checkpoint or zero-cost inference route before reducing claim scope.'
        rows.append((stage,state,cause,impact,next_action))

    pilot_count=len(list(PILOT.glob('*.json'))) if PILOT.exists() else 0
    if ANALYSIS.exists():
        pilot_state='DO_NOW_COMPLETE'
        pilot_note='72-run pilot analysis exists.'
    elif pilot_count:
        pilot_state='DO_NOW'
        pilot_note=f'{pilot_count}/72 pilot outputs exist; continue frozen generation.'
    else:
        pilot_state='DEFER_WITH_DEPENDENCY'
        pilot_note='0/72 pilot outputs; waiting for template-smoke gate and all required models.'

    lines=['# Current Execution Decision Report','',
           f"- project state: **{s.get('status','UNKNOWN')}**",
           f"- runtime backend: **{s.get('runtime_backend','pending')}**",
           f"- pilot outputs: **{pilot_count}/72**",
           f"- external evidence synthesis available: **{EXT.exists()}**",
           '',
           '## Stage-by-stage decision','',
           '| stage | decision | immediate cause | impact if unresolved | next action |',
           '|---|---|---|---|---|']
    for row in rows:
        lines.append('| '+' | '.join(x.replace('|','/') for x in row)+' |')
    lines += ['', '## Pilot', '', f'- **{pilot_state}** — {pilot_note}', '',
              '## Reporting rule if a stage ultimately cannot be completed','',
              '1. Preserve all completed stage evidence.',
              '2. Search open/current external alternatives before abandoning the stage.',
              '3. Reject alternatives that change the scientific treatment or add uncontrolled confounds.',
              '4. If no valid alternative exists, answer from completed stages only.',
              '5. State the missing stage, root cause, and exact claim impact:',
              '   - precision only;',
              '   - generalizability;',
              '   - causal interpretation;',
              '   - or claim invalidation.',
              '',
              '## Current best-supported answer if execution stopped now','',
              '- BASE already produces substantive research-plan behavior under an identical raw scaffold.',
              '- SFT materially improves instruction routing/structural compliance under the same raw scaffold.',
              '- Native SFT chat rendering improves compliance further, showing that interface/template contributes in addition to weight-stage differences.',
              '- DPO and RLVR effects remain unresolved until their local smoke/pilot outputs exist.',
              '- Therefore current evidence supports a **pretraining repertoire + SFT routing** account, but not yet claims about preference-selection or RLVR verifier effects.'
    ]
    (ROOT/'CURRENT_EXECUTION_DECISION_REPORT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('EXECUTION_DECISION_REPORT=PASS')

if __name__=='__main__':
    main()
