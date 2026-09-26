#!/usr/bin/env python3
"""
Direct Cloud Shell executor for STGR/LSCB v0.4.

Uses the interactive gcloud identity already present in Cloud Shell instead of
GitHub Actions WIF. It never edits the frozen v0.4 experimental materials.
It ALWAYS attempts to upload the result ZIP to the research Drive folder,
including TECHNICAL_FAIL evidence, so the Owner does not need to relay logs.
"""
import base64
import hashlib
import os
import pathlib
import subprocess
import sys
import json
import tempfile
import zipfile
import time
import threading

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
B64 = REPO_ROOT / "research/stgr-lscb-v04/package_function.b64"
EXPECTED_SHA256 = "e24dec441f4026ade03e52e9db92de3dce5894e397515d9ab5a903df76230544"
OUT = REPO_ROOT / "research/stgr-lscb-v04/STGR_LSCB_RESULTS_V0_4.zip"
DRIVE_FOLDER_ID = "19edDH7Jb534Mt9WYfuSXaCJL3n-WStf2"
PROJECT_ID = "gas-test-runner-20260620-wjxf"
_TOKEN = {"value": None, "at": 0.0}
CACHE_DIR = pathlib.Path.home() / ".stgr_lscb_v04_call_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
_PROGRESS = {"api_calls": 0, "cache_hits": 0}

def access_token():
    # gcloud user access tokens are short-lived. Cache for 45 minutes so the
    # experiment does not spawn a gcloud process for every model call, then
    # transparently refresh during longer runs.
    now = time.time()
    if _TOKEN["value"] and now - _TOKEN["at"] < 2700:
        return _TOKEN["value"]
    token = subprocess.check_output(
        ["gcloud", "auth", "print-access-token"], text=True
    ).strip()
    _TOKEN["value"] = token
    _TOKEN["at"] = now
    return token

