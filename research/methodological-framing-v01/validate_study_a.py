from __future__ import annotations
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "study_a"
RAW = ROOT / "raw"
BLIND = ROOT / "blind"
KEY = ROOT / "BLIND_KEY.jsonl"
SECONDARY = ROOT / "SECONDARY_SAMPLE.json"
FROZEN = json.loads((BASE / "FROZEN_STUDY_A_SCHEMA_V1_0.json").read_text(encoding="utf-8"))

COUNT_FIELDS = FROZEN["primary_general_count_fields"]
BOOL_FIELDS = []
for f in FROZEN["primary_general_boolean_fields"] + FROZEN["secondary_general_fields"] + FROZEN["global_structure_binary_fields"]:
    if f not in BOOL_FIELDS:
        BOOL_FIELDS.append(f)
for fields in FROZEN["confirmatory_signature_fields_by_family"].values():
    for f in fields:
        if f not in BOOL_FIELDS:
            BOOL_FIELDS.append(f)
EXPECTED = set(COUNT_FIELDS + BOOL_FIELDS)

def jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def main():
    raw = sorted(RAW.glob("*.json"))
    if len(raw) != 336:
        raise SystemExit(f"raw incomplete {len(raw)}/336")
    run_ids, response_ids = set(), set()
    for f in raw:
        rec = json.loads(f.read_text(encoding="utf-8"))
        if rec.get("counted") is not True:
            raise SystemExit("non-counted record in Study A raw")
        rid, api = rec.get("run_id"), rec.get("response_id")
        if not rid or rid in run_ids:
            raise SystemExit("duplicate/missing run_id")
        if not api or api in response_ids:
            raise SystemExit("duplicate/missing API response_id")
        run_ids.add(rid); response_ids.add(api)

    key = jsonl(KEY)
    if len(key) != 336 or {x["run_id"] for x in key} != run_ids:
        raise SystemExit("blind key mismatch")
    bids = {x["blind_id"] for x in key}
    if len(bids) != 336:
        raise SystemExit("duplicate blind ids")
    if len(list(BLIND.glob("*.json"))) != 336:
        raise SystemExit("blind files incomplete")

    sample = json.loads(SECONDARY.read_text(encoding="utf-8"))
    sample_ids = set(sample["blind_ids"])
    if len(sample_ids) != 84 or not sample_ids <= bids:
        raise SystemExit("secondary sample invalid")

    dirs = {
        "primary": ROOT / "scoring" / "primary-gpt-6-sol" / "scores",
        "secondary": ROOT / "scoring" / "secondary-gpt-5.6-terra" / "scores",
    }
    for label, path in dirs.items():
        files = sorted(path.glob("*.json"))
        target = 336 if label == "primary" else 84
        if len(files) != target:
            raise SystemExit(f"{label} incomplete {len(files)}/{target}")
        seen_b, seen_r = set(), set()
        for f in files:
            rec = json.loads(f.read_text(encoding="utf-8"))
            bid, rid = rec.get("blind_id"), rec.get("response_id")
            if bid not in bids or bid in seen_b:
                raise SystemExit(f"{label} blind id error")
            if not rid or rid in seen_r:
                raise SystemExit(f"{label} response id error")
            score = rec.get("score", {})
            if set(score) != EXPECTED:
                raise SystemExit(f"{label} schema mismatch")
            seen_b.add(bid); seen_r.add(rid)
        if label == "secondary" and seen_b != sample_ids:
            raise SystemExit("secondary scored set differs from frozen sample")

    print("STUDY_A_VALIDATION=PASS")
    print("raw=336 blind=336 primary=336 secondary=84")

if __name__ == "__main__":
    main()
