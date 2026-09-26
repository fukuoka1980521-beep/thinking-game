#!/usr/bin/env python3
import json, sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
LOG=HERE/"TRACE_LOG_V1_4.jsonl"

MANDATORY={"REPEATED_REPAIR","OWNER_MANUAL_REPEAT","LOCAL_GLOBAL_DIVERGENCE","EVIDENCE_STALL","MEASUREMENT_CONFLICT","LIVE_EVIDENCE_GAP"}

def load():
    if not LOG.exists():
        print("TRACE_LOG_ABSENT=OK")
        return []
    rows=[]
    for n,line in enumerate(LOG.read_text(encoding="utf-8").splitlines(),1):
        if not line.strip(): continue
        try: obj=json.loads(line)
        except Exception as e: raise SystemExit(f"BAD_JSON line={n}: {e}")
        rows.append(obj)
    return rows

def main():
    rows=load()
    if not rows:
        return
    seen=set()
    by_task={}
    violations=[]
    for i,r in enumerate(rows,1):
        for k in ["trace_id","event_id","global_goal_id","local_task_id","action_index","action_type","action_result","local_success","evidence_delta","owner_touch","trigger_flags","global_reassessment_performed","decision"]:
            if k not in r: violations.append(f"missing {k} at row {i}")
        eid=r.get("event_id")
        if eid in seen: violations.append(f"duplicate event_id {eid}")
        seen.add(eid)
        task=r.get("local_task_id")
        hist=by_task.setdefault(task,[])
        expected=set()

        recent_repairs=[x for x in hist if x.get("action_type") in {"PATCH","RETRY"} and x.get("evidence_delta")!="GLOBAL_EVIDENCE_GAIN"]
        if len(recent_repairs)>=2: expected.add("REPEATED_REPAIR")

        owner_relays=[x for x in hist if x.get("owner_touch") and x.get("owner_touch_type") in {"RELAY","TERMINAL","UI"}]
        if owner_relays and r.get("owner_touch") and r.get("owner_touch_type") in {"RELAY","TERMINAL","UI"}:
            expected.add("OWNER_MANUAL_REPEAT")

        recent_local_success=[x for x in hist if x.get("local_success") and x.get("evidence_delta") in {"LOCAL_ONLY_GAIN","NO_EVIDENCE_GAIN"}]
        if r.get("local_success"): expected.add("LOCAL_SUCCESS")
        if len(recent_local_success)>=1 and r.get("local_success") and r.get("evidence_delta") in {"LOCAL_ONLY_GAIN","NO_EVIDENCE_GAIN"}:
            expected.add("LOCAL_GLOBAL_DIVERGENCE")

        if len(hist)>=2 and all(x.get("evidence_delta")=="NO_EVIDENCE_GAIN" for x in hist[-2:]):
            expected.add("EVIDENCE_STALL")

        flags=set(r.get("trigger_flags") or [])
        missing=expected-flags
        if missing: violations.append(f"{eid}: missing derived flags {sorted(missing)}")

        # Newly observed mandatory triggers become pending for the next
        # mutating continuation. Explicit reassessment clears the pending set.
        new_mandatory=flags & MANDATORY
        if r.get("global_reassessment_performed"):
            pending_by_task[task]=set()
        else:
            pending.update(new_mandatory)

        hist.append(r)

        if r.get("global_reassessment_performed"):
            # Reset the local loop streak after a completed global reassessment.
            by_task[task]=[]

    if violations:
        print("TRACE_VALIDATION=FAIL")
        for v in violations: print(v)
        raise SystemExit(1)
    print(f"TRACE_VALIDATION=PASS events={len(rows)} tasks={len(by_task)}")

if __name__=="__main__": main()
