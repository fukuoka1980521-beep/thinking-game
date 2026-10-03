from __future__ import annotations
import ctypes, hashlib, json, msvcrt, os, shutil, subprocess, sys, time
from datetime import datetime
from pathlib import Path

ROOT = Path(r"C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01")
REPO = ROOT.parents[1]
MODEL_DIR = Path(r"C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot")
PYTHON = Path(sys.executable)
ARIA2 = Path(r"C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\aria2.aria2_Microsoft.Winget.Source_8wekyb3d8bbwe\aria2-1.37.0-win-64bit-build1\aria2c.exe")
STATE_PATH = ROOT / "AUTORUN_STATE.json"
LOG_PATH = ROOT / "AUTORUN_WATCHDOG.log"
LOCK_PATH = ROOT / ".tmi_watchdog.lock"
DETACHED = 0x00000008 | 0x00000200

MODELS = {
    "BASE": ("mradermacher/OLMo-2-1124-7B-GGUF", "052f3248d0878a61a6ffa8f8903e513b215e6f0e", "OLMo-2-1124-7B.Q4_K_M.gguf"),
    "SFT": ("mradermacher/OLMo-2-1124-7B-SFT-GGUF", "8fbeaff0abdd5cca10ee696462f2d3a17c8fdc82", "OLMo-2-1124-7B-SFT.Q4_K_M.gguf"),
    "DPO": ("mradermacher/OLMo-2-1124-7B-DPO-GGUF", "32ce3d935205a7301f5bde270abffb4331f22525", "OLMo-2-1124-7B-DPO.Q4_K_M.gguf"),
    "RLVR": ("mradermacher/OLMo-2-1124-7B-Instruct-GGUF", "d618cdd4d18a8463dbb919e30ee9863b16b4173f", "OLMo-2-1124-7B-Instruct.Q4_K_M.gguf"),
}
STAGES = ["BASE", "SFT", "DPO", "RLVR"]
def now():
    return datetime.now().astimezone().isoformat(timespec="seconds")

def log(msg):
    line = f"{now()} {msg}"
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(line + "\n")

def load_state():
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text(encoding="utf-8"))
        except Exception as e:
            log(f"STATE_READ_ERROR {type(e).__name__} {e}")
    return {
        "schema": 1,
        "status": "RUNNING",
        "downloads": {},
        "job": None,
        "retries": {},
        "smoke_decision": None,
        "primary_rendering": None,
        "created_at": now(),
        "updated_at": now(),
    }

