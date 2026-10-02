from __future__ import annotations
import hashlib, json, os, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
UNIVERSE=BASE/"FROZEN_STUDY_C_EVIDENCE_UNIVERSE_V1_0.json"
MANIFEST=BASE/"FROZEN_STUDY_C_MANIFEST_V1_0.jsonl"
FREEZE=BASE/"STUDY_C_FREEZE_V1_0.json"
ROOT=BASE/"study_c"
RAW=ROOT/"raw"
API="https://api.openai.com/v1/responses"
MODEL="gpt-5.6-sol"
WORKERS=4
MAX_OPEN=2
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]

def now(): return datetime.now(timezone.utc).isoformat()
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def verify_freeze():
    f=json.loads(FREEZE.read_text(encoding="utf-8"))
    checks={
      "prereg_sha256":BASE/"STUDY_C_PREREGISTRATION_V1_0.md",
      "universe_sha256":UNIVERSE,
      "method_bank_sha256":METHODS,
      "manifest_sha256":MANIFEST,
      "runner_sha256":Path(__file__),
      "analyzer_sha256":BASE/"analyze_study_c.py"
    }
    for k,p in checks.items():
        if sha(p)!=f[k]: raise SystemExit(f"freeze hash mismatch {p.name}")
    if f["counted_runs_at_freeze"]!=0: raise SystemExit("counted_runs_at_freeze mismatch")
    return f

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
        for part in item.get("content",[]):
            if part.get("type")=="output_text": out.append(part.get("text",""))
    return "".join(out)

def schema(unopened):
    return {
      "type":"object",
      "properties":{"action":{"type":"string","enum":["OPEN"]},"module_id":{"type":"string","enum":list(unopened)}},
      "required":["action","module_id"],
      "additionalProperties":False
    }

def api_call(key,body,unopened,context):
    raw=json.dumps(body,ensure_ascii=False).encode("utf-8")
    last=None
    for attempt in range(1,6):
        try:
            req=urllib.request.Request(API,data=raw,headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},method="POST")
            with urllib.request.urlopen(req,timeout=180) as h:
                resp=json.loads(h.read().decode("utf-8"))
            if resp.get("status")!="completed" or resp.get("incomplete_details") is not None:
                last=f"incomplete {resp.get('status')}"
            elif resp.get("model")!=MODEL:
                last=f"model mismatch {resp.get('model')}"
            else:
                x=json.loads(output_text(resp))
                if x.get("action")!="OPEN" or x.get("module_id") not in unopened:
                    raise ValueError("invalid choice")
                return resp,x,attempt
        except urllib.error.HTTPError as e:
            txt=e.read().decode("utf-8",errors="replace")
            if "credit_balance_exhausted" in txt or "insufficient_quota" in txt:
                raise RuntimeError("API_CREDIT_BALANCE_EXHAUSTED")
            last=f"HTTP {e.code}: {txt[:800]}"
        except Exception as e:
            last=repr(e)
        time.sleep(min(2**attempt,20))
    raise RuntimeError(f"{context}: {last}")

def choice_prompt(world,instruction,catalog_order,opened):
    cat_by_id={x["module_id"]:x for x in world["catalog"]}
    catalog="\n".join(f"- {mid}: {cat_by_id[mid]['descriptor']}" for mid in catalog_order if mid not in opened)
    opened_text="\n\n".join(f"OPENED {i+1} — {mid}\n{world['modules'][mid]}" for i,mid in enumerate(opened)) or "(none)"
    return f"""RESEARCH QUESTION:
{world['research_question']}

METHODOLOGICAL FRAMING:
{instruction}

AVAILABLE RESEARCH OPERATIONS:
{catalog}

EVIDENCE ALREADY OPENED:
{opened_text}

RESOURCE RULE:
- You must choose exactly one unopened operation now.
- Across this trajectory you will open exactly {MAX_OPEN} operations.
- You cannot reopen an operation.
- Do not explain your reasoning.

Return only the structured action.
"""

def run_one(key,row,world,instruction):
    opened=[]; turns=[]; api_ids=[]; raw_responses=[]
    role_by_id={x["module_id"]:x["role"] for x in world["catalog"]}
    for step in range(1,MAX_OPEN+1):
        unopened=[mid for mid in row["catalog_order"] if mid not in opened]
        pr=choice_prompt(world,instruction,row["catalog_order"],opened)
        body={
          "model":MODEL,
          "input":[{"role":"user","content":[{"type":"input_text","text":pr}]}],
          "store":False,"max_output_tokens":200,
          "temperature":1.0,"top_p":1.0,"reasoning":{"effort":"none"},
          "text":{"format":{"type":"json_schema","name":"study_c_v02_choice","strict":True,"schema":schema(unopened)}}
        }
        resp,choice,attempt=api_call(key,body,unopened,f"{row['run_id']} step {step}")
        mid=choice["module_id"]; opened.append(mid)
        rid=resp.get("id"); api_ids.append(rid); raw_responses.append(resp)
        turns.append({"step":step,"opened_before":opened[:-1],"choice":choice,"response_id":rid,"attempt_count":attempt,"prompt_sha256":hashlib.sha256(pr.encode()).hexdigest()})
    return {
      **row,"counted":True,"study":"C","timestamp_utc":now(),
      "requested_model":MODEL,"returned_models":sorted(set(r.get("model") for r in raw_responses)),
      "path_module_ids":opened,"path_roles":[role_by_id[x] for x in opened],"opened_count":len(opened),
      "turns":turns,"all_response_ids":api_ids,"raw_responses":raw_responses
    }

def main():
    verify_freeze()
    key=get_key()
    if not key: raise SystemExit("OPENAI_API_KEY missing")
    methods=json.loads(METHODS.read_text(encoding="utf-8"))
    instructions={x["family"]:x["instruction"] for x in methods["conditions"] if x["depth"]=="LABEL_ONLY"}
    if set(instructions)!=set(FAMILIES): raise SystemExit("method bank mismatch")
    u=json.loads(UNIVERSE.read_text(encoding="utf-8"))
    worlds={x["id"]:x for x in u["worlds"]}
    rows=[json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    if len(rows)!=252 or len({x["run_id"] for x in rows})!=252: raise SystemExit("manifest invalid")

    RAW.mkdir(parents=True,exist_ok=True)
    pending=[r for r in rows if not (RAW/f"{r['run_id']}.json").exists()]
    print(f"STUDY_C_START done={252-len(pending)} pending={len(pending)} workers={WORKERS}",flush=True)

    def one(row):
        dest=RAW/f"{row['run_id']}.json"
        if dest.exists(): return row["run_id"],"SKIP"
        rec=run_one(key,row,worlds[row["world_id"]],instructions[row["method_family"]])
        tmp=dest.with_suffix(".tmp"); tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        if dest.exists(): tmp.unlink(missing_ok=True); return row["run_id"],"SKIP_RACE"
        tmp.replace(dest); return row["run_id"],"OK"

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs=[ex.submit(one,r) for r in pending]
        for fut in as_completed(futs):
            rid,status=fut.result()
            print(f"STUDY_C {len(list(RAW.glob('*.json')))}/252 {rid} {status}",flush=True)

    if len(list(RAW.glob("*.json")))!=252: raise SystemExit("collection incomplete")
    print("STUDY_C_COLLECTION_COMPLETE=252/252")

if __name__=="__main__": main()