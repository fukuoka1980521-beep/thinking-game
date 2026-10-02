from __future__ import annotations
import hashlib, json, os, random, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
UNIVERSE=BASE/"STUDY_C_EVIDENCE_UNIVERSE_V01.json"
ROOT=BASE/"study_c_calibration_v01"
RAW=ROOT/"raw"
API="https://api.openai.com/v1/responses"
MODEL="gpt-5.6-sol"
WORKERS=4
SEED=2026100206
MAX_OPEN=4
MIN_STOP=2
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]

def now():
    return datetime.now(timezone.utc).isoformat()

def get_key():
    key=os.environ.get("OPENAI_API_KEY","").strip()
    if key: return key
    if os.name=="nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER,r"Environment") as h:
                return str(winreg.QueryValueEx(h,"OPENAI_API_KEY")[0]).strip()
        except Exception:
            pass
    return ""

def output_text(resp):
    out=[]
    for item in resp.get("output",[]):
        if item.get("type")!="message": continue
        for part in item.get("content",[]):
            if part.get("type")=="output_text": out.append(part.get("text",""))
    return "".join(out)

def api_call(key,body,validator,context):
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
                parsed=json.loads(output_text(resp))
                validator(parsed)
                return resp,parsed,attempt
        except urllib.error.HTTPError as e:
            txt=e.read().decode("utf-8",errors="replace")
            if "credit_balance_exhausted" in txt or "insufficient_quota" in txt:
                raise RuntimeError("API_CREDIT_BALANCE_EXHAUSTED")
            last=f"HTTP {e.code}: {txt[:800]}"
        except Exception as e:
            last=repr(e)
        time.sleep(min(2**attempt,20))
    raise RuntimeError(f"{context}: {last}")

def choice_schema(unopened,can_stop):
    action_enum=["OPEN","STOP"] if can_stop else ["OPEN"]
    module_enum=list(unopened)+(["NONE"] if can_stop else [])
    return {
      "type":"object",
      "properties":{
        "action":{"type":"string","enum":action_enum},
        "module_id":{"type":"string","enum":module_enum}
      },
      "required":["action","module_id"],
      "additionalProperties":False
    }

def final_schema():
    return {
      "type":"object",
      "properties":{
        "evidence_sufficiency":{"type":"string","enum":["SUFFICIENT","LIMITED","INSUFFICIENT"]},
        "confidence":{"type":"integer","minimum":0,"maximum":100},
        "conclusion":{"type":"string"}
      },
      "required":["evidence_sufficiency","confidence","conclusion"],
      "additionalProperties":False
    }

def make_choice_prompt(world,instruction,opened):
    catalog="\n".join(f"- {x['module_id']}: {x['descriptor']}" for x in world["catalog"])
    opened_text="\n\n".join(
        f"OPENED {i+1} — {mid}\n{world['modules'][mid]}" for i,mid in enumerate(opened)
    ) or "(none)"
    remaining=MAX_OPEN-len(opened)
    stop_rule=(
        "You may either OPEN one unopened module or STOP now."
        if len(opened)>=MIN_STOP else
        f"You must OPEN another module now. STOP is unavailable until at least {MIN_STOP} modules have been opened."
    )
    return f"""RESEARCH QUESTION:
{world['research_question']}

METHODOLOGICAL FRAMING:
{instruction}

AVAILABLE EVIDENCE CATALOG:
{catalog}

EVIDENCE ALREADY OPENED:
{opened_text}

RESOURCE BUDGET:
- You may open at most {MAX_OPEN} modules total.
- You have opened {len(opened)}.
- Remaining capacity: {remaining}.
- You cannot reopen a module.
- {stop_rule}

Choose the next evidence-acquisition action.
Do not explain your reasoning.
Return only the structured action.
"""

def make_final_prompt(world,instruction,opened):
    opened_text="\n\n".join(
        f"OPENED {i+1} — {mid}\n{world['modules'][mid]}" for i,mid in enumerate(opened)
    )
    return f"""RESEARCH QUESTION:
{world['research_question']}

METHODOLOGICAL FRAMING:
{instruction}

EVIDENCE YOU CHOSE TO OPEN, IN ORDER:
{opened_text}

You have finished evidence acquisition.
Using only the evidence you opened, give the final research conclusion.
Do not mention hidden reasoning or the experimental comparison.
Return only the structured final judgment.
"""

