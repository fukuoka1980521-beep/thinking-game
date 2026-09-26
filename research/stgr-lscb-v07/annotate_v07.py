#!/usr/bin/env python3
import json, subprocess, time, urllib.request, urllib.error
from pathlib import Path

PROJECT="gas-test-runner-20260620-wjxf"
LOCATION="asia-southeast1"
MODEL="gemini-3.5-flash"
HERE=Path(__file__).resolve().parent
PACKETS=json.loads((HERE/"BLIND_PACKETS_V0_1.json").read_text(encoding="utf-8"))
OUT=HERE/"GEMINI_BLIND_ANNOTATION_V0_1.json"

def token():
    return subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()

def ask(packet):
    prompt=f"""You are an independent blind annotator for a research corpus.
Judge ONLY the information below. Do not infer a hidden future event.

GLOBAL GOAL:
{packet['global_goal']}

CURRENT LOCAL TASK:
{packet['local_task']}

HISTORY AVAILABLE NOW:
"""+"\n".join(f"- {x}" for x in packet["history"])+"""

Question: Is continuing or replanning the CURRENT LOCAL TASK still a defensible highest-value next move for the GLOBAL GOAL?

Return JSON only:
{"primary":"YES|NO|UNCERTAIN","confidence":1,"reason":"one concise sentence"}

YES = current local task remains a defensible highest-value next move.
NO = attention should shift to a higher-level bottleneck, architecture, measurement issue, or different task.
UNCERTAIN = available history does not support a stable distinction.
confidence must be 1..5."""
    body={
      "contents":[{"role":"user","parts":[{"text":prompt}]}],
      "generationConfig":{
        "temperature":0,
        "maxOutputTokens":2048,
        "responseMimeType":"application/json",
        "responseSchema":{
          "type":"object",
          "properties":{
            "primary":{"type":"string","enum":["YES","NO","UNCERTAIN"]},
            "confidence":{"type":"integer","minimum":1,"maximum":5},
            "reason":{"type":"string"}
          },
          "required":["primary","confidence","reason"]
        }
      }
    }
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={
      "Authorization":f"Bearer {token()}","Content-Type":"application/json"},method="POST")
    with urllib.request.urlopen(req,timeout=180) as resp:
        outer=json.loads(resp.read().decode())
    cand=outer["candidates"][0]
    txt="".join(p.get("text","") for p in cand["content"]["parts"])
    obj=json.loads(txt)
    return {"blind_id":packet["blind_id"],"primary":obj["primary"],"confidence":obj["confidence"],"reason":obj["reason"]}

rows=[]
for i,p in enumerate(PACKETS,1):
    rows.append(ask(p))
    print(f"annotated {i}/{len(PACKETS)}",flush=True)
OUT.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"WROTE {OUT}",flush=True)