def save_state(s):
    s["updated_at"] = now()
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(s, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(STATE_PATH)

def acquire_lock():
    LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    f = LOCK_PATH.open("a+b")
    if f.tell() == 0:
        f.write(b"0")
        f.flush()
    f.seek(0)
    try:
        msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
    except OSError:
        f.close()
        return None
    return f

def release_lock(f):
    try:
        f.seek(0)
        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
    finally:
        f.close()

def process_alive(pid):
    if not pid:
        return False
    k32 = ctypes.windll.kernel32
    h = k32.OpenProcess(0x1000, False, int(pid))
    if not h:
        return False
    code = ctypes.c_ulong()
    ok = k32.GetExitCodeProcess(h, ctypes.byref(code))
    k32.CloseHandle(h)
    return bool(ok and code.value == 259)
def sha256_file(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def start_detached(cmd, logfile):
    logfile.parent.mkdir(parents=True, exist_ok=True)
    fh = logfile.open("ab", buffering=0)
    try:
        p = subprocess.Popen(
            [str(x) for x in cmd],
            cwd=str(ROOT),
            stdout=fh,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            creationflags=DETACHED,
            close_fds=True,
        )
        return p.pid
    finally:
        fh.close()

def model_paths(stage):
    _, _, filename = MODELS[stage]
    final = MODEL_DIR / filename
    partial = MODEL_DIR / (filename + ".download")
    control = MODEL_DIR / (filename + ".download.aria2")
    return final, partial, control

def finalize_download_if_complete(stage, state):
    final, partial, control = model_paths(stage)
    ds = state["downloads"].setdefault(stage, {})
    pid = ds.get("pid")
    if final.exists() and final.stat().st_size > 4_000_000_000:
        ds["status"] = "READY"
        if not ds.get("sha256"):
            log(f"HASH_START {stage} bytes={final.stat().st_size}")
            ds["sha256"] = sha256_file(final)
            ds["bytes"] = final.stat().st_size
            log(f"HASH_DONE {stage} sha256={ds['sha256']}")
        return True
    if partial.exists() and partial.stat().st_size > 4_000_000_000 and not control.exists() and not process_alive(pid):
        partial.replace(final)
        ds["status"] = "READY"
        ds["pid"] = None
        log(f"DOWNLOAD_FINALIZED {stage} bytes={final.stat().st_size}")
        ds["sha256"] = sha256_file(final)
        ds["bytes"] = final.stat().st_size
        return True
    return False

def ensure_download(stage, state):
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if finalize_download_if_complete(stage, state):
        return True
    repo, rev, filename = MODELS[stage]
    final, partial, control = model_paths(stage)
    ds = state["downloads"].setdefault(stage, {})
    pid = ds.get("pid")
    if process_alive(pid):
        ds["status"] = "DOWNLOADING"
        ds["partial_bytes"] = partial.stat().st_size if partial.exists() else 0
        return False
    if shutil.disk_usage(MODEL_DIR).free < 6_000_000_000:
        state["status"] = "STOPPED_DISK_LOW"
        log(f"STOP_DISK_LOW stage={stage} free={shutil.disk_usage(MODEL_DIR).free}")
        return False
    url = f"https://huggingface.co/{repo}/resolve/{rev}/{filename}?download=true"
    cmd = [
        ARIA2, "-x", "8", "-s", "8", "-k", "1M",
        "--continue=true", "--file-allocation=none",
        "--auto-file-renaming=false", "--allow-overwrite=true",
        "--max-tries=0", "--retry-wait=3",
        "-d", MODEL_DIR, "-o", partial.name, url,
    ]
    pid = start_detached(cmd, ROOT / "autorun_logs" / f"download_{stage}.log")
    ds.update({"status": "DOWNLOADING", "pid": pid, "started_at": now(), "url": url})
    log(f"DOWNLOAD_START {stage} pid={pid} existing={partial.stat().st_size if partial.exists() else 0}")
    return False
def smoke_file(stage, rendering):
    return ROOT / "template_smoke" / "raw" / f"SMOKE-{stage}-{rendering.upper()}.json"

def base_smoke_valid():
    p = smoke_file("BASE", "raw")
    if not p.exists():
        return None
    try:
        r = json.loads(p.read_text(encoding="utf-8"))
        text = str(r.get("raw_text", ""))
        low = text.lower()
        headings = [
            "objective and scope", "assumptions", "research design",
            "data or evidence needed", "measurement", "analysis",
            "decision / stopping rule", "limitations",
        ]
        present = sum(h in low for h in headings)
        refusal = any(x in low for x in ["i cannot", "i can't", "unable to", "cannot comply"])
        hits = sum(x in low for x in ["response", "question", "variation", "factor", "observation", "explanation"])
        return bool(text.strip() and not refusal and present >= 6 and hits >= 2)
    except Exception as e:
        log(f"BASE_SMOKE_PARSE_ERROR {type(e).__name__} {e}")
        return False

def job_alive(state):
    j = state.get("job")
    return bool(j and process_alive(j.get("pid")))

def clear_finished_job(state):
    j = state.get("job")
    if not j:
        return
    if process_alive(j.get("pid")):
        return
    log(f"JOB_EXIT type={j.get('type')} stage={j.get('stage')} rendering={j.get('rendering')} pid={j.get('pid')}")
    state["job"] = None

def start_stage_job(stage, rendering, mode, state):
    key = f"{mode}:{stage}:{rendering}"
    tries = state["retries"].get(key, 0)
    if tries >= 4:
        state["status"] = "STOPPED_RETRY_LIMIT"
        log(f"STOP_RETRY_LIMIT {key}")
        return False
    cmd = [PYTHON, ROOT / "run_pilot_stage.py", "--stage", stage, "--rendering", rendering, "--mode", mode]
    pid = start_detached(cmd, ROOT / "autorun_logs" / f"{mode}_{stage}_{rendering}.log")
    state["job"] = {"type": mode, "stage": stage, "rendering": rendering, "pid": pid, "started_at": now()}
    state["retries"][key] = tries + 1
    log(f"JOB_START type={mode} stage={stage} rendering={rendering} pid={pid} attempt={tries+1}")
    return True
def smoke_complete():
    needed = [("BASE", "raw")]
    for s in ["SFT", "DPO", "RLVR"]:
        needed += [(s, "raw"), (s, "native")]
    return all(smoke_file(s, r).exists() for s, r in needed)

def ensure_smoke(state):
    if not smoke_file("BASE", "raw").exists():
        if not ensure_download("BASE", state):
            return False
        start_stage_job("BASE", "raw", "smoke", state)
        return False
    valid = base_smoke_valid()
    if valid is False:
        state["status"] = "STOP_BASE_RAW_INVALID"
        log("STOP_BASE_RAW_INVALID")
        return False
    for stage in ["SFT", "DPO", "RLVR"]:
        if not ensure_download(stage, state):
            return False
        for rendering in ["raw", "native"]:
            if not smoke_file(stage, rendering).exists():
                start_stage_job(stage, rendering, "smoke", state)
                return False
    if not smoke_complete():
        return False
    gate = ROOT / "template_smoke" / "TEMPLATE_SMOKE_GATE.json"
    if not gate.exists():
        rc = subprocess.run([str(PYTHON), str(ROOT / "evaluate_template_smoke.py")], cwd=ROOT).returncode
        log(f"SMOKE_EVAL rc={rc}")
        if rc != 0:
            return False
    result = json.loads(gate.read_text(encoding="utf-8"))
    decision = result.get("decision")
    state["smoke_decision"] = decision
    if decision == "GO_COMMON_RAW":
        state["primary_rendering"] = "COMMON_RAW"
        log("SMOKE_GATE GO_COMMON_RAW")
        return True
    if decision == "GO_STAGE_NATIVE_WITH_RAW_SENSITIVITY":
        state["primary_rendering"] = "STAGE_NATIVE"
        log("SMOKE_GATE GO_STAGE_NATIVE_WITH_RAW_SENSITIVITY")
        return True
    state["status"] = "STOPPED_" + str(decision)
    log(f"SMOKE_GATE_STOP {decision}")
    return False

def pilot_files_for(stage, rendering):
    d = ROOT / "pilot_v01" / "raw"
    return list(d.glob(f"P1-{stage}-*-{rendering.upper()}.json")) if d.exists() else []
def ensure_pilot(state):
    primary = state.get("primary_rendering")
    if primary not in {"COMMON_RAW", "STAGE_NATIVE"}:
        return False
    for stage in STAGES:
        rendering = "raw" if primary == "COMMON_RAW" or stage == "BASE" else "native"
        if len(pilot_files_for(stage, rendering)) < 18:
            if not finalize_download_if_complete(stage, state):
                if not ensure_download(stage, state):
                    return False
            start_stage_job(stage, rendering, "pilot", state)
            return False
    rawdir = ROOT / "pilot_v01" / "raw"
    files = list(rawdir.glob("*.json"))
    if len(files) != 72:
        state["status"] = "STOPPED_PILOT_FILE_COUNT"
        log(f"STOP_PILOT_FILE_COUNT n={len(files)}")
        return False
    result = ROOT / "pilot_v01" / "analysis" / "PILOT_ANALYSIS.json"
    if not result.exists():
        rc = subprocess.run([str(PYTHON), str(ROOT / "analyze_pilot_v0_1.py")], cwd=ROOT).returncode
        log(f"PILOT_ANALYZE rc={rc}")
        if rc != 0:
            return False
    state["status"] = "PILOT_COMPLETE"
    log("PILOT_COMPLETE n=72")
    return True

def commit_if_complete(state):
    if state.get("git_committed"):
        return
    subprocess.run(["git", "add", "research/training-method-interaction-v01"], cwd=REPO)
    cp = subprocess.run(
        ["git", "commit", "-m", "research: complete local training-method calibration pilot"],
        cwd=REPO, capture_output=True, text=True
    )
    log(f"GIT_COMMIT rc={cp.returncode} out={cp.stdout[-500:].strip()} err={cp.stderr[-500:].strip()}")
    pp = subprocess.run(
        ["git", "push", "origin", "research/methodological-framing-v01"],
        cwd=REPO, capture_output=True, text=True
    )
    log(f"GIT_PUSH rc={pp.returncode} out={pp.stdout[-500:].strip()} err={pp.stderr[-500:].strip()}")
    if pp.returncode == 0:
        state["git_committed"] = True
def tick():
    state = load_state()
    if state.get("status", "").startswith("STOP"):
        save_state(state)
        return
    clear_finished_job(state)
    if job_alive(state):
        save_state(state)
        return
    if not ensure_smoke(state):
        save_state(state)
        return
    if not ensure_pilot(state):
        save_state(state)
        return
    commit_if_complete(state)
    save_state(state)

if __name__ == "__main__":
    lock = acquire_lock()
    if lock is None:
        sys.exit(0)
    try:
        tick()
    except Exception as e:
        s = load_state()
        s["last_exception"] = {"at": now(), "type": type(e).__name__, "message": str(e)}
        save_state(s)
        log(f"EXCEPTION {type(e).__name__} {e}")
        raise
    finally:
        release_lock(lock)
