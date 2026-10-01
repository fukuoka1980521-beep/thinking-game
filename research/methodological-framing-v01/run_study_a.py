from __future__ import annotations
import argparse, hashlib, json, os, threading, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
METHODS = BASE / "FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
TASKS = BASE / "FROZEN_STUDY_A_TASK_BANK_V1_0.json"
SCHEMA = BASE / "FROZEN_STUDY_A_SCHEMA_V1_0.json"
MANIFEST = BASE / "FROZEN_STUDY_A_MANIFEST_V1_0.jsonl"
PREREG = BASE / "STUDY_A_PREREGISTRATION_V1_0.md"
MEASUREMENT = BASE / "FROZEN_STUDY_A_MEASUREMENT_V1_0.py"
FREEZE = BASE / "STUDY_A_FREEZE_V1_0.json"
ROOT = BASE / "study_a"
RAW = ROOT / "raw"
LOG = ROOT / "collection.log"
API = "https://api.openai.com/v1/responses"
MODEL = "gpt-5.6-sol"
MAX_OUTPUT_TOKENS = 8000
MAX_WORKERS = 8
LOG_LOCK = threading.Lock()

def sha256_bytes(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def now():
    return datetime.now(timezone.utc).isoformat()

def append_log(msg):
    ROOT.mkdir(parents=True, exist_ok=True)
    with LOG_LOCK:
        with LOG.open("a", encoding="utf-8") as h:
            h.write(f"{now()} {msg}\n")

def verify_freeze():
    f = json.loads(FREEZE.read_text(encoding="utf-8"))
    checks = {
        "method_bank_sha256": METHODS,
        "task_bank_sha256": TASKS,
        "schema_sha256": SCHEMA,
        "manifest_sha256": MANIFEST,
        "preregistration_sha256": PREREG,
        "measurement_code_sha256": MEASUREMENT,
        "collection_code_sha256": Path(__file__),
    }
    for key, path in checks.items():
        if sha256_bytes(path) != f[key]:
            raise SystemExit(f"freeze hash mismatch: {path.name}")
    if f["manifest_n"] != 336 or f["counted_runs_at_freeze"] != 0:
        raise SystemExit("invalid freeze metadata")
    return f

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
    parts=[]
    for item in resp.get("output",[]):
        if item.get("type")!="message":
            continue
        for part in item.get("content",[]):
            if part.get("type")=="output_text":
                parts.append(part.get("text",""))
    return "".join(parts)

def prompt_for(objective,instruction):
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

def request_body(prompt):
    return {
        "model":MODEL,
        "input":[{"role":"user","content":[{"type":"input_text","text":prompt}]}],
        "store":False,
        "max_output_tokens":MAX_OUTPUT_TOKENS,
        "temperature":1.0,
        "top_p":1.0,
        "reasoning":{"effort":"none"},
    }

def call(key,prompt,run_id):
    body=request_body(prompt)
    payload=json.dumps(body,ensure_ascii=False).encode("utf-8")
    last=None
    for attempt in range(1,6):
        started=now()
        try:
            req=urllib.request.Request(
                API,data=payload,
                headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req,timeout=240) as h:
                resp=json.loads(h.read().decode("utf-8"))
            if resp.get("model")!=MODEL:
                raise RuntimeError(f"returned model mismatch: {resp.get('model')}")
            if resp.get("status")!="completed" or resp.get("incomplete_details") is not None:
                append_log(f"RETRY_INCOMPLETE run_id={run_id} attempt={attempt} status={resp.get('status')} details={resp.get('incomplete_details')}")
                last=f"incomplete status={resp.get('status')}"
                time.sleep(min(2**attempt,20))
                continue
            return body,resp,attempt,started
        except urllib.error.HTTPError as e:
            body_text=e.read().decode("utf-8",errors="replace")
            append_log(f"HTTP_ERROR run_id={run_id} attempt={attempt} code={e.code}")
            if "credit_balance_exhausted" in body_text or "insufficient_quota" in body_text:
                raise RuntimeError("API_CREDIT_BALANCE_EXHAUSTED")
            last=repr(e)
        except Exception as e:
            append_log(f"RETRY run_id={run_id} attempt={attempt} error={type(e).__name__}")
            last=repr(e)
        time.sleep(min(2**attempt,20))
    raise RuntimeError(last or "request failure")

def load_inputs():
    methods=json.loads(METHODS.read_text(encoding="utf-8"))
    tasks=json.loads(TASKS.read_text(encoding="utf-8"))
    manifest=[json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    if len(manifest)!=336 or len({x["run_id"] for x in manifest})!=336:
        raise SystemExit("manifest denominator/uniqueness mismatch")
    return {x["id"]:x for x in methods["conditions"]},{x["id"]:x for x in tasks["tasks"]},manifest

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--dry-run",action="store_true")
    args=ap.parse_args()

    verify_freeze()
    methods,tasks,manifest=load_inputs()
    if args.dry_run:
        print("STUDY_A_DRY_RUN=PASS")
        print("MANIFEST=336")
        print(f"MAX_WORKERS={MAX_WORKERS}")
        print(f"MAX_OUTPUT_TOKENS={MAX_OUTPUT_TOKENS}")
        return

    key=get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")
    RAW.mkdir(parents=True,exist_ok=True)

    existing={p.stem for p in RAW.glob("*.json")}
    pending=[row for row in manifest if row["run_id"] not in existing]
    done=336-len(pending)
    print(f"STUDY_A_START done={done} pending={len(pending)} workers={MAX_WORKERS}",flush=True)
    append_log(f"START done={done} pending={len(pending)} workers={MAX_WORKERS}")

    def one(row):
        dest=RAW/f"{row['run_id']}.json"
        if dest.exists():
            return row["run_id"],"SKIP"
        cond=methods[row["condition_id"]]
        prompt=prompt_for(tasks[row["task_id"]]["objective"],cond["instruction"])
        body,resp,attempt,started=call(key,prompt,row["run_id"])
        txt=output_text(resp)
        if not txt.strip():
            raise RuntimeError("empty output "+row["run_id"])
        rec={
            **row,
            "counted":True,
            "request_started_utc":started,
            "timestamp_utc":now(),
            "requested_model":MODEL,
            "returned_model":resp.get("model"),
            "store":False,
            "max_output_tokens":MAX_OUTPUT_TOKENS,
            "temperature":1.0,
            "top_p":1.0,
            "reasoning_effort":"none",
            "attempt_count":attempt,
            "prompt_text":prompt,
            "prompt_sha256":hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "request_body":body,
            "response_id":resp.get("id"),
            "response_status":resp.get("status"),
            "incomplete_details":resp.get("incomplete_details"),
            "usage":resp.get("usage"),
            "raw_text":txt,
            "raw_response":resp,
        }
        tmp=dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        if dest.exists():
            tmp.unlink(missing_ok=True)
            return row["run_id"],"SKIP_RACE"
        tmp.replace(dest)
        append_log(f"COUNTED run_id={row['run_id']} response_id={resp.get('id')}")
        return row["run_id"],"OK"

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs=[ex.submit(one,row) for row in pending]
        for fut in as_completed(futs):
            rid,status=fut.result()
            if status=="OK":
                done+=1
            elif status.startswith("SKIP"):
                done=len(list(RAW.glob("*.json")))
            print(f"STUDY_A {done}/336 {rid} {status}",flush=True)

    final=len(list(RAW.glob("*.json")))
    if final!=336:
        raise SystemExit(f"collection incomplete {final}/336")
    append_log("COLLECTION_COMPLETE 336/336")
    print("STUDY_A_COLLECTION_COMPLETE=336/336")

if __name__=="__main__":
    main()
