#!/usr/bin/env python3
"""
Direct Cloud Shell executor for STGR/LSCB v0.4.

Uses the interactive gcloud identity already present in Cloud Shell instead of
GitHub Actions WIF. It never edits the frozen v0.4 experimental materials.
"""
import base64
import hashlib
import importlib.util
import os
import pathlib
import subprocess
import sys
import tempfile
import zipfile

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
B64 = REPO_ROOT / "research/stgr-lscb-v04/package_function.b64"
EXPECTED_SHA256 = "e24dec441f4026ade03e52e9db92de3dce5894e397515d9ab5a903df76230544"
OUT = REPO_ROOT / "research/stgr-lscb-v04/STGR_LSCB_RESULTS_V0_4.zip"

def access_token():
    return subprocess.check_output(
        ["gcloud", "auth", "print-access-token"], text=True
    ).strip()

def main():
    raw = base64.b64decode(B64.read_text(encoding="ascii"))
    got = hashlib.sha256(raw).hexdigest()
    if got != EXPECTED_SHA256:
        raise SystemExit(f"package hash mismatch: {got}")

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
        os.environ.setdefault("GCP_PROJECT", "gas-test-runner-20260620-wjxf")
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
        payload = experiment.run_experiment_zip()
        OUT.write_bytes(payload)

    with zipfile.ZipFile(OUT) as z:
        names = set(z.namelist())
        if "results/TECHNICAL_FAILURE.json" in names:
            print(z.read("results/TECHNICAL_FAILURE.json").decode("utf-8"))
            raise SystemExit(2)
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
            raise SystemExit(f"result missing: {missing}")
        print(z.read("results/research_report.md").decode("utf-8"))
    print(f"RESULT_ZIP={OUT}")

if __name__ == "__main__":
    main()
