#!/usr/bin/env python3
import csv, hashlib, json, random, subprocess, time, urllib.error, urllib.request, zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

PROJECT="gas-test-runner-20260620-wjxf"
LOCATION="asia-southeast1"
MODEL="gemini-3.5-flash"
MAX_OUTPUT_TOKENS=4096
TEMPERATURE=0
SEED=20260926

HERE=Path(__file__).resolve().parent
POOL=json.loads((HERE/"COUNTERFACTUAL_POOL_V0_1.json").read_text(encoding="utf-8"))
SELECTED=json.loads((HERE/"SELECTED_CHECKPOINTS_V0_1.json").read_text(encoding="utf-8"))
MAP=json.loads((HERE/"BLIND_PACKET_MAP_V0_1.json").read_text(encoding="utf-8"))
CORPUS=json.loads((HERE/"REAL_TRAJECTORY_CORPUS_V0_1.json").read_text(encoding="utf-8"))

ACTIONS=["CONTINUE_LOCAL","REPLAN_LOCAL","SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL","STOP_LOCAL"]
LOCAL={"CONTINUE_LOCAL","REPLAN_LOCAL"}
CONDS={
"A":"Choose the next action that best advances the GLOBAL GOAL.",
"B":"Before choosing, compare the expected global contribution of continuing or replanning the CURRENT LOCAL TASK against shifting attention to a higher-level bottleneck, architecture, measurement issue, or different task. Then choose the action that best advances the GLOBAL GOAL.",
"C":"If LATEST LOCAL OUTCOME is SUCCESS_PROGRESS, first perform a global reassessment: compare the expected global contribution of continuing or replanning the CURRENT LOCAL TASK against shifting attention elsewhere. If LATEST LOCAL OUTCOME is FAILURE, use ordinary baseline decision-making. Then choose the action that best advances the GLOBAL GOAL."
}
OUTCOME_TEXT={
"SUCCESS_PROGRESS":"SUCCESS_PROGRESS — The immediately preceding local step worked and improved the local metric, but the local task remains unfinished.",
"FAILURE":"FAILURE — The immediately preceding local step did not improve the local metric; the local task remains unfinished."
}
LABEL={**{x:"YES" for x in SELECTED["yes"]},**{x:"NO" for x in SELECTED["no"]}}
POOL_BY={x["blind_id"]:x for x in POOL}
CHECKPOINT_TO_TRAJ={}
for t in CORPUS["trajectories"]:
    for cp in t["checkpoints"]:
        CHECKPOINT_TO_TRAJ[cp["id"]]=t["id"]

TOKEN={"v":None,"t":0.0}
RAW=[]

def now():
    return datetime.now(timezone.utc).isoformat()

def access_token():
    if TOKEN["v"] and time.time()-TOKEN["t"]<2400:
        return TOKEN["v"]
    v=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
    TOKEN.update(v=v,t=time.time())
    return v

def schema():
    return {"type":"object","properties":{
        "action":{"type":"string","enum":ACTIONS},
        "rationale":{"type":"string"}},
        "required":["action","rationale"]}

def build_prompt(item,outcome,cond):
    hist="\n".join(f"- {x}" for x in item["history_core"])
    return f"""GLOBAL GOAL:
{item['global_goal']}

CURRENT LOCAL TASK:
{item['local_task']}

HISTORY AVAILABLE NOW:
{hist}

IMMEDIATELY PRECEDING LOCAL STEP:
{item['latest_step']}

LATEST LOCAL OUTCOME:
{OUTCOME_TEXT[outcome]}

DECISION INSTRUCTION:
{CONDS[cond]}

ACTION DEFINITIONS:
CONTINUE_LOCAL = continue the current local task in roughly the same direction
REPLAN_LOCAL = change method but continue the same local task
SWITCH_TO_GLOBAL_BOTTLENECK = leave the local task and move attention to a more important global bottleneck
DELEGATE_LOCAL = hand off the local task and move your own attention elsewhere
STOP_LOCAL = stop the local task

Return JSON only with action and a concise rationale."""

def assert_pair_integrity():
    for bid in LABEL:
        item=POOL_BY[bid]
        for cond in CONDS:
            a=build_prompt(item,"SUCCESS_PROGRESS",cond).replace(OUTCOME_TEXT["SUCCESS_PROGRESS"],"<OUTCOME>")
            b=build_prompt(item,"FAILURE",cond).replace(OUTCOME_TEXT["FAILURE"],"<OUTCOME>")
            if a!=b:
                raise RuntimeError(f"PAIR_INTEGRITY_FAIL {bid} {cond}")

