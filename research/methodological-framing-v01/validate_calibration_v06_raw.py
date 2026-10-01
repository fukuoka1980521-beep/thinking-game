from __future__ import annotations
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v06"
RAW = ROOT / "raw"
EXPECTED_MODEL = "gpt-5.6-sol"

def main():
    files = sorted(RAW.glob("*.json"))
    if len(files) != 42:
        raise SystemExit(f"raw incomplete: {len(files)}/42")

    run_ids = set()
    response_ids = set()
    prompt_hashes = []
    output_tokens = []

    for f in files:
        rec = json.loads(f.read_text(encoding="utf-8"))
        rid = rec.get("run_id")
        api_id = rec.get("response_id")
        if not rid or rid in run_ids:
            raise SystemExit(f"duplicate/missing run_id: {f.name}")
        if not api_id or api_id in response_ids:
            raise SystemExit(f"duplicate/missing response_id: {f.name}")
        if rec.get("calibration_only") is not True:
            raise SystemExit(f"not calibration-only: {f.name}")
        if rec.get("calibration_version") != "v0.6":
            raise SystemExit(f"wrong calibration version: {f.name}")
        if rec.get("response_status") != "completed":
            raise SystemExit(f"non-completed response: {f.name}")
        if rec.get("incomplete_details") is not None:
            raise SystemExit(f"incomplete_details present: {f.name}")
        if rec.get("max_output_tokens") != 8000:
            raise SystemExit(f"wrong output budget: {f.name}")
        if rec.get("requested_model") != EXPECTED_MODEL or rec.get("returned_model") != EXPECTED_MODEL:
            raise SystemExit(f"model mismatch: {f.name}")
        if not str(rec.get("raw_text", "")).strip():
            raise SystemExit(f"empty output: {f.name}")
        run_ids.add(rid)
        response_ids.add(api_id)
        prompt_hashes.append(rec.get("prompt_sha256"))
        output_tokens.append((rec.get("usage") or {}).get("output_tokens", 0))

    print("CALIBRATION_V06_RAW_VALIDATION=PASS")
    print("raw=42 unique_run_ids=42 unique_response_ids=42")
    print("model=gpt-5.6-sol completed=42 incomplete=0 max_output_tokens=8000")
    print(f"output_tokens_total={sum(output_tokens)} min={min(output_tokens)} max={max(output_tokens)}")

if __name__ == "__main__":
    main()