def heartbeat(stop_event):
    started = time.time()
    while not stop_event.wait(60):
        mins = int((time.time() - started) // 60)
        print(
            f"[STGR v0.4] running: {mins} min | "
            f"new_api_calls={_PROGRESS['api_calls']} | "
            f"reused_cached_calls={_PROGRESS['cache_hits']}",
            flush=True,
        )

def install_persistent_call_cache(experiment):
    """Cache each successful model call by exact prompt+schema+runtime config.

    This does not change prompts, outputs, scoring, or run order. It only makes
    a Cloud Shell restart resumable: already completed calls are replayed from
    the exact saved response tuple, while unseen calls still hit Vertex AI.
    Failures are never cached.
    """
    original = experiment.call_vertex

    def cached_call_vertex(prompt, schema, max_attempts=5):
        key_payload = {
            "prompt": prompt,
            "schema": schema,
            "project": experiment.PROJECT,
            "location": experiment.LOCATION,
            "model": experiment.MODEL,
            "max_output_tokens": experiment.MAX_OUTPUT_TOKENS,
            "temperature": experiment.TEMPERATURE,
            "max_attempts": max_attempts,
        }
        key = hashlib.sha256(
            json.dumps(key_payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
        ).hexdigest()
        path = CACHE_DIR / f"{key}.json"
        if path.exists():
            saved = json.loads(path.read_text(encoding="utf-8"))
            _PROGRESS["cache_hits"] += 1
            return (
                saved["parsed"],
                saved["text"],
                saved["usage"],
                saved["elapsed"],
                saved["finish"],
                saved["retries"],
            )

        result = original(prompt, schema, max_attempts=max_attempts)
        parsed, text, usage, elapsed, finish, retries = result
        payload = {
            "parsed": parsed,
            "text": text,
            "usage": usage,
            "elapsed": elapsed,
            "finish": finish,
            "retries": retries,
        }
        tmp = path.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        tmp.replace(path)
        _PROGRESS["api_calls"] += 1
        return result

    experiment.call_vertex = cached_call_vertex

def upload_result():
    token = access_token()
    metadata = json.dumps(
        {"name": "STGR_LSCB_RESULTS_V0_4.zip", "parents": [DRIVE_FOLDER_ID]},
        ensure_ascii=False,
    )
    cmd = [
        "curl", "-sS", "--fail-with-body", "-X", "POST",
        "-H", f"Authorization: Bearer {token}",
        "-H", f"X-Goog-User-Project: {PROJECT_ID}",
        "-F", f"metadata={metadata};type=application/json;charset=UTF-8",
        "-F", f"file=@{OUT};type=application/zip",
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime",
    ]
    uploaded = subprocess.check_output(cmd, text=True)
    print(f"DRIVE_UPLOAD={uploaded.strip()}", flush=True)

def main():
    print("[STGR v0.4] START — 96 runs + blinded quality judge", flush=True)
    raw = base64.b64decode(B64.read_text(encoding="ascii"))
    got = hashlib.sha256(raw).hexdigest()
    if got != EXPECTED_SHA256:
        raise SystemExit(f"package hash mismatch: {got}")

    stop_event = threading.Event()
    hb = threading.Thread(target=heartbeat, args=(stop_event,), daemon=True)
    hb.start()

    technical_fail = False
    fail_text = None
    report_text = None
    try:
        with tempfile.TemporaryDirectory(prefix="stgr-v04-") as td:
            td = pathlib.Path(td)
            pkg = td / "pkg.zip"
            pkg.write_bytes(raw)
            with zipfile.ZipFile(pkg) as z:
                z.extractall(td)
            service = td / "STGR_LSCB_PILOT_V0_4" / "service"
            sys.path.insert(0, str(service))
            import experiment

            experiment.metadata_token = access_token
            os.environ.setdefault("GCP_PROJECT", PROJECT_ID)
            os.environ.setdefault("VERTEX_LOCATION", "asia-southeast1")
            os.environ.setdefault("VERTEX_MODEL", "gemini-3.5-flash")
            os.environ.setdefault("MAX_OUTPUT_TOKENS", "4096")
            os.environ.setdefault("TEMPERATURE", "0")

            # experiment reads env at import time; explicitly freeze values too.
            experiment.PROJECT = os.environ["GCP_PROJECT"]
            experiment.LOCATION = os.environ["VERTEX_LOCATION"]
            experiment.MODEL = os.environ["VERTEX_MODEL"]
            experiment.MAX_OUTPUT_TOKENS = int(os.environ["MAX_OUTPUT_TOKENS"])
            experiment.TEMPERATURE = float(os.environ["TEMPERATURE"])
            install_persistent_call_cache(experiment)
            print(
                f"[STGR v0.4] persistent cache: {CACHE_DIR} "
                f"({len(list(CACHE_DIR.glob('*.json')))} saved calls available)",
                flush=True,
            )

            payload = experiment.run_experiment_zip()
            OUT.write_bytes(payload)

        with zipfile.ZipFile(OUT) as z:
            names = set(z.namelist())
            technical_fail = "results/TECHNICAL_FAILURE.json" in names
            if technical_fail:
                fail_text = z.read("results/TECHNICAL_FAILURE.json").decode("utf-8")
            else:
                required = {
                    "results/raw_runs.jsonl",
                    "results/completed.jsonl",
                    "results/final_goal_quality.jsonl",
                    "results/scored_runs.csv",
                    "results/summary.json",
                    "results/research_report.md",
                    "results/execution_status.json",
                }
                missing = sorted(required - names)
                if missing:
                    technical_fail = True
                    fail_text = json.dumps(
                        {"status": "TECHNICAL_FAIL", "message": f"result missing: {missing}"},
                        ensure_ascii=False,
                        indent=2,
                    )
                else:
                    report_text = z.read("results/research_report.md").decode("utf-8")
    finally:
        stop_event.set()
        hb.join(timeout=2)

    # Always hand off the evidence before returning success/failure.
    print(f"RESULT_ZIP={OUT}", flush=True)
    try:
        upload_result()
    except Exception as e:
        print(f"DRIVE_UPLOAD_FAILED={type(e).__name__}: {e}", file=sys.stderr, flush=True)
        raise

    if technical_fail:
        print("TECHNICAL_FAILURE_EVIDENCE_UPLOADED", flush=True)
        if fail_text:
            print(fail_text, flush=True)
        raise SystemExit(2)

    if report_text:
        print(report_text, flush=True)
    print("STGR_V04_COMPLETE_AND_UPLOADED=YES", flush=True)

if __name__ == "__main__":
    main()
