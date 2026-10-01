from __future__ import annotations
import json
from pathlib import Path

BASE=Path(__file__).resolve().parent
P=BASE/"pilot"/"scoring"/"primary-gpt-6-sol"/"scores"
S=BASE/"pilot"/"scoring"/"secondary-gpt-5.6-terra"/"scores"
SCHEMA=json.loads((BASE/"RESEARCH_STATE_SCHEMA.json").read_text(encoding="utf-8"))
EXPECTED=set(SCHEMA["fields"])

def check(path,label):
    files=sorted(path.glob("*.json"))
    if len(files)!=21: raise SystemExit(f"{label} incomplete {len(files)}/21")
    ids=set(); response_ids=set()
    for f in files:
        r=json.loads(f.read_text(encoding="utf-8"))
        if r["blind_id"] in ids: raise SystemExit(f"{label} duplicate blind id")
        ids.add(r["blind_id"])
        if r["response_id"] in response_ids: raise SystemExit(f"{label} duplicate response id")
        response_ids.add(r["response_id"])
        if set(r["score"])!=EXPECTED:
            raise SystemExit(f"{label} score keys mismatch {f.name}")
    return ids

def main():
    a=check(P,"primary"); b=check(S,"secondary")
    if a!=b: raise SystemExit("primary/secondary blind sets differ")
    print("PILOT_SCORE_VALIDATION=PASS")
    print("primary=21 secondary=21 common_blind_ids=21")

if __name__=="__main__":
    main()
