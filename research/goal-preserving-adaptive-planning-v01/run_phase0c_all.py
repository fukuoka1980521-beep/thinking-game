from __future__ import annotations
import json, hashlib, os, re, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "phase0b" / "PHASE0B_MANIFEST_V1_0.jsonl"
OUT = ROOT / "phase0c"
RAW = OUT / "raw"
AN = OUT / "analysis"
MANIFEST = OUT / "PHASE0C_MANIFEST_V1_0.jsonl"
FREEZE = OUT / "PHASE0C_FREEZE_V1_0.json"

KEEP = {"CTRL", "GOAL_EVENT", "COMPACT_STATE_EVENT"}
MODEL = Path(r"C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf")
SERVER = Path(r"C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe")
PORT = 18085

def sha256_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def build_manifest():
    OUT.mkdir(parents=True, exist_ok=True)
    source = [json.loads(x) for x in SRC.read_text(encoding="utf-8").splitlines() if x.strip()]
    rows = []
    for r in source:
        if r["condition_id"] not in KEEP:
            continue
        x = dict(r)
        x["run_id"] = r["run_id"].replace("GPAP0B-", "GPAP0C-")
        msgs = [dict(m) for m in r["messages"]]
        final = msgs[-1]
        final["content"] = re.sub(r"\n\nOptions:.*$", "", final["content"], flags=re.S)
        final["content"] += (
            "\n\nWhat should you do next?"
            "\nReturn exactly:"
            "\nNEXT_ACTION: <one concrete next action>"
            "\nRATIONALE: <one concise sentence>"
        )
        x["messages"] = msgs
        x.pop("correct_letter", None)
        x.pop("letter_to_class", None)
        x["status"] = "NOT_RUN"
        x["sampling"] = dict(x["sampling"])
        x["sampling"]["max_tokens"] = 120
        x["sampling"]["seed"] = int(sha256_text(x["run_id"])[16:24], 16) & 0x7fffffff
        rows.append(x)
    assert len(rows) == 12
    text = "\n".join(json.dumps(r, ensure_ascii=False, sort_keys=True) for r in rows) + "\n"
    MANIFEST.write_text(text, encoding="utf-8")
    freeze = {
        "status": "FROZEN_BEFORE_OUTPUTS",
        "n": 12,
        "manifest_sha256": sha256_text(text),
        "source_manifest": "phase0b/PHASE0B_MANIFEST_V1_0.jsonl",
        "conditions": ["CTRL", "GOAL_EVENT", "COMPACT_STATE_EVENT"],
        "primary": "open next-action correctness",
        "paid_api_allowed": False,
        "paid_compute_allowed": False,
    }
    FREEZE.write_text(json.dumps(freeze, indent=2), encoding="utf-8")
    print("PHASE0C_FREEZE", freeze["manifest_sha256"])
    return rows

def http(port, path, payload=None, timeout=600):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        f"http://127.0.0.1:{port}{path}",
        data=data,
        headers={"Content-Type": "application/json"} if data else {},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

def cleanup():
    ps = r"""Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'llama*.exe' -and $_.CommandLine -like '*OLMo-2-1124-7B-Instruct.Q4_K_M.gguf*' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F | Out-Null }"""
    subprocess.run(
        ["powershell", "-NoProfile", "-Command", ps],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=30,
    )
    time.sleep(2)

def start_server():
    cleanup()
    logf = (OUT / "server.log").open("a", encoding="utf-8")
    proc = subprocess.Popen(
        [
            str(SERVER), "-m", str(MODEL),
            "--host", "127.0.0.1", "--port", str(PORT),
            "-c", "8192", "-t", "10", "-ngl", "0", "-np", "1",
            "--alias", "gpap0c", "--no-ui", "--no-cache-prompt", "--log-disable",
        ],
        stdout=logf,
        stderr=subprocess.STDOUT,
        text=True,
    )
    for _ in range(240):
        if proc.poll() is not None:
            logf.close()
            raise RuntimeError("server exited during load")
        try:
            if http(PORT, "/health", timeout=2).get("status") == "ok":
                return proc, logf
        except Exception:
            pass
        time.sleep(1)
    proc.kill()
    logf.close()
    raise TimeoutError("server health timeout")

def stop_server(proc, logf):
    try:
        proc.terminate()
        proc.wait(timeout=10)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass
    logf.close()

def tokenize(text):
    if not text:
        return 0
    try:
        return len(http(PORT, "/tokenize", {"content": text}, timeout=10).get("tokens", []))
    except Exception:
        return max(1, len(text.split()))

