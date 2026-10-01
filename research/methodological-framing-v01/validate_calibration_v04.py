from __future__ import annotations
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v04"
RAW = ROOT / "raw"
BLIND = ROOT / "blind"
KEY = ROOT / "BLIND_KEY.jsonl"
CFG = json.loads((BASE / "CALIBRATION_V04_SCHEMA.json").read_text(encoding="utf-8-sig"))
COUNT_FIELDS = CFG["count_fields"]
BOOL_FIELDS = CFG["boolean_fields"]
EXPECTED = set(COUNT_FIELDS + BOOL_FIELDS)

def read_jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8-sig").splitlines() if x.strip()]

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
        if rec.get("calibration_version") != "v0.4":
            raise SystemExit(f"wrong calibration version: {rid}")
        if rec.get("response_status") != "completed":
            raise SystemExit(f"incomplete response status: {rid}")
        if rec.get("incomplete_details") is not None:
            raise SystemExit(f"incomplete_details present: {rid}")
        if rec.get("max_output_tokens") != 8000:
            raise SystemExit(f"unexpected output budget: {rid}")
        if rec.get("returned_model") != "gpt-5.6-sol":
            raise SystemExit(f"model mismatch: {rid}")
        run_ids.add(rid)
        response_ids.add(api_id)
    return run_ids

def validate_blind(run_ids):
    blind_files = sorted(BLIND.glob("*.json"))
    key = read_jsonl(KEY)
    if len(blind_files) != 42 or len(key) != 42:
        raise SystemExit("blind package incomplete")
    if {x["run_id"] for x in key} != run_ids:
        raise SystemExit("blind key run-id mismatch")
    bids = [x["blind_id"] for x in key]
    if len(set(bids)) != 42:
        raise SystemExit("duplicate blind ids")
    return set(bids)

def validate_scores(label, bids):
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
        if set(score) != EXPECTED:
            raise SystemExit(f"{label} schema mismatch")
        for k in COUNT_FIELDS:
            if type(score[k]) is not int or score[k] < 0:
                raise SystemExit(f"{label} invalid count {k}")
        for k in BOOL_FIELDS:
            if type(score[k]) is not bool:
                raise SystemExit(f"{label} invalid bool {k}")
        seen_bids.add(bid)
        seen_resp.add(rid)
    if seen_bids != bids:
        raise SystemExit(f"{label} blind set mismatch")

def main():
    run_ids = validate_raw()
    bids = validate_blind(run_ids)
    validate_scores("primary-gpt-6-sol", bids)
    validate_scores("secondary-gpt-5.6-terra", bids)
    print("CALIBRATION_V04_VALIDATION=PASS")
    print("raw=42 blind=42 primary=42 secondary=42")

if __name__ == "__main__":
    main()
