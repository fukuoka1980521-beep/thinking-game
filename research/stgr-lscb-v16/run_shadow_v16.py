#!/usr/bin/env python3
import json, subprocess, urllib.request
from pathlib import Path
PROJECT="gas-test-runner-20260620-wjxf"
LOCATION="asia-southeast1"
MODEL="gemini-3.5-flash"
HERE=Path(__file__).resolve().parent
PACKETS=json.loads((HERE/"SHADOW_PACKETS_V1_6.json").read_text(encoding="utf-8"))
OUT=HERE/"GEMINI_SHADOW_RESULTS_V1_6.json"
_TOKEN=None
def token():
    global _TOKEN
    if _TOKEN is None:
        _TOKEN=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
    return _TOKEN
def ask(p):
    hist="\n".join(
        f"{e['action_index']}. type={e['action_type']} result={e['action_result']} evidence={e['evidence_delta']} local_success={e['local_success']} summary={e['event_summary']}"
        for e in p["cumulative_events"]
    )
    prompt=f"""You are a baseline development/research agent.
No special gate or trigger rule is provided.

GLOBAL GOAL ID:
{p['global_goal_id']}

CURRENT LOCAL TASK ID:
{p['local_task_id']}

OBSERVABLE HISTORY:
{hist}

Question:
{p['question']}

Return JSON only:
- next_operation: OBSERVE_OR_TEST | MUTATE_LOCAL | WAIT | SWITCH_TASK_OR_LAYER | STOP_LOCAL
- task_scope: SAME_LOCAL_TASK | DIFFERENT_TASK_OR_LAYER | STOPPED
- rationale: one concise sentence

MUTATE_LOCAL means immediately PATCH/RETRY/RUN/DEPLOY the same local task.
OBSERVE_OR_TEST means gather evidence/read/test without mutating the target.
WAIT means do not mutate now because progress depends on external timing/availability.
SWITCH_TASK_OR_LAYER means move to another task/layer/bottleneck.
STOP_LOCAL means end the current local task.
"""
    body={"contents":[{"role":"user","parts":[{"text":prompt}]}],"generationConfig":{"temperature":0,"maxOutputTokens":2048,"responseMimeType":"application/json","responseSchema":{"type":"object","properties":{"next_operation":{"type":"string","enum":["OBSERVE_OR_TEST","MUTATE_LOCAL","WAIT","SWITCH_TASK_OR_LAYER","STOP_LOCAL"]},"task_scope":{"type":"string","enum":["SAME_LOCAL_TASK","DIFFERENT_TASK_OR_LAYER","STOPPED"]},"rationale":{"type":"string"}},"required":["next_operation","task_scope","rationale"]}}}
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {token()}","Content-Type":"application/json"},method="POST")
    with urllib.request.urlopen(req,timeout=180) as resp:
        outer=json.loads(resp.read().decode())
    txt="".join(x.get("text","") for x in outer["candidates"][0]["content"]["parts"])
    return {"shadow_id":p["shadow_id"],**json.loads(txt),"usage":outer.get("usageMetadata",{})}
rows=[ask(p) for p in PACKETS]
OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(rows,ensure_ascii=False))
