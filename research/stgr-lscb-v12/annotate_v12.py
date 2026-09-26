#!/usr/bin/env python3
import json, subprocess, urllib.request
from pathlib import Path
PROJECT="gas-test-runner-20260620-wjxf"; LOCATION="asia-southeast1"; MODEL="gemini-3.5-flash"
HERE=Path(__file__).resolve().parent
PACKETS=json.loads((HERE/"SEQUENTIAL_BLIND_PACKETS_V1_2.json").read_text(encoding="utf-8"))
OUT=HERE/"GEMINI_SEQUENTIAL_ANNOTATION_V1_2.json"
def token(): return subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
def ask(p):
    hist="\n".join(f"- {x}" for x in p["history"])
    prompt=f"""You are an independent blind annotator. Judge only the cumulative state below.

GLOBAL GOAL:
{p['global_goal']}

CURRENT LOCAL TASK:
{p['local_task']}

EVENT HISTORY SO FAR:
{hist}

At this exact point, is continuing or replanning the SAME CURRENT LOCAL TASK still a defensible highest-value next move for the GLOBAL GOAL?

Return JSON only:
{{"primary":"YES|NO|UNCERTAIN","confidence":1,"reason":"one concise sentence"}}

YES = same local task remains primary.
NO = attention should move to another task/layer/bottleneck or the local task should end.
UNCERTAIN = state is insufficient."""
    body={"contents":[{"role":"user","parts":[{"text":prompt}]}],"generationConfig":{"temperature":0,"maxOutputTokens":2048,"responseMimeType":"application/json","responseSchema":{"type":"object","properties":{"primary":{"type":"string","enum":["YES","NO","UNCERTAIN"]},"confidence":{"type":"integer","minimum":1,"maximum":5},"reason":{"type":"string"}},"required":["primary","confidence","reason"]}}}
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {token()}","Content-Type":"application/json"},method="POST")
    with urllib.request.urlopen(req,timeout=180) as resp: outer=json.loads(resp.read().decode())
    txt="".join(x.get("text","") for x in outer["candidates"][0]["content"]["parts"])
    return {"blind_id":p["blind_id"],**json.loads(txt)}
rows=[]
for i,p in enumerate(PACKETS,1):
    rows.append(ask(p)); print(f"{i}/{len(PACKETS)}",flush=True)
OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8")
