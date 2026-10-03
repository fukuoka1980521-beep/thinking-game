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

# Download-source fallbacks are operational contingencies only. They do not alter
# prompt/sampling conditions. RLVR has an official AllenAI Q4_K_M fallback.
DOWNLOAD_SOURCES = {
    "BASE": [
        {"repo": "mradermacher/OLMo-2-1124-7B-GGUF", "rev": "052f3248d0878a61a6ffa8f8903e513b215e6f0e", "remote_file": "OLMo-2-1124-7B.Q4_K_M.gguf"},
    ],
    "SFT": [
        {"repo": "mradermacher/OLMo-2-1124-7B-SFT-GGUF", "rev": "8fbeaff0abdd5cca10ee696462f2d3a17c8fdc82", "remote_file": "OLMo-2-1124-7B-SFT.Q4_K_M.gguf"},
    ],
    "DPO": [
        {"repo": "mradermacher/OLMo-2-1124-7B-DPO-GGUF", "rev": "32ce3d935205a7301f5bde270abffb4331f22525", "remote_file": "OLMo-2-1124-7B-DPO.Q4_K_M.gguf"},
    ],
    "RLVR": [
        {"repo": "mradermacher/OLMo-2-1124-7B-Instruct-GGUF", "rev": "d618cdd4d18a8463dbb919e30ee9863b16b4173f", "remote_file": "OLMo-2-1124-7B-Instruct.Q4_K_M.gguf", "label": "primary_one_distributor"},
        {"repo": "allenai/OLMo-2-1124-7B-Instruct-GGUF", "rev": "410e0069f64869e4b1d17d8de04810b881fd824b", "remote_file": "olmo-2-1124-7B-instruct-Q4_K_M.gguf", "label": "official_allenai_fallback", "published_sha256": "e08112e5f84aab7c05fa6e713c58e5214cd5d8e32ed773ff3354b006eed41b95"},
    ],
}

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

def age_seconds(iso_value):
    if not iso_value:
        return 0.0
    try:
        return max(0.0, (datetime.now().astimezone() - datetime.fromisoformat(iso_value)).total_seconds())
    except Exception:
        return 0.0