def run_trajectory(key,row,world,instruction):
    opened=[]
    turns=[]
    response_ids=[]
    raw_responses=[]
    for step in range(1,MAX_OPEN+1):
        if len(opened)>=MAX_OPEN: break
        all_ids=[x["module_id"] for x in world["catalog"]]
        unopened=[x for x in all_ids if x not in opened]
        can_stop=len(opened)>=MIN_STOP

        def validate_choice(x):
            if x.get("action") not in (["OPEN","STOP"] if can_stop else ["OPEN"]):
                raise ValueError("bad action")
            if x["action"]=="OPEN":
                if x.get("module_id") not in unopened: raise ValueError("bad/opened module")
            else:
                if x.get("module_id")!="NONE": raise ValueError("STOP must use NONE")

        pr=make_choice_prompt(world,instruction,opened)
        body={
          "model":MODEL,
          "input":[{"role":"user","content":[{"type":"input_text","text":pr}]}],
          "store":False,
          "max_output_tokens":300,
          "temperature":1.0,
          "top_p":1.0,
          "reasoning":{"effort":"none"},
          "text":{"format":{"type":"json_schema","name":"study_c_evidence_choice","strict":True,"schema":choice_schema(unopened,can_stop)}}
        }
        resp,choice,attempt=api_call(key,body,validate_choice,f"{row['run_id']} step {step}")
        rid=resp.get("id")
        response_ids.append(rid)
        raw_responses.append(resp)
        turns.append({
          "step":step,
          "opened_before":list(opened),
          "choice":choice,
          "response_id":rid,
          "attempt_count":attempt,
          "prompt_sha256":hashlib.sha256(pr.encode("utf-8")).hexdigest()
        })
        if choice["action"]=="STOP":
            break
        opened.append(choice["module_id"])

    def validate_final(x):
        if x.get("evidence_sufficiency") not in {"SUFFICIENT","LIMITED","INSUFFICIENT"}: raise ValueError("bad sufficiency")
        if type(x.get("confidence")) is not int or not 0<=x["confidence"]<=100: raise ValueError("bad confidence")
        if not isinstance(x.get("conclusion"),str) or not x["conclusion"].strip(): raise ValueError("empty conclusion")

    pr=make_final_prompt(world,instruction,opened)
    body={
      "model":MODEL,
      "input":[{"role":"user","content":[{"type":"input_text","text":pr}]}],
      "store":False,
      "max_output_tokens":1000,
      "temperature":1.0,
      "top_p":1.0,
      "reasoning":{"effort":"none"},
      "text":{"format":{"type":"json_schema","name":"study_c_final_judgment","strict":True,"schema":final_schema()}}
    }
    resp,final,attempt=api_call(key,body,validate_final,f"{row['run_id']} final")
    response_ids.append(resp.get("id"))
    raw_responses.append(resp)

    role_by_id={x["module_id"]:x["role"] for x in world["catalog"]}
    return {
      **row,
      "calibration_only":True,
      "counted":False,
      "timestamp_utc":now(),
      "requested_model":MODEL,
      "returned_models":sorted(set(r.get("model") for r in raw_responses)),
      "path_module_ids":opened,
      "path_roles":[role_by_id[x] for x in opened],
      "opened_count":len(opened),
      "stopped_early":len(opened)<MAX_OPEN,
      "turns":turns,
      "final":final,
      "final_response_id":resp.get("id"),
      "final_attempt_count":attempt,
      "final_prompt_sha256":hashlib.sha256(pr.encode("utf-8")).hexdigest(),
      "all_response_ids":response_ids,
      "raw_responses":raw_responses
    }

def main():
    key=get_key()
    if not key: raise SystemExit("OPENAI_API_KEY missing")
    methods=json.loads(METHODS.read_text(encoding="utf-8"))
    instructions={x["family"]:x["instruction"] for x in methods["conditions"] if x["depth"]=="LABEL_ONLY"}
    if set(instructions)!=set(FAMILIES): raise SystemExit("method bank mismatch")
    u=json.loads(UNIVERSE.read_text(encoding="utf-8"))
    worlds={x["id"]:x for x in u["worlds"]}
    if set(worlds)!={"C1","C2"}: raise SystemExit("world bank mismatch")

    rows=[]
    for wid in ("C1","C2"):
        for fam in FAMILIES:
            for rep in range(1,4):
                rows.append({"run_id":f"C01-{wid}-{fam}-R{rep:02d}","world_id":wid,"method_family":fam,"replicate":rep})
    random.Random(SEED).shuffle(rows)

    RAW.mkdir(parents=True,exist_ok=True)
    pending=[r for r in rows if not (RAW/f"{r['run_id']}.json").exists()]
    print(f"STUDY_C_CAL_V01_START done={42-len(pending)} pending={len(pending)} workers={WORKERS}",flush=True)

    def one(row):
        dest=RAW/f"{row['run_id']}.json"
        if dest.exists(): return row["run_id"],"SKIP"
        rec=run_trajectory(key,row,worlds[row["world_id"]],instructions[row["method_family"]])
        tmp=dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        if dest.exists():
            tmp.unlink(missing_ok=True); return row["run_id"],"SKIP_RACE"
        tmp.replace(dest)
        return row["run_id"],"OK"

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs=[ex.submit(one,r) for r in pending]
        for fut in as_completed(futs):
            rid,status=fut.result()
            done=len(list(RAW.glob("*.json")))
            print(f"STUDY_C_CAL_V01 {done}/42 {rid} {status}",flush=True)

    final=len(list(RAW.glob("*.json")))
    if final!=42: raise SystemExit(f"collection incomplete {final}/42")
    print("STUDY_C_CAL_V01_COLLECTION_COMPLETE=42/42")

if __name__=="__main__":
    main()
