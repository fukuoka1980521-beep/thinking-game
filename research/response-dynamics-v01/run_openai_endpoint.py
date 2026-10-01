from __future__ import annotations
import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
BANK_PATH = BASE / "ANCHOR_BANK.json"
MANIFEST_PATH = BASE / "FROZEN_MANIFEST_V0_1.jsonl"
DEFAULT_MODEL = "gpt-5.6-sol"
API_URL = "https://api.openai.com/v1/responses"
MAX_OUTPUT_TOKENS = 4096
TEMPERATURE = 1.0
TOP_P = 1.0
REASONING_EFFORT = "none"

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def read_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]
def load_inputs():
    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    anchors = {a["id"]: a for a in bank["anchors"]}
    manifest = read_jsonl(MANIFEST_PATH)
    if len(anchors) != 16 or len(manifest) != 336:
        raise RuntimeError("Frozen inputs failed count check.")
    if len({r["run_id"] for r in manifest}) != 336:
        raise RuntimeError("Duplicate run_id in frozen manifest.")
    return bank, anchors, manifest

def user_item(text: str) -> dict:
    return {"role": "user", "content": [{"type": "input_text", "text": text}]}

def assistant_item(text: str) -> dict:
    return {"role": "assistant", "content": [{"type": "output_text", "text": text}]}

def resolve_prompt(row: dict, anchor: dict) -> str:
    if "prompt_text" in row:
        return row["prompt_text"]
    condition = row["condition"]
    source = row["prompt_source"]
    if condition == "PRIOR_ANSWER":
        return anchor["prior_answer"] + "\n\n" + anchor["prompt"]
    if condition == "REFERENT_BOUND":
        return anchor["referent_bound_context"] + "\n\n" + anchor["prompt"]
    if source not in anchor:
        raise KeyError(f"{row['run_id']}: missing anchor field {source}")
    return anchor[source]
def response_text(resp: dict) -> str:
    out = []
    for item in resp.get("output", []):
        if item.get("type") != "message":
            continue
        for part in item.get("content", []):
            if part.get("type") == "output_text":
                out.append(part.get("text", ""))
    return "".join(out)

def api_request(api_key: str, model: str, messages: list[dict], attempts_log: Path):
    body = {
        "model": model,
        "input": messages,
        "store": False,
        "max_output_tokens": MAX_OUTPUT_TOKENS,
        "temperature": TEMPERATURE,
        "top_p": TOP_P,
        "reasoning": {"effort": REASONING_EFFORT},
    }
    payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    last_error = None
    for attempt in range(1, 7):
        started = utc_now()
        try:
            req = urllib.request.Request(API_URL, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=180) as r:
                resp = json.loads(r.read().decode("utf-8"))
            log_attempt(attempts_log, started, attempt, "OK", resp.get("id"))
            return body, resp
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")
            last_error = f"HTTP {e.code}: {detail}"
            log_attempt(attempts_log, started, attempt, "HTTP_ERROR", last_error)
            if e.code not in (408, 409, 429, 500, 502, 503, 504):
                break
        except Exception as e:
            last_error = repr(e)
            log_attempt(attempts_log, started, attempt, "ERROR", last_error)
        time.sleep(min(2 ** attempt, 30))
    raise RuntimeError(last_error or "unknown API failure")
def log_attempt(path: Path, started: str, attempt: int, status: str, detail):
    record = {"timestamp": started, "attempt": attempt, "status": status, "detail": detail}
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

def result_path(run_dir: Path, run_id: str) -> Path:
    return run_dir / "responses" / f"{run_id}.json"

def load_result(run_dir: Path, run_id: str):
    p = result_path(run_dir, run_id)
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))

def predecessor_id(row: dict, turn: int) -> str:
    return f"{row['transcript_group']}-T{turn}"

def build_messages(row: dict, anchor: dict, run_dir: Path) -> list[dict]:
    prompt = resolve_prompt(row, anchor)
    if row["run_type"] == "INDEPENDENT" or row["turn"] == 1:
        return [user_item(prompt)]
    prev_turn = row["turn"] - 1
    if row["turn"] == 4:
        prev_turn = 3
    prev = load_result(run_dir, predecessor_id(row, prev_turn))
    if not prev:
        raise RuntimeError(f"{row['run_id']}: missing predecessor T{prev_turn}")
    messages = list(prev["delivered_messages"])
    messages.append(assistant_item(prev["raw_text"]))
    messages.append(user_item(prompt))
    return messages