def terminate_tree(pid, reason):
    if not pid or not process_alive(pid):
        return
    log(f"PROCESS_TREE_TERMINATE pid={pid} reason={reason}")
    subprocess.run(
        ["taskkill", "/PID", str(pid), "/T", "/F"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=30,
    )
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
    _, _, filename = MODELS[stage]
    final, partial, control = model_paths(stage)
    ds = state["downloads"].setdefault(stage, {})
    pid = ds.get("pid")
    if process_alive(pid):
        ds["status"] = "DOWNLOADING"
        stat = partial.stat() if partial.exists() else None
        current_bytes = stat.st_size if stat else 0
        current_mtime_ns = stat.st_mtime_ns if stat else 0
        previous_bytes = int(ds.get("partial_bytes", 0) or 0)
        previous_mtime_ns = int(ds.get("partial_mtime_ns", 0) or 0)
        # aria2 range downloads can create a near-final logical file size before all
        # ranges are present. Treat either size growth OR file mtime change as progress.
        if current_bytes != previous_bytes or current_mtime_ns != previous_mtime_ns:
            ds["last_progress_at"] = now()
            ds["partial_bytes"] = current_bytes
            ds["partial_mtime_ns"] = current_mtime_ns
        elif not ds.get("last_progress_at"):
            ds["last_progress_at"] = now()
            ds["partial_bytes"] = current_bytes
            ds["partial_mtime_ns"] = current_mtime_ns
        elif age_seconds(ds.get("last_progress_at")) > 600:
            terminate_tree(pid, f"download_stale_{stage}")
            ds["pid"] = None
            ds["status"] = "STALE_RESTART_PENDING"
            log(f"DOWNLOAD_STALE {stage} bytes={current_bytes} mtime_ns={current_mtime_ns}")
        return False

    # A tracked downloader exited without producing a verified final file.
    # Count the failed source attempt instead of blindly repeating it forever.
    if pid:
        ds["pid"] = None
        ds["failed_attempts_current_source"] = int(ds.get("failed_attempts_current_source", 0) or 0) + 1
        log(f"DOWNLOAD_PROCESS_EXIT_UNFINALIZED {stage} attempts={ds['failed_attempts_current_source']}")

    sources = DOWNLOAD_SOURCES[stage]
    source_index = int(ds.get("source_index", 0) or 0)
    failed = int(ds.get("failed_attempts_current_source", 0) or 0)

    # After two failed launches on the same source, switch source if a scientifically
    # acceptable operational fallback exists. Otherwise, stop this dependency after
    # three failed launches and report from current evidence.
    if failed >= 2 and source_index + 1 < len(sources):
        old_index = source_index
        source_index += 1
        ds["source_index"] = source_index
        ds["failed_attempts_current_source"] = 0
        if partial.exists():
            archived = MODEL_DIR / (partial.name + f".source{old_index}.failed")
            if archived.exists():
                archived.unlink()
            partial.replace(archived)
        if control.exists():
            control.unlink()
        log(f"DOWNLOAD_SOURCE_SWITCH {stage} from={old_index} to={source_index} source={sources[source_index].get('label','fallback')}")
        amendment = ROOT / f"DOWNLOAD_FALLBACK_AMENDMENT_{stage}.md"
        amendment.write_text(
            "# Download Fallback Amendment\n\n"
            f"Stage: {stage}\n\n"
            f"Primary download source failed twice without a verified artifact. "
            f"Operational source switched before any {stage} output was generated.\n\n"
            f"Fallback: {sources[source_index]['repo']} @ {sources[source_index]['rev']}\n\n"
            "Scientific prompt/sampling conditions are unchanged. Quantization-source difference "
            "must be disclosed as a calibration limitation.\n",
            encoding="utf-8",
        )
        failed = 0

    if failed >= 3 and source_index + 1 >= len(sources):
        state["status"] = f"STOPPED_DOWNLOAD_UNRESOLVED_{stage}"
        state["unresolved_dependency"] = {
            "stage": stage,
            "cause": "all configured download sources exhausted",
            "attempts_on_final_source": failed,
            "impact": "stage-specific behavioral comparison unavailable; completed stages remain valid",
        }
        log(f"STOP_DOWNLOAD_UNRESOLVED {stage} attempts={failed}")
        try:
            subprocess.run([str(PYTHON), str(ROOT / "build_execution_report.py")], cwd=ROOT, timeout=60)
        except Exception as e:
            log(f"EXECUTION_REPORT_AFTER_DOWNLOAD_STOP_ERROR {type(e).__name__} {e}")
        return False

    if shutil.disk_usage(MODEL_DIR).free < 6_000_000_000:
        state["status"] = "STOPPED_DISK_LOW"
        log(f"STOP_DISK_LOW stage={stage} free={shutil.disk_usage(MODEL_DIR).free}")
        return False

    source = sources[source_index]
    repo, rev, remote_file = source["repo"], source["rev"], source["remote_file"]
    url = f"https://huggingface.co/{repo}/resolve/{rev}/{remote_file}?download=true"
    cmd = [
        ARIA2, "-x", "8", "-s", "8", "-k", "1M",
        "--continue=true", "--file-allocation=none",
        "--auto-file-renaming=false", "--allow-overwrite=true",
        "--max-tries=5", "--retry-wait=3",
        "-d", MODEL_DIR, "-o", partial.name, url,
    ]
    pid = start_detached(cmd, ROOT / "autorun_logs" / f"download_{stage}.log")
    stat = partial.stat() if partial.exists() else None
    existing = stat.st_size if stat else 0
    mtime_ns = stat.st_mtime_ns if stat else 0
    ds.update({
        "status": "DOWNLOADING", "pid": pid, "started_at": now(), "url": url,
        "source_index": source_index, "source_repo": repo, "source_revision": rev,
        "partial_bytes": existing, "partial_mtime_ns": mtime_ns, "last_progress_at": now()
    })
    log(f"DOWNLOAD_START {stage} pid={pid} existing={existing} source_index={source_index} repo={repo}")
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
        words = len(text.split())
        template_corruption = any(x in text for x in ["<|user|>", "<|assistant|>", "<|system|>"])
        return bool(text.strip() and words >= 100 and not refusal and not template_corruption and hits >= 2)
    except Exception as e:
        log(f"BASE_SMOKE_PARSE_ERROR {type(e).__name__} {e}")
        return False

def job_progress_count(j):
    kind = j.get("type")
    if kind == "runtime_benchmark":
        d = ROOT / "runtime_benchmark"
        return len(list(d.glob("*"))) if d.exists() else 0
    if kind == "smoke":
        return int(smoke_file(j.get("stage"), j.get("rendering")).exists())
    if kind == "pilot":
        d = ROOT / "pilot_v01" / "raw"
        if not d.exists():
            return 0
        stage = j.get("stage")
        rendering = str(j.get("rendering", "")).upper()
        return len(list(d.glob(f"P1-{stage}-*-{rendering}.json")))
    return 0

def job_alive(state):
    j = state.get("job")
    if not j or not process_alive(j.get("pid")):
        return False
    kind = j.get("type")
    absolute_limits = {"runtime_benchmark": 1800, "smoke": 1200, "pilot": 7200}
    if age_seconds(j.get("started_at")) > absolute_limits.get(kind, 7200):
        terminate_tree(j.get("pid"), f"{kind}_absolute_timeout")
        state["job"] = None
        log(f"JOB_STALE_ABSOLUTE type={kind}")
        return False
    current = job_progress_count(j)
    previous = int(j.get("progress_count", -1))
    if current > previous:
        j["progress_count"] = current
        j["last_progress_at"] = now()
    elif not j.get("last_progress_at"):
        j["progress_count"] = current
        j["last_progress_at"] = now()
    stale_limit = 1800 if kind == "pilot" else absolute_limits.get(kind, 7200)
    if age_seconds(j.get("last_progress_at")) > stale_limit:
        terminate_tree(j.get("pid"), f"{kind}_no_progress")
        state["job"] = None
        log(f"JOB_STALE_NO_PROGRESS type={kind} count={current}")
        return False
    return True

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
def runtime_selection_path():
    return ROOT / "runtime_benchmark" / "RUNTIME_SELECTION.json"

def start_runtime_benchmark(state):
    key = "runtime_benchmark"
    tries = state["retries"].get(key, 0)
    if tries >= 3:
        state["status"] = "STOPPED_RUNTIME_BENCHMARK_RETRY_LIMIT"
        log("STOP_RUNTIME_BENCHMARK_RETRY_LIMIT")
        return False
    cmd = [PYTHON, ROOT / "benchmark_runtime.py"]
    pid = start_detached(cmd, ROOT / "autorun_logs" / "runtime_benchmark.log")
    state["job"] = {"type": "runtime_benchmark", "pid": pid, "started_at": now()}
    state["retries"][key] = tries + 1
    log(f"JOB_START type=runtime_benchmark pid={pid} attempt={tries+1}")
    return True

def ensure_runtime_selection(state):
    sel_path = runtime_selection_path()
    if not sel_path.exists():
        start_runtime_benchmark(state)
        return False
    sel = json.loads(sel_path.read_text(encoding="utf-8"))
    selected = sel.get("selected_backend")
    if selected not in {"cpu", "vulkan"}:
        state["status"] = "STOPPED_RUNTIME_SELECTION_INVALID"
        log(f"STOP_RUNTIME_SELECTION_INVALID value={selected}")
        return False
    state["runtime_backend"] = selected
    state["runtime_gpu_layers"] = int(sel.get("gpu_layers", 0))
    state["runtime_device"] = sel.get("device", "none")
    p = smoke_file("BASE", "raw")
    if p.exists():
        rec = json.loads(p.read_text(encoding="utf-8"))
        actual = rec.get("runtime_backend", "cpu_preselection")
        if actual != selected:
            archive = ROOT / "template_smoke" / "backend_calibration"
            archive.mkdir(parents=True, exist_ok=True)
            target = archive / f"SMOKE-BASE-RAW-{actual}.json"
            if target.exists():
                target.unlink()
            p.replace(target)
            state["retries"].pop("smoke:BASE:raw", None)
            log(f"BASE_SMOKE_BACKEND_REDO from={actual} to={selected}")
            start_stage_job("BASE", "raw", "smoke", state)
            return False
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
    if not ensure_runtime_selection(state):
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
    gate = ROOT / "pilot_v01" / "analysis" / "PILOT_GATE.json"
    if not gate.exists():
        rc = subprocess.run([str(PYTHON), str(ROOT / "evaluate_pilot_gate.py")], cwd=ROOT).returncode
        log(f"PILOT_GATE_EVAL rc={rc}")
        if rc != 0:
            return False
    interpretation = ROOT / "pilot_v01" / "analysis" / "PILOT_INTERPRETATION.md"
    if not interpretation.exists():
        rc = subprocess.run([str(PYTHON), str(ROOT / "build_pilot_interpretation.py")], cwd=ROOT).returncode
        log(f"PILOT_INTERPRETATION rc={rc}")
        if rc != 0:
            return False
    g = json.loads(gate.read_text(encoding="utf-8"))
    decision = g.get("status")
    if decision == "GO":
        state["status"] = "PILOT_COMPLETE_GO"
        log("PILOT_COMPLETE_GO n=72")
    else:
        state["status"] = "PILOT_COMPLETE_NO_GO"
        log(f"PILOT_COMPLETE_NO_GO n=72 failed={[k for k,v in g.get('gates',{}).items() if not v]}")
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
