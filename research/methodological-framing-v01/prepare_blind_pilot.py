from __future__ import annotations
import hashlib, json
from pathlib import Path

BASE=Path(__file__).resolve().parent
RAW=BASE/"pilot"/"raw"
BLIND=BASE/"pilot"/"blind"
KEY=BASE/"pilot"/"BLIND_KEY.jsonl"

def blind_id(run_id:str)->str:
    return "MP-"+hashlib.sha256(("method-pilot-v01|"+run_id).encode()).hexdigest()[:16].upper()

def main():
    BLIND.mkdir(parents=True,exist_ok=True)
    rows=[]
    files=sorted(RAW.glob("*.json"))
    if len(files)!=21:
        raise SystemExit(f"raw pilot incomplete: {len(files)}/21")
    for f in files:
        rec=json.loads(f.read_text(encoding="utf-8"))
        bid=blind_id(rec["run_id"])
        item={"blind_id":bid,"plan_text":rec["raw_text"]}
        (BLIND/f"{bid}.json").write_text(json.dumps(item,ensure_ascii=False,indent=2),encoding="utf-8")
        rows.append({"blind_id":bid,"run_id":rec["run_id"],"condition":rec["condition"],"replicate":rec["replicate"]})
    KEY.write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in rows)+"\n",encoding="utf-8")
    print(f"BLIND_PILOT_READY={len(rows)}")

if __name__=="__main__":
    main()
