from __future__ import annotations
import json, os, time, urllib.request, urllib.error, hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
MANIFEST=BASE/"STUDY_D_CALIBRATION_V01_MANIFEST.jsonl"
UNIVERSE=BASE/"STUDY_D_EVIDENCE_UNIVERSE_V01.json"
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
ROOT=BASE/"study_d_calibration_v01"
RAW=ROOT/"raw"
API="https://api.openai.com/v1/responses"
MODEL="gpt-5.6-sol"
MAX_WORKERS=8

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
        for p in item.get("content",[]):
            if p.get("type")=="output_text": out.append(p.get("text",""))
    return "".join(out)

def schema():
    return {
      "type":"object","additionalProperties":False,
      "properties":{
        "weights":{
          "type":"array","minItems":8,"maxItems":8,
          "items":{"type":"object","additionalProperties":False,
                   "properties":{"module_id":{"type":"string"},"weight":{"type":"integer","minimum":0,"maximum":100}},
                   "required":["module_id","weight"]}
        },
        "top3":{"type":"array","minItems":3,"maxItems":3,"items":{"type":"string"}},
        "target_support_percent":{"type":"integer","minimum":0,"maximum":100},
        "confidence_percent":{"type":"integer","minimum":0,"maximum":100}
      },
      "required":["weights","top3","target_support_percent","confidence_percent"]
    }

def validate_state(state, valid_ids):
    ws=state["weights"]
    ids=[x["module_id"] for x in ws]
    if len(ids)!=8 or len(set(ids))!=8 or set(ids)!=set(valid_ids):
        raise ValueError("weights module IDs invalid")
    if sum(int(x["weight"]) for x in ws)!=100:
        raise ValueError("weights do not sum to 100")
    top=state["top3"]
    if len(top)!=3 or len(set(top))!=3 or any(x not in valid_ids for x in top):
        raise ValueError("top3 invalid")

def build_prompt(row, world, instruction, stages):
    mods={x["id"]:x for x in world["modules"]}
    visible=world["catalog_order"]
    reveal_roles=set(stages[row["stage"]])
    lines=[
      "RESEARCH QUESTION:",
      world["question"],
      "",
      "TARGET HYPOTHESIS TO ASSESS:",
      world["target_hypothesis"],
      "",
      "METHODOLOGICAL FRAMING:",
      instruction,
      "",
      "AVAILABLE EVIDENCE MODULE CATALOG:"
    ]
    for mid in visible:
        lines.append(f"- {mid}: {mods[mid]['descriptor']}")
    lines += ["","EVIDENCE RESULTS CURRENTLY AVAILABLE:"]
    revealed=[mods[mid] for mid in visible if mods[mid]["role"] in reveal_roles]
    if not revealed:
        lines.append("- No evidence results have been revealed yet.")
    else:
        for m in revealed:
            lines.append(f"- {m['id']}: {m['evidence']}")
    lines += [
      "",
      "Return only the required structured JSON.",
      "Allocate exactly 100 total attention points across all 8 module IDs.",
      "The weights must sum exactly to 100.",
      "top3 must contain exactly 3 distinct module IDs in priority order.",
      "target_support_percent is your current percent support for the target hypothesis.",
      "confidence_percent is confidence in that current assessment.",
      "Do not use external tools. Do not add prose."
    ]
    return "\n".join(lines)

def call(key,prompt):
    body={
      "model":MODEL,
      "input":[{"role":"user","content":[{"type":"input_text","text":prompt}]}],
      "store":False,
      "max_output_tokens":1000,
      "temperature":1.0,
      "top_p":1.0,
      "reasoning":{"effort":"none"},
      "text":{"format":{"type":"json_schema","name":"study_d_snapshot","strict":True,"schema":schema()}}
    }
    data=json.dumps(body,ensure_ascii=False).encode("utf-8")
    last=None
    for attempt in range(1,6):
        try:
            req=urllib.request.Request(API,data=data,headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},method="POST")
            with urllib.request.urlopen(req,timeout=180) as h:
                resp=json.loads(h.read().decode("utf-8"))
            if resp.get("status")!="completed" or resp.get("incomplete_details") is not None:
                last=f"incomplete:{resp.get('status')}"
            elif resp.get("model")!=MODEL:
                last=f"model_mismatch:{resp.get('model')}"
            else:
                txt=output_text(resp)
                return body,resp,json.loads(txt),attempt
        except urllib.error.HTTPError as e:
            bodytxt=e.read().decode("utf-8",errors="replace")
            if "credit_balance_exhausted" in bodytxt or "insufficient_quota" in bodytxt:
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
    if len(manifest)!=126 or len({x["run_id"] for x in manifest})!=126:
        raise SystemExit("manifest invalid")
    universe=json.loads(UNIVERSE.read_text(encoding="utf-8"))
    worlds={x["id"]:x for x in universe["worlds"]}
    stages=universe["stages"]
    methods={x["id"]:x for x in json.loads(METHODS.read_text(encoding="utf-8"))["conditions"]}
    RAW.mkdir(parents=True,exist_ok=True)
    pending=[r for r in manifest if not (RAW/f"{r['run_id']}.json").exists()]
    print(f"STUDY_D_CALIBRATION_START done={126-len(pending)} pending={len(pending)} workers={MAX_WORKERS}",flush=True)

    def one(row):
        dest=RAW/f"{row['run_id']}.json"
        if dest.exists(): return row["run_id"],"SKIP"
        world=worlds[row["world_id"]]
        valid_ids=[m["id"] for m in world["modules"]]
        prompt=build_prompt(row,world,methods[row["condition_id"]]["instruction"],stages)
        for outer in range(1,4):
            body,resp,state,attempt=call(key,prompt)
            try:
                validate_state(state,valid_ids)
                break
            except Exception:
                if outer==3: raise
                continue
        rec={
          **row,
          "calibration_only":True,
          "timestamp_utc":now(),
          "requested_model":MODEL,
          "returned_model":resp.get("model"),
          "response_id":resp.get("id"),
          "response_status":resp.get("status"),
          "incomplete_details":resp.get("incomplete_details"),
          "usage":resp.get("usage"),
          "attempt_count":attempt,
          "prompt_sha256":hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
          "prompt_text":prompt,
          "state":state,
          "raw_response":resp
        }
        tmp=dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        if dest.exists():
            tmp.unlink(missing_ok=True); return row["run_id"],"SKIP_RACE"
        tmp.replace(dest)
        return row["run_id"],"OK"

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs=[ex.submit(one,row) for row in pending]
        for fut in as_completed(futs):
            rid,status=fut.result()
            n=len(list(RAW.glob("*.json")))
            print(f"STUDY_D {n}/126 {rid} {status}",flush=True)

    n=len(list(RAW.glob("*.json")))
    if n!=126: raise SystemExit(f"incomplete {n}/126")
    print("STUDY_D_CALIBRATION_COLLECTION_COMPLETE=126/126")

if __name__=="__main__":
    main()
