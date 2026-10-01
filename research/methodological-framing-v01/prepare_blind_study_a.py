from __future__ import annotations
import hashlib, json
from collections import defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "study_a"
RAW = ROOT / "raw"
BLIND = ROOT / "blind"
KEY = ROOT / "BLIND_KEY.jsonl"
SECONDARY = ROOT / "SECONDARY_SAMPLE.json"

def blind_id(run_id: str) -> str:
    return "A-" + hashlib.sha256(("study-a-v1|" + run_id).encode()).hexdigest()[:16].upper()

def sample_rank(run_id: str) -> str:
    return hashlib.sha256(("study-a-secondary|" + run_id).encode()).hexdigest()

def main():
    files = sorted(RAW.glob("*.json"))
    if len(files) != 336:
        raise SystemExit(f"raw Study A incomplete: {len(files)}/336")

    BLIND.mkdir(parents=True, exist_ok=True)
    rows = []
    by_cell = defaultdict(list)

    for f in files:
        rec = json.loads(f.read_text(encoding="utf-8"))
        bid = blind_id(rec["run_id"])
        item = {"blind_id": bid, "plan_text": rec["raw_text"]}
        (BLIND / f"{bid}.json").write_text(
            json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        keyrow = {
            "blind_id": bid,
            "run_id": rec["run_id"],
            "task_id": rec["task_id"],
            "condition_id": rec["condition_id"],
            "method_family": rec["method_family"],
            "instruction_depth": rec["instruction_depth"],
            "replicate": rec["replicate"],
        }
        rows.append(keyrow)
        cell = (rec["task_id"], rec["condition_id"])
        by_cell[cell].append((sample_rank(rec["run_id"]), bid))

    KEY.write_text(
        "\n".join(json.dumps(x, ensure_ascii=False) for x in rows) + "\n",
        encoding="utf-8",
    )

    selected = []
    for cell, items in sorted(by_cell.items()):
        items.sort()
        selected.extend(bid for _, bid in items[:3])

    if len(selected) != 84 or len(set(selected)) != 84:
        raise SystemExit(f"secondary sample error {len(selected)}")

    SECONDARY.write_text(
        json.dumps({
            "method": "3 deterministic hash-ranked items per task x condition cell",
            "n": 84,
            "blind_ids": sorted(selected),
        }, indent=2) + "\n",
        encoding="utf-8",
    )

    print("STUDY_A_BLIND_READY=336")
    print("STUDY_A_SECONDARY_SAMPLE=84")

if __name__ == "__main__":
    main()
