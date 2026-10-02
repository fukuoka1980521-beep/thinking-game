from __future__ import annotations
import hashlib, json, os, random, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
EVIDENCE=BASE/"STUDY_B_EVIDENCE_BANK_V01.json"
ROOT=BASE/"study_b_calibration_v01"
RAW=ROOT/"raw"
API="https://api.openai.com/v1/responses"
MODEL="gpt-5.6-sol"
MAX_OUTPUT_TOKENS=1600
WORKERS=4
SEED=2026100203
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
EIDS=[f"E{i}" for i in range(1,9)]

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

def schema():
    return {
      "type":"object",
      "properties":{
        "conclusion":{"type":"string","enum":["SUPPORTS_MOST","DOES_NOT_SUPPORT_MOST","INCONCLUSIVE"]},
        "confidence":{"type":"integer","minimum":0,"maximum":100},
        "decisive_evidence_ids":{"type":"array","items":{"type":"string","enum":EIDS},"minItems":1,"maxItems":3,"uniqueItems":True},
        "strongest_counterevidence_id":{"type":"string","enum":EIDS},
        "next_action":{"type":"string","enum":["ACCEPT_TARGET_FOR_NOW","REJECT_TARGET_FOR_NOW","COLLECT_MORE_EVIDENCE"]},
        "rationale":{"type":"string","maxLength":1800}
      },
      "required":["conclusion","confidence","decisive_evidence_ids","strongest_counterevidence_id","next_action","rationale"],
      "additionalProperties":False
    }

def prompt(packet,instruction):
    ev="\n".join(f"{k}: {v}" for k,v in packet["evidence"].items())
    return f"""TARGET CLAIM:
{packet['target_claim']}

FIXED EVIDENCE PACKET:
{ev}

METHODOLOGICAL FRAMING:
{instruction}

TASK:
Using only the fixed evidence packet, interpret the target claim.
Do not request or use external information.
Do not design a new study.
Return the required structured judgment only.

Definitions:
- SUPPORTS_MOST: the fixed evidence supports that the named factor explains more than half of the observed difference.
- DOES_NOT_SUPPORT_MOST: the fixed evidence supports rejecting that 'explains most' claim.
- INCONCLUSIVE: the fixed evidence does not justify either of the above conclusions.
- decisive_evidence_ids: choose 1-3 evidence items that most drive your conclusion.
- strongest_counterevidence_id: choose the evidence item that most strongly pushes against your conclusion.
- next_action: what to do with the target claim now, given only this packet.
"""

def validate_state(s):
    if s["conclusion"] not in {"SUPPORTS_MOST","DOES_NOT_SUPPORT_MOST","INCONCLUSIVE"}: raise ValueError("bad conclusion")
    if not isinstance(s["confidence"],int) or not 0<=s["confidence"]<=100: raise ValueError("bad confidence")
    xs=s["decisive_evidence_ids"]
    if not isinstance(xs,list) or not 1<=len(xs)<=3 or len(set(xs))!=len(xs) or any(x not in EIDS for x in xs): raise ValueError("bad decisive ids")
    if s["strongest_counterevidence_id"] not in EIDS: raise ValueError("bad counter id")
    if s["next_action"] not in {"ACCEPT_TARGET_FOR_NOW","REJECT_TARGET_FOR_NOW","COLLECT_MORE_EVIDENCE"}: raise ValueError("bad action")
    if not isinstance(s["rationale"],str): raise ValueError("bad rationale")

def request(key,body):
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
                txt=output_text(resp)
                state=json.loads(txt)
                validate_state(state)
                return resp,state,attempt
        except urllib.error.HTTPError as e:
            txt=e.read().decode("utf-8",errors="replace")
            if "credit_balance_exhausted" in txt or "insufficient_quota" in txt:
                raise RuntimeError("API_CREDIT_BALANCE_EXHAUSTED")
            last=repr(e)
        except Exception as e:
            last=repr(e)
        time.sleep(min(2**attempt,20))
    raise RuntimeError(last or "request failure")

def main():
    key=get_key()
    if not key: raise SystemExit("OPENAI_API_KEY missing")
    methods=json.loads(METHODS.read_text(encoding="utf-8"))
    inst={x["family"]:x["instruction"] for x in methods["conditions"] if x["depth"]=="LABEL_ONLY"}
    if set(inst)!=set(FAMILIES): raise SystemExit("method bank mismatch")
    packets={x["id"]:x for x in json.loads(EVIDENCE.read_text(encoding="utf-8"))["packets"]}
    rows=[]
    for packet in ("B1","B2"):
        for fam in FAMILIES:
            for rep in range(1,4):
                rows.append({"run_id":f"B01-{packet}-{fam}-R{rep:02d}","packet_id":packet,"method_family":fam,"replicate":rep})
    random.Random(SEED).shuffle(rows)
    RAW.mkdir(parents=True,exist_ok=True)
    pending=[r for r in rows if not (RAW/f"{r['run_id']}.json").exists()]
    print(f"STUDY_B_CAL_V01_START done={42-len(pending)} pending={len(pending)} workers={WORKERS}",flush=True)

    def one(row):
        dest=RAW/f"{row['run_id']}.json"
        if dest.exists(): return row["run_id"],"SKIP"
        pr=prompt(packets[row["packet_id"]],inst[row["method_family"]])
        body={
          "model":MODEL,
          "input":[{"role":"user","content":[{"type":"input_text","text":pr}]}],
          "store":False,
          "max_output_tokens":MAX_OUTPUT_TOKENS,
          "temperature":1.0,
          "top_p":1.0,
          "reasoning":{"effort":"none"},
          "text":{"format":{"type":"json_schema","name":"study_b_calibration_v01_state","strict":True,"schema":schema()}}
        }
        resp,state,attempt=request(key,body)
        rec={**row,"calibration_only":True,"counted":False,"timestamp_utc":now(),
             "requested_model":MODEL,"returned_model":resp.get("model"),
             "response_id":resp.get("id"),"response_status":resp.get("status"),
             "incomplete_details":resp.get("incomplete_details"),"usage":resp.get("usage"),
             "store":False,"max_output_tokens":MAX_OUTPUT_TOKENS,"temperature":1.0,"top_p":1.0,"reasoning_effort":"none",
             "attempt_count":attempt,"prompt_sha256":hashlib.sha256(pr.encode("utf-8")).hexdigest(),
             "prompt_text":pr,"state":state,"raw_response":resp}
        tmp=dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        tmp.replace(dest)
        return row["run_id"],"OK"

    done=42-len(pending)
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs=[ex.submit(one,r) for r in pending]
        for fut in as_completed(futs):
            rid,status=fut.result(); done+=1
            print(f"STUDY_B_CAL_V01 {done}/42 {rid} {status}",flush=True)
    if len(list(RAW.glob("*.json")))!=42: raise SystemExit("collection incomplete")
    print("STUDY_B_CAL_V01_COLLECTION_COMPLETE=42/42")

if __name__=="__main__":
    main()
