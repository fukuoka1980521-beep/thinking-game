from __future__ import annotations
import argparse, json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import score_calibration_v05 as base

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v05"
WORKERS = 4

def run(label: str):
    key = base.get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")
    model = base.MODELS[label]
    files = sorted((ROOT / "blind").glob("*.json"))
    if len(files) != 42:
        raise SystemExit(f"blind calibration incomplete: {len(files)}/42")
    out = ROOT / "scoring" / f"{label}-{model}" / "scores"
    out.mkdir(parents=True, exist_ok=True)

    def one(f):
        item = json.loads(f.read_text(encoding="utf-8"))
        dest = out / f.name
        if dest.exists():
            return item["blind_id"], "SKIP"
        resp, score = base.request_score(key, item, model)
        rec = {
            "blind_id": item["blind_id"],
            "timestamp_utc": base.now(),
            "requested_scorer_model": model,
            "returned_scorer_model": resp.get("model"),
            "response_id": resp.get("id"),
            "response_status": resp.get("status"),
            "usage": resp.get("usage"),
            "score": score,
            "raw_scorer_response": resp,
        }
        tmp = dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(dest)
        return item["blind_id"], "OK"

    pending = [f for f in files if not (out / f.name).exists()]
    done = 42 - len(pending)
    print(f"CAL_V05_PARALLEL_SCORING_START {label} pending={len(pending)} workers={WORKERS}", flush=True)
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = [ex.submit(one, f) for f in pending]
        for fut in as_completed(futs):
            bid, status = fut.result()
            done += 1
            print(f"CAL_V05_SCORED {label} {done}/42 {bid} {status}", flush=True)
    print(f"CAL_V05_SCORING_COMPLETE {label}=42/42", flush=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scorer", choices=["primary", "secondary"], required=True)
    args = ap.parse_args()
    run(args.scorer)

if __name__ == "__main__":
    main()
