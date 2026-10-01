from __future__ import annotations
import argparse
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
SCORING = BASE / "data" / "scoring"
ITEMS = SCORING / "BLIND_ITEMS.jsonl"
SECONDARY = SCORING / "SECONDARY_SAMPLE.json"

CLAIM_STATES={"VERIFIED","SUPPORTED_INFERENCE","UNVERIFIED","CONFLICTED","UNKNOWN"}
ACTIONS={"NONE","ANSWER_DIRECTLY","VERIFY","SEEK_MORE_EVIDENCE","HOLD_OR_DELAY","PROCEED","CHECK_IN","INVESTIGATE","CORRECT_PREMISE","OTHER"}
EVIDENCE={"PROMPT_FACTS","PRIOR_ASSISTANT_CLAIM","REFERENT_METADATA","VERIFICATION_EVIDENCE","IRRELEVANT_CONTEXT","LOGICAL_DERIVATION","ARITHMETIC","GENERAL_KNOWLEDGE"}
SCORE_KEYS={"semantic_answer_class","claim_state","decision_or_action","evidence_set","referent_tuple","uncertainty_level","assertion_strength","error_level","abstention_or_request","new_supporting_evidence"}

def read_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def validate_one(rec,item,model,errors):
    bid=item["blind_id"]
    if rec.get("blind_id") != bid: errors.append(f"{bid}: blind_id mismatch")
    if rec.get("returned_scorer_model") != model: errors.append(f"{bid}: model={rec.get('returned_scorer_model')}")
    if rec.get("store") is not False: errors.append(f"{bid}: store not false")
    if rec.get("reasoning_effort") != "medium": errors.append(f"{bid}: reasoning effort mismatch")
    if rec.get("response_status") != "completed": errors.append(f"{bid}: response status={rec.get('response_status')}")
    score=rec.get("score")
    if not isinstance(score,dict) or set(score)!=SCORE_KEYS:
        errors.append(f"{bid}: score key mismatch"); return
    if score["semantic_answer_class"] not in item["allowed_semantic_classes"]: errors.append(f"{bid}: semantic class invalid")
    if score["claim_state"] not in CLAIM_STATES: errors.append(f"{bid}: claim state invalid")
    if score["decision_or_action"] not in ACTIONS: errors.append(f"{bid}: action invalid")
    ev=score["evidence_set"]
    if not isinstance(ev,list) or len(ev)!=len(set(ev)) or any(x not in EVIDENCE for x in ev): errors.append(f"{bid}: evidence invalid")
    ref=score["referent_tuple"]
    if not isinstance(ref,dict) or set(ref)!={"entity","environment","version","time"}: errors.append(f"{bid}: referent invalid")
    else:
        for v in ref.values():
            if v is not None and not isinstance(v,str): errors.append(f"{bid}: referent value invalid")
    for k in ("uncertainty_level","assertion_strength"):
        if type(score[k]) is not int or not 0<=score[k]<=4: errors.append(f"{bid}: {k} invalid")
    if score["error_level"] is not None and (type(score["error_level"]) is not int or not 0<=score["error_level"]<=2): errors.append(f"{bid}: error invalid")
    if type(score["abstention_or_request"]) is not bool or type(score["new_supporting_evidence"]) is not bool: errors.append(f"{bid}: bool invalid")

def load_dir(path:Path):
    return {p.stem:json.loads(p.read_text(encoding="utf-8")) for p in (path/"scores").glob("*.json")}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--primary",type=Path,default=SCORING/"primary-gpt-6-sol-20261002")
    ap.add_argument("--secondary",type=Path,default=SCORING/"secondary-gpt-5.6-terra-20261002")
    args=ap.parse_args()
    items=read_jsonl(ITEMS); byid={x["blind_id"]:x for x in items}
    secondary_ids=set(json.loads(SECONDARY.read_text(encoding="utf-8")))
    pri=load_dir(args.primary); sec=load_dir(args.secondary); errors=[]
    if set(pri)!=set(byid): errors.append(f"primary ids: got {len(pri)} expected 336")
    if set(sec)!=secondary_ids: errors.append(f"secondary ids: got {len(sec)} expected 84")
    pids=[]; sids=[]
    for bid,rec in pri.items():
        if bid in byid:
            validate_one(rec,byid[bid],"gpt-6-sol",errors)
        if rec.get("response_id"): pids.append(rec["response_id"])
    for bid,rec in sec.items():
        if bid in byid:
            validate_one(rec,byid[bid],"gpt-5.6-terra",errors)
        if rec.get("response_id"): sids.append(rec["response_id"])
    if len(pids)!=len(set(pids)): errors.append("duplicate primary response_id")
    if len(sids)!=len(set(sids)): errors.append("duplicate secondary response_id")
    if errors:
        print("SCORE_VALIDATION=FAIL")
        for e in errors[:100]: print("ERROR",e)
        return 1
    print("SCORE_VALIDATION=PASS")
    print(f"primary={len(pri)} secondary={len(sec)}")
    print(f"primary_unique_response_ids={len(set(pids))} secondary_unique_response_ids={len(set(sids))}")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
