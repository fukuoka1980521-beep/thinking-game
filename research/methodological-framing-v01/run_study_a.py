from __future__ import annotations
import hashlib, json, os, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
METHODS = BASE / "FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
TASKS = BASE / "FROZEN_STUDY_A_TASK_BANK_V1_0.json"
SCHEMA = BASE / "FROZEN_STUDY_A_SCHEMA_V1_0.json"
MANIFEST = BASE / "FROZEN_STUDY_A_MANIFEST_V1_0.jsonl"
PREREG = BASE / "STUDY_A_PREREGISTRATION_V1_0.md"
FREEZE = BASE / "STUDY_A_FREEZE_V1_0.json"
ROOT = BASE / "study_a"
RAW = ROOT / "raw"
LOG = ROOT / "collection.log"
API = "https://api.openai.com/v1/responses"
MODEL = "gpt-5.6-sol"

def sha256_bytes(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def verify_freeze():
    f = json.loads(FREEZE.read_text(encoding="utf-8"))
    checks = {
        "method_bank_sha256": METHODS,
        "task_bank_sha256": TASKS,
        "schema_sha256": SCHEMA,
        "manifest_sha256": MANIFEST,
        "preregistration_sha256": PREREG,
    }
    for key, path in checks.items():
        if sha256_bytes(path) != f[key]:
            raise SystemExit(f"freeze hash mismatch: {path.name}")
    if f["manifest_n"] != 336 or f["counted_runs_at_freeze"] != 0:
        raise SystemExit("invalid freeze metadata")

def get_api_key():
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key
    if os.name == "nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as h:
                value, _ = winreg.QueryValueEx(h, "OPENAI_API_KEY")
                return str(value).strip()
        except Exception:
            pass
    return ""

def output_text(resp):
    parts = []
    for item in resp.get("output", []):
        if item.get("type") != "message":
            continue
        for part in item.get("content", []):
            if part.get("type") == "output_text":
                parts.append(part.get("text", ""))
    return "".join(parts)

def prompt_for(objective, instruction):
    return f"""RESEARCH OBJECTIVE (identical within task):
{objective}

METHODOLOGICAL FRAMING:
{instruction}

OUTPUT REQUIREMENTS (identical across conditions):
Produce a research plan only, with these neutral headings:
1. Objective and scope
2. Assumptions
3. Research design
4. Data or evidence needed
5. Measurement
6. Analysis
7. Decision / stopping rule
8. Limitations

Within those headings, include whatever elements you judge scientifically necessary.
Do not mention that you are in an experiment comparing methodologies.
Do not use external tools."""

def now():
    return datetime.now(timezone.utc).isoformat()

def append_log(msg):
    ROOT.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as h:
        h.write(f"{now()} {msg}\n")

def call(key, prompt):
    body = {
        "model": MODEL,
        "input": [{"role": "user", "content": [{"type": "input_text", "text": prompt}]}],
        "store": False,
        "max_output_tokens": 2200,
        "temperature": 1.0,
        "top_p": 1.0,
        "reasoning": {"effort": "none"},
    }
    payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
    last = None
    for attempt in range(1, 6):
        try:
            req = urllib.request.Request(
                API,
                data=payload,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=240) as h:
                return body, json.loads(h.read().decode("utf-8"))
        except Exception as e:
            last = repr(e)
            append_log(f"RETRY attempt={attempt} error={last}")
            time.sleep(min(2 ** attempt, 20))
    raise RuntimeError(last or "request failure")

def main():
    verify_freeze()
    key = get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")

    method_bank = json.loads(METHODS.read_text(encoding="utf-8"))
    task_bank = json.loads(TASKS.read_text(encoding="utf-8"))
    methods = {x["id"]: x for x in method_bank["conditions"]}
    tasks = {x["id"]: x for x in task_bank["tasks"]}
    manifest = [json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    if len(manifest) != 336:
        raise SystemExit("manifest denominator mismatch")

    RAW.mkdir(parents=True, exist_ok=True)
    done = 0
    for row in manifest:
        dest = RAW / f"{row['run_id']}.json"
        if dest.exists():
            done += 1
            continue

        cond = methods[row["condition_id"]]
        prompt = prompt_for(tasks[row["task_id"]]["objective"], cond["instruction"])
        body, resp = call(key, prompt)
        text = output_text(resp)
        if not text.strip():
            raise RuntimeError("empty output " + row["run_id"])
        if resp.get("model") != MODEL:
            raise RuntimeError(f"returned model mismatch {resp.get('model')}")

        rec = {
            **row,
            "counted": True,
            "timestamp_utc": now(),
            "requested_model": MODEL,
            "returned_model": resp.get("model"),
            "store": False,
            "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "response_id": resp.get("id"),
            "usage": resp.get("usage"),
            "raw_text": text,
            "raw_response": resp,
        }
        tmp = dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(dest)
        done += 1
        append_log(f"COUNTED {done}/336 {row['run_id']} response_id={resp.get('id')}")
        print(f"STUDY_A {done}/336 {row['run_id']}", flush=True)

    print("STUDY_A_COLLECTION_COMPLETE=336/336")

if __name__ == "__main__":
    main()
