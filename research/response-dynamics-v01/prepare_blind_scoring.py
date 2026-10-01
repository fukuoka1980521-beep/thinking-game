from __future__ import annotations
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
RAW = BASE / "data" / "raw" / "openai-gpt-5.6-sol-20261002" / "responses"
OUT = BASE / "data" / "scoring"
BANK = BASE / "ANCHOR_BANK.json"
MANIFEST = BASE / "FROZEN_MANIFEST_V0_1.jsonl"

def blind_id(run_id: str) -> str:
    h = hashlib.sha256(("response-dynamics-v01|" + run_id).encode()).hexdigest()[:16]
    return "B-" + h.upper()

def order_key(bid: str) -> str:
    return hashlib.sha256(("order|" + bid).encode()).hexdigest()

def secondary_key(bid: str) -> str:
    return hashlib.sha256(("secondary|" + bid).encode()).hexdigest()

def main():
    bank = json.loads(BANK.read_text(encoding="utf-8"))
    anchors = {a["id"]: a for a in bank["anchors"]}
    manifest = [json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    rows = {r["run_id"]: r for r in manifest}
    items, keys = [], []
    files = sorted(RAW.glob("*.json"))
    if len(files) != 336:
        raise SystemExit(f"expected 336 raw files, got {len(files)}")
    for f in files:
        rec = json.loads(f.read_text(encoding="utf-8"))
        rid = rec["run_id"]
        row = rows[rid]
        a = anchors[row["anchor_id"]]
        bid = blind_id(rid)
        items.append({
            "blind_id": bid,
            "category": a["category"],
            "canonical_question": a["prompt"],
            "reference_target": a["reference"],
            "allowed_semantic_classes": a["expected_semantic_classes"],
            "delivered_transcript": rec["delivered_messages"],
            "final_response": rec["raw_text"],
        })
        keys.append({
            "blind_id": bid,
            "run_id": rid,
            "anchor_id": row["anchor_id"],
            "condition": row["condition"],
            "replicate": row["replicate"],
            "turn": row["turn"],
            "run_type": row["run_type"],
        })

    if len({x["blind_id"] for x in items}) != 336:
        raise SystemExit("blind ID collision")
    items.sort(key=lambda x: order_key(x["blind_id"]))
    keys.sort(key=lambda x: x["blind_id"])
    secondary = sorted((x["blind_id"] for x in items), key=secondary_key)[:84]

    OUT.mkdir(parents=True, exist_ok=True)
    item_path = OUT / "BLIND_ITEMS.jsonl"
    key_path = OUT / "BLIND_KEY.jsonl"
    sec_path = OUT / "SECONDARY_SAMPLE.json"
    item_path.write_text(
        "\n".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in items) + "\n",
        encoding="utf-8",
    )
    key_path.write_text(
        "\n".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in keys) + "\n",
        encoding="utf-8",
    )
    sec_path.write_text(json.dumps(secondary, indent=2) + "\n", encoding="utf-8")

    print("BLIND_PACKAGE=PASS")
    print("items=336 secondary=84")
    print("blind_items_sha256=" + hashlib.sha256(item_path.read_bytes()).hexdigest())
    print("blind_key_sha256=" + hashlib.sha256(key_path.read_bytes()).hexdigest())
    print("secondary_sha256=" + hashlib.sha256(sec_path.read_bytes()).hexdigest())

if __name__ == "__main__":
    main()
