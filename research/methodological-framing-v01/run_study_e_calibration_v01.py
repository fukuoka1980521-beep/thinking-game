from __future__ import annotations
import json, os, re, time, urllib.request, urllib.error, hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as frozen

BASE=Path(__file__).resolve().parent
MANIFEST=BASE/"STUDY_E_CALIBRATION_V01_MANIFEST.jsonl"
UNIVERSE=BASE/"STUDY_E_EVIDENCE_UNIVERSE_V01.json"
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
ROOT=BASE/"study_e_calibration_v01"
RAW=ROOT/"raw"
API="https://api.openai.com/v1/responses"
PLANNER="gpt-5.6-sol"
EXECUTOR="gpt-6-luna"
MAX_WORKERS=6

def now(): return datetime.now(timezone.utc).isoformat()

def get_key():
    key=os.environ.get("OPENAI_API_KEY","").strip()
    if key: return key
    if os.name=="nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER,r"Environment") as h:
                return str(winreg.QueryValueEx(h,"OPENAI_API_KEY")[0]).strip()
        except Exception: pass
    return ""

def output_text(resp):
    out=[]
    for item in resp.get("output",[]):
        if item.get("type")!="message": continue
        for p in item.get("content",[]):
            if p.get("type")=="output_text": out.append(p.get("text",""))
    return "".join(out)

def sanitize_plan(text):
    t=text
    for phrase in sorted(frozen.MASK_PHRASES,key=len,reverse=True):
        pat=re.compile(r"(?<![A-Za-z])"+re.escape(phrase)+r"(?![A-Za-z])",re.I)
        t=pat.sub("[MASKED]",t)
    return t

def planner_prompt(question,instruction):
    return f"""RESEARCH OBJECTIVE:
Design a rigorous empirical investigation of this question:
{question}

METHODOLOGICAL FRAMING:
{instruction}

OUTPUT REQUIREMENTS:
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

def executor_schema():
    return {"type":"object","additionalProperties":False,
            "properties":{"selected":{"type":"array","minItems":4,"maxItems":4,"items":{"type":"string"}}},
            "required":["selected"]}

def executor_prompt(world,sanitized):
    mods={m["id"]:m for m in world["modules"]}
    lines=[
      "RESEARCH QUESTION:",world["question"],"",
      "A PRIOR PLANNER PRODUCED THE FOLLOWING SANITIZED RESEARCH PLAN:",
      sanitized,"",
      "AVAILABLE EVIDENCE MODULES:"
    ]
    for mid in world["catalog_order"]:
        lines.append(f"- {mid}: {mods[mid]['descriptor']}")
    lines += ["",
      "You are a neutral execution agent. You do not know how the plan was originally framed.",
      "Choose exactly 4 distinct evidence modules to open first, in priority order, to execute the plan.",
      "Return only the required structured JSON.",
      "Do not use external tools."
    ]
    return "\n".join(lines)

def call(key,model,prompt,max_tokens,text_format=None):
    body={"model":model,"input":[{"role":"user","content":[{"type":"input_text","text":prompt}]}],
          "store":False,"max_output_tokens":max_tokens,"temperature":1.0,"top_p":1.0,"reasoning":{"effort":"none"}}
    if text_format is not None:
        body["text"]={"format":{"type":"json_schema","name":"study_e_executor","strict":True,"schema":text_format}}
    data=json.dumps(body,ensure_ascii=False).encode("utf-8")
    last=None
    for attempt in range(1,6):
        try:
            req=urllib.request.Request(API,data=data,headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},method="POST")
            with urllib.request.urlopen(req,timeout=240) as h:
                resp=json.loads(h.read().decode("utf-8"))
            if resp.get("status")=="completed" and resp.get("incomplete_details") is None and resp.get("model")==model:
                return body,resp,output_text(resp),attempt
            last=f"bad status/model {resp.get('status')} {resp.get('model')}"
        except urllib.error.HTTPError as e:
            txt=e.read().decode("utf-8",errors="replace")
            if "credit_balance_exhausted" in txt or "insufficient_quota" in txt:
                raise RuntimeError("API_CREDIT_BALANCE_EXHAUSTED")
            last=repr(e)
        except Exception as e:
            last=repr(e)
        time.sleep(min(2**attempt,20))
    raise RuntimeError(last or "request failed")

def main():
    key=get_key()
    if not key: raise SystemExit("OPENAI_API_KEY missing")
    manifest=[json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    if len(manifest)!=42 or len({x["group_id"] for x in manifest})!=42: raise SystemExit("manifest invalid")
    worlds={w["id"]:w for w in json.loads(UNIVERSE.read_text(encoding="utf-8"))["worlds"]}
    methods={x["id"]:x for x in json.loads(METHODS.read_text(encoding="utf-8"))["conditions"]}
    RAW.mkdir(parents=True,exist_ok=True)
    pending=[r for r in manifest if not (RAW/f"{r['group_id']}.json").exists()]
    print(f"STUDY_E_CALIBRATION_START done={42-len(pending)} pending={len(pending)}",flush=True)

    def one(row):
        dest=RAW/f"{row['group_id']}.json"
        if dest.exists(): return row["group_id"],"SKIP"
        world=worlds[row["world_id"]]
        pp=planner_prompt(world["question"],methods[row["condition_id"]]["instruction"])
        pb,pr,plan,patt=call(key,PLANNER,pp,2200,None)
        sanitized=sanitize_plan(plan)
        ep=executor_prompt(world,sanitized)
        valid={m["id"] for m in world["modules"]}
        for outer in range(1,4):
            eb,er,etxt,eatt=call(key,EXECUTOR,ep,500,executor_schema())
            state=json.loads(etxt)
            sel=state["selected"]
            if len(sel)==4 and len(set(sel))==4 and all(x in valid for x in sel):
                break
            if outer==3: raise RuntimeError("executor path invalid")
        rec={**row,"timestamp_utc":now(),
             "planner":{"requested_model":PLANNER,"returned_model":pr.get("model"),"response_id":pr.get("id"),"status":pr.get("status"),"incomplete_details":pr.get("incomplete_details"),"usage":pr.get("usage"),"attempt_count":patt,"prompt_sha256":hashlib.sha256(pp.encode()).hexdigest(),"raw_text":plan},
             "sanitized_plan":sanitized,
             "executor":{"requested_model":EXECUTOR,"returned_model":er.get("model"),"response_id":er.get("id"),"status":er.get("status"),"incomplete_details":er.get("incomplete_details"),"usage":er.get("usage"),"attempt_count":eatt,"prompt_sha256":hashlib.sha256(ep.encode()).hexdigest(),"selected":sel}}
        tmp=dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        if dest.exists():
            tmp.unlink(missing_ok=True); return row["group_id"],"SKIP_RACE"
        tmp.replace(dest)
        return row["group_id"],"OK"

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs=[ex.submit(one,r) for r in pending]
        for fut in as_completed(futs):
            gid,status=fut.result()
            print(f"STUDY_E {len(list(RAW.glob('*.json')))}/42 {gid} {status}",flush=True)
    n=len(list(RAW.glob("*.json")))
    if n!=42: raise SystemExit(f"incomplete {n}/42")
    print("STUDY_E_CALIBRATION_COLLECTION_COMPLETE=42/42")

if __name__=="__main__":
    main()
