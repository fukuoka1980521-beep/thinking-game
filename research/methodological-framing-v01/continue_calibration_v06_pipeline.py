from __future__ import annotations
import json, subprocess, sys, time
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v06"
RAW = ROOT / "raw"
LOG = BASE / "calibration_v06_pipeline.log"

def log(msg):
    line = time.strftime("%Y-%m-%d %H:%M:%S") + " " + msg
    print(line, flush=True)
    with LOG.open("a", encoding="utf-8") as h:
        h.write(line + "\n")

def run(cmd):
    log("RUN " + " ".join(cmd))
    p = subprocess.run(cmd, cwd=BASE, text=True, capture_output=True)
    if p.stdout:
        for line in p.stdout.splitlines():
            log("OUT " + line)
    if p.stderr:
        for line in p.stderr.splitlines():
            log("ERR " + line)
    if p.returncode != 0:
        raise SystemExit("command failed: " + " ".join(cmd))
    return p

def raw_complete():
    files = list(RAW.glob("*.json"))
    if len(files) != 42:
        return False
    for f in files:
        rec = json.loads(f.read_text(encoding="utf-8"))
        if rec.get("response_status") != "completed":
            raise SystemExit("non-completed raw response: " + f.name)
        if rec.get("incomplete_details") is not None:
            raise SystemExit("incomplete_details in raw response: " + f.name)
        if rec.get("max_output_tokens") != 8000:
            raise SystemExit("wrong output budget: " + f.name)
        if rec.get("calibration_version") != "v0.6":
            raise SystemExit("wrong calibration version: " + f.name)
    return True

def main():
    LOG.unlink(missing_ok=True)
    log("PIPELINE_START")
    deadline = time.time() + 3600
    while not raw_complete():
        log(f"WAIT_RAW {len(list(RAW.glob('*.json')))}/42")
        if time.time() > deadline:
            raise SystemExit("raw collection timeout")
        time.sleep(15)

    log("RAW_COMPLETE 42/42")
    run([sys.executable, "prepare_blind_calibration_v06.py"])

    p1log = BASE / "calibration_v06_primary.log"
    p2log = BASE / "calibration_v06_secondary.log"
    with p1log.open("w", encoding="utf-8") as h1, p2log.open("w", encoding="utf-8") as h2:
        p1 = subprocess.Popen(
            [sys.executable, "score_calibration_v06_parallel.py", "--scorer", "primary"],
            cwd=BASE, stdout=h1, stderr=subprocess.STDOUT, text=True,
        )
        p2 = subprocess.Popen(
            [sys.executable, "score_calibration_v06_parallel.py", "--scorer", "secondary"],
            cwd=BASE, stdout=h2, stderr=subprocess.STDOUT, text=True,
        )
        log(f"SCORING_STARTED primary_pid={p1.pid} secondary_pid={p2.pid}")
        rc1, rc2 = p1.wait(), p2.wait()
        log(f"SCORING_EXIT primary={rc1} secondary={rc2}")
        if rc1 != 0 or rc2 != 0:
            raise SystemExit("parallel scoring failed")

    run([sys.executable, "validate_calibration_v06.py"])
    run([sys.executable, "analyze_calibration_v06.py"])

    result = json.loads((ROOT / "analysis" / "CALIBRATION_V06_RESULTS.json").read_text(encoding="utf-8"))
    gate = result["gate"]["study_A_freeze"]
    log("CALIBRATION_GATE=" + gate)
    log("STUDY_A_FREEZE_READY=" + ("YES" if gate == "GO" else "NO"))
    log("PIPELINE_COMPLETE")

if __name__ == "__main__":
    main()
