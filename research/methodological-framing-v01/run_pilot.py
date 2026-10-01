from __future__ import annotations
import json, os, time, urllib.request, urllib.error, hashlib
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
BANK=BASE/"METHOD_BANK_DRAFT.json"
OUT=BASE/"pilot"/"raw"
API="https://api.openai.com/v1/responses"
MODEL="gpt-5.6-sol"

def now(): return datetime.now(timezone.utc).isoformat()

def text_from(resp):
    out=[]
    for item in resp.get("output",[]):
        if item.get("type")=="message":
            for p in item.get("content",[]):
                if p.get("type")=="output_text": out.append(p.get("text",""))
    return "".join(out)

def call(key,prompt):
    body={
        "model":MODEL,
        "input":[{"role":"user","content":[{"type":"input_text","text":prompt}]}],
        "store":False,
        "max_output_tokens":2200,
        "temperature":1.0,
        "top_p":1.0,
        "reasoning":{"effort":"none"}
    }
    data=json.dumps(body,ensure_ascii=False).encode("utf-8")
    req=urllib.request.Request(API,data=data,headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},method="POST")
    last=None
    for a in range(1,6):
        try:
            with urllib.request.urlopen(req,timeout=180) as h:
                return body,json.loads(h.read().decode("utf-8"))
        except Exception as e:
            last=repr(e); time.sleep(min(2**a,20))
    raise RuntimeError(last)

def prompt_for(obj,cond):
    return f"""RESEARCH OBJECTIVE (identical across all conditions):
{obj}

METHODOLOGICAL FRAMING:
{cond['instruction']}

OUTPUT REQUIREMENTS (identical across all conditions):
Produce a research plan only, with these neutral headings:
1. Objective and scope
2. Assumptions
3. Research design
4. Data or evidence needed
5. Measurement
6. Analysis
7. Decision / stopping rule
8. Limitations

Within those headings, include whatever elements you judge scientifically necessary. Do not mention that you are in an experiment comparing methodologies. Do not use external tools."""

def main():
    key=os.environ.get("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")
    bank=json.loads(BANK.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True,exist_ok=True)
    manifest=[]
    for cond in bank["conditions"]:
        for rep in range(1,4):
            run_id=f"P-{cond['id']}-R{rep:02d}"
            manifest.append({"run_id":run_id,"condition":cond["id"],"replicate":rep})
    (BASE/"pilot"/"PILOT_MANIFEST.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8")

    done=0
    for row in manifest:
        path=OUT/f"{row['run_id']}.json"
        if path.exists():
            done+=1
            continue
        cond=next(x for x in bank["conditions"] if x["id"]==row["condition"])
        prompt=prompt_for(bank["objective_constant"],cond)
        body,resp=call(key,prompt)
        text=text_from(resp)
        if not text.strip():
            raise RuntimeError(f"empty output {row['run_id']}")
        rec={
            **row,
            "pilot_only":True,
            "timestamp_utc":now(),
            "requested_model":MODEL,
            "returned_model":resp.get("model"),
            "store":False,
            "prompt_sha256":hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "raw_text":text,
            "response_id":resp.get("id"),
            "usage":resp.get("usage"),
            "raw_response":resp
        }
        path.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        done+=1
        print(f"PILOT {done}/21 {row['run_id']} model={resp.get('model')}",flush=True)
    print("PILOT_COMPLETE=21/21")

if __name__=="__main__":
    main()
