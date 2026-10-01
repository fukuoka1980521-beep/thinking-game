from __future__ import annotations
import json
from pathlib import Path

BASE=Path(__file__).resolve().parent
CFG=json.loads((BASE/"RESEARCH_STATE_SCHEMA_V0_2_DRAFT.json").read_text(encoding="utf-8"))
COUNT_FIELDS=CFG["general_count_fields"]
BOOL_FIELDS=CFG["general_boolean_fields"]+[f for xs in CFG["signature_boolean_fields"].values() for f in xs]
EXPECTED=set(COUNT_FIELDS+BOOL_FIELDS)
DIRS={
    "primary":BASE/"pilot"/"scoring_v02"/"primary-gpt-6-sol"/"scores",
    "secondary":BASE/"pilot"/"scoring_v02"/"secondary-gpt-5.6-terra"/"scores"
}

def check(label,path):
    files=sorted(path.glob("*.json"))
    if len(files)!=21:
        raise SystemExit(f"{label} incomplete {len(files)}/21")
    bids=set(); rids=set()
    for f in files:
        rec=json.loads(f.read_text(encoding="utf-8"))
        bid=rec.get("blind_id")
        rid=rec.get("response_id")
        if not bid or bid in bids:
            raise SystemExit(f"{label} duplicate/missing blind id")
        if not rid or rid in rids:
            raise SystemExit(f"{label} duplicate/missing response id")
        bids.add(bid); rids.add(rid)
        score=rec.get("score",{})
        if set(score)!=EXPECTED:
            raise SystemExit(f"{label} score keys mismatch {f.name}")
        for k in COUNT_FIELDS:
            if type(score[k]) is not int or score[k] < 0:
                raise SystemExit(f"{label} invalid count {k} {f.name}")
        for k in BOOL_FIELDS:
            if type(score[k]) is not bool:
                raise SystemExit(f"{label} invalid bool {k} {f.name}")
    return bids

def main():
    p=check("primary",DIRS["primary"])
    s=check("secondary",DIRS["secondary"])
    if p!=s:
        raise SystemExit("blind-id sets differ")
    print("PILOT_V02_SCORE_VALIDATION=PASS")
    print("primary=21 secondary=21 common_blind_ids=21")

if __name__=="__main__":
    main()
