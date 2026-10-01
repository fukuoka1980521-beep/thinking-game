from __future__ import annotations
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import run_calibration_v03 as base

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v03"
RAW = ROOT / "raw"
MANIFEST = ROOT / "CALIBRATION_MANIFEST.json"
WORKERS = 4

def main():
    key = base.get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")
    bank = json.loads(base.BANK.read_text(encoding="utf-8"))
    tasks = {x["id"]: x for x in bank["tasks"]}
    conditions = {x["id"]: x for x in bank["conditions"]}
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def run_one(row):
        dest = RAW / f"{row['run_id']}.json"
        if dest.exists():
            return row["run_id"], "SKIP"
        prompt = base.prompt_for(tasks[row["task_id"]]["objective"], conditions[row["condition"]]["instruction"])
        body, resp = base.call(
            key,
            bank["acting_model"],
            bank["reasoning_effort"],
            int(bank["max_output_tokens"]),
            prompt,
        )
        text = base.output_text(resp)
        if not text.strip():
            raise RuntimeError("empty response: " + row["run_id"])
        rec = {
            **row,
            "calibration_only": True,
            "timestamp_utc": base.now(),
            "requested_model": bank["acting_model"],
            "returned_model": resp.get("model"),
            "store": False,
            "prompt_sha256": base.hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "raw_text": text,
            "response_id": resp.get("id"),
            "usage": resp.get("usage"),
            "raw_response": resp,
        }
        tmp = dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(dest)
        return row["run_id"], "OK"

    pending = [row for row in manifest if not (RAW / f"{row['run_id']}.json").exists()]
    print(f"CALIBRATION_V03_PARALLEL_START pending={len(pending)} workers={WORKERS}", flush=True)
    done = 42 - len(pending)
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(run_one, row): row for row in pending}
        for fut in as_completed(futs):
            rid, status = fut.result()
            done += 1
            print(f"CALIBRATION_V03 {done}/42 {rid} {status}", flush=True)

    print("CALIBRATION_V03_COLLECTION_COMPLETE=42/42", flush=True)

if __name__ == "__main__":
    main()