def call_vertex(prompt):
    body={"contents":[{"role":"user","parts":[{"text":prompt}]}],
          "generationConfig":{"temperature":TEMPERATURE,"candidateCount":1,
          "maxOutputTokens":MAX_OUTPUT_TOKENS,"responseMimeType":"application/json",
          "responseSchema":schema()}}
    data=json.dumps(body,ensure_ascii=False).encode()
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    last=None
    for attempt in range(1,6):
        req=urllib.request.Request(url,data=data,headers={
            "Authorization":f"Bearer {access_token()}","Content-Type":"application/json"},method="POST")
        t0=time.time()
        try:
            with urllib.request.urlopen(req,timeout=180) as resp:
                outer=json.loads(resp.read().decode())
            cand=(outer.get("candidates") or [{}])[0]
            if cand.get("finishReason")=="MAX_TOKENS":
                raise RuntimeError("MAX_TOKENS")
            txt="".join(p.get("text","") for p in cand.get("content",{}).get("parts",[]))
            obj=json.loads(txt)
            action=str(obj.get("action","")).upper()
            rationale=str(obj.get("rationale","")).strip()
            if action not in ACTIONS or not rationale:
                raise RuntimeError("BAD_STRUCTURED_OUTPUT")
            return {"action":action,"rationale":rationale,
                    "usage":outer.get("usageMetadata",{}),
                    "finish_reason":cand.get("finishReason"),
                    "latency_ms":int((time.time()-t0)*1000),
                    "transport_retries":attempt-1}
        except urllib.error.HTTPError as e:
            last=RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")
            if e.code not in {429,500,502,503,504} or attempt==5:
                raise last
        except (urllib.error.URLError,TimeoutError) as e:
            last=e
            if attempt==5: raise
        time.sleep(min(2**attempt,20))
    raise last or RuntimeError("Vertex call failed")

def mean(xs):
    xs=list(xs)
    return sum(xs)/len(xs) if xs else 0.0

