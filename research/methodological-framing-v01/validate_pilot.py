from __future__ import annotations
import hashlib,json
from pathlib import Path
from run_pilot import prompt_for,MODEL

BASE=Path(__file__).resolve().parent
BANK=BASE/"METHOD_BANK_DRAFT.json"
RAW=BASE/"pilot"/"raw"

def main():
    bank=json.loads(BANK.read_text(encoding="utf-8"))
    conds={x["id"]:x for x in bank["conditions"]}
    files=sorted(RAW.glob("*.json"))
    if len(files)!=21:
        raise SystemExit(f"PILOT_VALIDATION=FAIL files={len(files)}/21")
    run_ids=set(); response_ids=set()
    counts={}
    for f in files:
        r=json.loads(f.read_text(encoding="utf-8"))
        rid=r["run_id"]
        if rid in run_ids: raise SystemExit("duplicate run_id")
        run_ids.add(rid)
        if r.get("response_id") in response_ids: raise SystemExit("duplicate response_id")
        response_ids.add(r.get("response_id"))
        if r.get("returned_model")!=MODEL:
            raise SystemExit(f"model mismatch {rid}: {r.get('returned_model')}")
        cond=conds[r["condition"]]
        expected=hashlib.sha256(prompt_for(bank["objective_constant"],cond).encode("utf-8")).hexdigest()
        if r.get("prompt_sha256")!=expected:
            raise SystemExit(f"prompt hash mismatch {rid}")
        if not r.get("raw_text","").strip():
            raise SystemExit(f"empty output {rid}")
        counts[r["condition"]]=counts.get(r["condition"],0)+1
    if set(counts.values())!={3} or len(counts)!=7:
        raise SystemExit(f"condition counts invalid {counts}")
    print("PILOT_VALIDATION=PASS")
    print(f"files={len(files)} unique_run_ids={len(run_ids)} unique_response_ids={len(response_ids)}")
    print("conditions="+json.dumps(counts,sort_keys=True))

if __name__=="__main__":
    main()
