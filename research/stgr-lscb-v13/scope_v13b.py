#!/usr/bin/env python3
import json, subprocess, urllib.request
from pathlib import Path
PROJECT="gas-test-runner-20260620-wjxf"; LOCATION="asia-southeast1"; MODEL="gemini-3.5-flash"
HERE=Path(__file__).resolve().parent
PACKETS=json.loads((HERE/"BLIND_SHIFT_PACKETS_V1_3B.json").read_text())
OUT=HERE/"GEMINI_EVENT_SCOPE_V1_3B.json"
TOKEN=None
def tok():
    global TOKEN
    if TOKEN is None:
        TOKEN=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
    return TOKEN
def ask(p):
    event=p["cumulative_events"][-1]
    prompt=f"""Classify only the current event relative to the current local task.
GLOBAL GOAL: {p['global_goal']}
CURRENT LOCAL TASK: {p['current_local_task']}
CURRENT EVENT: {event}
Return JSON with scope=LOCAL_ACTION|EVIDENCE_EVENT|GLOBAL_REPLAN|TERMINAL_COMPLETE and a short reason."""
    body={"contents":[{"role":"user","parts":[{"text":prompt}]}],"generationConfig":{"temperature":0,"maxOutputTokens":1024,"responseMimeType":"application/json","responseSchema":{"type":"object","properties":{"scope":{"type":"string","enum":["LOCAL_ACTION","EVIDENCE_EVENT","GLOBAL_REPLAN","TERMINAL_COMPLETE"]},"reason":{"type":"string"}},"required":["scope","reason"]}}}
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {tok()}","Content-Type":"application/json"},method="POST")
    with urllib.request.urlopen(req,timeout=180) as resp: outer=json.loads(resp.read().decode())
    txt="".join(x.get("text","") for x in outer["candidates"][0]["content"]["parts"])
    return {"blind_id":p["blind_id"],**json.loads(txt)}
rows=[ask(p) for p in PACKETS]
OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print(json.dumps(rows,ensure_ascii=False))
