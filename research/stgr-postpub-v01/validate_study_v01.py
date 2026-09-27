from __future__ import annotations
import json, sys
from pathlib import Path
from study_lib_v01 import TRACK_FILES, load_schema, read_jsonl, study_status

BASE = Path(__file__).resolve().parent

def main():
    schema=load_schema(BASE)
    errors=[]
    for track,(events_name,results_name) in TRACK_FILES.items():
        events=read_jsonl(BASE/events_name)
        results=read_jsonl(BASE/results_name)
        target=int(schema["tracks"][track]["target_natural_events"])
        if len(events)>target:
            errors.append(f"{track}: events exceed target")
        if len(results)>len(events):
            errors.append(f"{track}: more results than events")
        expected_prefix="RQA" if track=="RQ-A" else "RQB"
        for i,row in enumerate(events,1):
            expected=f"{expected_prefix}-{i:03d}"
            if row.get("event_id")!=expected:
                errors.append(f"{track}: event order mismatch at {i}: {row.get('event_id')} != {expected}")
            if row.get("lifecycle")!="STATE_FROZEN":
                errors.append(f"{track} {expected}: invalid event lifecycle")
            if row.get("state_frozen_before_consequential_action") is not True:
                errors.append(f"{track} {expected}: state not frozen before action")
        event_ids={x.get("event_id") for x in events}
        seen=set()
        for row in results:
            eid=row.get("event_id")
            if eid not in event_ids:
                errors.append(f"{track}: orphan result {eid}")
            if eid in seen:
                errors.append(f"{track}: duplicate result {eid}")
            seen.add(eid)
            if row.get("lifecycle")!="RESULT_RECORDED":
                errors.append(f"{track} {eid}: invalid result lifecycle")
    print(json.dumps(study_status(BASE),ensure_ascii=False,indent=2))
    if errors:
        for e in errors:
            print("ERROR:",e,file=sys.stderr)
        return 1
    print("OVERALL: PASS")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
