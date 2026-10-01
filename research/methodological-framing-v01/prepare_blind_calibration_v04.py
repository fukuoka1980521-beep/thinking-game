from __future__ import annotations
import hashlib, json
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v04"
RAW = ROOT / "raw"
BLIND = ROOT / "blind"
KEY = ROOT / "BLIND_KEY.jsonl"

def blind_id(run_id: str) -> str:
    return "C04-" + hashlib.sha256(("method-cal-v04|" + run_id).encode()).hexdigest()[:16].upper()

def main():
    files = sorted(RAW.glob("*.json"))
    if len(files) != 42:
        raise SystemExit(f"raw calibration incomplete: {len(files)}/42")
    BLIND.mkdir(parents=True, exist_ok=True)
    rows = []
    for f in files:
        rec = json.loads(f.read_text(encoding="utf-8"))
        bid = blind_id(rec["run_id"])
        item = {"blind_id": bid, "plan_text": rec["raw_text"]}
        (BLIND / f"{bid}.json").write_text(
            json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        rows.append({
            "blind_id": bid,
            "run_id": rec["run_id"],
            "task_id": rec["task_id"],
            "condition": rec["condition"],
            "instruction_depth": rec["instruction_depth"],
            "replicate": rec["replicate"],
        })
    KEY.write_text(
        "\n".join(json.dumps(x, ensure_ascii=False) for x in rows) + "\n",
        encoding="utf-8",
    )
    print("CALIBRATION_V04_BLIND_READY=42")

if __name__ == "__main__":
    main()
