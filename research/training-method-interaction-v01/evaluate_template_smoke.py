from __future__ import annotations
import json
from pathlib import Path
import pilot_measurement_v0_1 as m

ROOT=Path(__file__).resolve().parent
RAW=ROOT/'template_smoke'/'raw'
STAGES=['BASE','SFT','DPO','RLVR']
POST=['SFT','DPO','RLVR']

def load(stage,rendering):
    p=RAW/f'SMOKE-{stage}-{rendering.upper()}.json'
    if not p.exists(): return None
    r=json.loads(p.read_text(encoding='utf-8'))
    c=m.compliance(r.get('raw_text',''))
    low=r.get('raw_text','').lower()
    objective_hits=sum(x in low for x in ['response','question','variation','factor','observation','explanation'])
    return {
        'file':p.name,
        'chars':len(r.get('raw_text','')),
        'elapsed_seconds':r.get('elapsed_seconds'),
        **c,
        'objective_keyword_hits':objective_hits,
        'valid_for_gate':bool(c['nonempty'] and not c['refusal_like'] and c['headings_present']>=6 and objective_hits>=2),
    }

def main():
    raw={s:load(s,'raw') for s in STAGES}
    native={s:load(s,'native') for s in POST}
    raw_complete=all(raw.values())
    native_complete=all(native.values())
    decision='INCOMPLETE'
    if raw_complete:
        if not raw['BASE']['valid_for_gate']:
            decision='STOP_BASE_RAW_INVALID'
        elif all(x['valid_for_gate'] for x in raw.values()):
            decision='GO_COMMON_RAW'
        elif native_complete and all(native[s]['valid_for_gate'] for s in POST):
            decision='GO_STAGE_NATIVE_WITH_RAW_SENSITIVITY'
        elif native_complete:
            decision='STOP_TEMPLATE_FEASIBILITY_FAILED'
    result={'status':'TEMPLATE_SMOKE_GATE','raw':raw,'native_posttrained':native,'decision':decision}
    out=ROOT/'template_smoke'
    out.mkdir(exist_ok=True)
    (out/'TEMPLATE_SMOKE_GATE.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    lines=['# Template Smoke Gate','',f'**Decision: {decision}**','']
    for kind,group in [('COMMON_RAW',raw),('STAGE_NATIVE_POSTTRAINED',native)]:
        lines += ['## '+kind,'','| stage | present | valid | headings | refusal | words | objective hits | seconds |','|---|---:|---:|---:|---:|---:|---:|---:|']
        for s,x in group.items():
            if x is None: lines.append(f'| {s} | 0 | - | - | - | - | - | - |')
            else: lines.append(f"| {s} | 1 | {int(x['valid_for_gate'])} | {x['headings_present']} | {int(x['refusal_like'])} | {x['word_count']} | {x['objective_keyword_hits']} | {x.get('elapsed_seconds') or 0:.1f} |")
        lines.append('')
    (out/'TEMPLATE_SMOKE_GATE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('TEMPLATE_SMOKE_DECISION='+decision)

if __name__=='__main__':
    main()
