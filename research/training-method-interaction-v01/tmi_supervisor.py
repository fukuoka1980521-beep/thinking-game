from __future__ import annotations
import msvcrt, subprocess, sys, time
from datetime import datetime
from pathlib import Path

ROOT = Path(r"C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01")
WATCHDOG = ROOT / "tmi_watchdog.py"
PYTHON = Path(sys.executable).with_name("python.exe")
LOG = ROOT / "AUTORUN_SUPERVISOR.log"
LOCK = ROOT / ".tmi_supervisor.lock"

def now():
    return datetime.now().astimezone().isoformat(timespec="seconds")

def log(msg):
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{now()} {msg}\n")

def acquire():
    f = LOCK.open("a+b")
    if f.tell() == 0:
        f.write(b"0"); f.flush()
    f.seek(0)
    try:
        msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
    except OSError:
        f.close()
        return None
    return f

lock = acquire()
if lock is None:
    sys.exit(0)

log(f"SUPERVISOR_START pid={__import__('os').getpid()} python={PYTHON}")
while True:
    try:
        cp = subprocess.run(
            [str(PYTHON), str(WATCHDOG)],
            cwd=str(ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=600,
        )
        if cp.returncode != 0:
            log(f"WATCHDOG_EXIT rc={cp.returncode}")
    except subprocess.TimeoutExpired:
        log("WATCHDOG_TIMEOUT_600S")
    except Exception as e:
        log(f"SUPERVISOR_EXCEPTION {type(e).__name__} {e}")
    time.sleep(15)