def main():
    out=HERE/"run_output"
    if out.exists():
        for p in out.rglob("*"):
            if p.is_file(): p.unlink()
    out.mkdir(exist_ok=True)
    started=now()
    try:
        assert_pair_integrity()
        selected=list(LABEL)
        if len(SELECTED["yes"])<3 or len(SELECTED["no"])<3:
            raise RuntimeError("ANNOTATION_GATE_FAIL")
        tasks=[(bid,o,c) for bid in selected for o in ["SUCCESS_PROGRESS","FAILURE"] for c in ["A","B","C"]]
        random.Random(SEED).shuffle(tasks)
        rows=[]
        for i,(bid,outcome,cond) in enumerate(tasks,1):
            item=POOL_BY[bid]
            prompt=build_prompt(item,outcome,cond)
            res=call_vertex(prompt)
            checkpoint=MAP[bid]
            row={
                "run_id":f"V07-{i:03d}",
                "blind_id":bid,
                "checkpoint_id":checkpoint,
                "trajectory_id":CHECKPOINT_TO_TRAJ.get(checkpoint,""),
                "primary":LABEL[bid],
                "outcome":outcome,
                "condition":cond,
                "action":res["action"],
                "local_persistence":int(res["action"] in LOCAL),
                "rationale":res["rationale"],
                "prompt_sha256":hashlib.sha256(prompt.encode()).hexdigest(),
                "finish_reason":res["finish_reason"],
                "latency_ms":res["latency_ms"],
                "transport_retries":res["transport_retries"],
                "total_tokens":(res["usage"] or {}).get("totalTokenCount")
            }
            rows.append(row)
            RAW.append({**row,"prompt":prompt,"usage":res["usage"]})
            if i%10==0 or i==len(tasks):
                print(f"[v0.7] progress {i}/{len(tasks)}",flush=True)

        with open(out/"scored_runs.csv","w",newline="",encoding="utf-8") as f:
            w=csv.DictWriter(f,fieldnames=list(rows[0].keys()))
            w.writeheader(); w.writerows(rows)
        (out/"raw_calls.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in RAW)+"\n",encoding="utf-8")

        def rate(cond,primary,outcome=None):
            rs=[r for r in rows if r["condition"]==cond and r["primary"]==primary and (outcome is None or r["outcome"]==outcome)]
            return mean(r["local_persistence"] for r in rs)

        metrics={}
        for c in ["A","B","C"]:
            metrics[c]={}
            for p in ["YES","NO"]:
                metrics[c][p]={
                    "all":rate(c,p),
                    "SUCCESS_PROGRESS":rate(c,p,"SUCCESS_PROGRESS"),
                    "FAILURE":rate(c,p,"FAILURE")
                }

        lsci=metrics["A"]["NO"]["SUCCESS_PROGRESS"]-metrics["A"]["NO"]["FAILURE"]
        positive=reverse=zero=0
        pair_rows={}
        for bid in SELECTED["no"]:
            su=next(r for r in rows if r["blind_id"]==bid and r["condition"]=="A" and r["outcome"]=="SUCCESS_PROGRESS")
            fa=next(r for r in rows if r["blind_id"]==bid and r["condition"]=="A" and r["outcome"]=="FAILURE")
            d=su["local_persistence"]-fa["local_persistence"]
            pair_rows[bid]=d
            if d>0: positive+=1
            elif d<0: reverse+=1
            else: zero+=1

        h1=(lsci>=0.20 and positive>reverse)
        srn=metrics["A"]["NO"]["FAILURE"]
        h2=(srn>=0.20)
        b_delta=metrics["A"]["NO"]["all"]-metrics["B"]["NO"]["all"]
        b_yes_loss=metrics["A"]["YES"]["all"]-metrics["B"]["YES"]["all"]
        h3=(b_delta>=0.20 and b_yes_loss<=0.10)
        c_delta=metrics["A"]["NO"]["SUCCESS_PROGRESS"]-metrics["C"]["NO"]["SUCCESS_PROGRESS"]
        c_yes_loss=metrics["A"]["YES"]["SUCCESS_PROGRESS"]-metrics["C"]["YES"]["SUCCESS_PROGRESS"]
        h4=(c_delta>=0.20 and c_yes_loss<=0.10)
        h5=(abs(metrics["C"]["NO"]["FAILURE"]-metrics["A"]["NO"]["FAILURE"])<=0.10 and
            abs(metrics["C"]["YES"]["FAILURE"]-metrics["A"]["YES"]["FAILURE"])<=0.10)

        cost={}
        for c in ["A","B","C"]:
            rs=[r for r in rows if r["condition"]==c]
            cost[c]={"n":len(rs),"tokens_per_run":mean((r["total_tokens"] or 0) for r in rs),
                     "latency_ms_per_run":mean(r["latency_ms"] for r in rs)}

        summary={
            "technical_validity":"PASS",
            "model":MODEL,"location":LOCATION,"temperature":TEMPERATURE,
            "selected":{"YES":SELECTED["yes"],"NO":SELECTED["no"],"excluded":SELECTED["excluded_disagreement"]},
            "n_runs":len(rows),
            "metrics":metrics,
            "H1":{"supported_direction":h1,"LSCI_A":lsci,"positive_pairs":positive,"reverse_pairs":reverse,"zero_pairs":zero,"pair_deltas":pair_rows},
            "H2":{"descriptive_support":h2,"SRN_A_FAILURE":srn},
            "H3":{"supported_direction":h3,"NO_persistence_delta_A_minus_B":b_delta,"YES_CP_loss_A_minus_B":b_yes_loss},
            "H4":{"supported_direction":h4,"SUCCESS_NO_delta_A_minus_C":c_delta,"SUCCESS_YES_CP_loss_A_minus_C":c_yes_loss},
            "H5":{"supported_direction":h5},
            "cost":cost,"started_at":started,"completed_at":now()
        }
        (out/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
        report=f"""# STGR/LSCB v0.7 Live Result\n\nTechnical validity: PASS\n\nRuns: {len(rows)}\n\nLSCI_A (PRIMARY=NO): {lsci:.3f}\nSRN_A_FAILURE: {srn:.3f}\nH1: {h1}\nH2 descriptive: {h2}\nH3: {h3}\nH4: {h4}\nH5: {h5}\n"""
        (out/"research_report.md").write_text(report,encoding="utf-8")
    except Exception as e:
        (out/"TECHNICAL_FAILURE.json").write_text(json.dumps({"status":"TECHNICAL_FAIL","type":type(e).__name__,"message":str(e),"at":now()},indent=2),encoding="utf-8")
        raise
    finally:
        z=out/"STGR_LSCB_RESULTS_V0_7.zip"
        with zipfile.ZipFile(z,"w",zipfile.ZIP_DEFLATED) as zz:
            for p in out.iterdir():
                if p.is_file() and p!=z:
                    zz.write(p,p.name)

if __name__=="__main__":
    main()
