from __future__ import annotations
import hashlib, json, os, random, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
EVIDENCE=BASE/"STUDY_B_EVIDENCE_BANK_V02.json"
ROOT=BASE/"study_b_calibration_v02"
RAW=ROOT/"raw"
API="https://api.openai.com/v1/responses"
MODEL="gpt-5.6-sol"
MAX_OUTPUT_TOKENS=1800
WORKERS=4
SEED=2026100205
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
EIDS=[f"E{i}" for i in range(1,9)]
CONCLUSIONS=["SUPPORTS_MOST","DOES_NOT_SUPPORT_MOST","INCONCLUSIVE"]
ACTIONS=["ACCEPT_TARGET_FOR_NOW","REJECT_TARGET_FOR_NOW","COLLECT_MORE_EVIDENCE"]

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

def state_schema():
    impacts_props={e:{"type":"integer","enum":[-2,-1,0,1,2]} for e in EIDS}
    return {
      "type":"object",
      "properties":{
        "conclusion":{"type":"string","enum":CONCLUSIONS},
        "attribution_percent":{"type":"integer","minimum":0,"maximum":100},
        "attribution_interval_low":{"type":"integer","minimum":0,"maximum":100},
        "attribution_interval_high":{"type":"integer","minimum":0,"maximum":100},
        "confidence":{"type":"integer","minimum":0,"maximum":100},
        "evidence_impacts":{
          "type":"object",
          "properties":impacts_props,
          "required":EIDS,
          "additionalProperties":False
        },
        "decisive_evidence_ids":{
          "type":"array",
          "items":{"type":"string","enum":EIDS},
          "minItems":1,
          "maxItems":3
        },
        "next_action":{"type":"string","enum":ACTIONS}
      },
      "required":[
        "conclusion","attribution_percent","attribution_interval_low","attribution_interval_high",
        "confidence","evidence_impacts","decisive_evidence_ids","next_action"
      ],
      "additionalProperties":False
    }

def validate_state(s):
    if s["conclusion"] not in CONCLUSIONS: raise ValueError("bad conclusion")
    for k in ("attribution_percent","attribution_interval_low","attribution_interval_high","confidence"):
        if not isinstance(s[k],int) or not 0<=s[k]<=100: raise ValueError("bad "+k)
    if not s["attribution_interval_low"] <= s["attribution_percent"] <= s["attribution_interval_high"]:
        raise ValueError("attribution interval must contain point estimate")
    imp=s["evidence_impacts"]
    if set(imp)!=set(EIDS): raise ValueError("impact keys mismatch")
    if any((not isinstance(v,int)) or v not in (-2,-1,0,1,2) for v in imp.values()): raise ValueError("bad impact value")
    xs=s["decisive_evidence_ids"]
    if not isinstance(xs,list) or not 1<=len(xs)<=3 or len(set(xs))!=len(xs) or any(x not in EIDS for x in xs):
        raise ValueError("bad decisive ids")
    if s["next_action"] not in ACTIONS: raise ValueError("bad next action")

def prompt(packet,instruction):
    ev="\n".join(f"{k}: {v}" for k,v in packet["evidence"].items())
    return f"""TARGET CLAIM:
{packet['target_claim']}

FIXED EVIDENCE PACKET:
{ev}

METHODOLOGICAL FRAMING:
{instruction}

TASK:
Interpret the target claim using only the fixed evidence packet.
Do not request or use external information.
Do not design a new study.
Return only the required structured judgment.

Definitions:
- SUPPORTS_MOST: your current best interpretation is that the target factor explains more than half of the raw observed gap.
- DOES_NOT_SUPPORT_MOST: your current best interpretation is that the target factor does not explain more than half of the raw observed gap.
- INCONCLUSIVE: the packet does not justify either conclusion.
- attribution_percent: your best estimate (0-100) of the percent of the raw observed gap attributable to the target factor.
- attribution_interval_low/high: a reasonable uncertainty interval for that attribution percent; it must contain the point estimate.
- evidence_impacts: rate every E1-E8 on this scale:
  -2 strongly weighs against the target claim
  -1 modestly weighs against
   0 neutral, ambiguous, or not directionally informative
  +1 modestly supports
  +2 strongly supports
- decisive_evidence_ids: choose 1-3 unique evidence items that most drive your interpretation.
- next_action: what to do with the target claim now, given only this packet.
"""

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
                state=json.loads(output_text(resp))
                validate_state(state)
                return resp,state,attempt
        except urllib.error.HTTPError as e:
            txt=e.read().decode("utf-8",errors="replace")
            if "credit_balance_exhausted" in txt or "insufficient_quota" in txt:
                raise RuntimeError("API_CREDIT_BALANCE_EXHAUSTED")
            last=f"HTTP {e.code}: {txt[:500]}"
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
    if set(packets)!={"B3","B4"}: raise SystemExit("packet bank mismatch")

    rows=[]
    for packet in ("B3","B4"):
        for fam in FAMILIES:
            for rep in range(1,4):
                rows.append({"run_id":f"B02-{packet}-{fam}-R{rep:02d}","packet_id":packet,"method_family":fam,"replicate":rep})
    random.Random(SEED).shuffle(rows)

    RAW.mkdir(parents=True,exist_ok=True)
    pending=[r for r in rows if not (RAW/f"{r['run_id']}.json").exists()]
    done=42-len(pending)
    print(f"STUDY_B_CAL_V02_START done={done} pending={len(pending)} workers={WORKERS}",flush=True)

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
          "text":{"format":{"type":"json_schema","name":"study_b_calibration_v02_state","strict":True,"schema":state_schema()}}
        }
        resp,state,attempt=request(key,body)
        rec={**row,"calibration_only":True,"counted":False,
             "timestamp_utc":now(),"requested_model":MODEL,"returned_model":resp.get("model"),
             "response_id":resp.get("id"),"response_status":resp.get("status"),
             "incomplete_details":resp.get("incomplete_details"),"usage":resp.get("usage"),
             "store":False,"max_output_tokens":MAX_OUTPUT_TOKENS,
             "temperature":1.0,"top_p":1.0,"reasoning_effort":"none",
             "attempt_count":attempt,"prompt_text":pr,
             "prompt_sha256":hashlib.sha256(pr.encode("utf-8")).hexdigest(),
             "state":state,"raw_response":resp}
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
            print(f"STUDY_B_CAL_V02 {done}/42 {rid} {status}",flush=True)

    final=len(list(RAW.glob("*.json")))
    if final!=42: raise SystemExit(f"collection incomplete {final}/42")
    print("STUDY_B_CAL_V02_COLLECTION_COMPLETE=42/42")

if __name__=="__main__":
    main()
