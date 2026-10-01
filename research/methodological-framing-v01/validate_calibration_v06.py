from __future__ import annotations
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v06"
RAW = ROOT / "raw"
BLIND = ROOT / "blind"
KEY = ROOT / "BLIND_KEY.jsonl"
CFG = json.loads((BASE / "CALIBRATION_V06_SCHEMA.json").read_text(encoding="utf-8-sig"))
ARTIFACTS = list(CFG["artifacts"].values())

def read_jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def validate_raw():
    files = sorted(RAW.glob("*.json"))
    if len(files) != 42:
        raise SystemExit(f"raw incomplete {len(files)}/42")
    run_ids, response_ids = set(), set()
    for f in files:
        rec = json.loads(f.read_text(encoding="utf-8"))
        rid, api_id = rec.get("run_id"), rec.get("response_id")
        if not rid or rid in run_ids:
            raise SystemExit("duplicate/missing run id")
        if not api_id or api_id in response_ids:
            raise SystemExit("duplicate/missing response id")
        if rec.get("calibration_only") is not True:
            raise SystemExit("missing calibration_only")
        status = rec.get("response_status") or (rec.get("raw_response") or {}).get("status")
        incomplete = rec.get("incomplete_details")
        if "incomplete_details" not in rec:
            incomplete = (rec.get("raw_response") or {}).get("incomplete_details")
        if status != "completed" or incomplete is not None:
            raise SystemExit(f"incomplete acting response: {rid}")
        if rec.get("max_output_tokens") != 8000:
            raise SystemExit(f"unexpected output budget: {rid}")
        run_ids.add(rid); response_ids.add(api_id)
    return run_ids

def validate_blind(run_ids):
    blind_files = sorted(BLIND.glob("*.json"))
    key = read_jsonl(KEY)
    if len(blind_files) != 42 or len(key) != 42:
        raise SystemExit("blind package incomplete")
    if {x["run_id"] for x in key} != run_ids:
        raise SystemExit("blind key mismatch")
    bids = [x["blind_id"] for x in key]
    if len(set(bids)) != 42:
        raise SystemExit("duplicate blind ids")
    plans = {f.stem: json.loads(f.read_text(encoding="utf-8"))["plan_text"] for f in blind_files}
    return set(bids), plans

def validate_scores(label, bids, plans):
    path = ROOT / "scoring" / label / "scores"
    files = sorted(path.glob("*.json"))
    if len(files) != 42:
        raise SystemExit(f"{label} incomplete {len(files)}/42")
    seen_bids, seen_resp = set(), set()
    for f in files:
        rec = json.loads(f.read_text(encoding="utf-8"))
        bid, rid = rec.get("blind_id"), rec.get("response_id")
        if bid not in bids or bid in seen_bids:
            raise SystemExit(f"{label} bad blind id")
        if not rid or rid in seen_resp:
            raise SystemExit(f"{label} duplicate/missing response id")
        if rec.get("response_status") != "completed":
            raise SystemExit(f"{label} incomplete scorer response")
        score = rec.get("score", {})
        if set(score) != set(ARTIFACTS):
            raise SystemExit(f"{label} artifact keys mismatch")
        plan = plans[bid]
        for field in ARTIFACTS:
            row = score[field]
            if set(row) != {"present", "evidence"} or type(row["present"]) is not bool:
                raise SystemExit(f"{label} bad row {field}")
            ev = row["evidence"]
            if row["present"]:
                if not isinstance(ev, list) or not (1 <= len(ev) <= 2):
                    raise SystemExit(f"{label} true without evidence {field}")
                if any((not isinstance(x, str)) or (not x) or (x not in plan) for x in ev):
                    raise SystemExit(f"{label} nonliteral evidence {field}")
            else:
                if ev != []:
                    raise SystemExit(f"{label} false with evidence {field}")
        seen_bids.add(bid); seen_resp.add(rid)
    if seen_bids != bids:
        raise SystemExit(f"{label} blind set mismatch")

def main():
    run_ids = validate_raw()
    bids, plans = validate_blind(run_ids)
    validate_scores("primary-gpt-6-sol", bids, plans)
    validate_scores("secondary-gpt-5.6-terra", bids, plans)
    print("CALIBRATION_V06_VALIDATION=PASS")
    print("raw=42 blind=42 primary=42 secondary=42 evidence_spans=VALID")

if __name__ == "__main__":
    main()
