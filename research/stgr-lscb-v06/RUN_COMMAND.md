# STGR / LSCB v0.6 — Cloud Shell command

Run once in authenticated Google Cloud Shell:

```bash
set -e; rm -rf ~/stgr-v06-run; git clone --depth 1 --branch research/stgr-lscb-v06 https://github.com/fukuoka1980521-beep/thinking-game.git ~/stgr-v06-run; cd ~/stgr-v06-run; nohup python3 research/stgr-lscb-v06/run_v06.py > ~/stgr-v06.log 2>&1 < /dev/null & PY_PID=$!; echo "STGR v0.6 PYTHON_PID=$PY_PID"; sleep 3; echo "=== PROCESS ==="; pgrep -af '[p]ython3 research/stgr-lscb-v06/run_v06.py' || true; echo "=== LOG ==="; tail -n 30 ~/stgr-v06.log 2>/dev/null || true
```

Expected:
```text
[STGR v0.6] START — calibration-gated SUCCESS_PROGRESS pilot
[STGR v0.6] calibration=...
```

Important: clone and cd run in the foreground. Only the Python runner is backgrounded.

The run automatically uploads `STGR_LSCB_RESULTS_V0_6.zip` to the research Drive folder whether calibration stops or main completes.
