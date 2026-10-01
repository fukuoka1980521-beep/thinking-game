from __future__ import annotations
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
SCORING = BASE / "data" / "scoring"
ITEMS = SCORING / "BLIND_ITEMS.jsonl"
KEY = SCORING / "BLIND_KEY.jsonl"
SECONDARY = SCORING / "SECONDARY_SAMPLE.json"
FORBIDDEN = {"run_id","condition","replicate","turn","run_type","anchor_id"}

def read_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def main():
    items = read_jsonl(ITEMS)
    keys = read_jsonl(KEY)
    secondary = json.loads(SECONDARY.read_text(encoding="utf-8"))
    errors = []
    blind_ids = [x["blind_id"] for x in items]
    key_ids = [x["blind_id"] for x in keys]
    if len(items) != 336:
        errors.append(f"items={len(items)}, expected 336")
    if len(keys) != 336:
        errors.append(f"keys={len(keys)}, expected 336")
    if len(set(blind_ids)) != 336:
        errors.append("blind IDs not unique")
    if set(blind_ids) != set(key_ids):
        errors.append("blind item/key ID mismatch")
    if len(secondary) != 84 or len(set(secondary)) != 84:
        errors.append(f"secondary={len(secondary)} unique={len(set(secondary))}, expected 84/84")
    if not set(secondary).issubset(set(blind_ids)):
        errors.append("secondary IDs not subset of blind items")

    leaks = {}
    for item in items:
        bad = sorted(set(item) & FORBIDDEN)
        if bad:
            leaks[item["blind_id"]] = bad
    if leaks:
        errors.append(f"forbidden scorer-facing keys in {len(leaks)} items")

    expected_fields = {
        "blind_id","category","canonical_question","reference_target",
        "allowed_semantic_classes","delivered_transcript","final_response"
    }
    if any(set(x) != expected_fields for x in items):
        errors.append("blind item field set mismatch")
    if errors:
        print("BLIND_PACKAGE_VALIDATION=FAIL")
        for e in errors:
            print("ERROR", e)
        return 1
    print("BLIND_PACKAGE_VALIDATION=PASS")
    print("items=336 unique_blind_ids=336 key_rows=336 secondary=84")
    print("forbidden_scorer_facing_keys=0")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
