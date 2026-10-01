from __future__ import annotations
import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent
MANIFEST = BASE / "FROZEN_MANIFEST_V0_1.jsonl"

def read_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def load_result(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-dir", type=Path, default=BASE / "data" / "raw" / "openai-gpt-5.6-sol-20261002")
    ap.add_argument("--expect-model", default="gpt-5.6-sol")
    args = ap.parse_args()
    manifest = read_jsonl(MANIFEST)
    expected = {r["run_id"]: r for r in manifest}
    files = sorted((args.run_dir / "responses").glob("*.json"))
    errors = []
    if len(files) != 336:
        errors.append(f"raw_file_count={len(files)}, expected 336")
    seen = {}
    response_ids = []
    for f in files:
        rec = load_result(f)
        rid = rec.get("run_id")
        if rid not in expected:
            errors.append(f"unexpected run_id {rid}")
            continue
        if rid in seen:
            errors.append(f"duplicate run_id {rid}")
        seen[rid] = rec
        row = expected[rid]
        for key in ("anchor_id","run_type","condition","replicate","turn","fresh_context"):
            if rec.get(key) != row.get(key):
                errors.append(f"{rid}: metadata mismatch {key}")
        if rec.get("returned_model") != args.expect_model:
            errors.append(f"{rid}: returned_model={rec.get('returned_model')}")
        if rec.get("store") is not False:
            errors.append(f"{rid}: store is not false")
        if rec.get("conversation") is not None or rec.get("previous_response_id") is not None:
            errors.append(f"{rid}: inherited API conversation linkage")
        if rec.get("tools") != []:
            errors.append(f"{rid}: tools not empty")
        if not str(rec.get("raw_text","")).strip():
            errors.append(f"{rid}: empty raw_text")
        if rec.get("response_status") != "completed":
            errors.append(f"{rid}: response_status={rec.get('response_status')}")
        response_ids.append(rec.get("response_id"))
    missing = sorted(set(expected) - set(seen))
    if missing:
        errors.append(f"missing_run_ids={len(missing)}")
    ids = [x for x in response_ids if x]
    if len(ids) != len(set(ids)):
        errors.append("duplicate response_id among counted results")

    counts = Counter(rec["condition"] for rec in seen.values())
    target = Counter(r["condition"] for r in manifest)
    if counts != target:
        errors.append(f"condition_counts={dict(counts)} expected={dict(target)}")

    groups = defaultdict(dict)
    for rid, rec in seen.items():
        row = expected[rid]
        if row["run_type"] == "TRAJECTORY":
            groups[row["transcript_group"]][(row["turn"], row["condition"])] = rec

    for group, g in groups.items():
        rel = g.get((4, "VERIFICATION_RELEVANT"))
        irr = g.get((4, "VERIFICATION_IRRELEVANT"))
        t3 = g.get((3, "TRAJECTORY_BASE"))
        if not (rel and irr and t3):
            errors.append(f"{group}: incomplete trajectory group")
            continue
        if rel["delivered_messages"][:-1] != irr["delivered_messages"][:-1]:
            errors.append(f"{group}: turn4 branch prefix differs")
        if rel["delivered_messages"][:-2] != t3["delivered_messages"]:
            errors.append(f"{group}: branch transcript not derived from exact T3 input")
        if rel["delivered_messages"][-2].get("role") != "assistant":
            errors.append(f"{group}: missing T3 assistant replay")
    if errors:
        print("RAW_COLLECTION_VALIDATION=FAIL")
        for e in errors[:100]:
            print("ERROR", e)
        return 1
    print("RAW_COLLECTION_VALIDATION=PASS")
    print(f"files={len(files)} unique_run_ids={len(seen)} unique_response_ids={len(set(ids))}")
    print("conditions=" + json.dumps(dict(counts), sort_keys=True))
    print(f"trajectory_groups={len(groups)}")
    print(f"model={args.expect_model}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
