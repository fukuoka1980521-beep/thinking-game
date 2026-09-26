#!/usr/bin/env python3
import json, subprocess, urllib.request
from pathlib import Path
PROJECT="gas-test-runner-20260620-wjxf"; LOCATION="asia-southeast1"; MODEL="gemini-3.5-flash"
HERE=Path(__file__).resolve().parent
PACKETS=json.loads((HERE/"BLIND_SHIFT_PACKETS_V1_3B.json").read_text())
OUT=HERE/"GEMINI_BLIND_SHIFT_ANNOTATION_V1_3B.json"
TOKEN=None
def tok():
    global TOKEN
    if TOKEN is None:
        TOKEN=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
    return TOKEN
def ask(p):
    ev="\n".join(f"{i+1}. {x}" for i,x in enumerate(p["cumulative_events"]))
    prompt=f"""Judge this workflow state only.
GLOBAL GOAL: {p['global_goal']}
CURRENT LOCAL TASK: {p['current_local_task']}
CUMULATIVE EVENTS:
{ev}
Is staying on the SAME CURRENT LOCAL TASK still a defensible highest-value next move?
Return JSON only with shift_status=STAY|SHIFT|UNCERTAIN, confidence=1..5, and one-sentence reason.
STAY=same local task remains defensible. SHIFT=move to another task/layer/architecture/evidence objective, or task is complete."""
    body={"contents":[{"role":"user","parts":[{"text":prompt}]}],"generationConfig":{"temperature":0,"maxOutputTokens":2048,"responseMimeType":"application/json","responseSchema":{"type":"object","properties":{"shift_status":{"type":"string","enum":["STAY","SHIFT","UNCERTAIN"]},"confidence":{"type":"integer","minimum":1,"maximum":5},"reason":{"type":"string"}},"required":["shift_status","confidence","reason"]}}}
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {tok()}","Content-Type":"application/json"},method="POST")
    with urllib.request.urlopen(req,timeout=180) as resp: outer=json.loads(resp.read().decode())
    txt="".join(x.get("text","") for x in outer["candidates"][0]["content"]["parts"])
    return {"blind_id":p["blind_id"],**json.loads(txt)}
rows=[ask(p) for p in PACKETS]
OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print(json.dumps(rows,ensure_ascii=False))