def save_result(run_dir: Path, row: dict, messages: list[dict], request_body: dict, resp: dict):
    p = result_path(run_dir, row["run_id"])
    if p.exists():
        raise RuntimeError(f"Refusing to overwrite raw response: {p.name}")
    text = response_text(resp)
    if not text.strip():
        raise RuntimeError(f"{row['run_id']}: usable output_text missing")
    record = {
        "run_id": row["run_id"],
        "anchor_id": row["anchor_id"],
        "cohort": "OPENAI_CONTROLLED_ENDPOINT",
        "run_type": row["run_type"],
        "condition": row["condition"],
        "replicate": row["replicate"],
        "turn": row["turn"],
        "fresh_context": row["fresh_context"],
        "timestamp_utc": utc_now(),
        "requested_model": request_body["model"],
        "returned_model": resp.get("model"),
        "store": request_body["store"],
        "max_output_tokens": request_body["max_output_tokens"],
        "temperature": request_body["temperature"],
        "top_p": request_body["top_p"],
        "reasoning_effort": request_body["reasoning"]["effort"],
        "seed": "UNKNOWN",
        "tools": [],
        "conversation": None,
        "previous_response_id": None,
        "delivered_messages": messages,
        "delivered_messages_sha256": sha256_text(json.dumps(messages, ensure_ascii=False, sort_keys=True)),
        "raw_text": text,
        "response_id": resp.get("id"),
        "response_status": resp.get("status"),
        "usage": resp.get("usage"),
        "raw_response": resp,
    }
    p.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    with (run_dir / "COUNTED_SUCCESS.jsonl").open("a", encoding="utf-8") as f:
        f.write(json.dumps({k: record[k] for k in ("run_id","timestamp_utc","returned_model","response_status")}, ensure_ascii=False) + "\n")
def dry_run(anchors: dict, manifest: list[dict]):
    prompts = []
    for row in manifest:
        a = anchors[row["anchor_id"]]
        prompts.append((row["run_id"], resolve_prompt(row, a)))
    counts = {}
    for row in manifest:
        counts[row["condition"]] = counts.get(row["condition"], 0) + 1
    print(f"DRY_RUN_OK total={len(prompts)} unique_run_ids={len(set(x[0] for x in prompts))}")
    print("CONDITIONS=" + json.dumps(counts, sort_keys=True))
    print("MANIFEST_SHA256=" + hashlib.sha256(MANIFEST_PATH.read_bytes()).hexdigest())
    print("ANCHOR_BANK_SHA256=" + hashlib.sha256(BANK_PATH.read_bytes()).hexdigest())

def smoke(api_key: str, model: str):
    messages = [user_item("Reply with exactly: EXECUTION_SMOKE_OK")]
    tmp = BASE / "_smoke_attempts.tmp.jsonl"
    try:
        body, resp = api_request(api_key, model, messages, tmp)
        print("SMOKE_STATUS=OK")
        print("REQUESTED_MODEL=" + model)
        print("RETURNED_MODEL=" + str(resp.get("model")))
        print("TEXT=" + response_text(resp))
    finally:
        if tmp.exists():
            tmp.unlink()
def execute(api_key: str, model: str, anchors: dict, manifest: list[dict], run_dir: Path):
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "responses").mkdir(exist_ok=True)
    metadata = run_dir / "RUN_METADATA.json"
    if not metadata.exists():
        meta = {
            "created_utc": utc_now(),
            "cohort": "OPENAI_CONTROLLED_ENDPOINT",
            "requested_model": model,
            "endpoint": API_URL,
            "manifest_sha256": hashlib.sha256(MANIFEST_PATH.read_bytes()).hexdigest(),
            "anchor_bank_sha256": hashlib.sha256(BANK_PATH.read_bytes()).hexdigest(),
            "protocol": "EXECUTION_PROTOCOL_OPENAI_20261002.md",
            "settings": {
                "store": False, "max_output_tokens": MAX_OUTPUT_TOKENS,
                "temperature": TEMPERATURE, "top_p": TOP_P,
                "reasoning_effort": REASONING_EFFORT, "tools": []
            }
        }
        metadata.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    successes = sum(1 for r in manifest if result_path(run_dir, r["run_id"]).exists())
    print(f"RESUME_COUNT={successes}/336", flush=True)
    for idx, row in enumerate(manifest, start=1):
        p = result_path(run_dir, row["run_id"])
        if p.exists():
            continue
        a = anchors[row["anchor_id"]]
        messages = build_messages(row, a, run_dir)
        attempts = run_dir / "ATTEMPTS.jsonl"
        body, resp = api_request(api_key, model, messages, attempts)
        save_result(run_dir, row, messages, body, resp)
        successes += 1
        print(f"COUNTED {successes}/336 {row['run_id']} model={resp.get('model')}", flush=True)
    print("EXECUTION_COMPLETE=336/336", flush=True)
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--smoke", action="store_true")
    ap.add_argument("--execute", action="store_true")
    ap.add_argument("--run-dir", type=Path, default=BASE / "data" / "raw" / "openai-gpt-5.6-sol-20261002")
    args = ap.parse_args()
    _, anchors, manifest = load_inputs()
    if args.dry_run:
        dry_run(anchors, manifest)
        return 0
    api_key = os.environ.get("OPENAI_API_KEY") or os.popen(
        'powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable(\'OPENAI_API_KEY\',\'User\')"'
    ).read().strip()
    if not api_key:
        print("OPENAI_API_KEY not set", file=sys.stderr)
        return 2
    if args.smoke:
        smoke(api_key, args.model)
        return 0
    if args.execute:
        execute(api_key, args.model, anchors, manifest, args.run_dir)
        return 0
    ap.error("choose --dry-run, --smoke, or --execute")

if __name__ == "__main__":
    raise SystemExit(main())
