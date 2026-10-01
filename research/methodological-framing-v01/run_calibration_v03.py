from __future__ import annotations
import hashlib, json, os, random, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
BANK = BASE / "CALIBRATION_V03_BANK.json"
ROOT = BASE / "calibration_v03"
RAW = ROOT / "raw"
MANIFEST = ROOT / "CALIBRATION_MANIFEST.json"
API = "https://api.openai.com/v1/responses"

def now():
    return datetime.now(timezone.utc).isoformat()

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

def call(key, model, reasoning_effort, max_output_tokens, prompt):
    body = {
        "model": model,
        "input": [{"role": "user", "content": [{"type": "input_text", "text": prompt}]}],
        "store": False,
        "max_output_tokens": max_output_tokens,
        "temperature": 1.0,
        "top_p": 1.0,
        "reasoning": {"effort": reasoning_effort},
    }
    data = json.dumps(body, ensure_ascii=False).encode("utf-8")
    last = None
    for attempt in range(1, 6):
        try:
            req = urllib.request.Request(
                API, data=data,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=240) as h:
                return body, json.loads(h.read().decode("utf-8"))
        except Exception as e:
            last = repr(e)
            time.sleep(min(2 ** attempt, 20))
    raise RuntimeError(last or "request failed")

def main():
    key = get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")

    bank = json.loads(BANK.read_text(encoding="utf-8"))
    tasks = {x["id"]: x for x in bank["tasks"]}
    conditions = {x["id"]: x for x in bank["conditions"]}

    manifest = []
    for task_id in tasks:
        for condition in conditions:
            for rep in range(1, int(bank["replicates"]) + 1):
                manifest.append({
                    "run_id": f"C03-{task_id}-{condition}-R{rep:02d}",
                    "task_id": task_id,
                    "condition": condition,
                    "instruction_depth": "LABEL_ONLY",
                    "replicate": rep,
                })

    rnd = random.Random(int(bank["execution_seed_for_manifest_order"]))
    rnd.shuffle(manifest)
    ROOT.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    done = 0
    for row in manifest:
        dest = RAW / f"{row['run_id']}.json"
        if dest.exists():
            done += 1
            continue
        prompt = prompt_for(tasks[row["task_id"]]["objective"], conditions[row["condition"]]["instruction"])
        body, resp = call(
            key,
            bank["acting_model"],
            bank["reasoning_effort"],
            int(bank["max_output_tokens"]),
            prompt,
        )
        text = output_text(resp)
        if not text.strip():
            raise RuntimeError("empty response: " + row["run_id"])
        rec = {
            **row,
            "calibration_only": True,
            "timestamp_utc": now(),
            "requested_model": bank["acting_model"],
            "returned_model": resp.get("model"),
            "store": False,
            "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "raw_text": text,
            "response_id": resp.get("id"),
            "usage": resp.get("usage"),
            "raw_response": resp,
        }
        tmp = dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(dest)
        done += 1
        print(f"CALIBRATION_V03 {done}/42 {row['run_id']}", flush=True)

    print("CALIBRATION_V03_COLLECTION_COMPLETE=42/42")

if __name__ == "__main__":
    main()
