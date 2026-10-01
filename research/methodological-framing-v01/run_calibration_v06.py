from __future__ import annotations
import hashlib, json, random
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import run_calibration_v03 as base

BASE = Path(__file__).resolve().parent
BANK = BASE / "CALIBRATION_V06_BANK.json"
ROOT = BASE / "calibration_v06"
RAW = ROOT / "raw"
MANIFEST = ROOT / "CALIBRATION_MANIFEST.json"
WORKERS = 8
MAX_OUTPUT_TOKENS = 8000

def main():
    key = base.get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")

    bank = json.loads(BANK.read_text(encoding="utf-8-sig"))
    tasks = {x["id"]: x for x in bank["tasks"]}
    conditions = {x["id"]: x for x in bank["conditions"]}

    manifest = []
    for task_id in tasks:
        for condition in conditions:
            for rep in range(1, int(bank["replicates"]) + 1):
                manifest.append({
                    "run_id": f"C06-{task_id}-{condition}-R{rep:02d}",
                    "task_id": task_id,
                    "condition": condition,
                    "instruction_depth": "LABEL_ONLY",
                    "replicate": rep,
                })

    rnd = random.Random(int(bank["execution_seed_for_manifest_order"]))
    rnd.shuffle(manifest)
    ROOT.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    def run_one(row):
        dest = RAW / f"{row['run_id']}.json"
        if dest.exists():
            return row["run_id"], "SKIP"

        prompt = base.prompt_for(
            tasks[row["task_id"]]["objective"],
            conditions[row["condition"]]["instruction"],
        )
        _, resp = base.call(
            key,
            bank["acting_model"],
            bank["reasoning_effort"],
            MAX_OUTPUT_TOKENS,
            prompt,
        )

        if resp.get("status") != "completed":
            raise RuntimeError(
                f"incomplete response {row['run_id']}: "
                f"status={resp.get('status')} details={resp.get('incomplete_details')}"
            )
        if resp.get("incomplete_details") is not None:
            raise RuntimeError(f"incomplete_details present {row['run_id']}")
        if resp.get("model") != bank["acting_model"]:
            raise RuntimeError(
                f"returned model mismatch {row['run_id']}: {resp.get('model')}"
            )

        out = base.output_text(resp)
        if not out.strip():
            raise RuntimeError(f"empty output {row['run_id']}")

        rec = {
            **row,
            "calibration_only": True,
            "calibration_version": "v0.6",
            "timestamp_utc": base.now(),
            "requested_model": bank["acting_model"],
            "returned_model": resp.get("model"),
            "store": False,
            "max_output_tokens": MAX_OUTPUT_TOKENS,
            "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "raw_text": out,
            "response_id": resp.get("id"),
            "usage": resp.get("usage"),
            "response_status": resp.get("status"),
            "incomplete_details": resp.get("incomplete_details"),
            "raw_response": resp,
        }
        tmp = dest.with_suffix(".tmp")
        tmp.write_text(
            json.dumps(rec, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        tmp.replace(dest)
        return row["run_id"], "OK"

    pending = [row for row in manifest if not (RAW / f"{row['run_id']}.json").exists()]
    done = 42 - len(pending)
    print(
        f"CALIBRATION_V06_START pending={len(pending)} "
        f"workers={WORKERS} max_output_tokens={MAX_OUTPUT_TOKENS}",
        flush=True,
    )

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(run_one, row): row for row in pending}
        for fut in as_completed(futs):
            rid, status = fut.result()
            done += 1
            print(f"CALIBRATION_V06 {done}/42 {rid} {status}", flush=True)

    print("CALIBRATION_V06_COLLECTION_COMPLETE=42/42", flush=True)

if __name__ == "__main__":
    main()