def run_collection(rows):
    RAW.mkdir(parents=True, exist_ok=True)
    proc, logf = start_server()
    try:
        for i, row in enumerate(rows, 1):
            p = RAW / (row["run_id"] + ".json")
            if p.exists():
                print(i, row["run_id"], "SKIP", flush=True)
                continue
            payload = {
                "model": "gpap0c",
                "messages": row["messages"],
                "temperature": 0.0,
                "top_p": 1.0,
                "max_tokens": row["sampling"]["max_tokens"],
                "seed": row["sampling"]["seed"],
                "stream": False,
            }
            resp = None
            elapsed = None
            for attempt in range(2):
                try:
                    t0 = time.time()
                    resp = http(PORT, "/v1/chat/completions", payload, timeout=600)
                    elapsed = time.time() - t0
                    break
                except Exception:
                    stop_server(proc, logf)
                    if attempt == 1:
                        raise
                    proc, logf = start_server()
            txt = str(resp["choices"][0]["message"]["content"])
            out = dict(row)
            out.update(
                {
                    "status": "COMPLETE",
                    "raw_text": txt,
                    "elapsed_seconds": elapsed,
                    "injected_tokens": tokenize(row.get("injected_text", "")),
                    "usage": resp.get("usage"),
                }
            )
            tmp = p.with_suffix(".tmp")
            tmp.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
            os.replace(tmp, p)
            print(i, row["run_id"], flush=True)
    finally:
        stop_server(proc, logf)

RULES = {
    "H1_COST_ROUTE": {
        "required_groups": [["local", "csv", "export"], ["report", "reconcil", "variance"]],
        "wrong_phrases": ["retry the connector", "repair the connector", "connector diagnostics", "restore paid"],
    },
    "H2_MIGRATION_TOOL": {
        "required_groups": [["script"], ["import", "migrat"], ["integrity", "verify", "check"]],
        "wrong_phrases": ["repair the original", "fix the original utility", "refactor the migration utility"],
    },
    "H3_PATCH_LOOP": {
        "required_groups": [["confirm"], ["committed", "record", "result"], ["test", "verify", "check"]],
        "wrong_phrases": ["continue preview", "rebuild the preview", "css cleanup", "eliminate the one-pixel", "eliminate the one pixel"],
    },
    "H4_AUTH_CHANGE": {
        "required_groups": [["region a", "one-region", "pilot"], ["disable", "hold", "do not launch", "remain disabled", "only"]],
        "wrong_phrases": ["three-region", "all three", "finish b and c", "launch b", "launch c"],
    },
}

def extract_action(text):
    m = re.search(r"^NEXT_ACTION:\s*(.+)$", text, re.I | re.M)
    return m.group(1).strip() if m else ""

def score_action(sid, action):
    low = action.lower()
    rule = RULES[sid]
    if any(x in low for x in rule["wrong_phrases"]):
        return "WRONG"
    if all(any(k in low for k in grp) for grp in rule["required_groups"]):
        return "CORRECT"
    return "REVIEW"

def analyze():
    AN.mkdir(parents=True, exist_ok=True)
    files = sorted(RAW.glob("*.json"))
    if len(files) != 12:
        raise SystemExit(f"phase0c incomplete {len(files)}/12")
    rows = []
    for p in files:
        r = json.loads(p.read_text(encoding="utf-8"))
        action = extract_action(r.get("raw_text", ""))
        rows.append(
            {
                "run_id": r["run_id"],
                "scenario_id": r["scenario_id"],
                "condition_id": r["condition_id"],
                "action": action,
                "score": score_action(r["scenario_id"], action),
                "injected_tokens": r.get("injected_tokens", 0),
                "raw_text": r.get("raw_text", ""),
            }
        )
    summary = {}
    for c in ["CTRL", "GOAL_EVENT", "COMPACT_STATE_EVENT"]:
        z = [x for x in rows if x["condition_id"] == c]
        summary[c] = {
            "correct": sum(x["score"] == "CORRECT" for x in z),
            "wrong": sum(x["score"] == "WRONG" for x in z),
            "review": sum(x["score"] == "REVIEW" for x in z),
            "tokens": sum(x["injected_tokens"] for x in z),
        }
    h4_goal = next(x for x in rows if x["scenario_id"] == "H4_AUTH_CHANGE" and x["condition_id"] == "GOAL_EVENT")
    decision = (
        "GOAL_EVENT_PROMISING"
        if summary["GOAL_EVENT"]["correct"] > summary["CTRL"]["correct"]
        and summary["GOAL_EVENT"]["wrong"] <= summary["CTRL"]["wrong"]
        and h4_goal["score"] == "CORRECT"
        and summary["GOAL_EVENT"]["tokens"] < summary["COMPACT_STATE_EVENT"]["tokens"]
        else "NO_GO_OR_REVISE"
    )
    res = {
        "status": "PHASE0C_OPEN_ACTION_CALIBRATION",
        "decision": decision,
        "summary": summary,
        "rows": rows,
    }
    (AN / "PHASE0C_ANALYSIS.json").write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")
    lines = [
        "# Phase 0c Open-Action Analysis",
        "",
        f"**Decision: {decision}**",
        "",
        "| condition | correct | wrong | review | injected tokens |",
        "|---|---:|---:|---:|---:|",
    ]
    for c, x in summary.items():
        lines.append(f"| {c} | {x['correct']} | {x['wrong']} | {x['review']} | {x['tokens']} |")
    lines += ["", "REVIEW outputs require inspection; they are not silently counted as correct."]
    (AN / "PHASE0C_ANALYSIS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("PHASE0C_ANALYSIS", decision)
    print(json.dumps(summary, indent=2))

def main():
    rows = build_manifest()
    if "--build-only" in sys.argv:
        return
    run_collection(rows)
    analyze()

if __name__ == "__main__":
    main()
